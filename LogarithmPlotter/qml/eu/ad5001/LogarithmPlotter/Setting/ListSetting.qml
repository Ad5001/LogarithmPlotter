/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
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
import QtQml.Models

/*!
    \qmltype ListSetting
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Setting to create and edit lists and dictionaries.
            
    \sa EditorDialog, Settings, Icon
*/
Column {
    id: control
    
    /*!
        \qmlsignal ListSetting::changed()
        
        Emitted when an entry of the setting has been changed.
        The corresponding handler is \c onChanged.
    */
    signal changed()
    
    /*!
       \qmlproperty string ListSetting::label
       Label of the setting.
    */
    property string label: ''
    /*!
       \qmlproperty string ListSetting::icon
       Icon path of the setting.
    */
    property string icon: ''
    /*!
       \qmlproperty bool ListSetting::dictionaryMode
       true to set the export mode to dictionary, false for list.
    */
    property bool dictionaryMode: false
    /*!
       \qmlproperty string ListSetting::keyType
       Type for keys for dictionary, can be either "string" or "number".
    */
    property string keyType: "string"
    /*!
       \qmlproperty string ListSetting::keyType
       Type for values of the dictionary or list, can be either "string" or "number".
    */
    property string valueType: "string"
    /*!
       \qmlproperty string ListSetting::preKeyLabel
       Text to be put before the key for each entry.
    */
    property string preKeyLabel: ""
    /*!
       \qmlproperty string ListSetting::postKeyLabel
       Text to be put after the key for each entry. Only for dictionaries.
    */
    property string postKeyLabel: ": "
    /*!
       \qmlproperty var ListSetting::keyRegexp
       Regular expression used in the validator for keys. Only for dictionaries.
    */
    property var keyRegexp: /^.+$/
    /*!
       \qmlproperty var ListSetting::valueRegexp
       Regular expression used in the validator for values.
    */
    property var valueRegexp: /^.+$/
    /*!
       \qmlproperty bool ListSetting::forbidAdding
       If true, prevents the user from adding or removing new entries.
    */
    property bool forbidAdding: false
    
    /*!
       \qmlproperty bool ListSetting::model
       Model of the list/dictionnary, in the form of [{key: < key >, val: < value > }].
       
       Use the \a importModel method to set the model.
    */
    property alias model: repeater.model
    
    Row {
        height: 30
        width: parent.width;
        Icon {
            id: iconLabel
            anchors.top: parent.top
            anchors.topMargin: icon == "" ? 0 : 3
            source: control.visible ? "../icons/" + control.icon : ""
            width: height
            height: icon == "" || !visible ? 0 : 24
            color: sysPalette.windowText
        }
        Label {
            id: labelItem
            height: 30
            verticalAlignment: TextInput.AlignVCenter
            text: qsTranslate("control", "%1: ").arg(control.label)
        }
    }
    
    Repeater {
        id: repeater
        width: control.width
        model: ListModel {}
        
        Row {
            id: defRow
            height: addEntryBtn.height
            width: parent.width
            
            Text {
                id: preKeyText
                height: parent.height
                verticalAlignment: TextInput.AlignVCenter
                color: sysPalette.windowText
                text: control.preKeyLabel
            }
            
            TextField {
                id: keyInput
                visible: control.dictionaryMode
                height: parent.height
                width: visible ? 50 : 0
                validator: RegularExpressionValidator { 
                    regularExpression: control.keyRegexp
                }
                verticalAlignment: TextInput.AlignVCenter
                horizontalAlignment: TextInput.AlignHCenter
                color: sysPalette.windowText
                text: visible ? control.model.get(index).key : false
                selectByMouse: true
                onEditingFinished: {
                    var value = text
                    if(control.keyType == 'int') {
                        value = parseInt(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(control.keyType == 'double') {
                        value = parseFloat(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(value !== "" && valueInput.acceptableInput) {
                        control.model.setProperty(index, 'key', value)
                        control.changed()
                    }
                }
            }
            
            Text {
                id: postKeyText
                visible: control.dictionaryMode
                height: parent.height
                verticalAlignment: TextInput.AlignVCenter
                color: sysPalette.windowText
                text: control.postKeyLabel
            }
            
            TextField {
                id: valueInput
                height: parent.height
                width: parent.width - x - deleteButton.width - 5
                validator: RegularExpressionValidator { 
                    regularExpression: control.valueRegexp
                }
                verticalAlignment: TextInput.AlignVCenter
                horizontalAlignment: TextInput.AlignHCenter
                color: sysPalette.windowText
                text: visible ? control.model.get(index).val : false
                selectByMouse: true
                onEditingFinished: {
                    var value = text
                    if(control.valueType == 'int') {
                        value = parseInt(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(control.valueType == 'double') {
                        value = parseFloat(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(value !== "" && keyInput.acceptableInput) {
                        control.model.setProperty(index, 'val', value)
                        control.changed()
                    }
                }
            }
            
            Item {
                width: 5
                height: parent.height
            }
            
            Button {
                id: deleteButton
                width: visible ? parent.height : 0
                height: width
                icon.source: './icons/common/delete.svg'
                icon.name: 'delete'
                visible: !control.forbidAdding
                
                onClicked: {
                    control.model.remove(index)
                }
            }
        }
    }
    
    Button {
        id: addEntryBtn
        visible: !control.forbidAdding
        text: qsTr('+ Add Entry')
        width: control.width
        
        onClicked: {
            control.model.append({
                key: control.keyType == 'string' ? '' : model.count,
                val: control.valueType == 'string' ? '' : 0
            })
        }
    }
    
    /*!
        \qmlmethod void ListSetting::importModel(var importer)
        Imports either a list or a dictionnary in the model.
    */
    function importModel(importer) {
        model.clear()
        for(var key in importer) 
            model.append({
                key: control.keyType == 'string' ? key.toString() : parseFloat(key),
                val: control.valueType == 'string' ? importer[key].toString() : parseFloat(importer[key])
            })
    }
    
    
    /*!
        \qmlmethod void ListSetting::exportModel()
        Exports the model either a list or a dictionnary in the model depending on \a dictionaryMode.
    */
    function exportModel() {
        if(dictionaryMode) {
            var ret = {}
            for(var i = 0; i < model.count; i++)
                ret[model.get(i).key] = model.get(i).val
            return ret
        } else {
            var ret = []
            for(var i = 0; i < model.count; i++)
                ret.push(model.get(i).val)
            return ret
        }
    }
}
