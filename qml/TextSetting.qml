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

import QtQuick.Controls 2.12
import QtQuick 2.12 

Item {
    id: control
    height: 30
    
    signal changed(string newValue)
    
    property bool isInt: false
    property bool isDouble: false
    property double min: -1
    property string label
    property string defValue
    property string icon: ""
    
    Icon {
        id: iconLabel
        anchors.top: parent.top
        anchors.topMargin: icon == "" ? 0 : 3
        source: control.visible ? control.icon : ""
        width: height
        height: icon == "" || !visible ? 0 : 24
        color: sysPalette.windowText
    }
    
    Label {
        id: labelItem
        anchors.left: iconLabel.right
        anchors.leftMargin: icon == "" ? 0 : 5
        height: parent.height
        anchors.top: parent.top
        verticalAlignment: TextInput.AlignVCenter
        //color: sysPalette.windowText
        text: control.label +": "
    }
    
        
    TextField {
        id: input
        anchors.top: parent.top
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - labelItem.width - iconLabel.width - 10
        height: parent.height
        verticalAlignment: TextInput.AlignVCenter
        horizontalAlignment: TextInput.AlignHCenter
        color: sysPalette.windowText
        focus: true
        text: control.defValue
        selectByMouse: true
        onEditingFinished: {
            var value = text
            if(control.isInt) value = Math.max(control.min,parseInt(value).toString()=="NaN"?control.min:parseInt(value))
            if(control.isDouble) value = Math.max(control.min,parseFloat(value).toString()=="NaN"?control.min:parseFloat(value))
            if(value != "" && value.toString() != defValue) {
                control.changed(value)
                defValue = value.toString()
            }
        }
    }
}
