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
from LogarithmPlotter.util import config
from tempfile import TemporaryDirectory
from os.path import join


@pytest.fixture()
def resource():
    directory = TemporaryDirectory()
    config.CONFIG_FILE = join(directory.name, "config.json")
    config.init()
    yield config.CONFIG_FILE
    directory.cleanup()


class TestConfig:

    def test_init(self, resource):
        assert config.current_config == config.DEFAULT_SETTINGS

    def test_get(self, resource):
        assert config.getSetting("expression_editor.autoclose") == True
        with pytest.raises(config.UnknownNamespaceError):
            config.getSetting("unknown_setting")

    def test_set(self, resource):
        assert config.setSetting("expression_editor.autoclose", False) is None
        assert config.getSetting("expression_editor.autoclose") == False # Ensure set is working.
        with pytest.raises(config.UnknownNamespaceError):
            config.setSetting("unknown_dict.unknown_setting", False)

    def test_reinit(self, resource):
        default_value = config.getSetting("expression_editor.autoclose")
        config.setSetting("expression_editor.autoclose", not default_value)
        config.init()
        assert config.getSetting("expression_editor.autoclose") != default_value # Ensure setting has been reset.

    def test_save(self, resource):
        config.setSetting("expression_editor.autoclose", False)
        config.save(resource)
        config.init()
        assert config.getSetting("expression_editor.autoclose") == False # Ensure setting has been saved.
