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
import eu.ad5001.LogarithmPlotter.ObjectLists.Editor 1.0 as Editor
import "../js/objects.js" as Objects

/*!
    \qmltype ObjectLists
    \inqmlmodule eu.ad5001.LogarithmPlotter.ObjectLists
    \brief Tab of the drawer that allows the user to manage the objects.

    This item allows the user to synthetically see all objects, while giving the user the ability
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
        //width: implicitWidth //objectListList.width - (implicitHeight > objectListList.parent.height ? 20 : 0)
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
            
            delegate: ObjectRow {
                id: controlRow
                width: objTypeList.width
                obj: Objects.currentObjects[objType][index]
                posPicker: positionPicker
                
                onChanged: {
                    obj = Objects.currentObjects[objType][index]
                    objectListList.update()
                }
                
                Component.onCompleted: objTypeList.editingRows.push(controlRow)
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
    Editor.Dialog {
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
