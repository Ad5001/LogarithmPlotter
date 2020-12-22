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
import QtQuick.Controls 2.12

Item {
    id: control
    height: 30
    
    signal activated(int newIndex)
    
    property var model: []
    property string label: ''
    property alias currentIndex: combox.currentIndex
    
    Text {
        id: labelItem
        height: 30
        anchors.top: parent.top
        verticalAlignment: TextInput.AlignVCenter
        color: sysPalette.windowText
        text: " "+ control.label +": "
    }
    
    ComboBox {
        id: combox
        height: 30
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - labelItem.width
        model: control.model
        currentIndex: model.indexOf(defValue)
        onActivated: function(newIndex) {
            control.activated(newIndex)
        }
    }
}
