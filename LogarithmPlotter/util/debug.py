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

from PySide6.QtCore import QtMsgType, qInstallMessageHandler, QMessageLogContext
from math import ceil, log10
from os import path

CURRENT_PATH = path.dirname(path.realpath(__file__))
SOURCEMAP_PATH = path.realpath(f"{CURRENT_PATH}/../qml/eu/ad5001/LogarithmPlotter/js/index.mjs.map")
SOURCEMAP_INDEX = None


class LOG_COLORS:
    GRAY = "\033[90m"
    BLUE = "\033[94m"
    ORANGE = "\033[38;5;166m"
    RED = "\033[38;5;204m"
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


def map_javascript_source(source_file: str, line: str) -> tuple[str, str]:
    """
    Maps a line from the compiled javascript to its source.
    """
    try:
        if SOURCEMAP_INDEX is not None:
            token = SOURCEMAP_INDEX.lookup(line, 20)
            source_file = source_file[:-len("index.mjs")] + token.src
            line = token.src_line
    except IndexError:
        pass  # Unable to find source, leave as is.
    return source_file, line


def create_log_terminal_message(mode: QtMsgType, context: QMessageLogContext, message: str):
    """
    Parses a qt log message and returns it.
    """
    mode = MODES[mode] if mode in MODES else DEFAULT_MODE
    line = context.line
    source_file = context.file
    # Remove source and line from message
    if source_file is not None:
        if message.startswith(source_file):
            message = message[len(source_file) + 1:]
        source_file = "LogarithmPlotter/qml/" + source_file.split("/qml/")[-1]  # We're only interested in that part.
    if line is not None and message.startswith(str(line)):
        line_length = ceil(log10((line + 1) if line > 0 else 1))
        message = message[line_length + 2:]
    # Check MJS
    if line is not None and source_file is not None and source_file.endswith("index.mjs"):
        source_file, line = map_javascript_source(source_file, line)
    prefix = f"{LOG_COLORS.INVERT}{mode[1]}[{mode[0].upper()}]{LOG_COLORS.RESET_INVERT}"
    message = message + LOG_COLORS.RESET
    context = f"{context.function} at {source_file}:{line}"
    return f"{prefix} {message} ({context})"


def log_qt_debug(mode: QtMsgType, context: QMessageLogContext, message: str):
    """
    Parses and renders qt log messages.
    """
    print(create_log_terminal_message(mode, context, message))


def setup():
    global SOURCEMAP_INDEX
    try:
        with open(SOURCEMAP_PATH, "r") as f:
            from sourcemap import loads
            SOURCEMAP_INDEX = loads(f.read())
    except Exception as e:
        log_qt_debug(QtMsgType.QtWarningMsg, QMessageLogContext(),
                     f"Could not setup JavaScript source mapper in logs: {repr(e)}")
    qInstallMessageHandler(log_qt_debug)
