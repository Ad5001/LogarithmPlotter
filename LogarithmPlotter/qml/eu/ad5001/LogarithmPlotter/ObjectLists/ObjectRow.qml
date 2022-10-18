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
import "../js/math/latex.js" as LatexJS


/*!
    \qmltype ObjectRow
    \inqmlmodule eu.ad5001.LogarithmPlotter.ObjectLists
    \brief Row describing an object.

    This item allows the user to see, control, and modify a graph object.
    It includes the visibility checkbox, the description label (optionally latex if enabled),
    the reposition and delete buttons, and the color picker.
    
    \sa LogarithmPlotter, ObjectCreationGrid, ObjectLists
*/
Item {
    id: objectRow
    
    signal changed()
    
    /*!
       \qmlproperty var ObjectRow::obj
       Object to show.
    */
    property var obj
    /*!
       \qmlproperty var ObjectRow::posPicker
       Reference to the global PositionPicker QML object.
    */
    property var posPicker
    
    /*!
       \qmlproperty bool ObjectRow::objVisible
       True if the object should be visible, false otherwise.
    */
    property alias objVisible: objVisibilityCheckBox.checked
    /*!
       \qmlproperty bool ObjectRow::minHeight
       Minimum height of the row.
    */
    readonly property int minHeight: 40
    
    height: objDescription.height
    width: obj.typeList.width
    
    CheckBox {
        id: objVisibilityCheckBox
        checked: obj.visible
        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.left
        anchors.leftMargin: 5
        onClicked: {
            history.addToHistory(new HistoryLib.EditedVisibility(
                obj.name, obj.type, this.checked
            ))
            obj.visible = this.checked
            changed()
        }
        
        ToolTip.visible: hovered
        ToolTip.text: checked ? 
            qsTr("Hide %1 %2").arg(obj.constructor.displayType()).arg(obj.name) : 
            qsTr("Show %1 %2").arg(obj.constructor.displayType()).arg(obj.name)
    }
    
    Label {
        id: objDescription
        anchors.left: objVisibilityCheckBox.right
        anchors.right: deleteButton.left
        height: LatexJS.enabled ? Math.max(parent.minHeight, latexDescription.height+4) : parent.minHeight
        verticalAlignment: TextInput.AlignVCenter
        text: LatexJS.enabled ? "" : obj.getReadableString()
        font.pixelSize: 14
        
        Image {
            id: latexDescription
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            visible: LatexJS.enabled
            property double depth: 2
            property var ltxInfo: visible ? Latex.render(obj.getLatexString(), depth*parent.font.pixelSize+4, parent.color).split(",") : ["","0","0"]
            source: visible ? ltxInfo[0] : ""
            width: parseInt(ltxInfo[1])/depth
            height: parseInt(ltxInfo[2])/depth
        }
        
        MouseArea {
            anchors.fill: parent
            onClicked: {
                objEditor.obj = Objects.currentObjects[obj.type][index]
                objEditor.objType = obj.type
                objEditor.objIndex = index
                //objEditor.editingRow = objectRow
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
        anchors.verticalCenter: parent.verticalCenter
        
        Setting.Icon {
            id: icon
            width: 18
            height: 18
            anchors.centerIn: parent
            
            color: sysPalette.windowText
            source: '../icons/common/position.svg'
        }
        
        property bool hasXProp: obj.constructor.properties().hasOwnProperty('x')
        property bool hasYProp: obj.constructor.properties().hasOwnProperty('y')
        visible: hasXProp || hasYProp
        ToolTip.visible: hovered
        ToolTip.text: qsTr("Set %1 %2 position").arg(obj.constructor.displayType()).arg(obj.name)
        
        onClicked: {
            posPicker.objType = obj.type
            posPicker.objName = obj.name
            posPicker.pickX = hasXProp
            posPicker.pickY = hasYProp
            posPicker.propertyX = 'x'
            posPicker.propertyY = 'y'
            posPicker.visible = true
            
        }
    }
    
    Button {
        id: deleteButton
        width: parent.minHeight - 10
        height: width
        anchors.right: colorPickRect.left
        anchors.rightMargin: 5
        anchors.verticalCenter: parent.verticalCenter
        icon.name: 'delete'
        icon.source: '../icons/common/delete.svg'
        icon.color: sysPalette.buttonText
        ToolTip.visible: hovered
        ToolTip.text: qsTr("Delete %1 %2").arg(obj.constructor.displayType()).arg(obj.name)
        
        onClicked: {
            history.addToHistory(new HistoryLib.DeleteObject(
                obj.name, obj.type, obj.export()
            ))
            Objects.deleteObject(obj.name)
            changed()
        }
    }
    
    Rectangle {
        id: colorPickRect
        anchors.right: parent.right
        anchors.rightMargin: 5
        anchors.verticalCenter: parent.verticalCenter
        color: obj.color
        width: parent.minHeight - 10
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
        title: qsTr("Pick new color for %1 %2").arg(obj.constructor.displayType()).arg(obj.name)
        onAccepted: {
            history.addToHistory(new HistoryLib.ColorChanged(
                obj.name, obj.type, obj.color, color.toString()
            ))
            obj.color = color.toString()
            changed()
        }
    }
}
