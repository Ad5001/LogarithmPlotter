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

from os import getcwd, chdir, environ, path
from platform import release as os_release
from sys import path as sys_path
from sys import platform, argv, exit
from tempfile import TemporaryDirectory
from time import time

from PySide6.QtCore import QTranslator, QLocale
from PySide6.QtGui import QIcon
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtQuickControls2 import QQuickStyle
from PySide6.QtWidgets import QApplication

start_time = time()

# Create the temporary directory for saving copied screenshots and latex files
tempdir = TemporaryDirectory()
tmpfile = path.join(tempdir.name, 'graph.png')
pwd = getcwd()

chdir(path.dirname(path.realpath(__file__)))

if path.realpath(path.join(getcwd(), "..")) not in sys_path:
    sys_path.append(path.realpath(path.join(getcwd(), "..")))

from LogarithmPlotter import __VERSION__
from LogarithmPlotter.util import config, native
from LogarithmPlotter.util.update import check_for_updates
from LogarithmPlotter.util.helper import Helper
from LogarithmPlotter.util.latex import Latex
from LogarithmPlotter.util.js import PyJSValue

LINUX_THEMES = {  # See https://specifications.freedesktop.org/menu-spec/latest/onlyshowin-registry.html
    "COSMIC": "Basic",
    "GNOME": "Basic",
    "GNOME-Classic": "Basic",
    "GNOME-Flashback": "Basic",
    "KDE": "Fusion",
    "LXDE": "Basic",
    "LXQt": "Fusion",
    "MATE": "Fusion",
    "TDE": "Fusion",
    "Unity": "Basic",
    "XFCE": "Basic",
    "Cinnamon": "Fusion",
    "Pantheon": "Basic",
    "DDE": "Basic",
    "EDE": "Fusion",
    "Endless": "Basic",
    "Old": "Fusion",
}


def get_linux_theme() -> str:
    if "XDG_SESSION_DESKTOP" in environ:
        if environ["XDG_SESSION_DESKTOP"] in LINUX_THEMES:
            return LINUX_THEMES[environ["XDG_SESSION_DESKTOP"]]
        return "Fusion"
    else:
        # Android
        return "Material"


def get_platform_qt_style(os) -> str:
    return {
        "linux": get_linux_theme(),
        "freebsd": get_linux_theme(),
        "win32": "Universal" if os_release() in ["10", "11", "12", "13", "14"] else "Windows",
        "cygwin": "Fusion",
        "darwin": "macOS"
    }[os]


def register_icon_directories() -> None:
    icon_fallbacks = QIcon.fallbackSearchPaths()
    base_icon_path = path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "icons")
    paths = [["common"], ["objects"], ["history"], ["settings"], ["settings", "custom"]]
    for p in paths:
        icon_fallbacks.append(path.realpath(path.join(base_icon_path, *p)))
    QIcon.setFallbackSearchPaths(icon_fallbacks)


def create_qapp() -> QApplication:
    app = QApplication(argv)
    app.setApplicationName("LogarithmPlotter")
    app.setApplicationDisplayName("LogarithmPlotter")
    app.setApplicationVersion(f"v{__VERSION__}")
    app.setDesktopFileName("eu.ad5001.LogarithmPlotter")
    app.setOrganizationName("Ad5001")
    app.styleHints().setShowShortcutsInContextMenus(True)
    app.setWindowIcon(QIcon(path.realpath(path.join(getcwd(), "logarithmplotter.svg"))))
    return app


def install_translation(app: QApplication) -> QTranslator:
    # Installing translators
    translator = QTranslator()
    # Check if lang is forced.
    forcedlang = [p for p in argv if p[:7] == "--lang="]
    locale = QLocale(forcedlang[0][7:]) if len(forcedlang) > 0 else QLocale()
    if not translator.load(locale, "lp", "_", path.realpath(path.join(getcwd(), "i18n"))):
        # Load default translation
        translator.load(QLocale("en"), "lp", "_", path.realpath(path.join(getcwd(), "i18n")))
    app.installTranslator(translator)
    return translator


def create_engine(helper: Helper, latex: Latex, dep_time: float) -> tuple[QQmlApplicationEngine, PyJSValue]:
    global tmpfile
    engine = QQmlApplicationEngine()
    js_globals = PyJSValue(engine.globalObject())
    js_globals.Modules = engine.newObject()
    js_globals.Helper = engine.newQObject(helper)
    js_globals.Latex = engine.newQObject(latex)
    engine.rootContext().setContextProperty("TestBuild", "--test-build" in argv)
    engine.rootContext().setContextProperty("StartTime", dep_time)

    engine.addImportPath(path.realpath(path.join(getcwd(), "qml")))
    engine.load(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "LogarithmPlotter.qml")))

    return engine, js_globals


def run():
    config.init()

    if not 'QT_QUICK_CONTROLS_STYLE' in environ:
        QQuickStyle.setStyle(get_platform_qt_style(platform))

    dep_time = time()
    print("Loaded dependencies in " + str((dep_time - start_time) * 1000) + "ms.")

    register_icon_directories()
    app = create_qapp()
    translator = install_translation(app)

    # Installing macOS file handler.
    macos_file_open_handler = None
    if platform == "darwin":
        macos_file_open_handler = native.MacOSFileOpenHandler()
        app.installEventFilter(macos_file_open_handler)

    helper = Helper(pwd, tmpfile)
    latex = Latex(tempdir)
    engine, js_globals = create_engine(helper, latex, dep_time)

    if len(engine.rootObjects()) == 0:  # No root objects loaded
        print("No root object", path.realpath(path.join(getcwd(), "qml")))
        exit(-1)

    # Open the current diagram
    chdir(pwd)
    if len(argv) > 0 and path.exists(argv[-1]) and argv[-1].split('.')[-1] in ['lpf']:
        js_globals.Modules.IO.loadDiagram(argv[-1])
    chdir(path.dirname(path.realpath(__file__)))

    if platform == "darwin":
        macos_file_open_handler.init_io(js_globals.Modules.IO)

    # Check for LaTeX installation if LaTeX support is enabled
    if config.getSetting("enable_latex"):
        latex.checkLatexInstallation()

    # Check for updates
    if config.getSetting("check_for_updates"):
        check_for_updates(__VERSION__, engine.rootObjects()[0])

    exit_code = app.exec()

    tempdir.cleanup()
    config.save()
    exit(exit_code)


if __name__ == "__main__":
    run()
