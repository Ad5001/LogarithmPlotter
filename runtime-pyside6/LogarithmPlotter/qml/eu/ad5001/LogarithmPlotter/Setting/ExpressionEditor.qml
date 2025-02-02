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
import Qt.labs.platform as Native
import eu.ad5001.LogarithmPlotter.Popup 1.0 as P
import eu.ad5001.LogarithmPlotter.Common


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
       \qmlproperty bool ExpressionEditor::allowGraphObjects
       If true, allows graph objects to be used as part of the expression.
    */
    property bool allowGraphObjects: true
    
    /*!
       \qmlproperty var ExpressionEditor::errorDialog
       Allows to summon the error dialog when using additional external parsing.
    */
    readonly property alias errorDialog: parsingErrorDialog
    
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
       \qmlproperty string ExpressionEditor::colorSchemes
       Color schemes of the editor.
    */
    readonly property var colorSchemes: [
        { // Breeze Light
            'NORMAL':   "#1F1C1B",
            'VARIABLE': "#0057AE",
            'CONSTANT': "#006E28",
            'FUNCTION': "#644A9B",
            'OPERATOR': "#CA60CA",
            'STRING':   "#BF0303",
            'NUMBER':   "#B08000"
        },
        { // Breeze Dark
            'NORMAL':   "#CFCFC2",
            'VARIABLE': "#2980B9",
            'CONSTANT': "#27AE60",
            'FUNCTION': "#8E44AD",
            'OPERATOR': "#A44EA4",
            'STRING':   "#F44F4F",
            'NUMBER':   "#F67400"
        },
        { // Solarized
            'NORMAL':   "#839496",
            'VARIABLE': "#B58900",
            'CONSTANT': "#859900",
            'FUNCTION': "#268BD2",
            'OPERATOR': "#859900",
            'STRING':   "#2AA198",
            'NUMBER':   "#2AA198"
        },
        { // GitHub Light
            'NORMAL':   "#24292E",
            'VARIABLE': "#D73A49",
            'CONSTANT': "#6F42C1",
            'FUNCTION': "#6F42C1",
            'OPERATOR': "#24292E",
            'STRING':   "#032F62",
            'NUMBER':   "#005CC5"
        },
        { // GitHub Dark
            'NORMAL':   "#E1E4E8",
            'VARIABLE': "#F97583",
            'CONSTANT': "#B392f0",
            'FUNCTION': "#B392f0",
            'OPERATOR': "#E1E4E8",
            'STRING':   "#9ECBFF",
            'NUMBER':   "#79B8FF"
        },
        { // Nord
            'NORMAL':   "#D8DEE9",
            'VARIABLE': "#81A1C1",
            'CONSTANT': "#8FBCBB",
            'FUNCTION': "#88C0D0",
            'OPERATOR': "#81A1C1",
            'STRING':   "#A3BE8C",
            'NUMBER':   "#B48EAD"
        },
        { // Monokai
            'NORMAL':   "#F8F8F2",
            'VARIABLE': "#66D9EF",
            'CONSTANT': "#F92672",
            'FUNCTION': "#A6E22E",
            'OPERATOR': "#F8F8F2",
            'STRING':   "#E6DB74",
            'NUMBER':   "#AE81FF"
        }
    ]
    
    Icon {
        id: iconLabel
        anchors.top: parent.top
        anchors.topMargin: parent.icon == "" ? 0 : 3
        source: control.visible && parent.icon != "" ? "../icons/" + control.icon : ""
        width: height
        height: parent.icon == "" || !visible ? 0 : 24
        color: sysPalette.windowText
    }
    
    Label {
        id: labelItem
        anchors.left: iconLabel.right
        anchors.leftMargin: parent.icon == "" ? 0 : 5
        anchors.top: parent.top
        height: parent.height
        width: Math.max(85, implicitWidth)
        verticalAlignment: TextInput.AlignVCenter
        //color: sysPalette.windowText
        text: visible ? qsTranslate("control", "%1: ").arg(control.label) : ""
        visible: control.label != ""
    }
    
    Native.MessageDialog {
        id: parsingErrorDialog
        title: qsTranslate("expression", "LogarithmPlotter - Parsing error")
        text: ""
        function showDialog(propName, propValue, error) {
            text = qsTranslate("expression", "Error while parsing expression for property %1:\n%2\n\nEvaluated expression: %3")
                    .arg(qsTranslate('prop', propName))
                    .arg(error).arg(propValue)
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
        color: syntaxHighlightingEnabled ? sysPalette.window : sysPalette.windowText
        focus: true
        selectByMouse: true
        
        property bool autocompleteEnabled: Helper.getSetting("autocompletion.enabled")
        property bool syntaxHighlightingEnabled: Helper.getSetting("expression_editor.colorize")
        property bool autoClosing: Helper.getSetting("expression_editor.autoclose")
        property var tokens: autocompleteEnabled || syntaxHighlightingEnabled ? parent.tokens(text) : []
        
        Keys.priority: Keys.BeforeItem // Required for knowing which key the user presses.
        
        onEditingFinished: {
            if(insertButton.focus || insertPopup.focus) return
            let value = text
            if(value != "" && value.toString() != parent.defValue) {
                let expr = parent.parse(value)
                if(expr != null) {
                    control.changed(expr)
                    defValue = expr.toEditableString()
                }
            }
        }
        
        onActiveFocusChanged: {
            if(activeFocus && autocompleteEnabled)
                autocompletePopup.open()
            else
                autocompletePopup.close()
        }
        
        cursorDelegate: Rectangle {
            visible: editor.cursorVisible
            color: sysPalette.windowText
            width: editor.cursorRectangle.width
        }

        Keys.onUpPressed: function(event) {
            if(autocompleteEnabled)
                if(acPopupContent.itemSelected == 0)
                    acPopupContent.itemSelected = acPopupContent.itemCount-1
                else
                    acPopupContent.itemSelected = acPopupContent.itemSelected-1
            event.accepted = true
        }
        
        Keys.onDownPressed: function(event) {
            if(autocompleteEnabled)
                if(acPopupContent.itemSelected == Math.min(acPopupContent.itemCount-1))
                    acPopupContent.itemSelected = 0
                else
                    acPopupContent.itemSelected = acPopupContent.itemSelected+1
            event.accepted = true
        }
        
        Keys.onPressed: function(event) {
            // Autocomplete popup events
            if(autocompleteEnabled && (event.key == Qt.Key_Enter || event.key == Qt.Key_Return) && acPopupContent.itemCount > 0) {
                acPopupContent.autocomplete()
                event.accepted = true
            } else 
                acPopupContent.itemSelected = 0
                
                
            if(event.text in parent.openAndCloseMatches && autoClosing) {
                let start = selectionStart
                insert(selectionStart, event.text)
                insert(selectionEnd, parent.openAndCloseMatches[event.text])
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
            text: parent.syntaxHighlightingEnabled ? colorize(parent.tokens) : ""
            color: sysPalette.windowText
            visible: parent.syntaxHighlightingEnabled
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
                    JS.Parsing.TokenType.VARIABLE,
                    JS.Parsing.TokenType.FUNCTION,
                    JS.Parsing.TokenType.CONSTANT
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
                        'dot': exists ? (token.type == JS.Parsing.TokenType.PUNCT && token.value == ".") : false,
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
                    if(newToken != null && newToken.type == JS.Parsing.TokenType.WHITESPACE)
                        return getPreviousToken(newToken)
                    return newToken
                }
                
                AutocompletionCategory {
                    id: objectPropertiesList
                    
                    category: qsTr("Object Properties")
                    visbilityCondition: control.allowGraphObjects && doesObjectExist
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
                    property bool doesObjectExist: isEnteringProperty && (objectName in Modules.Objects.currentObjectsByName)
                    property var objectProperties: doesObjectExist ? 
                                                    Modules.Objects.currentObjectsByName[objectName].constructor.properties() :
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
                    categoryItems: JS.Parsing.CONSTANTS_LIST
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': JS.Parsing.CONSTANTS[item],
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
                    categoryItems: JS.Parsing.FUNCTIONS_LIST
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': JS.Parsing.FUNCTIONS_USAGE[item].join(', '),
                        'autocomplete': item+'()', 'cursorFinalOffset': -1
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: executableObjectsList
                    
                    category: qsTr("Executable Objects")
                    visbilityCondition: control.allowGraphObjects && parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: functionsList.itemStartIndex + functionsList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Modules.Objects.getObjectsName("ExecutableObject").filter(obj => obj != self)
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': Modules.Objects.currentObjectsByName[item] == null ? '' : Modules.Objects.currentObjectsByName[item].constructor.displayType(),
                        'autocomplete': item+'()', 'cursorFinalOffset': -1
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
                
                AutocompletionCategory {
                    id: objectsList
                    
                    category: qsTr("Objects")
                    visbilityCondition: control.allowGraphObjects && parent.currentToken.identifier && !parent.previousToken.dot
                    itemStartIndex: executableObjectsList.itemStartIndex + executableObjectsList.model.length
                    itemSelected: parent.itemSelected
                    categoryItems: Object.keys(Modules.Objects.currentObjectsByName).filter(obj => obj != self)
                    autocompleteGenerator: (item) => {return {
                        'text': item, 'annotation': `${Modules.Objects.currentObjectsByName[item].constructor.displayType()}`,
                        'autocomplete': item+'.', 'cursorFinalOffset': 0
                    }}
                    baseText: parent.visible ? parent.currentToken.value : ""
                }
            }
        }
    }
    
    Button {
        id: insertButton
        anchors.right: parent.right
        anchors.rightMargin: 5
        anchors.verticalCenter: parent.verticalCenter
        width: 20
        height: width
        
        Icon {
            id: icon
            width: 12
            height: 12
            anchors.centerIn: parent
            
            color: sysPalette.windowText
            source: '../icons/properties/expression.svg'
        }
        
        onClicked: {
            insertPopup.open()
            insertPopup.setFocus()
        }
    }
    
    P.InsertCharacter {
        id: insertPopup
        
        x: parent.width - width
        y: parent.height
        
        category: "expression"
        
        onSelected: function(c) {
            editor.insert(editor.cursorPosition, c)
        }
        
        onClosed: function() {
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
            expr = new JS.MathLib.Expression(value.toString())
            // Check if the expression is valid, throws error otherwise.
            if(!expr.allRequirementsFulfilled()) {
                let undefVars = expr.undefinedVariables()
                if(undefVars.length > 1)
                    throw new Error(qsTranslate('error', 'No object found with names %1.').arg(undefVars.join(', ')))
                else
                    throw new Error(qsTranslate('error', 'No object found with name %1.').arg(undefVars.join(', ')))
            }
            if(expr.requiredObjects().includes(control.self))
                throw new Error(qsTranslate('error', 'Object cannot be dependent on itself.'))
            // Recursive dependencies
            let dependentOnSelfObjects = expr.requiredObjects().filter(
                (obj) => Modules.Objects.currentObjectsByName[obj].getDependenciesList()
                          .includes(Modules.Objects.currentObjectsByName[control.self])
            )
            if(dependentOnSelfObjects.length == 1)
                throw new Error(qsTranslate('error', 'Circular dependency detected. Object %1 depends on %2.').arg(dependentOnSelfObjects[0].toString()).arg(control.self))
            else if(dependentOnSelfObjects.length > 1)
                throw new Error(qsTranslate('error', 'Circular dependency detected. Objects %1 depend on %2.').arg(dependentOnSelfObjects.map(obj => obj.toString()).join(', ')).arg(control.self))
            //console.log(control.self, propertyName, expr.execute())
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
        let tokenizer = new JS.Parsing.Tokenizer(new JS.Parsing.Input(text), true, false)
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
        let scheme = colorSchemes[Helper.getSetting("expression_editor.color_scheme")]
        for(let token of tokenList) {
            switch(token.type) {
                case JS.Parsing.TokenType.VARIABLE:
                    parsedText += `<font color="${scheme.VARIABLE}">${token.value}</font>`
                    break;
                case JS.Parsing.TokenType.CONSTANT:
                    parsedText += `<font color="${scheme.CONSTANT}">${token.value}</font>`
                    break;
                case JS.Parsing.TokenType.FUNCTION:
                    parsedText += `<font color="${scheme.FUNCTION}">${JS.Utils.escapeHTML(token.value)}</font>`
                    break;
                case JS.Parsing.TokenType.OPERATOR:
                    parsedText += `<font color="${scheme.OPERATOR}">${JS.Utils.escapeHTML(token.value)}</font>`
                    break;
                case JS.Parsing.TokenType.NUMBER:
                    parsedText += `<font color="${scheme.NUMBER}">${JS.Utils.escapeHTML(token.value)}</font>`
                    break;
                case JS.Parsing.TokenType.STRING:
                    parsedText += `<font color="${scheme.STRING}">${token.limitator}${JS.Utils.escapeHTML(token.value)}${token.limitator}</font>`
                    break;
                case JS.Parsing.TokenType.WHITESPACE:
                case JS.Parsing.TokenType.PUNCT:
                default:
                    parsedText += JS.Utils.escapeHTML(token.value).replace(/ /g, '&nbsp;')
                    break;
            }
        }
        return parsedText
    }
}

