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
from os import getcwd, remove, path
from os.path import join
from tempfile import TemporaryDirectory
from json import loads
from shutil import copy2

from PySide6.QtCore import QObject, Signal, QThreadPool
from PySide6.QtGui import QImage
from PySide6.QtQml import QJSValue
from PySide6.QtWidgets import QApplication

from LogarithmPlotter import __VERSION__ as version
from LogarithmPlotter.util import config, helper
from LogarithmPlotter.util.helper import Helper, fetch_changelog, read_changelog, InvalidFileException

pwd = getcwd()
helper.SHOW_GUI_MESSAGES = False

@pytest.fixture()
def temporary():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, "graph.png")
    yield tmpfile, directory
    directory.cleanup()


def create_changelog_callback_asserter(promise, expect_404=False):
    def cb(changelog, expect_404=expect_404):
        # print("Got changelog", changelog)
        assert isinstance(changelog, QJSValue)
        assert changelog.isString()
        changlogValue = changelog.toVariant()
        assert ('404' in changlogValue) == expect_404
    def error(e):
        raise eval(e)
    promise.then(cb, error)

CHANGELOG_BASE_PATH = path.realpath(path.join(path.dirname(path.realpath(__file__)), "..", "CHANGELOG.md"))


class TestHelper:
    def test_changelog(self, temporary, qtbot):
        # Exists
        helper.CHANGELOG_VERSION = '0.5.0'
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        promise = obj.fetchChangelog()
        create_changelog_callback_asserter(promise, expect_404=False)
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
            pass
        assert type(fetch_changelog()) == str
        # Does not exist
        helper.CHANGELOG_VERSION = '2.0.0'
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        promise = obj.fetchChangelog()
        create_changelog_callback_asserter(promise, expect_404=True)
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
            pass
        # Local
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        assert path.exists(CHANGELOG_BASE_PATH)
        copy2(CHANGELOG_BASE_PATH, helper.CHANGELOG_CACHE_PATH)
        assert path.exists(helper.CHANGELOG_CACHE_PATH)
        promise = obj.fetchChangelog()
        create_changelog_callback_asserter(promise, expect_404=False)
        with qtbot.waitSignal(promise.fulfilled, timeout=100): # Local
            pass
        assert type(read_changelog()) == str
    
    def test_read(self, temporary):
        # Test file reading and information loading.
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        data = obj.load("ci/test1.lpf")
        assert type(data) == str
        data = loads(data)
        assert data['type'] == "logplotv1"
        # Checking data['types'] of valid file.
        # See https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/LogarithmPlotter-file-format-v1.0
        assert type(data['width']) == int
        assert type(data['height']) == int
        assert type(data['xzoom']) in (int, float)
        assert type(data['yzoom']) in (int, float)
        assert type(data['xmin']) in (int, float)
        assert type(data['ymax']) in (int, float)
        assert type(data['xaxisstep']) == str
        assert type(data['yaxisstep']) == str
        assert type(data['xaxislabel']) == str
        assert type(data['yaxislabel']) == str
        assert type(data['logscalex']) == bool
        assert type(data['linewidth']) in (int, float)
        assert type(data['showxgrad']) == bool
        assert type(data['showygrad']) == bool
        assert type(data['textsize']) in (int, float)
        assert type(data['history']) == list and len(data['history']) == 2
        assert type(data['history'][0]) == list
        assert type(data['history'][1]) == list
        for action_list in data['history']:
            for action in action_list:
                assert type(action[0]) == str
                assert type(action[1]) == list
        assert type(data['objects']) == dict
        for obj_type, objects in data['objects'].items():
            assert type(obj_type) == str
            assert type(objects) == list
            for obj in objects:
                assert type(obj) == list

    def test_read_newer(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        newer_file_path = join(directory.name, "newer.lpf")
        with open(newer_file_path, "w") as f:
            f.write("LPFv2[other invalid data]")
        with pytest.raises(InvalidFileException):
            obj.load(newer_file_path)

    def test_read_invalid_file(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        with pytest.raises(InvalidFileException):
            obj.load("./inexistant.lpf")
        with pytest.raises(InvalidFileException):
            obj.load("./pyproject.toml")

    def test_write(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        target = join(directory.name, "target.lpf")
        data = "example_data"
        obj.write(target, data)
        with open(target, "r") as f:
            read_data = f.read()
            # Ensure data has been written.
            assert read_data == "LPFv1" + data

    def test_tmp_graphic(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        assert obj.gettmpfile() == tmpfile
        obj.copyImageToClipboard()
        clipboard = QApplication.clipboard()
        assert type(clipboard.image()) == QImage

    def test_strings(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        assert obj.getVersion() == version
        assert type(obj.getDebugInfos()) == str
        assert type(obj.getSetting("last_install_greet").toVariant()) == str
        assert type(obj.getSetting("check_for_updates").toVariant()) == bool
        assert type(obj.getSetting("default_graph.xzoom").toVariant()) in [float, int]

    def test_set_config(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        obj.setSetting("last_install_greet", obj.getSetting("last_install_greet"))
        obj.setSetting("check_for_updates", obj.getSetting("check_for_updates"))
        obj.setSetting("default_graph.xzoom", obj.getSetting("default_graph.xzoom"))
