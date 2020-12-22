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
import "js/utils.js" as Utils


ListView {
    id: objectListList
    
    signal changed()
    
    property var listViews: {'':''} // Needs to be initialized or will be undefined -_-
    
    model: Object.keys(Objects.types)
    implicitHeight: contentItem.childrenRect.height
    
    delegate: ListView {
        id: objTypeList
        property string objType: objectListList.model[index]
        model: Objects.currentObjects[objType]
        width: objectListList.width
        implicitHeight: contentItem.childrenRect.height
        visible: model != undefined && model.length > 0
        
        Component.onCompleted: objectListList.listViews[objType] = objTypeList // Listing in order to be refreshed
        
        header: Text {
            verticalAlignment: TextInput.AlignVCenter
            color: sysPalette.windowText
            text: objectListList.model[index] + "s:"
            font.pixelSize: 20
            visible: objTypeList.visible
            height: visible ? 20 : 0
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
                    Objects.currentObjects[objType][index].color = color.toString()
                    controlRow.obj = Objects.currentObjects[objType][index]
                    objectListList.update()
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
        title: `Logarithmic Plotter`
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
            spacing: 10
        
            TextSetting {
                id: nameProperty
                height: 30
                label: "Name"
                min: 1
                width: dlgProperties.width
                defValue: objEditor.obj.name
                onChanged: function(newValue) {
                    if(Utils.parseName(newValue) != '') {
                        Objects.currentObjects[objEditor.objType][objEditor.objIndex].name = Utils.parseName(newValue)
                        // TODO Resolve dependencies
                        objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                        //objEditor.editingRow.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                        objectListList.update()
                    }
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
                    objectListList.update()
                }
            }
            
            // Dynamic properties
            Repeater {
                property var objProps: Objects.types[objEditor.objType].properties()
                model: Array.from(Object.keys(objProps), prop => [prop, objProps[prop]]) // Converted to 2-dimentional array.
                
                Item {
                    height: 30
                    width: dlgProperties.width
                    property string label: Utils.camelCase2readable(modelData[0])
                    
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
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
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
                        // True to select an object of type, false for enums.
                        property bool selectObjMode: (typeof modelData[1] == "string" && Object.keys(Objects.types).indexOf(modelData[1]) >= 0)
                        model: visible ? 
                            (selectObjMode ? Objects.getObjectsName(modelData[1]).concat(['+ Create new ' + modelData[1]]) : modelData[1]) 
                            : []
                        visible: Array.isArray(modelData[1]) || selectObjMode
                        currentIndex: model.indexOf(selectObjMode ? objEditor.obj[modelData[0]].name : objEditor.obj[modelData[0]])

                        onActivated: function(newIndex) {
                            // Setting object property.
                            if(selectObjMode) {
                                var selectedObj = Objects.getObjectByName(model[newIndex])
                                if(selectedObj == null) {
                                    selectedObj = Objects.createNewRegisteredObject(modelData[1])
                                    model = Objects.getObjectsName(modelData[1]).concat(['+ Create new ' + modelData[1]])
                                    currentIndex = model.indexOf(selectedObj.name)
                                }
                                Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = selectedObj
                            } else {
                                Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = model[newIndex]
                            }
                            // Refreshing
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
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
            model: Object.keys(Objects.types)
            
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
                    Objects.createNewRegisteredObject(modelData)
                    objectListList.update()
                }
            }
        }
    }
    
    function update() {
        objectListList.changed()
        objectListList.model.forEach(function(objType){
            objectListList.listViews[objType].model = Objects.currentObjects[objType]
        })
    }
}
