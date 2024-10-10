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

import QtQuick
import QtQuick.Controls
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import eu.ad5001.LogarithmPlotter.Popup 1.0 as Popup
import "js/index.mjs" as JS

/*!
    \qmltype Settings
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Tab of the drawer that allows the user to customize how the diagram looks.

    All canvas settings can found in this scrollable view, as well as buttons to copy and save the graph.
    
    \sa LogarithmPlotter, LogGraphCanvas
*/
ScrollView {
    id: settings
    
    signal changed()
    
    property int settingWidth: settings.width - ScrollBar.vertical.width
    property Canvas canvas
    
    /*!
       \qmlproperty double Settings::xzoom
       Zoom on the x axis of the diagram, provided from settings.
       \sa Settings
    */
    property double xzoom: Helper.getSettingInt('default_graph.xzoom')
    /*!
       \qmlproperty double Settings::yzoom
       Zoom on the y axis of the diagram, provided from settings.
       \sa Settings
    */
    property double yzoom: Helper.getSettingInt('default_graph.yzoom')
    /*!
       \qmlproperty double Settings::xmin
       Minimum x of the diagram, provided from settings.
       \sa Settings
    */
    property double xmin: Helper.getSettingInt('default_graph.xmin')
    /*!
       \qmlproperty double Settings::ymax
       Maximum y of the diagram, provided from settings.
       \sa Settings
    */
    property double ymax: Helper.getSettingInt('default_graph.ymax')
    /*!
       \qmlproperty string Settings::xaxisstep
       Step of the x axis graduation, provided from settings.
       \note: Only available in non-logarithmic mode.
       \sa Settings
    */
    property string xaxisstep: Helper.getSetting('default_graph.xaxisstep')
    /*!
       \qmlproperty string Settings::yaxisstep
       Step of the y axis graduation, provided from settings.
       \sa Settings
    */
    property string yaxisstep: Helper.getSetting('default_graph.yaxisstep')
    /*!
       \qmlproperty string Settings::xlabel
       Label used on the x axis, provided from settings.
       \sa Settings
    */
    property string xlabel: Helper.getSetting('default_graph.xlabel')
    /*!
       \qmlproperty string Settings::ylabel
       Label used on the y axis, provided from settings.
       \sa Settings
    */
    property string ylabel: Helper.getSetting('default_graph.ylabel')
    /*!
       \qmlproperty double Settings::linewidth
       Width of lines that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double linewidth: Helper.getSettingInt('default_graph.linewidth')
    /*!
       \qmlproperty double Settings::textsize
       Font size of the text that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double textsize: Helper.getSettingInt('default_graph.textsize')
    /*!
       \qmlproperty bool Settings::logscalex
       true if the canvas should be in logarithmic mode, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool logscalex: Helper.getSettingBool('default_graph.logscalex')
    /*!
       \qmlproperty bool Settings::showxgrad
       true if the x graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showxgrad: Helper.getSettingBool('default_graph.showxgrad')
    /*!
       \qmlproperty bool Settings::showygrad
       true if the y graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showygrad: Helper.getSettingBool('default_graph.showygrad')
    
    Column {
        spacing: 10
        width: parent.width
        bottomPadding: 20
        
        Popup.FileDialog {
            id: fdiag
            onAccepted: {
                var filePath = fdiag.currentFile.toString().substr(7)
                Modules.Settings.set("saveFilename", filePath)
                if(exportMode) {
                    Modules.IO.saveDiagram(filePath)
                } else {
                    Modules.IO.loadDiagram(filePath)
                    // Adding labels.
                    if(xAxisLabel.find(Modules.Settings.xlabel) === -1)
                        xAxisLabel.model.append({text: Modules.Settings.xlabel})
                    xAxisLabel.editText = Modules.Settings.xlabel
                    if(yAxisLabel.find(Modules.Settings.ylabel) === -1)
                        yAxisLabel.model.append({text: Modules.Settings.ylabel})
                    yAxisLabel.editText = Modules.Settings.ylabel
                }
            }
        }
        
        // Zoom
        Setting.TextSetting {
            id: zoomX
            height: 30
            isDouble: true
            label: qsTr("X Zoom")
            min: 0.1
            icon: "settings/xzoom.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("xzoom", newValue, true)
                settings.changed()
            }
            
            function update(newValue) {
                value = Modules.Settings.xzoom.toFixed(2)
                maxX.update()
            }
        }
        
        Setting.TextSetting {
            id: zoomY
            height: 30
            isDouble: true
            min: 0.1
            label: qsTr("Y Zoom")
            icon: "settings/yzoom.svg"
            width: settings.settingWidth

            onChanged: function(newValue) {
                Modules.Settings.set("yzoom", newValue, true)
                settings.changed()
            }
            
            function update(newValue) {
                value = Modules.Settings.yzoom.toFixed(2)
                minY.update()
            }
        }
        
        // Positioning the graph
        Setting.TextSetting {
            id: minX
            height: 30
            isDouble: true
            min: -Infinity
            label: qsTr("Min X")
            icon: "settings/xmin.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("xmin", newValue, true)
                settings.changed()
            }
            
            function update(newValue) {
                let newVal = Modules.Settings.xmin
                if(newVal > 1e-5)
                    newVal = newVal.toDecimalPrecision(8)
                value = newVal
                maxX.update()
            }
        }
        
        Setting.TextSetting {
            id: maxY
            height: 30
            isDouble: true
            min: -Infinity
            label: qsTr("Max Y")
            icon: "settings/ymax.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("ymax", newValue, true)
                settings.changed()
            }
            
            function update() {
                value = Modules.Settings.ymax
                minY.update()
            }
        }
        
        Setting.TextSetting {
            id: maxX
            height: 30
            isDouble: true
            min: -Infinity
            label: qsTr("Max X")
            icon: "settings/xmax.svg"
            width: settings.settingWidth
            
            onChanged: function(xvaluemax) {
                if(xvaluemax > Modules.Settings.xmin) {
                    const newXZoom = Modules.Settings.xzoom * canvas.width/(Modules.Canvas.x2px(xvaluemax)) // Adjusting zoom to fit. = (end)/(px of current point)
                    Modules.Settings.set("xzoom", newXZoom, true)
                    zoomX.update()
                    settings.changed()
                } else {
                    alert.show("Maximum x value must be superior to minimum.")
                }
            }
            
            function update() {
                let newVal = Modules.Canvas.px2x(canvas.width)
                if(newVal > 1e-5)
                    newVal = newVal.toDecimalPrecision(8)
                value = newVal
            }
        }
        
        Setting.TextSetting {
            id: minY
            height: 30
            isDouble: true
            min: -Infinity
            label: qsTr("Min Y")
            icon: "settings/ymin.svg"
            width: settings.settingWidth

            onChanged: function(yvaluemin) {
                if(yvaluemin < settings.ymax) {
                    const newYZoom = Modules.Settings.yzoom * canvas.height/(Modules.Canvas.y2px(yvaluemin)) // Adjusting zoom to fit. = (end)/(px of current point)
                    Modules.Settings.set("yzoom", newYZoom, true)
                    zoomY.update()
                    settings.changed()
                } else {
                    alert.show("Minimum y value must be inferior to maximum.")
                }
            }
            
            function update() {
                value = Modules.Canvas.px2y(canvas.height).toDecimalPrecision(8)
            }
        }
        
        Setting.TextSetting {
            id: xAxisStep
            height: 30
            category: "expression"
            label: qsTr("X Axis Step")
            icon: "settings/xaxisstep.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("xaxisstep", newValue, true)
                settings.changed()
            }
            
            function update() {
                value = Modules.Settings.xaxisstep
                visible = !Modules.Settings.logscalex
            }
        }
        
        Setting.TextSetting {
            id: yAxisStep
            height: 30
            category: "expression"
            label: qsTr("Y Axis Step")
            icon: "settings/yaxisstep.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("yaxisstep", newValue, true)
                settings.changed()
            }
            
            function update() { value = Modules.Settings.yaxisstep }
        }
        
        Setting.TextSetting {
            id: lineWidth
            height: 30
            isDouble: true
            label: qsTr("Line width")
            min: 1
            icon: "settings/linewidth.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("linewidth", newValue, true)
                settings.changed()
            }
            
            function update() { value = Modules.Settings.linewidth }
        }
        
        Setting.TextSetting {
            id: textSize
            height: 30
            isDouble: true
            label: qsTr("Text size (px)")
            min: 1
            icon: "settings/textsize.svg"
            width: settings.settingWidth
            
            onChanged: function(newValue) {
                Modules.Settings.set("textsize", newValue, true)
                settings.changed()
            }
            
            function update() { value = Modules.Settings.textsize }
        }
        
        Setting.ComboBoxSetting {
            id: xAxisLabel
            height: 30
            width: settings.settingWidth
            label: qsTr('X Label')
            icon: "settings/xlabel.svg"
            editable: true
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "x" }
                ListElement { text: "ω (rad/s)" }
            }
            
            onAccepted: function(){
                editText = JS.Utils.parseName(editText, false)
                if(find(editText) === -1) model.append({text: editText})
                currentIndex = find(editText)
                Modules.Settings.set("xlabel", editText, true)
                settings.changed()
            }
            
            onActivated: function(selectedId) {
                Modules.Settings.set("xlabel", model.get(selectedId).text, true)
                settings.changed()
            }
            
            function update() {
                editText = Modules.Settings.xlabel
                if(find(editText) === -1) model.append({text: editText})
                currentIndex = find(editText)
            }
        }
        
        Setting.ComboBoxSetting {
            id: yAxisLabel
            height: 30
            width: settings.settingWidth
            label: qsTr('Y Label')
            icon: "settings/ylabel.svg"
            editable: true
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "y" }
                ListElement { text: "G (dB)" }
                ListElement { text: "φ (°)" }
                ListElement { text: "φ (deg)" }
                ListElement { text: "φ (rad)" }
            }
            
            onAccepted: function(){
                editText = JS.Utils.parseName(editText, false)
                if(find(editText) === -1) model.append({text: editText})
                currentIndex = find(editText)
                Modules.Settings.set("ylabel", editText, true)
                settings.changed()
            }
            
            onActivated: function(selectedId) {
                Modules.Settings.set("ylabel", model.get(selectedId).text, true)
                settings.changed()
            }
            
            function update() {
                editText = Modules.Settings.ylabel
                if(find(editText) === -1) model.append({text: editText})
                currentIndex = find(editText)
            }
        }
        
        CheckBox {
            id: logScaleX
            text: qsTr('X Log scale')
            onClicked: {
                Modules.Settings.set("logscalex", checked, true)
                if(Modules.Settings.xmin <= 0) // Reset xmin to prevent crash.
                    Modules.Settings.set("xmin", .5)
                settings.changed()
            }
            
            function update() {
                checked = Modules.Settings.logscalex
                xAxisStep.update()
            }
        }
        
        CheckBox {
            id: showXGrad
            text: qsTr('Show X graduation')
            onClicked: {
                Modules.Settings.set("showxgrad", checked, true)
                settings.changed()
            }

            function update() { checked = Modules.Settings.showxgrad }
        }
        
        CheckBox {
            id: showYGrad
            checked: settings.showygrad
            text: qsTr('Show Y graduation')
            onClicked: {
                Modules.Settings.set("showygrad", checked, true)
                settings.changed()
            }
            function update() { checked = Modules.Settings.showygrad }
        }
        
        Button {
            id: copyToClipboard
            height: 30
            width: settings.settingWidth
            text: qsTr("Copy to clipboard")
            icon.name: 'editcopy'
            onClicked: root.copyDiagramToClipboard()
        }
        
        Button {
            id: saveDiagram
            height: 30
            width: settings.settingWidth
            text: qsTr("Save plot")
            icon.name: 'document-save'
            onClicked: save()
        }
        
        Button {
            id: saveDiagramAs
            height: 30
            width: settings.settingWidth
            text: qsTr("Save plot as")
            icon.name: 'document-save-as'
            onClicked: saveAs()
        }
        
        Button {
            id: loadDiagram
            height: 30
            width: settings.settingWidth
            text: qsTr("Load plot")
            icon.name: 'document-open'
            onClicked: load()
        }
    }
    
    
    /*!
        \qmlmethod void LogGraphCanvas::save()
        Saves the current canvas in the opened file. If no file is currently opened, prompts to pick a save location.
    */
    function save() {
        if(Modules.Settings.saveFilename == "") {
            saveAs()
        } else {
            Modules.IO.saveDiagram(Modules.Settings.saveFilename)
        }
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::saveAs()
        Prompts the user to pick a new save location.
    */
    function saveAs() {
        fdiag.exportMode = true
        fdiag.open()
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::saveAs()
        Prompts the user to pick a diagram to load.
    */
    function load() {
        fdiag.exportMode = false
        fdiag.open()
    }
    
    /**
     * Initializing the settings
     */
    Component.onCompleted: function() {
        const matchedElements = new Map([
            ["xzoom", zoomX],
            ["yzoom", zoomY],
            ["xmin", minX],
            ["ymax", maxY],
            ["xaxisstep", xAxisStep],
            ["yaxisstep", yAxisStep],
            ["xlabel", xAxisLabel],
            ["ylabel", yAxisLabel],
            ["linewidth", lineWidth],
            ["textsize", textSize],
            ["logscalex", logScaleX],
            ["showxgrad", showXGrad],
            ["showygrad", showYGrad]
        ])
        Modules.Settings.on("changed", (evt) => {
            if(matchedElements.has(evt.property))
                matchedElements.get(evt.property).update()
        })
        Modules.Settings.initialize({ helper: Helper })
    }
}
