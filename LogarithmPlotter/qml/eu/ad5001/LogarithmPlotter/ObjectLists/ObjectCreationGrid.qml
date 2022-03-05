/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting


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
                width: 96
                visible: Objects.types[modelData].createable()
                height: visible ? width*0.8 : 0
                // The KDE SDK is kinda buggy, so it respects neither specified color nor display propreties.
                //display: AbstractButton.TextUnderIcon
    
                Setting.Icon {
                    id: icon
                    width: 24
                    height: 24
                    anchors.left: parent.left
                    anchors.leftMargin: (parent.width-width)/2
                    anchors.top: parent.top
                    anchors.topMargin: (label.y-height)/2
                    
                    color: sysPalette.windowText
                    source: '../icons/objects/'+modelData+'.svg'
                }
    
                Label {
                    id: label
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: 5
                    anchors.left: parent.left
                    anchors.leftMargin: 4
                    anchors.right: parent.right
                    anchors.rightMargin: 4
                    horizontalAlignment: Text.AlignHCenter
                    font.pixelSize: 14
                    text: Objects.types[modelData].displayType()
                    wrapMode: Text.WordWrap
                    clip: true
                }
                
                ToolTip.visible: hovered
                ToolTip.delay: 200
                ToolTip.text: label.text
                
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
