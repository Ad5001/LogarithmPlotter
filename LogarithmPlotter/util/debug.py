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

from PySide6.QtCore import QtMsgType, qInstallMessageHandler
from math import ceil, log10
from sourcemap import loads
from os import path

CURRENT_PATH = path.dirname(path.realpath(__file__))
SOURECMAP_PATH = path.realpath(f"{CURRENT_PATH}/../qml/eu/ad5001/LogarithmPlotter/js/index.mjs.map")
SOURCEMAP_INDEX = None

class LOG_COLORS:
    GRAY = "\033[90m"
    BLUE = "\033[94m"
    ORANGE = "\033[38;5;166m"
    RED = "\033[e[38;5;204m"
    INVERT = "\033[7m"
    RESET_INVERT = "\033[27m"
    RESET = "\033[0m"



MODES = {
    QtMsgType.QtInfoMsg: ['info', LOG_COLORS.BLUE],
    QtMsgType.QtWarningMsg: ['warning', LOG_COLORS.ORANGE],
    QtMsgType.QtCriticalMsg: ['critical', LOG_COLORS.RED],
    QtMsgType.QtFatalMsg: ['critical', LOG_COLORS.RED]
}

DEFAULT_MODE = ['debug', LOG_COLORS.GRAY]

def log_qt_debug(mode, context, message):
    """
    Parses and renders qt log messages.
    """
    if mode in MODES:
        mode = MODES[mode]
    else:
        mode = DEFAULT_MODE
    line = context.line
    source_file = context.file
    # Remove source and line from emssage
    if source_file is not None:
        if message.startswith(source_file):
            message = message[len(source_file) + 1:]
        source_file = source_file.split("/qml")[-1] # We're only interested in that part.
    if line is not None and message.startswith(str(line)):
        line_length = ceil(log10((line+1) if line > 0 else 1))
        message = message[line_length + 2:]
    # Check MJS
    if line is not None and source_file is not None and source_file.endswith("index.mjs"):
        try:
            token = SOURCEMAP_INDEX.lookup(line, 20)
            source_file = source_file[:-len("index.mjs")] + token.src
            line = token.src_line
        except IndexError:
            pass # Unable to find source, leave as is.
    print(f"{LOG_COLORS.INVERT}{mode[1]}[{mode[0].upper()}]{LOG_COLORS.RESET_INVERT} {message}{LOG_COLORS.RESET} ({context.function} at {source_file}:{line})")

def setup():
    global SOURCEMAP_INDEX
    with open(SOURECMAP_PATH, "r") as f:
        SOURCEMAP_INDEX = loads(f.read())
        qInstallMessageHandler(log_qt_debug)
