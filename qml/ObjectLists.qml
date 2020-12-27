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
                ToolTip.text: checked ? `Hide all ${Objects.types[objType].typeMultiple()}` : `Show all ${Objects.types[objType].typeMultiple()}`
            }
            
            Text {
                id: typeHeaderText
                verticalAlignment: TextInput.AlignVCenter
                color: sysPalette.windowText
                text: Objects.types[objType].typeMultiple() + ":"
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
                    Objects.currentObjects[objType][index].visible = this.checked
                    objectListList.changed()
                    controlRow.obj = Objects.currentObjects[objType][index]
                }
                
                ToolTip.visible: hovered
                ToolTip.text: checked ? `Hide ${objType} ${obj.name}` : `Show ${objType} ${obj.name}`
            }
            
            Text {
                id: objDescription
                anchors.left: objVisibilityCheckBox.right
                anchors.right: settingsButton.left
                height: parent.height
                verticalAlignment: TextInput.AlignVCenter
                text: obj.getReadableString()
                font.pixelSize: 14
                color: sysPalette.windowText
                
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
                id: settingsButton
                width: parent.height - 10
                height: width
                anchors.right: deleteButton.left
                anchors.rightMargin: 5
                anchors.topMargin: 5
                icon.source: './icons/settings.svg'
                icon.name: 'configure'
                
                onClicked: {
                    objEditor.obj = Objects.currentObjects[objType][index]
                    objEditor.objType = objType
                    objEditor.objIndex = index
                    objEditor.editingRow = controlRow
                    objEditor.show()
                }
            }
            
            Button {
                id: deleteButton
                width: parent.height - 10
                height: width
                anchors.right: colorPickRect.left
                anchors.rightMargin: 5
                anchors.topMargin: 5
                icon.source: './icons/delete.svg'
                icon.name: 'delete'
                
                onClicked: {
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
        property QtObject editingRow: QtObject{}
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
                    var newName = Utils.parseName(newValue)
                    if(newName != '' && objEditor.obj.name != newName) {
                        if(Objects.getObjectByName(newName) != null) {
                            console.log(Objects.getObjectByName(newName).name, newName)
                            newName = Objects.getNewName(newName)
                        }
                        Objects.currentObjects[objEditor.objType][objEditor.objIndex].name = newName
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
                    //objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    //objEditor.editingRow.obj = objEditor.obj
                    objectListList.update()
                }
            }
            
            // Dynamic properties
            Repeater {
                id: dlgCustomProperties
                
                Item {
                    height: customPropListDict.visible ? customPropListDict.height : 30
                    width: dlgProperties.width
                    property string label: Utils.camelCase2readable(modelData[0])
                    
                    Text {
                        id: customPropComment
                        height: 30
                        width: parent.width
                        visible: modelData[0].startsWith('comment')
                        text: visible ? modelData[1].replace(/\{name\}/g, objEditor.obj.name) : ''
                        color: sysPalette.windowText
                    }
                    
                    TextSetting {
                        id: customPropText
                        height: visible ? 30 : 0
                        width: parent.width
                        label: parent.label
                        isDouble: modelData[1] == 'number'
                        visible: paramTypeIn(modelData[1], ['Expression', 'Domain', 'string', 'number'])
                        defValue: visible ? {
                            'Expression': () => Utils.simplifyExpression(objEditor.obj[modelData[0]].toEditableString()),
                            'Domain': () => objEditor.obj[modelData[0]].toString(),
                            'string': () => objEditor.obj[modelData[0]],
                            'number': () => objEditor.obj[modelData[0]]
                        }[modelData[1]]() : ""
                        onChanged: function(newValue) {
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = {
                                'Expression': () => new MathLib.Expression(newValue),
                                'Domain': () => MathLib.parseDomain(newValue),
                                'string': () => newValue,
                                'number': () => parseFloat(newValue)
                            }[modelData[1]]()
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
                        }
                    }
                    
                    CheckBox {
                        id: customPropCheckBox
                        visible: modelData[1] == 'Boolean'
                        width: parent.width
                        text: parent.label
                        checked: visible ? objEditor.obj[modelData[0]] : false
                        onClicked: {
                            objEditor.obj[modelData[0]] = this.checked
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
                        }
                    }
                    
                    ComboBoxSetting {
                        id: customPropCombo
                        height: 30
                        width: dlgProperties.width
                        label: parent.label
                        // True to select an object of type, false for enums.
                        property bool selectObjMode: paramTypeIn(modelData[1], ['ObjectType'])
                        model: visible ? 
                            (selectObjMode ? Objects.getObjectsName(modelData[1].objType).concat(['+ Create new ' + modelData[1].objType]) : modelData[1].values) 
                            : []
                        visible: paramTypeIn(modelData[1], ['ObjectType', 'Enum'])
                        currentIndex: model.indexOf(selectObjMode ? objEditor.obj[modelData[0]].name : objEditor.obj[modelData[0]])

                        onActivated: function(newIndex) {
                            // Setting object property.
                            if(selectObjMode) {
                                var selectedObj = Objects.getObjectByName(model[newIndex], modelData[1].objType)
                                if(selectedObj == null) {
                                    selectedObj = Objects.createNewRegisteredObject(modelData[1].objType)
                                    model = Objects.getObjectsName(modelData[1].objType).concat(['+ Create new ' + modelData[1].objType])
                                    currentIndex = model.indexOf(selectedObj.name)
                                }
                                Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]].requiredBy = objEditor.obj[modelData[0]].filter((obj) => objEditor.obj.name != obj.name)
                                selectedObj.requiredBy.push(Objects.currentObjects[objEditor.objType][objEditor.objIndex])
                                Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = selectedObj
                            } else {
                                Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = model[newIndex]
                            }
                            // Refreshing
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
                        }
                    }
                    
                    ListSetting {
                        id: customPropListDict
                        width: parent.width
                        
                        visible: paramTypeIn(modelData[1], ['List', 'Dict'])
                        label: parent.label
                        dictionaryMode: paramTypeIn(modelData[1], ['Dict'])
                        keyType: dictionaryMode ? modelData[1].keyType : 'string'
                        valueType: visible ? modelData[1].valueType : 'string'
                        preKeyLabel: visible ? (dictionaryMode ? modelData[1].preKeyLabel : modelData[1].label).replace(/\{name\}/g, objEditor.obj.name) : ''
                        postKeyLabel: visible ? (dictionaryMode ? modelData[1].postKeyLabel : '').replace(/\{name\}/g, objEditor.obj.name) : ''
                        keyRegexp: dictionaryMode ? modelData[1].keyFormat : /^.+$/
                        valueRegexp: visible ? modelData[1].format : /^.+$/
                        forbidAdding: visible ? modelData[1].forbidAdding : false
                        
                        onChanged: {
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = exportModel()
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
                        }
                        
                        Component.onCompleted: {
                            if(visible) importModel(objEditor.obj[modelData[0]])
                        }
                    }
                }
            }
        }
        
        function show() {
            dlgCustomProperties.model = [] // Reset
            var objProps = Objects.types[objEditor.objType].properties()
            dlgCustomProperties.model = Object.keys(objProps).map(prop => [prop, objProps[prop]]) // Converted to 2-dimentional array.
            objEditor.open()
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
                visible: Objects.types[modelData].createable()
                height: visible ? implicitHeight : 0
                icon.source: './icons/'+modelData+'.svg' // Default to dark version
                icon.color: sysPalette.windowText
                
                onClicked: {
                    Objects.createNewRegisteredObject(modelData)
                    objectListList.update()
                    objEditor.obj = Objects.currentObjects[modelData][Objects.currentObjects[modelData].length - 1]
                    objEditor.objType = modelData
                    objEditor.objIndex = Objects.currentObjects[modelData].length - 1
                    objEditor.editingRow = objectListList.listViews[modelData].editingRows[objEditor.objIndex]
                    objEditor.show()
                }
            }
        }
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
