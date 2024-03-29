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

# This file contains stuff for native interactions with each OS.

from PySide6.QtCore import QObject, QEvent


# On macOS, opening a file through finder can only be fetched through the
# QFileOpenEvent and NOT through command line parameters.
class MacOSFileOpenHandler(QObject):
    def __init__(self):
        self.initialized = False
        self.io_module = None
        self.opened_file = ""
        QObject.__init__(self)

    def init_io(self, io_modules):
        self.io_module = io_modules
        self.initialized = True
        if self.opened_file != "":
            self.open_file()

    def open_file(self):
        self.io_module.loadDiagram(self.opened_file)

    def eventFilter(self, obj, event):
        if event.type() == QEvent.FileOpen:
            print("Got file", event.file(), self.initialized)
            self.opened_file = event.file()
            if self.initialized:
                self.open_file()
            return True
        else:
            # standard event processing
            return QObject.eventFilter(self, obj, event)
