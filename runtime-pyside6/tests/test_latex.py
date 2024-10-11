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

import pytest
from tempfile import TemporaryDirectory
from shutil import which
from os.path import exists
from re import match
from PySide6.QtGui import QColor

from LogarithmPlotter.util import latex

latex.SHOW_GUI_MESSAGES = False


@pytest.fixture()
def latex_obj():
    directory = TemporaryDirectory()
    obj = latex.Latex(directory.name)
    if not obj.checkLatexInstallation():
        raise Exception("Cannot run LaTeX tests without a proper LaTeX installation. Make sure to install a LaTeX distribution, DVIPNG, and the calligra package, and run the tests again.")
    yield obj
    directory.cleanup()


class TestLatex:
    def test_check_install(self, latex_obj: latex.Latex) -> None:
        assert latex_obj.latexSupported == True
        assert latex_obj.checkLatexInstallation() == True
        bkp = [latex.DVIPNG_PATH, latex.LATEX_PATH]
        # Check what happens when one is missing.
        latex.DVIPNG_PATH = None
        assert latex_obj.latexSupported == False
        assert latex_obj.checkLatexInstallation() == False
        latex.DVIPNG_PATH = bkp[0]
        latex.LATEX_PATH = None
        assert latex_obj.latexSupported == False
        assert latex_obj.checkLatexInstallation() == False
        # Reset
        [latex.DVIPNG_PATH, latex.LATEX_PATH] = bkp

    def test_render(self, latex_obj: latex.Latex) -> None:
        result = latex_obj.render(r"\frac{d\sqrt{\mathrm{f}(x \times 2.3)}}{dx}", 14, QColor(0, 0, 0, 255))
        # Ensure result format
        assert type(result) == str
        [path, width, height] = result.split(",")
        assert exists(path)
        assert match(r"\d+", width)
        assert match(r"\d+", height)
        # Ensure it returns errors on invalid latex.
        with pytest.raises(latex.RenderError):
            latex_obj.render(r"\nonexistant", 14, QColor(0, 0, 0, 255))
        # Replace latex bin with one that returns errors
        bkp = latex.LATEX_PATH
        latex.LATEX_PATH = which("false")
        with pytest.raises(latex.RenderError):
            latex_obj.render(r"\mathrm{f}(x)", 14, QColor(0, 0, 0, 255))
        latex.LATEX_PATH = bkp

    def test_prerendered(self, latex_obj: latex.Latex) -> None:
        args = [r"\frac{d\sqrt{\mathrm{f}(x \times 2.3)}}{dx}", 14, QColor(0, 0, 0, 255)]
        latex_obj.render(*args)
        prerendered = latex_obj.findPrerendered(*args)
        assert type(prerendered) == str
        [path, width, height] = prerendered.split(",")
        assert exists(path)
        assert match(r"\d+", width)
        assert match(r"\d+", height)
        prerendered2 = latex_obj.findPrerendered(args[0], args[1]+2, args[2])
        assert prerendered2 == ""

