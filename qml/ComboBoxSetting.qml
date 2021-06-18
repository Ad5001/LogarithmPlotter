/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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

Item {
    id: control
    height: 30
    
    signal activated(int newIndex)
    signal accepted()
    
    property string label: ''
    property alias model: combox.model
    property alias editable: combox.editable
    property alias editText: combox.editText
    property alias currentIndex: combox.currentIndex
    property string icon: ""
    
    function find(elementName) {
        return combox.find(elementName)
    }
    
    Icon {
        id: iconLabel
        anchors.top: parent.top
        anchors.topMargin: icon == "" ? 0 : 3
        source: control.visible ? control.icon : ""
        width: height
        height: icon == "" && visible ? 0 : 24
        color: sysPalette.windowText
    }
    
    Label {
        id: labelItem
        anchors.left: iconLabel.right
        anchors.leftMargin: icon == "" ? 0 : 5
        height: 30
        anchors.top: parent.top
        verticalAlignment: TextInput.AlignVCenter
        text: control.label +": "
    }
    
    ComboBox {
        id: combox
        height: 30
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - labelItem.width - iconLabel.width - 10
        onActivated: function(newIndex) {
            control.activated(newIndex)
        }
        onAccepted: control.accepted()
    }
}
