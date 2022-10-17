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
import QtQuick.Dialogs 1.3 as D
import QtQuick.Controls 2.12
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import "../js/objects.js" as Objects
import "../js/historylib.js" as HistoryLib

/*!
    \qmltype ObjectLists
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Tab of the drawer that allows the user to manage the objects.

    This item allows the user to syntheticly see all objects, while giving the user the ability
    to show, hide, delete, change the location and color, as well as opening the editor dialog
    for each object.
    
    \sa LogarithmPlotter, ObjectCreationGrid, ObjectLists
*/
ScrollView {
    id: objectListList
    
    signal changed()
    
    property var listViews: {'':''} // Needs to be initialized or will be undefined -_-
    
    
    ScrollBar.horizontal.visible: false
    ScrollBar.vertical.visible: true
    
    ListView {
        id: objectsListView
        model: Object.keys(Objects.types)
        width: implicitWidth //objectListList.width - (implicitHeight > objectListList.parent.height ? 20 : 0)
        implicitHeight: contentItem.childrenRect.height + footer.height + 10
        
        delegate: ListView {
            id: objTypeList
            property string objType: objectsListView.model[index]
            property var editingRows: []
            model: Objects.currentObjects[objType]
            width: objectsListView.width
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
                    ToolTip.text: checked ? qsTr("Hide all %1").arg(Objects.types[objType].displayTypeMultiple()) : qsTr("Show all %1").arg(Objects.types[objType].displayTypeMultiple())
                }
                
                Label {
                    id: typeHeaderText
                    verticalAlignment: TextInput.AlignVCenter
                    text: qsTranslate("control", "%1: ").arg(Objects.types[objType].displayTypeMultiple())
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
                    ToolTip.text: checked ? 
                        qsTr("Hide %1 %2").arg(Objects.types[objType].displayType()).arg(obj.name) : 
                        qsTr("Show %1 %2").arg(Objects.types[objType].displayType()).arg(obj.name)
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
                            //objEditor.editingRow = controlRow
                            objEditor.show()
                        }
                    }
                }
                
                Button {
                    id: pointerButton
                    width: parent.height - 10
                    height: width
                    anchors.right: deleteButton.left
                    anchors.rightMargin: 5
                    anchors.topMargin: 5
                    
                    Setting.Icon {
                        id: icon
                        width: 18
                        height: 18
                        anchors.centerIn: parent
                        
                        color: sysPalette.windowText
                        source: '../icons/common/position.svg'
                    }
                    
                    property bool hasXProp: Objects.types[objType].properties().hasOwnProperty('x')
                    property bool hasYProp: Objects.types[objType].properties().hasOwnProperty('y')
                    visible: hasXProp || hasYProp
                    ToolTip.visible: hovered
                    ToolTip.text: qsTr("Set %1 %2 position").arg(Objects.types[objType].displayType()).arg(obj.name)
                    
                    onClicked: {
                        positionPicker.objType = objType
                        positionPicker.objName = obj.name
                        positionPicker.pickX = hasXProp
                        positionPicker.pickY = hasYProp
                        positionPicker.propertyX = 'x'
                        positionPicker.propertyY = 'y'
                        positionPicker.visible = true
                        
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
                    icon.source: '../icons/common/delete.svg'
                    icon.color: sysPalette.buttonText
                    ToolTip.visible: hovered
                    ToolTip.text: qsTr("Delete %1 %2").arg(Objects.types[objType].displayType()).arg(obj.name)
                    
                    onClicked: {
                        history.addToHistory(new HistoryLib.DeleteObject(
                            obj.name, objType, obj.export()
                        ))
                        Objects.deleteObject(obj.name)
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
                    title: qsTr("Pick new color for %1 %2").arg(Objects.types[objType].displayType()).arg(obj.name)
                    onAccepted: {
                        history.addToHistory(new HistoryLib.ColorChanged(
                            obj.name, objType, obj.color, color.toString()
                        ))
                        obj.color = color.toString()
                        controlRow.obj = Objects.currentObjects[objType][index]
                        objectListList.update()
                    }
                }
            }
        }
        
        // Create items
        footer: ObjectCreationGrid {
            id: createRow
            width: objectsListView.width
            objectEditor: objEditor
            objectLists: objectListList
        }
    }
    
    // Object editor
    EditorDialog {
        id: objEditor
    }
    
    /*!
        \qmlmethod void ObjectLists::update()
        Updates the view of the ObjectLists.
    */
    function update() {
        objectListList.changed()
        for(var objType in objectListList.listViews) {
            objectListList.listViews[objType].model = Objects.currentObjects[objType]
        }
    }
    
    /*!
        \qmlmethod void ObjectLists::paramTypeIn(var parameter, var types)
        Checks if the type of the provided \c parameter is in \c types.
        \note The type can be normal string types ('boolean', 'string', 'number'...) or object types (Enum, Dictionay, Object types...). If the latter, only the type of object type should be provided in \c types. E.g: if you want to check if the parameter is an enum, add "Enum" to types.
    */
    function paramTypeIn(parameter, types = []) {
        if(types.includes(parameter.toString())) return true
        if(typeof parameter == 'object' && 'type' in parameter) 
            return types.includes(parameter.type)
        return false
    }
}
