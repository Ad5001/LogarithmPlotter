/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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

import QtQuick.Dialogs 1.3 as D

D.FileDialog {
    id: fileDialog
    
    property bool exportMode: false
    
    title: exportMode ? "Export Logarithmic Graph file" : "Import Logarithmic Graph file"
    nameFilters: ["Logarithmic Graph JSON Data (*.json)", "All files (*)"]

    folder: shortcuts.documents
    selectExisting: !exportMode
    
}
