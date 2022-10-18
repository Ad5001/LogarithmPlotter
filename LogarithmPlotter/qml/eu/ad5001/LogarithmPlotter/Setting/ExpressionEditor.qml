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
import QtQuick.Dialogs 1.3 as D
import eu.ad5001.LogarithmPlotter.Popup 1.0 as Popup
import "../js/mathlib.js" as MathLib


/*!
    \qmltype ExpressionEditor
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Setting to edit strings and numbers.
            
    \sa EditorDialog, Settings, Icon
*/
Item {
    id: control
    height: 30
    
    /*!
        \qmlsignal ExpressionEditor::changed(var newValue)
        
        Emitted when the value of the expression has been changed.
        The corresponding handler is \c onChanged.
    */
    signal changed(var newValue)
    
    /*!
       \qmlproperty string ExpressionEditor::defValue
       Default editable expression value of the editor.
    */
    property string defValue
    /*!
       \qmlproperty string ExpressionEditor::value
       Value of the editor.
    */
    property alias value: editor.text
    /*!
       \qmlproperty string ExpressionEditor::self
       Object or context of the expression to be edited.
       Used to prevent circular dependency.
    */
    property string self: ""
    /*!
       \qmlproperty string ExpressionEditor::placeholderText
       Value of the editor.
    */
    property alias placeholderText: editor.placeholderText
    /*!
       \qmlproperty string ExpressionEditor::label
       Label of the editor.
    */
    property string label
    /*!
       \qmlproperty string ExpressionEditor::icon
       Icon path of the editor.
    */
    property string icon: ""
    
    /*!
       \qmlproperty string ExpressionEditor::openAndCloseMatches
       Characters that when pressed, should be immediately followed up by their closing character.
    */
    readonly property var openAndCloseMatches: {
        "(": ")",
        "[": "]",
        "'": "'",
        '"': '"'
    }
    
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
    
    D.MessageDialog {
        id: parsingErrorDialog
        title: qsTranslate("expression", "LogarithmPlotter - Parsing error")
        text: ""
        function showDialog(propName, propValue, error) {
            text = qsTranslate("expression", "Error while parsing expression for property %1:\n%2\n\nEvaluated expression: %3").arg(propName).arg(error).arg(propValue)
            open()
        }
    }
    
    TextField {
        id: editor
        anchors.top: parent.top
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - (labelItem.visible ? labelItem.width + 5 : 0) - iconLabel.width - 5
        height: parent.height
        verticalAlignment: TextInput.AlignVCenter
        horizontalAlignment: control.label == "" ? TextInput.AlignLeft : TextInput.AlignHCenter
        text: control.defValue
        color: sysPalette.windowText
        focus: true
        selectByMouse: true
        
        Keys.priority: Keys.BeforeItem // Required for knowing which key the user presses.
        
        onEditingFinished: {
            if(insertButton.focus || insertPopup.focus) return
            let value = text
            if(value != "" && value.toString() != defValue) {
                let expr = parse(value)
                if(expr != null) {
                    control.changed(expr)
                    defValue = expr.toEditableString()
                }
            }
        }
        
        Keys.onPressed: function(event) {
            if(event.text in openAndCloseMatches) {
                let start = selectionStart
                insert(selectionStart, event.text)
                insert(selectionEnd, openAndCloseMatches[event.text])
                cursorPosition = start+1
                event.accepted = true
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
            editor.insert(editor.cursorPosition, c)
            insertPopup.close()
            editor.focus = true
        }
    }
    
    /*!
        \qmlmethod var ExpressionEditor::parse(string newExpression)
        Parses the \c newExpression as an expression, checks for errors, shows them if any.
        Returns the parsed expression if possible, null otherwise..
    */
    function parse(newExpression) {
        let expr = null
        try {
            expr = new MathLib.Expression(value.toString())
            // Check if the expression is valid, throws error otherwise.
            if(!expr.allRequirementsFullfilled()) {
                let undefVars = expr.undefinedVariables()
                console.log(JSON.stringify(undefVars), undefVars.join(', '))
                if(undefVars.length > 1)
                    throw new Error(qsTranslate('error', 'No object found with names %1.').arg(undefVars.join(', ')))
                else
                    throw new Error(qsTranslate('error', 'No object found with name %1.').arg(undefVars.join(', ')))
            }
            if(expr.requiredObjects().includes(control.self))
                throw new Error(qsTranslate('error', 'Object cannot be dependent on itself.'))
                // TODO: Check for recursive dependencies.                    
        } catch(e) {
            // Error in expression
            parsingErrorDialog.showDialog(propertyName, newExpression, e.message)
        }
        return expr
    }
}

