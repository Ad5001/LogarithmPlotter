/**
 *  Logarithmic Plotter - Create graphs with logarithm scales.
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

import QtQuick.Controls 2.12
import QtQuick 2.12 
import "js/utils.js" as Utils

ScrollView {
    id: settings
    
    signal changed()
    
    property int settingWidth: settings.width
    
    property int xzoom: 100
    property int yzoom: 10
    property double xmin: 5/10
    property double ymax: 25
    property string xaxisstep: "4"
    property string yaxisstep: "4"
    property string xaxislabel: ""
    property string yaxislabel: ""
    property double linewidth: 1
    property double textsize: 14
    property bool logscalex: true
    property string saveFilename: ""
    property bool showxgrad: true
    property bool showygrad: true
    
    Column {
        //height: 30*12 //30*Math.max(1, Math.ceil(7 / columns))
        //columns: Math.floor(width / settingWidth)
        spacing: 10
        
        FileDialog {
            id: fdiag
            onAccepted: {
                var filePath = fileUrl.toString().substr(7)
                settings.saveFilename = filePath
                if(exportMode) {
                    root.saveDiagram(filePath)
                } else {
                    root.loadDiagram(filePath)
                    if(xAxisLabel.find(settings.xaxislabel) == -1) xAxisLabel.model.append({text: settings.xaxislabel})
                    xAxisLabel.editText = settings.xaxislabel
                    if(yAxisLabel.find(settings.yaxislabel) == -1) yAxisLabel.model.append({text: settings.yaxislabel})
                    yAxisLabel.editText = settings.yaxislabel
                }
            }
        }
        
        // Zoom
        TextSetting {
            id: zoomX
            height: 30
            isInt: true
            label: "X Zoom"
            min: 1
            icon: "icons/settings/xzoom.svg"
            width: settings.settingWidth
            defValue: settings.xzoom
            onChanged: function(newValue) {
                settings.xzoom = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: zoomY
            height: 30
            isInt: true
            label: "Y Zoom"
            icon: "icons/settings/yzoom.svg"
            width: settings.settingWidth
            defValue: settings.yzoom
            onChanged: function(newValue) {
                settings.yzoom = newValue
                settings.changed()
            }
        }
        
        // Positioning the graph
        TextSetting {
            id: minX
            height: 30
            isDouble: true
            min: -Infinity
            label: "Min X"
            icon: "icons/settings/xmin.svg"
            width: settings.settingWidth
            defValue: settings.xmin
            onChanged: function(newValue) {
                settings.xmin = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: maxY
            height: 30
            isDouble: true
            label: "Max Y"
            icon: "icons/settings/ymax.svg"
            width: settings.settingWidth
            defValue: settings.ymax
            onChanged: function(newValue) {
                settings.ymax = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: xAxisStep
            height: 30
            label: "X Axis Step"
            icon: "icons/settings/xaxisstep.svg"
            width: settings.settingWidth
            defValue: settings.xaxisstep
            visible: !settings.logscalex
            onChanged: function(newValue) {
                settings.xaxisstep = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: yAxisStep
            height: 30
            label: "Y Axis Step"
            icon: "icons/settings/yaxisstep.svg"
            width: settings.settingWidth
            defValue: settings.yaxisstep
            onChanged: function(newValue) {
                settings.yaxisstep = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: lineWidth
            height: 30
            isDouble: true
            label: "Line width"
            min: 1
            icon: "icons/settings/linewidth.svg"
            width: settings.settingWidth
            defValue: settings.linewidth
            onChanged: function(newValue) {
                settings.linewidth = newValue
                settings.changed()
            }
        }
        
        TextSetting {
            id: textSize
            height: 30
            isDouble: true
            label: "Text size (px)"
            min: 1
            icon: "icons/settings/textsize.svg"
            width: settings.settingWidth
            defValue: settings.textsize
            onChanged: function(newValue) {
                settings.textsize = newValue
                settings.changed()
            }
        }
        
        ComboBoxSetting {
            id: xAxisLabel
            height: 30
            width: settings.settingWidth
            label: 'X Label'
            icon: "icons/settings/xlabel.svg"
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "x" }
                ListElement { text: "ω (rad/s)" }
            }
            currentIndex: find(settings.xaxislabel)
            editable: true
            onAccepted: function(){
                editText = Utils.parseName(editText, false)
                if (find(editText) === -1) model.append({text: editText})
                settings.xaxislabel = editText
                settings.changed()
            }
            onActivated: function(selectedId) {
                settings.xaxislabel = model.get(selectedId).text
                settings.changed()
            }
            Component.onCompleted: editText = settings.xaxislabel
        }
        
        ComboBoxSetting {
            id: yAxisLabel
            height: 30
            width: settings.settingWidth
            label: 'Y Label'
            icon: "icons/settings/ylabel.svg"
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "y" }
                ListElement { text: "G (dB)" }
                ListElement { text: "φ (°)" }
                ListElement { text: "φ (deg)" }
                ListElement { text: "φ (rad)" }
            }
            currentIndex: find(settings.yaxislabel)
            editable: true
            onAccepted: function(){
                editText = Utils.parseName(editText, false)
                if (find(editText) === -1) model.append({text: editText, yaxisstep: root.yaxisstep})
                settings.yaxislabel = editText
                settings.changed()
            }
            onActivated: function(selectedId) {
                settings.yaxislabel = model.get(selectedId).text
                settings.changed()
            }
            Component.onCompleted: editText = settings.yaxislabel
        }
        
        CheckBox {
            id: logScaleX
            checked: settings.logscalex
            text: 'X Log scale'
            onClicked: {
                settings.logscalex = checked
                settings.changed()
            }
        }
        
        CheckBox {
            id: showXGrad
            checked: settings.showxgrad
            text: 'Show X graduation'
            onClicked: {
                settings.showxgrad = checked
                settings.changed()
            }
        }
        
        CheckBox {
            id: showYGrad
            checked: settings.showygrad
            text: 'Show Y graduation'
            onClicked: {
                settings.showygrad = checked
                settings.changed()
            }
        }
        
        Button {
            id: copyToClipboard
            height: 30
            width: settings.settingWidth
            text: "Copy to clipboard"
            icon.name: 'editcopy'
            onClicked: root.copyDiagramToClipboard()
        }
        
        Button {
            id: saveDiagram
            height: 30
            width: settings.settingWidth
            text: "Save plot"
            icon.name: 'document-save'
            onClicked: save()
        }
        
        Button {
            id: saveDiagramAs
            height: 30
            width: settings.settingWidth
            text: "Save plot as"
            icon.name: 'document-save-as'
            onClicked: saveAs()
        }
        
        Button {
            id: loadDiagram
            height: 30
            width: settings.settingWidth
            text: "Load plot"
            icon.name: 'document-open'
            onClicked: load()
        }
    }
    
    function save() {
        if(settings.saveFilename == "") {
            fdiag.exportMode = true
            fdiag.open()
        } else {
            root.saveDiagram(settings.saveFilename)
        }
    }
    
    function saveAs() {
        fdiag.exportMode = true
        fdiag.open()
    }
    
    function load() {
        fdiag.exportMode = false
        fdiag.open()
    }
}
