"""
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

from PySide6.QtCore import QObject, Slot, Property, QCoreApplication
from PySide6.QtGui import QImage, QColor
from PySide6.QtWidgets import QMessageBox

from os import path, remove
from string import Template
from tempfile import TemporaryDirectory
from subprocess import Popen, TimeoutExpired, PIPE
from shutil import which
from sys import argv

"""
Searches for a valid Latex and DVIPNG (http://savannah.nongnu.org/projects/dvipng/)
installation and collects the binary path in the DVIPNG_PATH variable.
If not found, it will send an alert to the user.
"""
LATEX_PATH = which('latex')
DVIPNG_PATH = which('dvipng')
PACKAGES = ["calligra", "amsfonts", "inputenc"]
SHOW_GUI_MESSAGES = "--test-build" not in argv

DEFAULT_LATEX_DOC = Template(r"""
\documentclass[]{minimal}
\usepackage[utf8]{inputenc}
\usepackage{calligra}
\usepackage{amsfonts}

\title{}
\author{}

\begin{document}

$$$$ $markup $$$$

\end{document}
""")


def show_message(msg: str) -> None:
    """
    Shows a GUI message if GUI messages are enabled
    """
    if SHOW_GUI_MESSAGES:
        QMessageBox.warning(None, "LogarithmPlotter - Latex", msg)


class MissingPackageException(Exception): pass


class RenderError(Exception): pass


class Latex(QObject):
    """
    Base class to convert Latex equations into PNG images with custom font color and size.
    It doesn't have any python dependency, but requires a working latex installation and
    dvipng to be installed on the system.
    """

    def __init__(self, tempdir: TemporaryDirectory):
        QObject.__init__(self)
        self.tempdir = tempdir

    @Property(bool)
    def latexSupported(self) -> bool:
        return LATEX_PATH is not None and DVIPNG_PATH is not None

    @Slot(result=bool)
    def checkLatexInstallation(self) -> bool:
        """
        Checks if the current latex installation is valid.
        """
        valid_install = True
        if LATEX_PATH is None:
            print("No Latex installation found.")
            msg = QCoreApplication.translate("latex",
                                             "No Latex installation found.\nIf you already have a latex distribution installed, make sure it's installed on your path.\nOtherwise, you can download a Latex distribution like TeX Live at https://tug.org/texlive/.")
            show_message(msg)
            valid_install = False
        elif DVIPNG_PATH is None:
            print("DVIPNG not found.")
            msg = QCoreApplication.translate("latex",
                                             "DVIPNG was not found. Make sure you include it from your Latex distribution.")
            show_message(msg)
            valid_install = False
        else:
            try:
                self.render("", 14, QColor(0, 0, 0, 255))
            except MissingPackageException:
                valid_install = False  # Should have sent an error message if failed to render
        return valid_install

    @Slot(str, float, QColor, result=str)
    def render(self, latex_markup: str, font_size: float, color: QColor) -> str:
        """
        Prepares and renders a latex string into a png file.
        """
        markup_hash, export_path = self.create_export_path(latex_markup, font_size, color)
        if self.latexSupported and not path.exists(export_path + ".png"):
            print("Rendering", latex_markup, export_path)
            # Generating file
            latex_path = path.join(self.tempdir.name, str(markup_hash))
            # If the formula is just recolored or the font is just changed, no need to recreate the DVI.
            if not path.exists(latex_path + ".dvi"):
                self.create_latex_doc(latex_path, latex_markup)
                self.convert_latex_to_dvi(latex_path)
                self.cleanup(latex_path)
            # Creating four pictures of different sizes to better handle dpi.
            self.convert_dvi_to_png(latex_path, export_path, font_size, color)
            # self.convert_dvi_to_png(latex_path, export_path+"@2", font_size*2, color)
            # self.convert_dvi_to_png(latex_path, export_path+"@3", font_size*3, color)
            # self.convert_dvi_to_png(latex_path, export_path+"@4", font_size*4, color)
        img = QImage(export_path)
        # Small hack, not very optimized since we load the image twice, but you can't pass a QImage to QML and expect it to be loaded
        return f'{export_path}.png,{img.width()},{img.height()}'

    @Slot(str, float, QColor, result=str)
    def findPrerendered(self, latex_markup: str, font_size: float, color: QColor) -> str:
        """
        Finds a prerendered image and returns its data if possible, and an empty string if not.
        """
        markup_hash, export_path = self.create_export_path(latex_markup, font_size, color)
        data = ""
        if path.exists(export_path + ".png"):
            img = QImage(export_path)
            data = f'{export_path}.png,{img.width()},{img.height()}'
        return data

    def create_export_path(self, latex_markup: str, font_size: float, color: QColor):
        """
        Standardizes export path for renders.
        """
        markup_hash = "render" + str(hash(latex_markup))
        export_path = path.join(self.tempdir.name, f'{markup_hash}_{int(font_size)}_{color.rgb()}')
        return markup_hash, export_path

    def create_latex_doc(self, export_path: str, latex_markup: str):
        """
        Creates a temporary latex document with base file_hash as file name and a given expression markup latex_markup.
        """
        f = open(export_path + ".tex", 'w')
        f.write(DEFAULT_LATEX_DOC.substitute(markup=latex_markup))
        f.close()

    def convert_latex_to_dvi(self, export_path: str):
        """
        Converts a TEX file to a DVI file.
        """
        self.run([
            LATEX_PATH,
            export_path + ".tex"
        ])

    def convert_dvi_to_png(self, dvi_path: str, export_path: str, font_size: float, color: QColor):
        """
        Converts a DVI file to a PNG file.
        Documentation: https://linux.die.net/man/1/dvipng
        """
        fg = color.convertTo(QColor.Rgb)
        fg = f'rgb {fg.redF()} {fg.greenF()} {fg.blueF()}'
        depth = int(font_size * 72.27 / 100) * 10
        self.run([
            DVIPNG_PATH,
            '-T', 'tight',  # Make sure image borders are as tight around the equation as possible to avoid blank space.
            '--truecolor',  # Make sure it's rendered in 24 bit colors.
            '-D', f'{depth}',  # Depth of the image
            '-bg', 'Transparent',  # Transparent background
            '-fg', f'{fg}',  # Foreground of the wanted color.
            f'{dvi_path}.dvi',  # Input file
            '-o', f'{export_path}.png',  # Output file
        ])

    def run(self, process: list):
        """
        Runs a subprocess and handles exceptions and messages them to the user.
        """
        cmd = " ".join(process)
        proc = Popen(process, stdout=PIPE, stderr=PIPE, cwd=self.tempdir.name)
        try:
            out, err = proc.communicate(timeout=2)  # 2 seconds is already FAR too long.
            if proc.returncode != 0:
                # Process errored
                output = str(out, 'utf8') + "\n" + str(err, 'utf8')
                msg = QCoreApplication.translate("latex",
                                                 "An exception occured within the creation of the latex formula.\nProcess '{}' ended with a non-zero return code {}:\n\n{}\nPlease make sure your latex installation is correct and report a bug if so.")
                show_message(msg.format(cmd, proc.returncode, output))
                raise RenderError(
                    f"{cmd} process exited with return code {str(proc.returncode)}:\n{str(out, 'utf8')}\n{str(err, 'utf8')}")
        except TimeoutExpired:
            # Process timed out
            proc.kill()
            out, err = proc.communicate()
            output = str(out, 'utf8') + "\n" + str(err, 'utf8')
            if 'not found' in output:
                for pkg in PACKAGES:
                    if f'{pkg}.sty' in output:
                        # Package missing.
                        msg = QCoreApplication.translate("latex",
                                                         "Your LaTeX installation does not include some required packages:\n\n- {} (https://ctan.org/pkg/{})\n\nMake sure said package is installed, or disable the LaTeX rendering in LogarithmPlotter.")
                        show_message(msg.format(pkg, pkg))
                        raise MissingPackageException("Latex: Missing package " + pkg)
            msg = QCoreApplication.translate("latex",
                                             "An exception occured within the creation of the latex formula.\nProcess '{}' took too long to finish:\n{}\nPlease make sure your latex installation is correct and report a bug if so.")
            show_message(msg.format(cmd, output))
            raise RenderError(f"{cmd} process timed out:\n{output}")

    def cleanup(self, export_path):
        """
        Removes auxiliary, logs and Tex temporary files.
        """
        for i in [".tex", ".aux", ".log"]:
            remove(export_path + i)