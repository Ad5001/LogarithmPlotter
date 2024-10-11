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
from sys import argv

import pytest
from PySide6.QtCore import QThreadPool

from LogarithmPlotter import __VERSION__ as version
from LogarithmPlotter.util.update import UpdateInformation, UpdateCheckerRunnable, check_for_updates


class MockWindow:
    def showAlert(self, msg): raise Exception(msg)
    def showUpdateMenu(self, msg): pass

def check_update_callback_type(show_alert, msg_text, update_available):
    assert type(show_alert) == bool
    assert type(msg_text) == str
    assert type(update_available) == bool

def test_update(qtbot):
    def check_older(show_alert, msg_text, update_available):
        check_update_callback_type(show_alert, msg_text, update_available)
        assert update_available
        assert show_alert

    def check_newer(show_alert, msg_text, update_available):
        check_update_callback_type(show_alert, msg_text, update_available)
        assert not update_available
        assert not show_alert

    update_info_older = UpdateInformation()
    update_info_older.got_update_info.connect(check_older)
    update_info_newer = UpdateInformation()
    update_info_newer.got_update_info.connect(check_newer)
    runnable = UpdateCheckerRunnable('1.0.0', update_info_newer)
    runnable.run()
    qtbot.waitSignal(update_info_newer.got_update_info, timeout=10000)
    runnable = UpdateCheckerRunnable('0.1.0', update_info_older)
    runnable.run()
    qtbot.waitSignal(update_info_older.got_update_info, timeout=10000)
    runnable = UpdateCheckerRunnable('0.5.0+dev0+git20240101', update_info_older)
    runnable.run()
    qtbot.waitSignal(update_info_older.got_update_info, timeout=10000)

def test_update_checker(qtbot):
    update_info = check_for_updates('0.6.0', MockWindow())
    assert QThreadPool.globalInstance().activeThreadCount() >= 1
    qtbot.waitSignal(update_info.got_update_info, timeout=10000)
    argv.append("--no-check-for-updates")
    update_info = check_for_updates('0.6.0', MockWindow())
    assert QThreadPool.globalInstance().activeThreadCount() < 2 # No new update checks where added
