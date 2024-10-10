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

import QtQuick.Controls
import QtQuick 
import eu.ad5001.LogarithmPlotter.Popup 1.0 as Popup

/*!
    \qmltype TextSetting
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Setting to edit strings and numbers.
            
    \sa EditorDialog, Settings, Icon
*/
Item {
    id: control
    height: 30
    
    /*!
        \qmlsignal TextSetting::changed(string newValue)
        
        Emitted when the value of the text has been changed.
        The corresponding handler is \c onChanged.
    */
    signal changed(var newValue)
    
    /*!
       \qmlproperty bool TextSetting::isInt
       If true, the input is being parsed an int before being emitting the \a changed signal.
    */
    property bool isInt: false
    /*!
       \qmlproperty bool TextSetting::isDouble
       If true, the input is being parsed an double before being emitting the \a changed signal.
    */
    property bool isDouble: false
    /*!
       \qmlproperty bool TextSetting::category
       Type of special character to insert from the popup.
       \sa InsertCharacter::category
    */
    property alias category: insertPopup.category
    /*!
       \qmlproperty double TextSetting::min
       Minimum value for numbers that can be entered into the input.
    */
    property double min: -1
    /*!
       \qmlproperty string TextSetting::defValue
       Default value of the input.
    */
    property string defValue
    /*!
       \qmlproperty string TextSetting::value
       Value of the input.
    */
    property alias value: input.text
    /*!
       \qmlproperty string TextSetting::placeholderText
       Value of the input.
    */
    property alias placeholderText: input.placeholderText
    /*!
       \qmlproperty string TextSetting::label
       Label of the setting.
    */
    property string label
    /*!
       \qmlproperty string TextSetting::icon
       Icon path of the setting.
    */
    property string icon: ""
    
    Icon {
        id: iconLabel
        anchors.top: parent.top
        anchors.topMargin: icon == "" ? 0 : 3
        source: control.visible && icon != "" ? "../icons/" + control.icon : ""
        width: height
        height: icon == "" || !visible ? 0 : 24
        color: sysPalette.windowText
    }
    
    Label {
        id: labelItem
        anchors.left: iconLabel.right
        anchors.leftMargin: icon == "" ? 0 : 5
        anchors.top: parent.top
        height: parent.height
        width: visible ? Math.max(85, implicitWidth) : 0
        verticalAlignment: TextInput.AlignVCenter
        //color: sysPalette.windowText
        text: visible ? qsTranslate("control", "%1: ").arg(control.label) : ""
        visible: control.label != ""
    }
        
    TextField {
        id: input
        anchors.top: parent.top
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - (labelItem.visible ? labelItem.width + 5 : 0) - iconLabel.width - 5
        height: parent.height
        verticalAlignment: TextInput.AlignVCenter
        horizontalAlignment: control.label == "" ? TextInput.AlignLeft : TextInput.AlignHCenter
        color: sysPalette.windowText
        validator: RegularExpressionValidator {
            regularExpression: control.isInt ? /-?[0-9]+/ : control.isDouble ? /-?[0-9]+(\.[0-9]+)?/ : /.+/
        }
        focus: true
        text: control.defValue
        selectByMouse: true
        onEditingFinished: function() {
            if(insertButton.focus || insertPopup.focus) return
            let value = text
            if(control.isInt) {
                let parsed = parseInt(value)
                value = isNaN(parsed) ? control.min : Math.max(control.min,parsed)
            } else if(control.isDouble) {
                let parsed = parseFloat(value)
                value = isNaN(parsed) ? control.min : Math.max(control.min,parsed)
            }
            if(value !== "" && value.toString() != defValue) {
                control.changed(value)
                defValue = value.toString()
            }
        }
    }
    
    Button {
        id: insertButton
        text: "α"
        anchors.right: parent.right
        anchors.rightMargin: 5
        anchors.verticalCenter: parent.verticalCenter
        width: 20
        height: width
        visible: !isInt && !isDouble
        onClicked: {
            insertPopup.open()
            insertPopup.focus = true
        }
    }
    
    Popup.InsertCharacter {
        id: insertPopup
        
        x: Math.round((parent.width - width) / 2)
        y: Math.round((parent.height - height) / 2)
        
        onSelected: function(c) {
            input.insert(input.cursorPosition, c)
            insertPopup.close()
            focus = false
            input.focus = true
        }
    }
}
