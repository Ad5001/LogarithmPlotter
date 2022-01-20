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
import QtQuick.Dialogs 1.3 as D
import eu.ad5001.LogarithmPlotter 1.0
import "../js/objects.js" as Objects
import "../js/objs/common.js" as ObjectsCommons
import "../js/historylib.js" as HistoryLib
import "../js/utils.js" as Utils
import "../js/mathlib.js" as MathLib

D.Dialog {
    id: objEditor
    property string objType: 'Point'
    property int objIndex: 0
    property var obj: Objects.currentObjects[objType][objIndex]
    property QtObject editingRow: QtObject{}
    property var objectLists
    title: `LogarithmPlotter`
    width: 300
    height: 400
    
    Label {
        id: dlgTitle
        anchors.left: parent.left
        anchors.top: parent.top
        verticalAlignment: TextInput.AlignVCenter
        text: qsTr("Edit properties of %1 %2").arg(Objects.types[objEditor.objType].displayType()).arg(objEditor.obj.name)
        font.pixelSize: 20
        color: sysPalette.windowText
    }
    
    Column {
        id: dlgProperties
        anchors.top: dlgTitle.bottom
        width: objEditor.width - 20
        spacing: 10
    
        TextSetting {
            id: nameProperty
            height: 30
            label: qsTr("Name")
            icon: "icons/settings/custom/label.svg"
            min: 1
            width: dlgProperties.width
            value: objEditor.obj.name
            onChanged: function(newValue) {
                var newName = Utils.parseName(newValue)
                if(newName != '' && objEditor.obj.name != newName) {
                    if(Objects.getObjectByName(newName) != null) {
                        console.log(Objects.getObjectByName(newName).name, newName)
                        newName = ObjectsCommons.getNewName(newName)
                    }
                    history.addToHistory(new HistoryLib.NameChanged(
                        objEditor.obj.name, objEditor.objType, newName
                    ))
                    Objects.currentObjects[objEditor.objType][objEditor.objIndex].name = newName
                    objEditor.obj = Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                    objectListList.update()
                }
            }
        }
    
        ComboBoxSetting {
            id: labelContentProperty
            height: 30
            width: dlgProperties.width
            label: qsTr("Label content")
            model: [qsTr("null"), qsTr("name"), qsTr("name + value")]
            property var idModel: ["null", "name", "name + value"]
            icon: "icons/settings/custom/label.svg"
            currentIndex: idModel.indexOf(objEditor.obj.labelContent)
            onActivated: function(newIndex) {
                if(idModel[newIndex] != objEditor.obj.labelContent) {
                    objEditor.obj.labelContent = idModel[newIndex]
                    objectListList.update()
                }
            }
        }
        
        // Dynamic properties
        Repeater {
            id: dlgCustomProperties
            
            Item {
                height: customPropComment.height + customPropText.height + customPropCheckBox.height + customPropCombo.height + customPropListDict.height
                width: dlgProperties.width
                property string label: Utils.camelCase2readable(modelData[0])
                
                // Item for comments
                Label {
                    id: customPropComment
                    width: parent.width
                    height: visible ? implicitHeight : 0
                    visible: modelData[0].startsWith('comment')
                    text: visible ? (modelData[1].replace(/\{name\}/g, objEditor.obj.name)) : ''
                    //color: sysPalette.windowText
                    wrapMode: Text.WordWrap
                }
                
                // Setting for text & number settings as well as domains & expressions
                TextSetting {
                    id: customPropText
                    height: visible ? 30 : 0
                    width: parent.width
                    label: parent.label
                    icon: `icons/settings/custom/${parent.label}.svg`
                    isDouble: modelData[1] == 'number'
                    visible: paramTypeIn(modelData[1], ['Expression', 'Domain', 'string', 'number'])
                    defValue: visible ? {
                        'Expression': () => Utils.simplifyExpression(objEditor.obj[modelData[0]].toEditableString()),
                        'Domain': () => objEditor.obj[modelData[0]].toString(),
                        'string': () => objEditor.obj[modelData[0]],
                        'number': () => objEditor.obj[modelData[0]]
                    }[modelData[1]]() : ""
                    onChanged: function(newValue) {
                        var newValue = {
                            'Expression': () => new MathLib.Expression(newValue),
                            'Domain': () => MathLib.parseDomain(newValue),
                            'string': () => newValue,
                            'number': () => parseFloat(newValue)
                        }[modelData[1]]()
                        // Ensuring old and new values are different to prevent useless adding to history.
                        if(objEditor.obj[modelData[0]] != newValue) {
                            history.addToHistory(new HistoryLib.EditedProperty(
                                objEditor.obj.name, objEditor.objType, modelData[0], 
                                objEditor.obj[modelData[0]], newValue
                            ))
                            objEditor.obj[modelData[0]] = newValue
                            Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                            objectListList.update()
                        }
                    }
                }
                
                // Setting for boolean
                CheckBox {
                    id: customPropCheckBox
                    visible: modelData[1] == 'boolean'
                    height: visible ? 20 : 0
                    width: parent.width
                    text: parent.label
                    icon: visible ? `icons/settings/custom/${parent.label}.svg` : ''
                    
                    checked: visible ? objEditor.obj[modelData[0]] : false
                    onClicked: {
                        history.addToHistory(new HistoryLib.EditedProperty(
                            objEditor.obj.name, objEditor.objType, modelData[0], 
                            objEditor.obj[modelData[0]], this.checked
                        ))
                        objEditor.obj[modelData[0]] = this.checked
                        Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                        objectListList.update()
                    }
                }
                
                // Setting when selecting data from an enum, or an object of a certain type.
                ComboBoxSetting {
                    id: customPropCombo
                    width: dlgProperties.width
                    height: visible ? 30 : 0
                    label: parent.label
                    icon: visible ? `icons/settings/custom/${parent.label}.svg` : ''
                    // True to select an object of type, false for enums.
                    property bool selectObjMode: paramTypeIn(modelData[1], ['ObjectType'])
                    
                    model: visible ? 
                        (selectObjMode ? Objects.getObjectsName(modelData[1].objType).concat([qsTr("+ Create new %1").arg(Objects.types[modelData[1].objType].displayType())]) : modelData[1].values) 
                        : []
                    visible: paramTypeIn(modelData[1], ['ObjectType', 'Enum'])
                    currentIndex: model.indexOf(selectObjMode ? objEditor.obj[modelData[0]].name : objEditor.obj[modelData[0]])

                    onActivated: function(newIndex) {
                        if(selectObjMode) {
                            // This is only done when what we're selecting are Objects.
                            // Setting object property.
                            var selectedObj = Objects.getObjectByName(model[newIndex], modelData[1].objType)
                            if(selectedObj == null) {
                                // Creating new object.
                                selectedObj = Objects.createNewRegisteredObject(modelData[1].objType)
                                history.addToHistory(new HistoryLib.CreateNewObject(selectedObj.name, modelData[1].objType, selectedObj.export()))
                                model = Objects.getObjectsName(modelData[1].objType).concat([qsTr("+ Create new %1").arg(Objects.types[modelData[1].objType].displayType())])
                                currentIndex = model.indexOf(selectedObj.name)
                            }
                            //Objects.currentObjects[objEditor.objType][objEditor.objIndex].requiredBy = objEditor.obj[modelData[0]].filter((obj) => objEditor.obj.name != obj.name)
                            objEditor.obj.requiredBy = objEditor.obj.requiredBy.filter((obj) => objEditor.obj.name != obj.name)
                            selectedObj.requiredBy.push(Objects.currentObjects[objEditor.objType][objEditor.objIndex])
                            history.addToHistory(new HistoryLib.EditedProperty(
                                objEditor.obj.name, objEditor.objType, modelData[0], 
                                objEditor.obj[modelData[0]], selectedObj
                            ))
                            objEditor.obj[modelData[0]] = selectedObj
                        } else if(model[newIndex] != objEditor.obj[modelData[0]]) { 
                            // Ensuring new property is different to not add useless history entries.
                            history.addToHistory(new HistoryLib.EditedProperty(
                                objEditor.obj.name, objEditor.objType, modelData[0], 
                                objEditor.obj[modelData[0]], model[newIndex]
                            ))
                            objEditor.obj[modelData[0]] = model[newIndex]
                        }
                        // Refreshing
                        Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                        objectListList.update()
                    }
                }
                
                // Setting to edit lists or dictionaries (e.g sequences & repartition function values)
                ListSetting {
                    id: customPropListDict
                    width: parent.width
                    height: visible ? implicitHeight : 0
                    
                    visible: paramTypeIn(modelData[1], ['List', 'Dict'])
                    label: parent.label
                    //icon: `icons/settings/custom/${parent.label}.svg`
                    dictionaryMode: paramTypeIn(modelData[1], ['Dict'])
                    keyType: dictionaryMode ? modelData[1].keyType : 'string'
                    valueType: visible ? modelData[1].valueType : 'string'
                    preKeyLabel: visible ? (dictionaryMode ? modelData[1].preKeyLabel : modelData[1].label).replace(/\{name\}/g, objEditor.obj.name) : ''
                    postKeyLabel: visible ? (dictionaryMode ? modelData[1].postKeyLabel : '').replace(/\{name\}/g, objEditor.obj.name) : ''
                    keyRegexp: dictionaryMode ? modelData[1].keyFormat : /^.+$/
                    valueRegexp: visible ? modelData[1].format : /^.+$/
                    forbidAdding: visible ? modelData[1].forbidAdding : false
                    
                    onChanged: {
                        var exported = exportModel()
                        history.addToHistory(new HistoryLib.EditedProperty(
                            objEditor.obj.name, objEditor.objType, modelData[0], 
                            objEditor.obj[modelData[0]], exported
                        ))
                        //Objects.currentObjects[objEditor.objType][objEditor.objIndex][modelData[0]] = exported
                        objEditor.obj[modelData[0]] = exported
                        //Objects.currentObjects[objEditor.objType][objEditor.objIndex].update()
                        objEditor.obj.update()
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
