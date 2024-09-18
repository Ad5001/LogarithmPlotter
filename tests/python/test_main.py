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
from os import environ
from os.path import exists, join
from PySide6.QtGui import QIcon
from tempfile import TemporaryDirectory

from LogarithmPlotter.logarithmplotter import get_linux_theme, LINUX_THEMES, get_platform_qt_style, \
    register_icon_directories, install_translation, create_engine
from LogarithmPlotter.util import config
from LogarithmPlotter.util.helper import Helper
from LogarithmPlotter.util.latex import Latex
from globals import app

THEMES = [
    "Basic",
    "Universal",
    "Material",
    "Fusion",
    "Windows",
    "macOS"
]

OS_PLATFORMS = [
    "linux",
    "freebsd",
    "win32",
    "cygwin",
    "darwin"
]

@pytest.fixture()
def temporary():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, "graph.png")
    yield tmpfile, directory
    directory.cleanup()

class TestMain:
    def test_linux_themes(self):
        # Check without a desktop
        if "XDG_SESSION_DESKTOP" in environ:
            del environ["XDG_SESSION_DESKTOP"]
        assert get_linux_theme() in THEMES
        # Test various environments.
        environ["XDG_SESSION_DESKTOP"] = "GNOME"
        assert get_linux_theme() in THEMES
        # Test various environments.
        environ["XDG_SESSION_DESKTOP"] = "NON-EXISTENT"
        assert get_linux_theme() in THEMES
        # Check all linux themes are in list
        for desktop, theme in LINUX_THEMES.items():
            assert theme in THEMES

    def test_os_themes(self):
        for platform in OS_PLATFORMS:
            assert get_platform_qt_style(platform) in THEMES

    def test_icon_directories(self):
        base_paths = QIcon.fallbackSearchPaths()
        register_icon_directories()
        # Check if registered
        assert len(base_paths) < len(QIcon.fallbackSearchPaths())
        # Check if all exists
        for p in QIcon.fallbackSearchPaths():
            assert exists(p)

    def test_app(self, temporary):
        assert not app.windowIcon().isNull()
        # Translations
        translator = install_translation(app)
        assert not translator.isEmpty()
        # Engine
        tmpfile, tempdir = temporary
        helper = Helper(".", tmpfile)
        latex = Latex(tempdir)
        engine, js_globals = create_engine(helper, latex, 0)
        assert len(engine.rootObjects()) > 0 # QML File loaded.
        assert type(engine.rootContext().contextProperty("TestBuild")) is bool
        assert engine.rootContext().contextProperty("StartTime") == 0