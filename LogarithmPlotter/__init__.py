"""
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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

from PySide2.QtWidgets import QApplication, QFileDialog
from PySide2.QtQml import QQmlApplicationEngine, qmlRegisterType
from PySide2.QtCore import Qt, QObject, Signal, Slot, Property
from PySide2.QtGui import QIcon, QImage
from PySide2 import __version__ as PySide2_version

import os
import tempfile
from platform import release as os_release
from json import dumps
from sys import platform, argv, version as sys_version
import webbrowser

__VERSION__ = "0.0.1.dev0"

tempfile = tempfile.mkstemp(suffix='.png')[1]

def get_linux_theme():
    des = {
        "KDE": "Flat",
        "gnome": "default",
        "lxqt": "fusion",
        "mate": "fusion",
    }
    if "XDG_SESSION_DESKTOP" in os.environ:
        return des[os.environ["XDG_SESSION_DESKTOP"]] if os.environ["XDG_SESSION_DESKTOP"] in des else "fusion"
    else:
        # Android
        return "Material"

class Helper(QObject):

    @Slot(str, str)
    def write(self, filename, filedata):
        if os.path.exists(os.path.dirname(os.path.realpath(filename))):
            f = open(os.path.realpath(filename), 'w',  -1, 'utf8')
            f.write(filedata)
            f.close()
        
    @Slot(str, result=str)
    def load(self, filename):
        if os.path.exists(os.path.realpath(filename)):
            f = open(os.path.realpath(filename), 'r',  -1, 'utf8')
            data = f.read()
            f.close()
            return data
        return '{}'

    @Slot(result=str)
    def gettmpfile(self):
        global tempfile
        return tempfile
    
    @Slot()
    def copyImageToClipboard(self):
        global tempfile
        clipboard = QApplication.clipboard()
        clipboard.setImage(QImage(tempfile))
    
    @Slot(result=str)
    def getVersion(self):
        return __VERSION__
    
    @Slot(result=str)
    def getDebugInfos(self):
        """
        Returns the version info about Qt, PySide2 & Python
        """
        return "Built with PySide2 (Qt) v{} and python v{}".format(PySide2_version, sys_version.split("\n")[0])
    
    @Slot(str)
    def openUrl(self, url):
        webbrowser.open(url)
        
def run():
    pwd = os.getcwd()
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    
    os.environ["QT_QUICK_CONTROLS_STYLE"] = {
        "linux": get_linux_theme(),
        "freebsd": get_linux_theme(),
        "win32": "universal" if os_release == "10" else "fusion",
        "cygwin": "fusion",
        "darwin": "imagine"
    }[platform]

    app = QApplication(argv)
    app.setApplicationName("LogarithmPlotter")
    app.setOrganizationName("Ad5001")
    app.setWindowIcon(QIcon(os.path.realpath(os.path.join(os.getcwd(), "..", "logplotter.svg"))))
    engine = QQmlApplicationEngine()
    helper = Helper()
    engine.rootContext().setContextProperty("Helper", helper)

    engine.addImportPath(os.path.realpath(os.path.join(os.getcwd(), "qml")))
    engine.load(os.path.realpath(os.path.join(os.getcwd(), "qml", "LogGraph.qml")))

    os.chdir(pwd)
    if len(argv) > 0 and os.path.exists(argv[-1]) and argv[-1].split('.')[-1] in ['json', 'lgg', 'lpf']:
        print(argv[-1])
        engine.rootObjects()[0].loadDiagram(argv[-1])
    os.chdir(os.path.dirname(os.path.realpath(__file__)))

    if not engine.rootObjects():
        print("No root object")
        exit(-1)
    exit_code = app.exec_()

    os.remove(tempfile)
    exit(exit_code)

if __name__ == "__main__":
    run()