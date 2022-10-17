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
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Row describing an object.

    This item allows the user to see, control, and modify a graph object.
    It includes the visibility checkbox, the description label (optionally latex if enabled),
    the reposition and delete buttons, and the color picker.
    
    
    \sa LogarithmPlotter, ObjectCreationGrid, ObjectLists
*/
Item {
    id: objectRow
    
    signal changed()
    
    property var obj
    property var posPicker
    
    property alias objVisible: objVisibilityCheckBox.checked
    
    height: 40
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
        height: parent.height
        verticalAlignment: TextInput.AlignVCenter
        text: LatexJS.enabled ? "" : obj.getReadableString()
        font.pixelSize: 14
        
        Image {
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            visible: LatexJS.enabled
            property var ltxInfo: visible ? Latex.render(obj.getLatexLabel(), 2*parent.font.pixelSize, parent.color).split(",") : ["","0","0"]
            source: visible ? ltxInfo[0] : ""
            width: parseInt(ltxInfo[1])/2
            height: parseInt(ltxInfo[2])/2
        }
        
        MouseArea {
            anchors.fill: parent
            onClicked: {
                objEditor.obj = Objects.currentObjects[obj.type][index]
                objEditor.obj.type = obj.type
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
        anchors.topMargin: 5
        
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
        width: parent.height - 10
        height: width
        anchors.right: colorPickRect.left
        anchors.rightMargin: 5
        anchors.topMargin: 5
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
