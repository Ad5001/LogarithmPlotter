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

from PySide2.QtCore import Qt, QRunnable, QThreadPool, QThread, QObject, Signal, QCoreApplication
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
from sys import argv

class UpdateInformation(QObject):
    got_update_info = Signal(bool, str, bool)

class UpdateCheckerRunnable(QRunnable):
    def __init__(self, current_version, callback):
        QRunnable.__init__(self)
        self.current_version = current_version
        self.callback = callback

    def run(self):
        msg_text = "Unknown update error."
        show_alert = True
        update_available = False
        try:
            # Fetching version
            r = urlopen("https://api.ad5001.eu/update/v1/LogarithmPlotter")
            lines = r.readlines()
            r.close()
            # Parsing version
            version = "".join(map(chr, lines[0])).strip() # Converts byte to string.
            version_tuple = version.split(".")
            is_version_newer = False
            if "dev" in self.current_version:
                # We're on a dev version
                current_version_tuple = self.current_version.split(".")[:-1] # Removing the dev0+git bit.
                is_version_newer = version_tuple >= current_version_tuple # If equals, that means we got out of testing phase.
            else:
                current_version_tuple = self.current_version.split(".")
                is_version_newer = version_tuple > current_version_tuple
            if is_version_newer:
                msg_text = QCoreApplication.translate("update","An update for LogarithPlotter (v{}) is available.").format(version)
                update_available = True
            else:
                show_alert = False
                msg_text = QCoreApplication.translate("update","No update available.")
                
        except HTTPError as e:
            msg_text = QCoreApplication.translate("update","Could not fetch update information: Server error {}.").format(str(e.code))
        except URLError as e:
            msg_text = QCoreApplication.translate("update","Could not fetch update information: {}.").format(str(e.reason))
        self.callback.got_update_info.emit(show_alert, msg_text,update_available)

def check_for_updates(current_version, window):
    """
    Checks for updates in the background, and sends an alert with information.
    """
    if "--no-check-for-updates" in argv:
        return # 
    def cb(show_alert, msg_text, update_available):
        pass
        if show_alert:
            window.showAlert(msg_text)
        if update_available:
            window.showUpdateMenu()
            
    update_info = UpdateInformation()
    update_info.got_update_info.connect(cb)
    
    runnable = UpdateCheckerRunnable(current_version, update_info)
    QThreadPool.globalInstance().start(runnable)
