/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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

import QtQuick
import QtQuick.Controls
import Qt.labs.platform as Native
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import "../../js/objects.js" as Objects
import "../../js/historylib.js" as HistoryLib
import "../../js/utils.js" as Utils
import "../../js/mathlib.js" as MathLib

/*!
    \qmltype CustomPropertyList
    \inqmlmodule eu.ad5001.LogarithmPlotter.ObjectLists.Editor
    \brief Lists all custom properties editors inside a repeater and allow for edition.

    This class repeats all of the custom properties and loads the appropriate editor for each kind of property.
    
    \sa Dialog
*/
Repeater {
    id: root
    
    signal changed()
    
    /*!
       \qmlproperty var CustomPropertyList::obj
       Object whose properties to list and edit.
    */
    property var obj
    /*!
       \qmlproperty var CustomPropertyList::positionPicker
       Reference to the global PositionPicker QML object.
    */
    property var positionPicker
    
    readonly property var textTypes: ['Domain', 'string', 'number']
    readonly property var comboBoxTypes: ['ObjectType', 'Enum']
    readonly property var listTypes: ['List', 'Dict']
    
       
    // NOTE: All components have the declared properties 'propertyLabel', 'propertyIcon', propertyName' and 'propertyType' to access the object in question.
    Component {
        id: commentComponent
        
        // Item for comments.
        // NOTE: propertyType here is the content of the comment (yes, it's a bit backwards, but it's more clear on the properties side).
        Label {
            // Translated text with object name.
            property string trText: qsTranslate('comment', propertyType).toString()
            text: (trText.includes("%1") ? trText.arg(obj.name) : trText).toString()
            //color: sysPalette.windowText
            wrapMode: Text.WordWrap
        }
    }
    
    Component {
        id: expressionEditorComponent
        
        // Setting for expressions
        Setting.ExpressionEditor {
            height: 30
            label: propertyLabel
            icon: `settings/custom/${propertyIcon}.svg`
            defValue: Utils.simplifyExpression(obj[propertyName].toEditableString())
            self: obj.name
            variables: propertyType.variables
            onChanged: function(newExpr) {
                if(obj[propertyName].toString() != newExpr.toString()) {
                    history.addToHistory(new HistoryLib.EditedProperty(
                        obj.name, objType, propertyName, 
                        obj[propertyName], newExpr
                    ))
                    obj[propertyName] = newExpr
                    root.changed()
                }
            }
        }        
    }

    
    Component {
        id: textEditorComponent
        
        // Setting for text & number settings as well as domains
        Setting.TextSetting {
            height: 30
            label: propertyLabel
            icon: `settings/custom/${propertyIcon}.svg`
            isDouble: propertyType == 'number'
            defValue: obj[propertyName] == null ? '' : obj[propertyName].toString()
            onChanged: function(newValue) {
                try {
                    var newValueParsed = {
                        'Domain': () => MathLib.parseDomain(newValue),
                        'string': () => newValue,
                        'number': () => parseFloat(newValue)
                    }[propertyType]()
                                        
                    // Ensuring old and new values are different to prevent useless adding to history.
                    if(obj[propertyName] != newValueParsed) {
                        history.addToHistory(new HistoryLib.EditedProperty(
                            obj.name, objType, propertyName, 
                            obj[propertyName], newValueParsed
                        ))
                        obj[propertyName] = newValueParsed
                        root.changed()
                    }
                } catch(e) {
                    // Error in expression or domain
                    parsingErrorDialog.showDialog(propertyName, newValue, e.message)
                }
            }
            
        
            Native.MessageDialog {
                id: parsingErrorDialog
                title: qsTranslate("expression", "LogarithmPlotter - Parsing error")
                text: ""
                function showDialog(propName, propValue, error) {
                    text = qsTranslate("error", "Error while parsing expression for property %1:\n%2\n\nEvaluated expression: %3").arg(propName).arg(error).arg(propValue)
                    open()
                }
            }
        }
    }
    
    Component {
        id: checkboxComponent
        
        // Setting for boolean
        CheckBox {
            height: 20
            text: propertyLabel
            //icon: `settings/custom/${propertyIcon}.svg`
            
            checked: {
                //if(obj[propertyName] == null) {
                //    return false
                //}
                return obj[propertyName]
            }
            onClicked: {
                history.addToHistory(new HistoryLib.EditedProperty(
                    obj.name, objType, propertyName, 
                    obj[propertyName], this.checked
                ))
                obj[propertyName] = this.checked
                root.changed()
            }
        }
    }
    
    Component {
        id: comboBoxComponent
        
        // Setting when selecting data from an enum, or an object of a certain type.
        Setting.ComboBoxSetting {
            height: 30
            label: propertyLabel
            icon: `settings/custom/${propertyIcon}.svg`
            // True to select an object of type, false for enums.
            property bool selectObjMode: paramTypeIn(propertyType, ['ObjectType'])
            property bool isRealObject: !selectObjMode || (propertyType.objType != "ExecutableObject" && propertyType.objType != "DrawableObject")
            
            // Base, untranslated version of the model.
            property var baseModel: selectObjMode ?
                    Objects.getObjectsName(propertyType.objType).concat(
                        isRealObject ? [qsTr("+ Create new %1").arg(Objects.types[propertyType.objType].displayType())] : [])
                    : propertyType.values
            // Translated version of the model.
            model: selectObjMode ? baseModel : propertyType.translatedValues
            currentIndex: baseModel.indexOf(selectObjMode ? obj[propertyName].name : obj[propertyName])
            
            onActivated: function(newIndex) {
                if(selectObjMode) {
                    // This is only done when what we're selecting are Objects.
                    // Setting object property.
                    var selectedObj = Objects.currentObjectsByName[baseModel[newIndex]]
                    if(newIndex != 0) {
                        // Make sure we don't set the object to null.
                        if(selectedObj == null) {
                            // Creating new object.
                            selectedObj = Objects.createNewRegisteredObject(propertyType.objType)
                            history.addToHistory(new HistoryLib.CreateNewObject(selectedObj.name, propertyType.objType, selectedObj.export()))
                            baseModel = Objects.getObjectsName(propertyType.objType).concat(
                                        isRealObject ? [qsTr("+ Create new %1").arg(Objects.types[propertyType.objType].displayType())] : 
                                        [])
                            currentIndex = baseModel.indexOf(selectedObj.name)
                        }
                        selectedObj.requiredBy.push(Objects.currentObjects[objType][objIndex])
                        //Objects.currentObjects[objType][objIndex].requiredBy = obj[propertyName].filter((obj) => obj.name != obj.name)
                    }
                    obj.requiredBy = obj.requiredBy.filter((obj) => obj.name != obj.name)
                    history.addToHistory(new HistoryLib.EditedProperty(
                        obj.name, objType, propertyName, 
                        obj[propertyName], selectedObj
                    ))
                    obj[propertyName] = selectedObj
                } else if(baseModel[newIndex] != obj[propertyName]) { 
                    // Ensuring new property is different to not add useless history entries.
                    history.addToHistory(new HistoryLib.EditedProperty(
                        obj.name, objType, propertyName, 
                        obj[propertyName], baseModel[newIndex]
                    ))
                    obj[propertyName] = baseModel[newIndex]
                }
                // Refreshing
                root.changed()
            }
        }
    }
    
    Component {
        // Setting to edit lists or dictionaries (e.g sequences & repartition function values)
        id: listDictEditorComponent
        
        Setting.ListSetting {
            label: propertyLabel
            //icon: `settings/custom/${propertyIcon}.svg`
            dictionaryMode: paramTypeIn(propertyType, ['Dict'])
            keyType: dictionaryMode ? propertyType.keyType : 'string'
            valueType: propertyType.valueType
            preKeyLabel: (dictionaryMode ? propertyType.preKeyLabel : propertyType.label).replace(/\{name\}/g, obj.name).replace(/\{name_\}/g, obj.name.substring(obj.name.indexOf("_")+1))
            postKeyLabel: (dictionaryMode ? propertyType.postKeyLabel : '').replace(/\{name\}/g, obj.name).replace(/\{name_\}/g, obj.name.substring(obj.name.indexOf("_")+1))
            keyRegexp: dictionaryMode ? propertyType.keyFormat : /^.+$/
            valueRegexp: propertyType.format
            forbidAdding: propertyType.forbidAdding
            
            onChanged: {
                var exported = exportModel()
                history.addToHistory(new HistoryLib.EditedProperty(
                    obj.name, objType, propertyName, 
                    obj[propertyName], exported
                ))
                //Objects.currentObjects[objType][objIndex][propertyName] = exported
                obj[propertyName] = exported
                root.changed()
            }
            
            Component.onCompleted: {
                importModel(obj[propertyName])
            }
        }
    }
    
    delegate: Component {
        Row {
            width: dlgProperties.width
            spacing: 5
            
            Loader {
                id: propertyEditor
                width: dlgProperties.width - pointerButton.width
                property string propertyName: modelData[0]
                property var propertyType: modelData[1]
                property string propertyLabel: qsTranslate('prop',propertyName)
                property string propertyIcon: Utils.camelCase2readable(propertyName)
                
                sourceComponent: {
                    if(propertyName.startsWith('comment'))
                        return commentComponent
                    else if(propertyType == 'boolean')
                        return checkboxComponent
                    else if(paramTypeIn(propertyType, ['Expression']))
                        return expressionEditorComponent
                    else if(paramTypeIn(propertyType, textTypes))
                        return textEditorComponent
                    else if(paramTypeIn(propertyType, comboBoxTypes))
                        return comboBoxComponent
                    else if(paramTypeIn(propertyType, listTypes))
                        return listDictEditorComponent
                    else
                        return {}
                }
            }
        
            Button {
                id: pointerButton
                height: parent.height
                width: visible ? height : 0
                anchors.verticalCenter: parent.verticalCenter
                
                property bool isXProp: ['labelX', 'x'].includes(propertyEditor.propertyName)
                property bool isYProp: ['y'].includes(propertyEditor.propertyName)
                visible: isXProp || isYProp
                ToolTip.visible: hovered
                ToolTip.text: qsTr("Pick on graph")
                
                Setting.Icon {
                    id: icon
                    width: 18
                    height: 18
                    anchors.centerIn: parent
                    
                    color: sysPalette.windowText
                    source: '../icons/common/position.svg'
                }
                
                onClicked: {
                    positionPicker.objType = objType
                    positionPicker.objName = obj.name
                    positionPicker.pickX = isXProp
                    positionPicker.pickY = isYProp
                    positionPicker.propertyX = propertyEditor.propertyName
                    positionPicker.propertyY = propertyEditor.propertyName
                    positionPicker.visible = true
                    objEditor.close()
                }
            }
        }
    }
}
