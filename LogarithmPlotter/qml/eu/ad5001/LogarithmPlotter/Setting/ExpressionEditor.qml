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
import eu.ad5001.LogarithmPlotter.Popup 1.0 as P
import "../js/mathlib.js" as MathLib
import "../js/utils.js" as Utils
import "../js/objects.js" as Objects
import "../js/parsing/parsing.js" as Parsing


/*!
    \qmltype ExpressionEditor
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Setting to edit strings and numbers.
            
    \sa EditorDialog, AutocompletionCategory
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
       \qmlproperty var ExpressionEditor::variables
       Accepted variables for the expression.
    */
    property var variables: []
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
       TODO: Make it configurable.
    */
    readonly property var openAndCloseMatches: {
        "(": ")",
        "[": "]",
        "'": "'",
        '"': '"'
    }
    
    /*!
       \qmlproperty string ExpressionEditor::colorScheme
       Color scheme of the editor, currently based on Breeze Light.
       TODO: Make it configurable.
    */
    readonly property var colorScheme: {
        'NORMAL': "#1F1C1B",
        'VARIABLE': "#0057AE",
        'CONSTANT': "#5E2F00",
        'FUNCTION': "#644A9B",
        'OPERATOR': "#A44EA4",
        'STRING': "#9C0E0E",
        'NUMBER': "#805C00"
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
        //font.pixelSize: 14
        text: control.defValue
        color: "transparent"//sysPalette.windowText
        focus: true
        selectByMouse: true
        
        property var tokens: parent.tokens(text)
        
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
        
        //onTextEdited: acPopupContent.itemSelected = 0
        
        onActiveFocusChanged: {
            if(activeFocus)
                autocompletePopup.open()
            else
                autocompletePopup.close()
        }
        
        Keys.onUpPressed: function(event) {
            if(acPopupContent.itemSelected == 0)
                acPopupContent.itemSelected = acPopupContent.itemCount-1
            else
                acPopupContent.itemSelected = acPopupContent.itemSelected-1
            event.accepted = true
        }
        
        Keys.onDownPressed: function(event) {
            if(acPopupContent.itemSelected == Math.min(acPopupContent.itemCount-1))
                acPopupContent.itemSelected = 0
            else
                acPopupContent.itemSelected = acPopupContent.itemSelected+1
            event.accepted = true
        }
        
        Keys.onPressed: function(event) {
            // Autocomplete popup events
            //console.log(acPopupContent.currentToken.dot, acPopupContent.previousToken.dot, "@", acPopupContent.currentToken.identifier, acPopupContent.previousToken.identifier, acPopupContent.previousToken2.identifier, objectPropertiesList.objectName, JSON.stringify(objectPropertiesList.baseText), objectPropertiesList.model.length, JSON.stringify(objectPropertiesList.categoryItems))
            //console.log("Pressed key:", event.key, Qt.Key_Return, Qt.Key_Enter, event.text, acPopupContent.itemCount)
            if((event.key == Qt.Key_Enter || event.key == Qt.Key_Return) && acPopupContent.itemCount > 0) {
                acPopupContent.autocomplete()
                event.accepted = true
            } else 
                acPopupContent.itemSelected = 0
            /*if(event.key == Qt.Key_Left) { // TODO: Don't reset the position when the key moved is still on the same word
                if(!acPopupContent.identifierTokenTypes.includes())
            }*/
                
                
            if(event.text in openAndCloseMatches) {
                let start = selectionStart
                insert(selectionStart, event.text)
                insert(selectionEnd, openAndCloseMatches[event.text])
                cursorPosition = start+1
                event.accepted = true
            }
        }
        
        Text {
            id: colorizedEditor
            anchors.fill: editor
            verticalAlignment: TextInput.AlignVCenter
            horizontalAlignment: control.label == "" ? TextInput.AlignLeft : TextInput.AlignHCenter
            textFormat: Text.StyledText
            text: colorize(parent.tokens)
            color: sysPalette.windowText
            //font.pixelSize: parent.font.pixelSize
            //opacity: editor.activeFocus ? 0 : 1
        }
    
        Popup {
            id: autocompletePopup
            x: 0
            y: parent.height
            closePolicy: Popup.NoAutoClose
            
            width: editor.width
            height: acPopupContent.height
            padding: 0
            
            Column {
                id: acPopupContent
                width: parent.width
                
                readonly property var identifierTokenTypes: [
                    Parsing.TokenType.VARIABLE,
                    Parsing.TokenType.FUNCTION,
                    Parsing.TokenType.CONSTANT
                ]
                property var currentToken: generateTokenInformation(getTokenAt(editor.tokens, editor.cursorPosition))
                property var previousToken: generateTokenInformation(getPreviousToken(currentToken.token))
                property var previousToken2: generateTokenInformation(getPreviousToken(previousToken.token))
                property var previousToken3: generateTokenInformation(getPreviousToken(previousToken2.token))
                visible: currentToken.exists
                
                // Focus handling.
                readonly property var lists: [objectPropertiesList, variablesList, constantsList, functionsList, executableObjectsList, objectsList]
                readonly property int itemCount: objectPropertiesList.model.length + variablesList.model.length + constantsList.model.length + functionsList.model.length + executableObjectsList.model.length + objectsList.model.length
                property int itemSelected: 0
                
                /*!
                    \qmlmethod var ExpressionEditor::generateTokenInformation(var token)
                    Generates basic information about the given token (existence and type) used in autocompletion).
                */
                function generateTokenInformation(token) {
                    let exists = token != null
                    return {
                        'token': token,
                        'exists': exists,
                        'value': exists ? token.value : null,
                        'type': exists ? token.type : null,
                        'startPosition': exists ? token.startPosition : 0,
                        'dot': exists ? (token.type == Parsing.TokenType.PUNCT && token.value == ".") : false,
                        'identifier': exists ? identifierTokenTypes.includes(token.type) : false
                    }
                }
                /*!
                    \qmlmethod void ExpressionEditor::autocompleteInfoAt(int idx)
                    Returns the autocompletion text information at a given position.
                    The information contains key 'text' (description text), 'autocomplete' (text to insert)
                    and 'cursorFinalOffset' (amount to add to the cursor's position after the end of the autocomplete)
                */
                function autocompleteInfoAt(idx) {
                    if(idx >= itemCount) return ""
                    let startIndex = 0
                    for(let list of lists) {
                        if(idx < startIndex + list.model.length)
                            return list.model[idx-startIndex]
                        startIndex += list.model.length
                    }
                }
                
                /*!
                    \qmlmethod void ExpressionEditor::autocomplete()
                    Autocompletes with the current selected word.
                */
                function autocomplete() {
                    let autotext = autocompleteInfoAt(itemSelected)
                    let startPos = currentToken.startPosition
                    console.log("Replacing", currentToken.value, "at", startPos, "with", autotext.autocomplete)
                    editor.remove(startPos, startPos+currentToken.value.length)
                    editor.insert(startPos, autotext.autocomplete)
                    editor.cursorPosition = startPos+autotext.autocomplete.length+autotext.cursorFinalOffset
                }
                
                /*!
                    \qmlmethod var ExpressionEditor::getPreviousToken(var token)
                    Returns the token before this one.
                */
                function getPreviousToken(token) {
                    let newToken = getTokenAt(editor.tokens, token.startPosition)
                    if(newToken != null && newToken.type == Parsing.TokenType.WHITESPACE)
                        return getPreviousToken(newToken)
                    return newToken
                }
                
                AutocompletionCategory {
                    id: objectPropertiesList
                    
                    category: qsTr("Object Properties")
                    visbilityCondition: isEnteringProperty
                    itemStartIndex: 0
                    itemSelected: parent.itemSelected
                    property bool isEnteringProperty: (
                        // Current token is dot.
                        (parent.currentToken.dot && parent.previousToken.identifier && !parent.previousToken2.dot) ||
                        // Current token is property identifier
                        (parent.currentToken.identifier && parent.previousToken.dot && parent.previousToken2.identifier && !parent.previousToken3.dot))
                    property string objectName: isEnteringProperty ? 
                        (parent.currentToken.dot ? parent.previousToken.value : parent.previousToken2.value)
                    : ""
                    property var objectProperties: isEnteringProperty ? 
                                                    Objects.currentObjectsByName[objectName].constructor.properties() : 
                                                    {}
                    categoryItems: Object.keys(objectProperties)
                    autocompleteGenerator: (item) => {
                        let propType = objectProperties[item]
                        return {
                            'text': item, 'annotation': propType == null ? '' : propType.toString(),
                            'autocomplete': parent.currentToken.dot ? `.${item} ` : `${item} `,
                            'cursorFinalOffset': 0
                        }
                        
                    }
                    baseText: parent.visible && !parent.currentToken.dot ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: variablesList
                    
                    category: qsTr("Variables")
                    visbilityCondition: parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: objectPropertiesList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: control.variables
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': '',
                        'autocomplete': item + " ", 'cursorFinalOffset': 0
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: constantsList
                    
                    category: qsTr("Constants")
                    visbilityCondition: parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: variablesList.itemStartIndex + variablesList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Parsing.CONSTANTS_LIST
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': '',
                        'autocomplete': item + " ", 'cursorFinalOffset': 0
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: functionsList
                    
                    category: qsTr("Functions")
                    visbilityCondition: parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: constantsList.itemStartIndex + constantsList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Parsing.FUNCTIONS_LIST
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': '',
                        'autocomplete': item+'()', 'cursorFinalOffset': -1
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: executableObjectsList
                    
                    category: qsTr("Executable Objects")
                    visbilityCondition: parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: functionsList.itemStartIndex + functionsList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Objects.getObjectsName("ExecutableObject").filter(obj => obj != self)
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': Objects.currentObjectsByName[item] == null ? '' : Objects.currentObjectsByName[item].constructor.displayType(),
                        'autocomplete': item+'()', 'cursorFinalOffset': -1
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: objectsList
                    
                    category: qsTr("Objects")
                    visbilityCondition: parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: executableObjectsList.itemStartIndex + executableObjectsList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Object.keys(Objects.currentObjectsByName).filter(obj => obj != self)
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': `${Objects.currentObjectsByName[item].constructor.displayType()}`,
                        'autocomplete': item+'.', 'cursorFinalOffset': 0
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
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
    
    P.InsertCharacter {
        id: insertPopup
        
        x: Math.round((parent.width - width) / 2)
        y: Math.round((parent.height - height) / 2)
        
        onSelected: function(c) {
            editor.insert(editor.cursorPosition, c)
            insertPopup.close()
            focus = false
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
                if(undefVars.length > 1)
                    throw new Error(qsTranslate('error', 'No object found with names %1.').arg(undefVars.join(', ')))
                else
                    throw new Error(qsTranslate('error', 'No object found with name %1.').arg(undefVars.join(', ')))
            }
            if(expr.requiredObjects().includes(control.self))
                throw new Error(qsTranslate('error', 'Object cannot be dependent on itself.'))
                // TODO: Check for recursive dependencies.   
            return expr                 
        } catch(e) {
            // Error in expression
            parsingErrorDialog.showDialog(propertyName, newExpression, e.message)
            return null
        }
    }
    
    /*!
        \qmlmethod var ExpressionEditor::tokens(string expressionText)
        Generates a list of tokens from the given.
    */
    function tokens(text) {
        let tokenizer = new Parsing.Tokenizer(new Parsing.Input(text), true, false)
        let tokenList = []
        let token
        while((token = tokenizer.next()) != null)
            tokenList.push(token)
        return tokenList
    }
    
    /*!
        \qmlmethod var ExpressionEditor::getTokenAt(var tokens, int position)
        Gets the token at the given position within the text.
        Returns null if out of bounds.
    */
    function getTokenAt(tokenList, position) {
        let currentPosition = 0
        for(let token of tokenList)
            if(position <= (currentPosition + token.value.length))
                return token
            else
                currentPosition += token.value.length
        return null
    }
    
    /*!
        \qmlmethod var ExpressionEditor::colorize(var tokenList)
        Creates an HTML colorized string of the given tokens.
        Returns the colorized and escaped expression if possible, null otherwise..
    */
    function colorize(tokenList) {
        let parsedText = ""
        for(let token of tokenList) {
            switch(token.type) {
                case Parsing.TokenType.VARIABLE:
                    parsedText += `<font color="${colorScheme.VARIABLE}">${token.value}</font>`
                    break;
                case Parsing.TokenType.CONSTANT:
                    parsedText += `<font color="${colorScheme.CONSTANT}">${token.value}</font>`
                    break;
                case Parsing.TokenType.FUNCTION:
                    parsedText += `<font color="${Utils.escapeHTML(colorScheme.FUNCTION)}">${token.value}</font>`
                    break;
                case Parsing.TokenType.OPERATOR:
                    parsedText += `<font color="${colorScheme.OPERATOR}">${Utils.escapeHTML(token.value)}</font>`
                    break;
                case Parsing.TokenType.NUMBER:
                    parsedText += `<font color="${colorScheme.NUMBER}">${Utils.escapeHTML(token.value)}</font>`
                    break;
                case Parsing.TokenType.STRING:
                    parsedText += `<font color="${colorScheme.STRING}">${token.limitator}${Utils.escapeHTML(token.value)}${token.limitator}</font>`
                    break;
                case Parsing.TokenType.WHITESPACE:
                case Parsing.TokenType.PUNCT:
                default:
                    parsedText += Utils.escapeHTML(token.value).replace(/ /g, '&nbsp;')
                    break;
            }
        }
        return parsedText
    }
}

