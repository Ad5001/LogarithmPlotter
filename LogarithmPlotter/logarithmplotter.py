"""
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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

from time import time

from PySide6.QtWidgets import QApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtCore import Qt, QTranslator, QLocale
from PySide6.QtGui import QIcon

from tempfile import TemporaryDirectory
from os import getcwd, chdir, environ, path, remove, close
from platform import release as os_release
from sys import platform, argv, version as sys_version, exit
from sys import path as sys_path

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

config.init()

def get_linux_theme():
    des = {
        "KDE": "default",
        "gnome": "default",
        "lxqt": "fusion",
        "mate": "fusion",
    }
    if "XDG_SESSION_DESKTOP" in environ:
        return des[environ["XDG_SESSION_DESKTOP"]] if environ["XDG_SESSION_DESKTOP"] in des else "fusion"
    else:
        # Android
        return "Material"
        
def run():
    
    if not 'QT_QUICK_CONTROLS_STYLE' in environ:
        environ["QT_QUICK_CONTROLS_STYLE"] = {
            "linux": get_linux_theme(),
            "freebsd": get_linux_theme(),
            "win32": "universal" if os_release == "10" else "fusion",
            "cygwin": "fusion",
            "darwin": "default"
        }[platform]
    
    dep_time = time()
    print("Loaded dependencies in " + str((dep_time - start_time)*1000) + "ms.")

    icon_fallbacks = QIcon.fallbackSearchPaths();
    base_icon_path = path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "icons")
    icon_fallbacks.append(path.realpath(path.join(base_icon_path, "common")))
    icon_fallbacks.append(path.realpath(path.join(base_icon_path, "objects")))
    icon_fallbacks.append(path.realpath(path.join(base_icon_path, "history")))
    icon_fallbacks.append(path.realpath(path.join(base_icon_path, "settings")))
    icon_fallbacks.append(path.realpath(path.join(base_icon_path, "settings", "custom")))
    QIcon.setFallbackSearchPaths(icon_fallbacks);
    
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling) 
    app = QApplication(argv)
    app.setApplicationName("LogarithmPlotter")
    app.setOrganizationName("Ad5001")
    app.styleHints().setShowShortcutsInContextMenus(True)
    app.setWindowIcon(QIcon(path.realpath(path.join(getcwd(), "logarithmplotter.svg"))))
    
    # Installing translators
    translator = QTranslator()
    # Check if lang is forced.
    forcedlang = [p for p in argv if p[:7]=="--lang="]
    locale = QLocale(forcedlang[0][7:]) if len(forcedlang) > 0 else QLocale()
    if (translator.load(locale, "lp", "_", path.realpath(path.join(getcwd(), "i18n")))):
        app.installTranslator(translator);
    
    # Installing macOS file handler.
    macOSFileOpenHandler = None
    if platform == "darwin":
        macOSFileOpenHandler = native.MacOSFileOpenHandler()
        app.installEventFilter(macOSFileOpenHandler)
    
    engine = QQmlApplicationEngine()
    global tmpfile
    helper = Helper(pwd, tmpfile)
    latex = Latex(tempdir)
    engine.rootContext().setContextProperty("Helper", helper)
    engine.rootContext().setContextProperty("Latex", latex)
    engine.rootContext().setContextProperty("TestBuild", "--test-build" in argv)
    engine.rootContext().setContextProperty("StartTime", dep_time)
    
    app.translate("About","About LogarithmPlotter") # FOR SOME REASON, if this isn't included, Qt refuses to load the QML file.

    engine.addImportPath(path.realpath(path.join(getcwd(), "qml")))
    engine.load(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "LogarithmPlotter.qml")))
    

    if not engine.rootObjects():
        print("No root object", path.realpath(path.join(getcwd(), "qml")))
        print(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "LogarithmPlotter.qml")))
        exit(-1)

    # Open the current diagram
    chdir(pwd)
    if len(argv) > 0 and path.exists(argv[-1]) and argv[-1].split('.')[-1] in ['lpf']:
        engine.rootObjects()[0].loadDiagram(argv[-1])
    chdir(path.dirname(path.realpath(__file__)))
    
    if platform == "darwin":
        macOSFileOpenHandler.init_graphics(engine.rootObjects()[0])
    
    # Check for LaTeX installation if LaTeX support is enabled
    if config.getSetting("enable_latex"):
        latex.check_latex_install()
    
    # Check for updates
    if config.getSetting("check_for_updates"):
        check_for_updates(__VERSION__, engine.rootObjects()[0])
    
    exit_code = app.exec_()
    
    tempdir.cleanup()
    config.save()
    exit(exit_code)

if __name__ == "__main__":
    run()

