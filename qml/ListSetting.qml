import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQml.Models 2.12

Column {
    id: control
    
    signal changed()
    
    property string label: ''
    property bool dictionaryMode: false
    property string keyType: "string"
    property string valueType: "string"
    property string preKeyLabel: ""
    property string postKeyLabel: ": "
    property var keyRegexp: /^.+$/
    property var valueRegexp: /^.+$/
    property bool forbidAdding: false
    
    
    property alias model: repeater.model
    
    Text {
        id: labelItem
        height: 30
        verticalAlignment: TextInput.AlignVCenter
        color: sysPalette.windowText
        text: control.label +": "
    }
    
    Repeater {
        id: repeater
        width: control.width
        model: ListModel {}
        
        Row {
            id: defRow
            height: addEntryBtn.height
            width: parent.width
            
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
                validator: RegExpValidator { 
                    regExp: control.keyRegexp
                }
                verticalAlignment: TextInput.AlignVCenter
                horizontalAlignment: TextInput.AlignHCenter
                color: sysPalette.windowText
                text: visible ? control.model.get(index).key : false
                selectByMouse: true
                onEditingFinished: {
                    var value = text
                    if(control.keyType == 'int') {
                        value = parseInt(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(control.keyType == 'double') {
                        value = parseFloat(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(value != "" && valueInput.acceptableInput) {
                        control.model.setProperty(index, 'key', value)
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
                width: parent.width - x
                validator: RegExpValidator { 
                    regExp: control.valueRegexp
                }
                verticalAlignment: TextInput.AlignVCenter
                horizontalAlignment: TextInput.AlignHCenter
                color: sysPalette.windowText
                text: visible ? control.model.get(index).key : false
                selectByMouse: true
                onEditingFinished: {
                    var value = text
                    if(control.valueType == 'int') {
                        value = parseInt(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(control.valueType == 'double') {
                        value = parseFloat(value)
                        if(value.toString()=="NaN")
                            value = ""
                    }
                    if(value != "" && keyInput.acceptableInput) {
                        control.model.setProperty(index, 'value', value)
                        control.changed()
                    }
                }
            }
        }
    }
    
    Button {
        id: addEntryBtn
        visible: !control.forbidAdding
        text: '+ Add Entry'
        width: control.width
        
        onClicked: {
            control.model.append({
                key: "",
                value: ""
            })
        }
    }
    
    function importModel(importer) {
        model.clear()
        for(var key in importer) 
            model.append({
                key: key,
                value: importer[key]
            })
    }
    
    function exportModel() {
        if(dictionaryMode) {
            var ret = {}
            for(var i = 0; i < model.count; i++)
                ret[model.get(i).key] = model.get(i).value
            return ret
        } else {
            var ret = []
            for(var i = 0; i < model.count; i++)
                ret.push(model.get(i).value)
        }
    }
}
