import QtQuick 2.12

ListView {
    id: control
    
    signal changed()
    
    property bool dictionaryMode: false
    property bool keyType: "string"
    property bool valueType: "string"
    property string preKeyLabel: ""
    property string postKeyLabel: ": "
    property var keyRegexp: /^.+$/
    property var valueRegexp: /^.+$/
    
    
    model: ListModel {}
    
    delegate: Row {
        height: 30
        width: control.width
        
        Text {
            id: preKeyText
            height: parent.height
            verticalAlignment: TextInput.AlignVCenter
            color: sysPalette.windowText
            text: control.preKeyLabel
        }
        
        TextField {
            id: keyInput
            visible: control.dictionaryMode
            height: parent.height
            width: visible ? 50 : 0
            validator: RegularExpressionValidator { 
                regularExpression: control.keyRegexp
            }
            verticalAlignment: TextInput.AlignVCenter
            horizontalAlignment: TextInput.AlignHCenter
            color: sysPalette.windowText
            text: visible ? model.get(index).key : false
            selectByMouse: true
            onEditingFinished: {
                var value = text
                if(control.keyType == 'int') {
                    value = parseFloat(value)
                    if(value.toString()=="NaN")
                        value = ""
                }
                if(control.keyType == 'double') {
                    value = parseFloat(value)
                    if(value.toString()=="NaN")
                        value = ""
                }
                if(value != "") {
                    model.setProperty(index, 'key', value)
                    control.changed()
                }
            }
        }
        
        Text {
            id: postKeyText
            visible: control.dictionaryMode
            height: parent.height
            verticalAlignment: TextInput.AlignVCenter
            color: sysPalette.windowText
            text: control.postKeyLabel
        }
        
        TextField {
            id: valueInput
            height: parent.height
            width: parent.width - preKeyText.width - keyInput.width - postKeyText.width
            validator: RegularExpressionValidator { 
                regularExpression: control.valueRegexp
            }
            verticalAlignment: TextInput.AlignVCenter
            horizontalAlignment: TextInput.AlignHCenter
            color: sysPalette.windowText
            text: visible ? model.get(index).key : false
            selectByMouse: true
            onEditingFinished: {
                var value = text
                if(control.valueType == 'int') {
                    value = parseFloat(value)
                    if(value.toString()=="NaN")
                        value = ""
                }
                if(control.valueType == 'double') {
                    value = parseFloat(value)
                    if(value.toString()=="NaN")
                        value = ""
                }
                if(value != "") {
                    model.setProperty(index, 'value', value)
                    control.changed()
                }
            }
        }
    }
    
    footer: Button {
        id: addEntryBtn
        text: '+ Add Entry'
        width: control.width
        height: visible ? implicitHeight : 0
        
        onClicked: {
            control.model.append({
                key: "",
                value: ""
            })
        }
    }
    
    function import(importer) {
        model.clear()
        if(dictionaryMode) {
            for(var key in importer) model.append({
                key: key,
                value: importer[value]
            })
        } else {
            for(var key in importer) model.append({
                key: key,
                value: importer[value]
            })
        }
    }
    
    function export() {
        if(d
    }
}
