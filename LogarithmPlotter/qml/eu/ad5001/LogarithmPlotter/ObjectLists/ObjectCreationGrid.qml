/**
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
 */

import QtQuick 2.12
import QtQuick.Controls 2.12
import "../js/objects.js" as Objects
import "../js/historylib.js" as HistoryLib

Column {
    id: createRow
    property var objectEditor
    property var objectLists
    
    Label {
        id: createTitle
        verticalAlignment: TextInput.AlignVCenter
        text: '+ Create new:'
        font.pixelSize: 20
    }
    
    Grid {
        width: parent.width
        columns: 3
        Repeater {
            model: Object.keys(Objects.types)
            
            Button {
                id: createBtn
                text: Objects.types[modelData].displayType()
                width: parent.width/3
                visible: Objects.types[modelData].createable()
                height: visible ? implicitHeight : 0
                display: AbstractButton.TextUnderIcon
                icon.name: modelData
                icon.source: '../icons/' + modelData + '.svg'
                icon.width: 24
                icon.height: 24
                icon.color: sysPalette.windowText
                
                onClicked: {
                    var newObj = Objects.createNewRegisteredObject(modelData)
                    history.addToHistory(new HistoryLib.CreateNewObject(newObj.name, modelData, newObj.export()))
                    objectLists.update()
                    objectEditor.obj = Objects.currentObjects[modelData][Objects.currentObjects[modelData].length - 1]
                    objectEditor.objType = modelData
                    objectEditor.objIndex = Objects.currentObjects[modelData].length - 1
                    objectEditor.editingRow = objectLists.listViews[modelData].editingRows[objectEditor.objIndex]
                    objectEditor.show()
                }
            }
        }
    }
}
