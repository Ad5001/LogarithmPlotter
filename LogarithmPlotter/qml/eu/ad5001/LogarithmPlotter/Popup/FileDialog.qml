/**
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
 */

import Qt.labs.platform

/*!
    \qmltype FileDialog
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Dialog used to prompt the user to save or load Logarithm Plot Files.
        
    \sa LogarithmPlotter, Settings
*/
FileDialog {
    id: fileDialog
    
    property bool exportMode: false
    
    title: exportMode ? qsTr("Export Logarithm Plot file") : qsTr("Import Logarithm Plot file")
    nameFilters: ["Logarithm Plot File (*.lpf)", "All files (*)"]

    defaultSuffix: 'lpf'
    fileMode: exportMode ? FileDialog.SaveFile : FileDialog.OpenFile
}
