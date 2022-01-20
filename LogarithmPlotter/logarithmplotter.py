"""
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
 *  Copyright (C) 2022  Ad5001
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

start_time = time()

from PySide2.QtWidgets import QApplication, QFileDialog
from PySide2.QtQml import QQmlApplicationEngine, qmlRegisterType
from PySide2.QtCore import Qt, QObject, Signal, Slot, Property, QTranslator, QLocale, QCoreApplication
from PySide2.QtGui import QIcon, QImage, QKeySequence
from PySide2 import __version__ as PySide2_version

from tempfile import mkstemp
from os import getcwd, chdir, environ, path, remove, close
from platform import release as os_release
from json import dumps, loads
from sys import platform, argv, version as sys_version, exit
from webbrowser import open as openWeb

# Create the temporary file for saving copied screenshots
fd, tmpfile = mkstemp(suffix='.png')
pwd = getcwd()

chdir(path.dirname(path.realpath(__file__)))

from sys import path as sys_path
if path.realpath(path.join(getcwd(), "..")) not in sys_path:
    sys_path.append(path.realpath(path.join(getcwd(), "..")))


from LogarithmPlotter import config, native, __VERSION__
from LogarithmPlotter.update import check_for_updates

config.init()

def get_linux_theme():
    des = {
        "KDE": "org.kde.desktop",
        "gnome": "default",
        "lxqt": "fusion",
        "mate": "fusion",
    }
    if "XDG_SESSION_DESKTOP" in environ:
        return des[environ["XDG_SESSION_DESKTOP"]] if environ["XDG_SESSION_DESKTOP"] in des else "fusion"
    else:
        # Android
        return "Material"

class Helper(QObject):
    
    def __init__(self, engine: QQmlApplicationEngine):
        QObject.__init__(self)
        self.engine = engine;

    @Slot(str, str)
    def write(self, filename, filedata):
        chdir(pwd)
        if path.exists(path.dirname(path.realpath(filename))):
            if filename.split(".")[-1] == "lpf":
                # Add header to file
                filedata = "LPFv1" + filedata
            f = open(path.realpath(filename), 'w',  -1, 'utf8')
            f.write(filedata)
            f.close()
        chdir(path.dirname(path.realpath(__file__)))
        
    @Slot(str, result=str)
    def load(self, filename):
        chdir(pwd)
        data = '{}'
        from PySide2.QtWidgets import QMessageBox
        if path.exists(path.realpath(filename)):
            f = open(path.realpath(filename), 'r',  -1, 'utf8')
            data = f.read()
            f.close()
            try:
                if data[:5] == "LPFv1":
                    # V1 version of the file
                    data = data[5:]
                elif data[0] == "{" and "type" in loads(data) and loads(data)["type"] == "logplotv1":
                    pass
                else:
                    raise Exception("Invalid LogarithmPlotter file.")
            except Exception as e: # If file can't be loaded
                QMessageBox.warning(None, 'LogarithmPlotter', QCoreApplication.translate('main','Could not open file "{}":\n{}').format(filename, e), QMessageBox.Ok) # Cannot parse file
        else:
            QMessageBox.warning(None, 'LogarithmPlotter', QCoreApplication.translate('main','Could not open file: "{}"\nFile does not exist.').format(filename), QMessageBox.Ok) # Cannot parse file
        chdir(path.dirname(path.realpath(__file__)))
        return data

    @Slot(result=str)
    def gettmpfile(self):
        global tmpfile
        return tmpfile
    
    @Slot()
    def copyImageToClipboard(self):
        global tmpfile
        clipboard = QApplication.clipboard()
        clipboard.setImage(QImage(tmpfile))
    
    @Slot(result=str)
    def getVersion(self):
        return __VERSION__
    
    @Slot(str, result=str)
    def getSetting(self, namespace):
        return config.getSetting(namespace)
    
    @Slot(str, result=bool)
    def getSettingBool(self, namespace):
        return config.getSetting(namespace)
    
    @Slot(str, str)
    def setSetting(self, namespace, value):
        return config.setSetting(namespace, value)
    
    @Slot(str, bool)
    def setSettingBool(self, namespace, value):
        return config.setSetting(namespace, value)
    
    @Slot(str)
    def setLanguage(self, new_lang):
        config.setSetting("language", new_lang)
    
    @Slot(result=str)
    def getDebugInfos(self):
        """
        Returns the version info about Qt, PySide2 & Python
        """
        return QCoreApplication.translate('main',"Built with PySide2 (Qt) v{} and python v{}").format(PySide2_version, sys_version.split("\n")[0])
    
    @Slot(str)
    def openUrl(self, url):
        openWeb(url)
        
def run():
    
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
    icon_fallbacks.append(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "icons")))
    icon_fallbacks.append(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "icons", "settings")))
    icon_fallbacks.append(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "icons", "settings", "custom")))
    QIcon.setFallbackSearchPaths(icon_fallbacks);
    
    app = QApplication(argv)
    app.setApplicationName("LogarithmPlotter")
    app.setOrganizationName("Ad5001")
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
    helper = Helper(engine)
    engine.rootContext().setContextProperty("Helper", helper)
    engine.rootContext().setContextProperty("TestBuild", "--test-build" in argv)
    engine.rootContext().setContextProperty("StartTime", dep_time)
    
    app.translate("About","About LogarithmPlotter") # FOR SOME REASON, if this isn't included, Qt refuses to load the QML file.

    engine.addImportPath(path.realpath(path.join(getcwd(), "qml")))
    engine.load(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "LogarithmPlotter.qml")))
    

    if not engine.rootObjects():
        print("No root object", path.realpath(path.join(getcwd(), "qml")))
        print(path.realpath(path.join(getcwd(), "qml", "eu", "ad5001", "LogarithmPlotter", "LogarithmPlotter.qml")))
        exit(-1)

    chdir(pwd)
    if len(argv) > 0 and path.exists(argv[-1]) and argv[-1].split('.')[-1] in ['lpf']:
        engine.rootObjects()[0].loadDiagram(argv[-1])
    chdir(path.dirname(path.realpath(__file__)))
    
    if platform == "darwin":
        macOSFileOpenHandler.init_graphics(engine.rootObjects()[0])
    
    # Check for updates
    if config.getSetting("check_for_updates"):
        check_for_updates(__VERSION__, engine.rootObjects()[0])
    
    exit_code = app.exec_()
    
    close(fd)
    remove(tmpfile)
    config.save()
    exit(exit_code)

if __name__ == "__main__":
    run()

