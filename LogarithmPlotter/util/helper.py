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

from PySide6.QtWidgets import QMessageBox, QApplication
from PySide6.QtCore import QRunnable, QThreadPool, QThread, QObject, Signal, Slot, QCoreApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtGui import QImage
from PySide6 import __version__ as PySide6_version

from os import chdir, path
from json import loads
from sys import version as sys_version
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

from LogarithmPlotter import __VERSION__
from LogarithmPlotter.util import config


class ChangelogFetcher(QRunnable):
    def __init__(self, helper):
        QRunnable.__init__(self)
        self.helper = helper

    def run(self):
        msg_text = "Unknown changelog error."
        try:
            # Fetching version
            r = urlopen("https://api.ad5001.eu/changelog/logarithmplotter/?version=" + __VERSION__)
            lines = r.readlines()
            r.close()
            msg_text = "".join(map(lambda x: x.decode('utf-8'), lines)).strip()
        except HTTPError as e:
            msg_text = QCoreApplication.translate("changelog", "Could not fetch changelog: Server error {}.").format(
                str(e.code))
        except URLError as e:
            msg_text = QCoreApplication.translate("changelog", "Could not fetch update: {}.").format(str(e.reason))
        self.helper.gotChangelog.emit(msg_text)


class Helper(QObject):
    changelogFetched = Signal(str)
    gotChangelog = Signal(str)

    def __init__(self, cwd: str, tmpfile: str):
        QObject.__init__(self)
        self.cwd = cwd
        self.tmpfile = tmpfile
        self.gotChangelog.connect(self.fetched)

    def fetched(self, changelog: str):
        self.changelogFetched.emit(changelog)

    @Slot(str, str)
    def write(self, filename, filedata):
        chdir(self.cwd)
        if path.exists(path.dirname(path.realpath(filename))):
            if filename.split(".")[-1] == "lpf":
                # Add header to file
                filedata = "LPFv1" + filedata
            f = open(path.realpath(filename), 'w', -1, 'utf8')
            f.write(filedata)
            f.close()
        chdir(path.dirname(path.realpath(__file__)))

    @Slot(str, result=str)
    def load(self, filename):
        chdir(self.cwd)
        data = '{}'
        if path.exists(path.realpath(filename)):
            f = open(path.realpath(filename), 'r', -1, 'utf8')
            data = f.read()
            f.close()
            try:
                if data[:5] == "LPFv1":
                    # V1 version of the file
                    data = data[5:]
                elif data[0] == "{" and "type" in loads(data) and loads(data)["type"] == "logplotv1":
                    pass
                elif data[:3] == "LPF":
                    # More recent version of LogarithmPlotter file, but incompatible with the current format
                    raise Exception(QCoreApplication.translate("This file was created by a more recent version of LogarithmPlotter and cannot be backloaded in LogarithmPlotter v{}.\nPlease update LogarithmPlotter to open this file.".format(__VERSION__)))
                else:
                    raise Exception("Invalid LogarithmPlotter file.")
            except Exception as e:  # If file can't be loaded
                QMessageBox.warning(None, 'LogarithmPlotter',
                                    QCoreApplication.translate('main', 'Could not open file "{}":\n{}').format(filename,
                                                                                                               e),
                                    QMessageBox.Ok)  # Cannot parse file
        else:
            QMessageBox.warning(None, 'LogarithmPlotter', QCoreApplication.translate('main', 'Could not open file: "{}"\nFile does not exist.').format(filename), QMessageBox.Ok)  # Cannot parse file
        try:
            chdir(path.dirname(path.realpath(__file__)))
        except NotADirectoryError as e:
            # Triggered on bundled versions of MacOS when it shouldn't. Prevents opening files.
            # See more at https://git.ad5001.eu/Ad5001/LogarithmPlotter/issues/1
            pass
        return data

    @Slot(result=str)
    def gettmpfile(self):
        return self.tmpfile

    @Slot()
    def copyImageToClipboard(self):
        clipboard = QApplication.clipboard()
        clipboard.setImage(QImage(self.tmpfile))

    @Slot(result=str)
    def getVersion(self):
        return __VERSION__

    @Slot(str, result=str)
    def getSetting(self, namespace):
        return config.getSetting(namespace)

    @Slot(str, result=float)
    def getSettingInt(self, namespace):
        print('Getting', namespace, config.getSetting(namespace))
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

    @Slot(str, float)
    def setSettingInt(self, namespace, value):
        return config.setSetting(namespace, value)

    @Slot(str)
    def setLanguage(self, new_lang):
        config.setSetting("language", new_lang)

    @Slot(result=str)
    def getDebugInfos(self):
        """
        Returns the version info about Qt, PySide6 & Python
        """
        return QCoreApplication.translate('main', "Built with PySide6 (Qt) v{} and python v{}").format(PySide6_version,
                                                                                                       sys_version.split(
                                                                                                           "\n")[0])

    @Slot()
    def fetchChangelog(self):
        changelog_cache_path = path.join(path.dirname(path.realpath(__file__)), "CHANGELOG.md")
        print(changelog_cache_path)
        if path.exists(changelog_cache_path):
            # We have a cached version of the changelog, for env that don't have access to the internet.
            f = open(changelog_cache_path);
            self.changelogFetched.emit("".join(f.readlines()).strip())
            f.close()
        else:
            # Fetch it from the internet.
            runnable = ChangelogFetcher(self)
            QThreadPool.globalInstance().start(runnable)
