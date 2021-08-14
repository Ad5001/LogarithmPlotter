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
import QtQuick.Dialogs 1.3 as D
import QtQuick.Controls 2.12
import "../js/objects.js" as Objects
import "../js/historylib.js" as HistoryLib


ListView {
    id: objectListList
    
    signal changed()
    
    property var listViews: {'':''} // Needs to be initialized or will be undefined -_-
    
    model: Object.keys(Objects.types)
    implicitHeight: contentItem.childrenRect.height + footer.height + 10
    
    delegate: ListView {
        id: objTypeList
        property string objType: objectListList.model[index]
        property var editingRows: []
        model: Objects.currentObjects[objType]
        width: objectListList.width
        implicitHeight: contentItem.childrenRect.height
        visible: model != undefined && model.length > 0
        interactive: false
        
        Component.onCompleted: objectListList.listViews[objType] = objTypeList // Listing in order to be refreshed
        
        header: Row {
            width: typeHeaderText.width + typeVisibilityCheckBox.visible
            height: visible ? 20 : 0
            visible: objTypeList.visible
            
            CheckBox {
                id: typeVisibilityCheckBox
                checked: Objects.currentObjects[objType] != undefined ? Objects.currentObjects[objType].every(obj => obj.visible) : true
                onClicked: {
                    for(var obj of Objects.currentObjects[objType]) obj.visible = this.checked
                    for(var obj of objTypeList.editingRows) obj.objVisible = this.checked
                    objectListList.changed()
                }
                
                ToolTip.visible: hovered
                ToolTip.text: checked ? `Hide all ${Objects.types[objType].displayTypeMultiple()}` : `Show all ${Objects.types[objType].displayTypeMultiple()}`
            }
            
            Label {
                id: typeHeaderText
                verticalAlignment: TextInput.AlignVCenter
                text: Objects.types[objType].displayTypeMultiple() + ":"
                font.pixelSize: 20
            }
        }
        
        delegate: Item {
            id: controlRow
            property var obj: Objects.currentObjects[objType][index]
            property alias objVisible: objVisibilityCheckBox.checked
            height: 40
            width: objTypeList.width
            
            Component.onCompleted: objTypeList.editingRows.push(controlRow)
            
            CheckBox {
                id: objVisibilityCheckBox
                checked: Objects.currentObjects[objType][index].visible
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.leftMargin: 5
                onClicked: {
                    history.addToHistory(new HistoryLib.EditedVisibility(
                        Objects.currentObjects[objType][index].name, objType, this.checked
                    ))
                    Objects.currentObjects[objType][index].visible = this.checked
                    objectListList.changed()
                    controlRow.obj = Objects.currentObjects[objType][index]
                }
                
                ToolTip.visible: hovered
                ToolTip.text: checked ? `Hide ${objType} ${obj.name}` : `Show ${objType} ${obj.name}`
            }
            
            Label {
                id: objDescription
                anchors.left: objVisibilityCheckBox.right
                anchors.right: deleteButton.left
                height: parent.height
                verticalAlignment: TextInput.AlignVCenter
                text: obj.getReadableString()
                font.pixelSize: 14
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        objEditor.obj = Objects.currentObjects[objType][index]
                        objEditor.objType = objType
                        objEditor.objIndex = index
                        objEditor.editingRow = controlRow
                        objEditor.show()
                    }
                }
            }
            
            Button {
                id: deleteButton
                width: parent.height - 10
                height: width
                anchors.right: colorPickRect.left
                anchors.rightMargin: 5
                anchors.topMargin: 5
                icon.name: 'delete'
                
                onClicked: {
                    history.addToHistory(new HistoryLib.DeleteObject(
                        objEditor.obj.name, objEditor.objType, objEditor.obj.export()
                    ))
                    Objects.currentObjects[objType][index].delete()
                    Objects.currentObjects[objType].splice(index, 1)
                    objectListList.update()
                }
            }
            
            Rectangle {
                id: colorPickRect
                anchors.right: parent.right
                anchors.rightMargin: 5
                anchors.topMargin: 5
                color: obj.color
                width: parent.height - 10
                height: width
                radius: Math.min(width, height)
                border.width: 2
                border.color: sysPalette.windowText
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: pickColor.open()
                }
            }
            
            D.ColorDialog {
                id: pickColor
                color: obj.color
                title: `Pick new color for ${objType} ${obj.name}`
                onAccepted: {
                    history.addToHistory(new HistoryLib.EditedProperty(
                        obj.name, objType, "color", 
                        obj.color, color.toString()
                    ))
                    obj.color = color.toString()
                    controlRow.obj = Objects.currentObjects[objType][index]
                    objectListList.update()
                }
            }
        }
    }
    
    // Object editor
    EditorDialog {
        id: objEditor
        objectLists: objectListList
    }
    
    // Create items
    footer: ObjectCreationGrid {
        id: createRow
        width: parent.width
        objectEditor: objEditor
        objectLists: objectListList
    }
    
    function update() {
        objectListList.changed()
        for(var objType in objectListList.listViews) {
            objectListList.listViews[objType].model = Objects.currentObjects[objType]
        }
    }
    
    function paramTypeIn(parameter, types = []) {
        if(types.includes(parameter.toString())) return true
        if(typeof parameter == 'object' && 'type' in parameter) 
            return types.includes(parameter.type)
        return false
    }
}
