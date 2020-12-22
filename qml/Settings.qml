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

Grid {
    id: root
    height: 30*Math.max(1, Math.ceil(7 / columns))
    columns: Math.floor(width / settingWidth)
    spacing: 10
    
    signal changed()
    signal copyToClipboard()
    signal saveDiagram(string filename)
    signal loadDiagram(string filename)
    
    property int settingWidth: 135
    
    property int xzoom: 100
    property int yzoom: 10
    property double xmin: 5/10
    property double ymax: 25
    property int yaxisstep: 4
    property string xaxislabel: "ω (rad/s)"
    property string yaxislabel: "Gain G (dB)"
    property string saveFilename: ""
    
    FileDialog {
        id: fdiag
        onAccepted: {
            var filePath = fileUrl.toString().substr(7)
            root.saveFilename = filePath
            console.log(filePath)
            if(exportMode) {
                root.saveDiagram(filePath)
            } else {
                root.loadDiagram(filePath)
            }
        }
    }
    
    // Line 1
    // Zoom
    TextSetting {
        id: zoomX
        height: 30
        isInt: true
        label: "X Zoom"
        min: 1
        width: root.settingWidth
        defValue: root.xzoom
        onChanged: function(newValue) {
            root.xzoom = newValue
            root.changed()
        }
    }
    TextSetting {
        id: zoomY
        height: 30
        isInt: true
        label: "Y Zoom"
        width: root.settingWidth
        defValue: root.yzoom
        onChanged: function(newValue) {
            root.yzoom = newValue
            root.changed()
        }
    }
    // Positioning the graph
    TextSetting {
        id: minX
        height: 30
        isDouble: true
        min: 0
        label: "Min X"
        width: root.settingWidth
        defValue: root.xmin
        onChanged: function(newValue) {
            root.xmin = newValue
            root.changed()
        }
    }
    TextSetting {
        id: maxY
        height: 30
        isDouble: true
        label: "Max Y"
        width: root.settingWidth
        defValue: root.ymax
        onChanged: function(newValue) {
            root.ymax = newValue
            root.changed()
        }
    }
    TextSetting {
        id: yAxisStep
        height: 30
        isInt: true
        label: "Y Axis Step"
        width: root.settingWidth
        defValue: root.yaxisstep
        onChanged: function(newValue) {
            root.yaxisstep = newValue
            root.changed()
        }
    }
    
    Button {
        id: copyToClipboard
        height: 30
        width: root.settingWidth
        text: "Copy to clipboard"
        icon.name: 'editcopy'
        onClicked: root.copyToClipboard()
    }
    
    TextSetting {
        id: xAxisLabel
        height: 30
        label: "X Label"
        width: root.settingWidth
        defValue: root.xaxislabel
        onChanged: function(newValue) {
            root.xaxislabel = newValue
            root.changed()
        }
    }
    
    TextSetting {
        id: yAxisLabel
        height: 30
        label: "Y Label"
        width: root.settingWidth
        defValue: root.yaxislabel
        onChanged: function(newValue) {
            root.yaxislabel = newValue
            root.changed()
        }
    }
    
    Button {
        id: saveDiagram
        height: 30
        width: root.settingWidth
        text: "Save diagram"
        icon.name: 'filesave'
        onClicked: save()
    }
    
    Button {
        id: saveDiagramAs
        height: 30
        width: root.settingWidth
        text: "Save diagram as"
        icon.name: 'filesaveas'
        onClicked: saveAs()
    }
    
    Button {
        id: loadDiagram
        height: 30
        width: root.settingWidth
        text: "Load diagram"
        icon.name: 'fileopen'
        onClicked: load()
    }
    CheckBox {
        id: modePhaseCheck
        height: 30
        width: root.settingWidth
        text: "Mode phase"
        property var refresh: checked ? root.changed() : root.changed()
    }
    
    function save() {
        if(root.saveFilename == "") {
            fdiag.exportMode = true
            fdiag.open()
        } else {
            root.saveDiagram(root.saveFilename)
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
