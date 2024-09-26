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
from PySide6.QtCore import QtMsgType, QMessageLogContext

from LogarithmPlotter.util import debug


def test_setup():
    sourcemap_installed = False
    try:
        import sourcemap
        sourcemap_installed = True
    except:
        pass
    if sourcemap_installed:
        file = debug.SOURCEMAP_PATH
        debug.SOURCEMAP_PATH = None
        debug.setup()  # Nothing could be setup.
        debug.SOURCEMAP_PATH = file
    debug.setup()
    assert (sourcemap_installed and exists(debug.SOURCEMAP_PATH)) == (debug.SOURCEMAP_INDEX is not None)


def test_map_source():
    sourcemap_available = debug.SOURCEMAP_INDEX is not None
    if sourcemap_available:
        assert debug.map_javascript_source("js/index.mjs", 22) == ("js/module/interface.mjs", 23)
        assert debug.map_javascript_source("js/index.mjs", 100000) == ("js/index.mjs", 100000)  # Too long, not found
        debug.SOURCEMAP_INDEX = None
    assert debug.map_javascript_source("js/index.mjs", 21) == ("js/index.mjs", 21)


def test_log_terminal_message():
    msg1 = debug.create_log_terminal_message(
        QtMsgType.QtWarningMsg, QMessageLogContext(),
        "a long and random message"
    )
    assert "[WARNING]" in msg1
    assert "a long and random message" in msg1
    msg2 = debug.create_log_terminal_message(
        QtMsgType.QtCriticalMsg,
        QMessageLogContext("LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter/Index.qml", 15, "anotherFunctionName",
                           "aCategoryDifferent"),
        "LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter/Index.qml:15: a potentially potential error message"
    )
    assert "[CRITICAL]" in msg2
    assert "Index.qml" in msg2
    assert "a potentially potential error message" in msg2
    assert "anotherFunctionName" in msg2
