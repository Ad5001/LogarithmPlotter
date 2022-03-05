"""
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2022  Ad5001
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

from PySide2.QtCore import QObject, Slot
from PySide2.QtGui import QImage, QColor
from PySide2.QtWidgets import QApplication

from os import path
from sympy import preview
from tempfile import TemporaryDirectory

class Latex(QObject):
    def __init__(self, tempdir: str, palette):
        QObject.__init__(self)
        self.tempdir = tempdir
        self.palette = palette
        fg = self.palette.windowText().color().convertTo(QColor.Rgb)
        
    @Slot(str, float, QColor, result=str)
    def render(self, latexstring, font_size, color = True):
        exprpath = path.join(self.tempdir.name, f'{hash(latexstring)}_{font_size}_{color.rgb()}.png')
        print("Rendering", latexstring, exprpath)
        if not path.exists(exprpath):
            fg = color.convertTo(QColor.Rgb)
            fg = f'rgb {fg.redF()} {fg.greenF()} {fg.blueF()}'
            preview('$$' + latexstring + '$$', viewer='file', filename=exprpath, dvioptions=[
                "-T", "tight", 
                "-z", "0", 
                "--truecolor", 
                f"-D {font_size * 72.27 / 10}", # See https://linux.die.net/man/1/dvipng#-D for convertion
                "-bg", "Transparent", 
                "-fg", fg],
            euler=True)
        img = QImage(exprpath);
        # Small hack, not very optimized since we load the image twice, but you can't pass a QImage to QML and expect it to be loaded
        return f'{exprpath},{img.width()},{img.height()}'
    
    @Slot(str)
    def copyLatexImageToClipboard(self, latexstring):
        global tempfile
        clipboard = QApplication.clipboard()
        clipboard.setImage(self.render(latexstring))
