/**
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
 */

import QtQuick 2.12
import QtQuick.Controls 2.12
import "../js/objects.js" as Objects
import "../js/historylib.js" as HistoryLib

/*!
    \qmltype ObjectCreationGrid
    \inqmlmodule eu.ad5001.LogarithmPlotter.ObjectLists
    \brief Grid with buttons to create objects.

    \sa LogarithmPlotter, ObjectLists
*/
Column {
    id: createRow
    property var objectEditor
    property var objectLists
    
    Label {
        id: createTitle
        verticalAlignment: TextInput.AlignVCenter
        text: qsTr('+ Create new:')
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
                icon.source: '../icons/objects/' + modelData + '.svg'
                icon.width: 24
                icon.height: 24
                icon.color: sysPalette.windowText
                ToolTip.visible: hovered
                ToolTip.delay: 200
                ToolTip.text: text
                
                onClicked: {
                    var newObj = Objects.createNewRegisteredObject(modelData)
                    history.addToHistory(new HistoryLib.CreateNewObject(newObj.name, modelData, newObj.export()))
                    objectLists.update()
                    objectEditor.obj = Objects.currentObjects[modelData][Objects.currentObjects[modelData].length - 1]
                    objectEditor.objType = modelData
                    objectEditor.objIndex = Objects.currentObjects[modelData].length - 1
                    objectEditor.show()
                }
            }
        }
    }
}
