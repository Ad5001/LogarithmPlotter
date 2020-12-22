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
import "js/utils.js" as Utils

Grid {
    id: settings
    height: 30*Math.max(1, Math.ceil(7 / columns))
    columns: Math.floor(width / settingWidth)
    spacing: 10
    
    signal changed()
    
    property int settingWidth: 135
    
    property int xzoom: 100
    property int yzoom: 10
    property double xmin: 5/10
    property double ymax: 25
    property int yaxisstep: 4
    property string xaxislabel: "ω (rad/s)"
    property string yaxislabel: "G (dB)"
    property string saveFilename: ""
    
    FileDialog {
        id: fdiag
        onAccepted: {
            var filePath = fileUrl.toString().substr(7)
            settings.saveFilename = filePath
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
        min: 0
        label: "Min X"
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
        width: settings.settingWidth
        defValue: settings.ymax
        onChanged: function(newValue) {
            settings.ymax = newValue
            settings.changed()
        }
    }
    TextSetting {
        id: yAxisStep
        height: 30
        isInt: true
        label: "Y Axis Step"
        width: settings.settingWidth
        defValue: settings.yaxisstep
        onChanged: function(newValue) {
            settings.yaxisstep = newValue
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
    
    TextSetting {
        id: xAxisLabel
        height: 30
        label: "X Label"
        width: settings.settingWidth
        defValue: settings.xaxislabel
        onChanged: function(newValue) {
            settings.xaxislabel = Utils.parseName(newValue, false)
            settings.changed()
        }
    }
    
    TextSetting {
        id: yAxisLabel
        height: 30
        label: "Y Label"
        width: settings.settingWidth
        defValue: settings.yaxislabel
        onChanged: function(newValue) {
            settings.yaxislabel = Utils.parseName(newValue, false)
            settings.changed()
        }
    }
    
    Button {
        id: saveDiagram
        height: 30
        width: settings.settingWidth
        text: "Save diagram"
        icon.name: 'filesave'
        onClicked: save()
    }
    
    Button {
        id: saveDiagramAs
        height: 30
        width: settings.settingWidth
        text: "Save diagram as"
        icon.name: 'filesaveas'
        onClicked: saveAs()
    }
    
    Button {
        id: loadDiagram
        height: 30
        width: settings.settingWidth
        text: "Load diagram"
        icon.name: 'fileopen'
        onClicked: load()
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
