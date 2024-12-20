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
import Qt.labs.platform as Native
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import eu.ad5001.LogarithmPlotter.Popup 1.0 as Popup
import eu.ad5001.LogarithmPlotter.Common

/*!
    \qmltype Dialog
    \inqmlmodule eu.ad5001.LogarithmPlotter.ObjectLists.Editor
    \brief Dialog used to edit properties of objects.

    This class contains the dialog that allows to edit all properties of objects.
    \todo In the future, this class should be optimized so that each property doesn't instanciate one instance of each setting type.
    
    \sa Loader, ObjectLists
*/
Popup.BaseDialog {
    id: objEditor
    /*!
       \qmlproperty string EditorDialog::objType
       Type of object being edited by the dialog.
    */
    property string objType: 'Point'
    /*!
       \qmlproperty int EditorDialog::objIndex
       Index of the objects amongst the ones of it's type.
    */
    property int objIndex: 0
    /*!
       \qmlproperty var EditorDialog::obj
       Instance of the object being edited.
    */
    property var obj: Modules.Objects.currentObjects[objType][objIndex]
    /*!
       \qmlproperty var EditorDialog::posPicker
       Reference to the global PositionPicker QML object.
    */
    property var posPicker
    
    title: "LogarithmPlotter"
    width: 350
    minimumHeight: Math.max(450,dlgProperties.height + margin*4 + 30)
    maximumHeight: minimumHeight
    
    Item {
        anchors {
            top: parent.top;
            left: parent.left;
            bottom: parent.bottom;
            right: parent.right;
            topMargin: margin;
            leftMargin: margin;
            bottomMargin: margin + 30;
            rightMargin: margin;
        }
        
        Column {
            id: dlgProperties
            anchors.top: parent.top
            width: objEditor.width - 20
            spacing: 10
        
            Label {
                id: dlgTitle
                verticalAlignment: TextInput.AlignVCenter
                text: qsTr("Edit properties of %1 %2").arg(Modules.Objects.types[objEditor.objType].displayType()).arg(objEditor.obj.name)
                font.pixelSize: 20
                color: sysPalette.windowText
            }
            
            Native.MessageDialog {
                id: invalidNameDialog
                title: qsTr("LogarithmPlotter - Invalid object name")
                text: ""
                function showDialog(objectName) {
                    text = qsTr("An object with the name '%1' already exists.").arg(objectName)
                    open()
                }
            }
        
            Setting.TextSetting {
                id: nameProperty
                height: 30
                label: qsTr("Name")
                icon: "common/label.svg"
                category: "name"
                width: dlgProperties.width
                value: objEditor.obj.name
                onChanged: function(newValue) {
                    let newName = JS.Utils.parseName(newValue)
                    if(newName != '' && objEditor.obj.name != newName) {
                        if(newName in Modules.Objects.currentObjectsByName) {
                            invalidNameDialog.showDialog(newName)
                        } else {
                            Modules.History.addToHistory(new JS.HistoryLib.NameChanged(
                                objEditor.obj.name, objEditor.objType, newName
                            ))
                            Modules.Objects.renameObject(obj.name, newName)
                            objEditor.obj = Modules.Objects.currentObjects[objEditor.objType][objEditor.objIndex]
                            objectListList.update()
                        }
                    }
                }
            }
        
            Setting.ComboBoxSetting {
                id: labelContentProperty
                height: 30
                width: dlgProperties.width
                label: qsTranslate("prop", "labelContent")
                model: [qsTr("null"), qsTr("name"), qsTr("name + value")]
                property var idModel: ["null", "name", "name + value"]
                icon: "common/label.svg"
                currentIndex: idModel.indexOf(objEditor.obj.labelContent)
                onActivated: function(newIndex) {
                    if(idModel[newIndex] != objEditor.obj.labelContent) {
                        Modules.History.addToHistory(new JS.HistoryLib.EditedProperty(
                            obj.name, objType, "labelContent",
                            objEditor.obj.labelContent, idModel[newIndex]
                        ))
                        objEditor.obj.labelContent = idModel[newIndex]
                        objEditor.obj.update()
                        objectListList.update()
                    }
                }
            }
            
            // Dynamic properties
            CustomPropertyList {
                id: dlgCustomProperties
                obj: objEditor.obj
                positionPicker: posPicker
                
                onChanged: {
                    obj.update()
                    objectListList.update()
                }
            }
        }
    }
    
    /*!
        \qmlmethod void EditorDialog::open()
        Shows the editor after the object to be edited is set.
    */
    function open() {
        dlgCustomProperties.model = [] // Reset
        let objProps = Modules.Objects.types[objEditor.objType].properties()
        dlgCustomProperties.model = Object.keys(objProps).map(prop => [prop, objProps[prop]]) // Converted to 2-dimentional array.
        objEditor.show()
    }
}
