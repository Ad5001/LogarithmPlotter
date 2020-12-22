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

import QtQuick 2.12
import QtQuick.Dialogs 1.3 as D
import QtQuick.Controls 2.12
import "js/objects.js" as Objects
import "js/mathlib.js" as MathLib


ListView {
    id: objectListList
    
    signal changed()
    
    property var listViews: {'':''} // Needs to be initialized or will be undefined -_-
    
    model: Object.keys(Objects.drawableTypes)
    implicitHeight: contentItem.childrenRect.height
    
    delegate: ListView {
        id: objTypeList
        property string objType: objectListList.model[index]
        model: Objects.currentObjects[objType]
        width: objectListList.width
        implicitHeight: contentItem.childrenRect.height
        visible: model.length > 0
        
        Component.onCompleted: objectListList.listViews[objType] = objTypeList // Listing in order to be refreshed
        
        header: Text {
            verticalAlignment: TextInput.AlignVCenter
            color: sysPalette.windowText
            text: objectListList.model[index] + "s:"
            font.pixelSize: 20
        }
        
        delegate: Item {
            id: controlRow
            property var obj: Objects.currentObjects[objType][index]
            height: 40
            width: objTypeList.width
            
            CheckBox {
                id: visibilityCheckBox
                checked: Objects.currentObjects[objType][index].visible
                onClicked: {
                    Objects.currentObjects[objType][index].visible = !Objects.currentObjects[objType][index].visible
                    objectListList.changed()
                    controlRow.obj = Objects.currentObjects[objType][index]
                }
                
                ToolTip.visible: hovered
                ToolTip.text: checked ? `Hide ${objType} ${obj.name}` : `Show ${objType} ${obj.name}`
            }
            
            Text {
                id: objDescription
                anchors.left: visibilityCheckBox.right
                height: parent.height
                verticalAlignment: TextInput.AlignVCenter
                text: obj.getReadableString()
                font.pixelSize: 16
                color: sysPalette.windowText
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        console.log('Showing', objType, index, Objects.currentObjects[objType])
                        objEditor.obj = Objects.currentObjects[objType][index]
                        objEditor.objType = objType
                        objEditor.objIndex = index
                        objEditor.editingRow = controlRow
                        objEditor.open()
                    }
                }
            }
            
            Rectangle {
                anchors.right: parent.right
                anchors.rightMargin: 5
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
                    Objects.currentObjects[objType][index].color = color
                    objectListList.changed()
                    controlRow.obj = Objects.currentObjects[objType][index]
                }
            }
        }
    }
    
    // Object editor
    D.Dialog {
        id: objEditor
        property string objType: 'Point'
        property int objIndex: 0
        property var editingRow: QtObject{}
        property var obj: Objects.currentObjects[objType][objIndex]
        title: `Logarithmic Graph Creator`
        width: 300
        height: 400
        
        Text {
            id: dlgTitle
            anchors.left: parent.left
            anchors.top: parent.top
            verticalAlignment: TextInput.AlignVCenter
            text: `Edit properties of ${objEditor.objType} ${objEditor.obj.name}`
            font.pixelSize: 20
            color: sysPalette.windowText
        }
        
        Column {
            id: dlgProperties
            anchors.top: dlgTitle.bottom
            width: objEditor.width - 40
            //height: 30*Math.max(1, Math.ceil(7 / columns))
            //columns: Math.floor(width / settingWidth)
            spacing: 10
        
            TextSetting {
                id: nameProperty
                height: 30
                label: "Name"
                min: 1
                width: dlgProperties.width
                defValue: objEditor.obj.name
                onChanged: function(newValue) {
                    Objects.currentObjects[objEditor.objType][objEditor.objIndex].name = newValue
                    // TODO Resolve dependencies
                    objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    objEditor.editingRow.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    objectListList.changed()
                }
            }
        
            ComboBoxSetting {
                id: labelContentProperty
                height: 30
                width: dlgProperties.width
                label: "Label content"
                model: ["null", "name", "name + value"]
                currentIndex: model.indexOf(objEditor.obj.labelContent)
                onActivated: function(newIndex) {
                    Objects.currentObjects[objEditor.objType][objEditor.objIndex].labelContent = model[newIndex]
                    objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    objEditor.editingRow.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    objectListList.changed()
                }
            }
            
            // Dynamic properties
            Repeater {
                property var objProps: Objects.drawableTypes[objEditor.objType].properties()
                model: Array.from(Object.keys(objProps), prop => [prop, objProps[prop]]) // Converted to 2-dimentional array.
                
                Item {
                    height: 30
                    width: dlgProperties.width
                    property string label: modelData[0].charAt(0).toUpperCase() + modelData[0].slice(1).replace(/([A-Z])/g," $1");
                    
                    TextSetting {
                        id: customPropText
                        height: 30
                        width: parent.width
                        label: parent.label
                        min: 1
                        isDouble: modelData[1] == 'number'
                        visible: ['Expression', 'Domain', 'string', 'number'].indexOf(modelData[1]) >= 0 
                        defValue: visible ? {
                            'Expression': function(){return objEditor.obj[modelData[0]].toEditableString()},
                            'Domain': function(){return objEditor.obj[modelData[0]].toString()},
                            'string': function(){return objEditor.obj[modelData[0]]},
                            'number': function(){return objEditor.obj[modelData[0]]}
                        }[modelData[1]]() : ""
                        onChanged: function(newValue) {
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = {
                                'Expression': function(){return new MathLib.Expression(newValue)},
                                'Domain': function(){return MathLib.parseDomain(newValue)},
                                'string': function(){return newValue},
                                'number': function(){return parseFloat(newValue)}
                            }[modelData[1]]()
                            // TODO Resolve dependencies
                            objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                            objEditor.editingRow.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                            objectListList.changed()
                        }
                        Component.onCompleted: {
                            //console.log(modelData[0], objEditor.obj[modelData[0]],modelData[1], defValue)
                        }
                    }
                    
                    ComboBoxSetting {
                        id: customPropCombo
                        height: 30
                        width: dlgProperties.width
                        label: parent.label
                        model: visible ? modelData[1] : []
                        visible: Array.isArray(modelData[1])
                        currentIndex: model.indexOf(objEditor.obj[modelData[0]])

                        onActivated: function(newIndex) {
                            // Setting object property.
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = model[newIndex]
                            // Refreshing
                            objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                            objEditor.editingRow.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                            objectListList.changed()
                        }
                    }
                }
            }
        }
    }
    
    footer: Column {
        id: createRow
        width: parent.width
        
        Text {
            id: createTitle
            verticalAlignment: TextInput.AlignVCenter
            text: '+ Create new:'
            font.pixelSize: 20
            color: sysPalette.windowText
        }
        
        Repeater {
            model: Object.keys(Objects.drawableTypes)
            
            Button {
                id: createBtn
                text: modelData
                width: createRow.width
                flat: false
                
                contentItem: Text {
                    
                    text: createBtn.text
                    font.pixelSize: 20
                    opacity: enabled ? 1.0 : 0.3
                    color: sysPalette.windowText
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                
                onClicked: {
                    var newobj = new Objects.drawableTypes[modelData]()
                    if(Object.keys(Objects.currentObjects).indexOf(modelData) == -1) 
                        Objects.currentObjects[modelData] = []
                    Objects.currentObjects[modelData].push(newobj)
                    objectListList.changed()
                    console.log(objectListList, objectListList.listViews)
                    objectListList.listViews[modelData].model = Objects.currentObjects[modelData]
                }
            }
        }
    }
}
