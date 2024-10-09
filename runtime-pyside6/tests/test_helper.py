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
from os import getcwd, remove
from os.path import join
from tempfile import TemporaryDirectory
from json import loads
from shutil import copy2

from PySide6.QtCore import QObject, Signal, QThreadPool
from PySide6.QtGui import QImage
from PySide6.QtWidgets import QApplication

from LogarithmPlotter import __VERSION__ as version
from LogarithmPlotter.util import config, helper
from LogarithmPlotter.util.helper import ChangelogFetcher, Helper, InvalidFileException

pwd = getcwd()
helper.SHOW_GUI_MESSAGES = False

@pytest.fixture()
def temporary():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, "graph.png")
    yield tmpfile, directory
    directory.cleanup()


class MockHelperSignals(QObject):
    changelogFetched = Signal(str)

    def __init__(self, expect_404):
        QObject.__init__(self)
        self.expect_404 = expect_404
        self.changelogFetched.connect(self.changelog_fetched)
        self.changelog = None

    def changelog_fetched(self, changelog):
        self.changelog = changelog


class TestChangelog:

    def test_exists(self, qtbot):
        helper.CHANGELOG_VERSION = '0.5.0'
        mock_helper = MockHelperSignals(False)
        fetcher = ChangelogFetcher(mock_helper)
        fetcher.run()  # Does not raise an exception
        qtbot.waitSignal(mock_helper.changelogFetched, timeout=10000)
        assert type(mock_helper.changelog) == str
        assert '404' not in mock_helper.changelog

    def tests_no_exist(self, qtbot):
        mock_helper = MockHelperSignals(True)
        helper.CHANGELOG_VERSION = '1.0.0'
        fetcher = ChangelogFetcher(mock_helper)
        fetcher.run()
        qtbot.waitSignal(mock_helper.changelogFetched, timeout=10000)
        assert type(mock_helper.changelog) == str
        assert '404' in mock_helper.changelog


class TestHelper:
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
        assert type(obj.getSetting("check_for_updates")) == str
        assert type(obj.getSettingInt("check_for_updates")) == float
        assert type(obj.getSettingBool("check_for_updates")) == bool

    def test_set_config(self, temporary):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        obj.setSetting("last_install_greet", obj.getSetting("last_install_greet"))
        obj.setSettingBool("check_for_updates", obj.getSettingBool("check_for_updates"))
        obj.setSettingInt("default_graph.xzoom", obj.getSettingInt("default_graph.xzoom"))

    def test_fetch_changelog(self, temporary, qtbot):
        tmpfile, directory = temporary
        obj = Helper(pwd, tmpfile)
        copy2("../../CHANGELOG.md", "../../LogarithmPlotter/util/CHANGELOG.md")
        obj.fetchChangelog()
        assert QThreadPool.globalInstance().activeThreadCount() == 0
        qtbot.waitSignal(obj.changelogFetched, timeout=10000)
        remove("../../LogarithmPlotter/util/CHANGELOG.md")
        obj.fetchChangelog()
        assert QThreadPool.globalInstance().activeThreadCount() > 0
        qtbot.waitSignal(obj.changelogFetched, timeout=10000)