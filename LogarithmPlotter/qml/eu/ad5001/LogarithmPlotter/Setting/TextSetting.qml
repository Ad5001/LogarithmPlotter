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

import QtQuick.Controls 2.12
import QtQuick 2.12 

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
    signal changed(string newValue)
    
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
        height: parent.height
        anchors.top: parent.top
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
        validator: RegExpValidator {
            regExp: control.isInt ? /-?[0-9]+/ : control.isDouble ? /-?[0-9]+(\.[0-9]+)?/ : /.+/
        }
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
    
    Button {
        text: "α"
        anchors.right: parent.right
        anchors.rightMargin: 5
        anchors.verticalCenter: parent.verticalCenter
        width: 20
        height: width
        visible: !isInt && !isDouble
        onClicked: insertPopup.open()
    }
    
    Popup {
        id: insertPopup
        x: Math.round((parent.width - width) / 2)
        y: Math.round((parent.height - height) / 2)
        width: 280
        height: insertGrid.insertChars.length/insertGrid.columns*(width/insertGrid.columns)
        modal: true
        focus: true
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutsideParent
        
        Grid {
            id: insertGrid
            width: parent.width
            columns: 7
            
            property var insertChars: [
                "α","β","γ","δ","ε","ζ","η",
                "π","θ","κ","λ","μ","ξ","ρ",
                "ς","σ","τ","φ","χ","ψ","ω",
                "Γ","Δ","Θ","Λ","Ξ","Π","Σ",
                "Φ","Ψ","Ω","ₐ","ₑ","ₒ","ₓ",
                "ₕ","ₖ","ₗ","ₘ","ₙ","ₚ","ₛ",
                "ₜ","¹","²","³","⁴","⁵","⁶",
                "⁷","⁸","⁹","⁰","₁","₂","₃",
                "₄","₅","₆","₇","₈","₉","₀"
            ]
            Repeater {
                model: parent.insertChars.length
                
                Button {
                    id: insertBtn
                    width: insertGrid.width/insertGrid.columns
                    height: width
                    text: insertGrid.insertChars[modelData]
                    flat: text == " "
                    font.pixelSize: 18
                    
                    onClicked: {
                        input.insert(input.cursorPosition, insertGrid.insertChars[modelData])
                        insertPopup.close()
                        input.focus = true
                    }
                }
            }
        }
    }
}
