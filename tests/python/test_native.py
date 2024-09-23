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
from os.path import exists

from PySide6.QtCore import QEvent, QObject, QUrl
from PySide6.QtGui import QActionEvent, QFileOpenEvent

from LogarithmPlotter.util.native import MacOSFileOpenHandler


class LoadDiagramCalledSuccessfully(Exception): pass


class MockIO:
    def loadDiagram(self, file_name):
        assert type(file_name) == str
        raise LoadDiagramCalledSuccessfully()


class MockFileOpenEvent(QEvent):
    def __init__(self, file):
        super(QEvent.FileOpen)
        self._file = file

    def file(self):
        return self._file


def test_native():
    event_filter = MacOSFileOpenHandler()
    # Nothing should happen here. The module hasn't been initialized
    event_filter.eventFilter(None, QFileOpenEvent(QUrl.fromLocalFile("ci/test1.lpf")))
    with pytest.raises(LoadDiagramCalledSuccessfully):
        event_filter.init_io(MockIO()) # Now that we've initialized, the loadDiagram function should be called.
    with pytest.raises(LoadDiagramCalledSuccessfully):
        # And now it will do so every time an event is loaded.
        event_filter.eventFilter(None, QFileOpenEvent(QUrl.fromLocalFile("ci/test1.lpf")))
    # Check what happens when a non file open qevent is launched against it.
    event_filter.eventFilter(QObject(), QEvent(QEvent.ActionAdded))

