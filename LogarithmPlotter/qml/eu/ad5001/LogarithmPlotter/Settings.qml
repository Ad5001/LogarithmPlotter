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
import "js/utils.mjs" as Utils

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
    property double xzoom: 100
    /*!
       \qmlproperty double Settings::yzoom
       Zoom on the y axis of the diagram, provided from settings.
       \sa Settings
    */
    property double yzoom: 10
    /*!
       \qmlproperty double Settings::xmin
       Minimum x of the diagram, provided from settings.
       \sa Settings
    */
    property double xmin: 5/10
    /*!
       \qmlproperty double Settings::ymax
       Maximum y of the diagram, provided from settings.
       \sa Settings
    */
    property double ymax: 25
    /*!
       \qmlproperty string Settings::xaxisstep
       Step of the x axis graduation, provided from settings.
       \note: Only available in non-logarithmic mode.
       \sa Settings
    */
    property string xaxisstep: "4"
    /*!
       \qmlproperty string Settings::yaxisstep
       Step of the y axis graduation, provided from settings.
       \sa Settings
    */
    property string yaxisstep: "4"
    /*!
       \qmlproperty string Settings::xlabel
       Label used on the x axis, provided from settings.
       \sa Settings
    */
    property string xlabel: ""
    /*!
       \qmlproperty string Settings::ylabel
       Label used on the y axis, provided from settings.
       \sa Settings
    */
    property string ylabel: ""
    /*!
       \qmlproperty double Settings::linewidth
       Width of lines that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double linewidth: 1
    /*!
       \qmlproperty double Settings::textsize
       Font size of the text that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double textsize: 18
    /*!
       \qmlproperty bool Settings::logscalex
       true if the canvas should be in logarithmic mode, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool logscalex: true
    /*!
       \qmlproperty bool Settings::showxgrad
       true if the x graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showxgrad: true
    /*!
       \qmlproperty bool Settings::showygrad
       true if the y graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showygrad: true
    /*!
       \qmlproperty bool Settings::saveFilename
       Path of the currently opened file. Empty if no file is opened.
    */
    property string saveFilename: ""
    
    Column {
        spacing: 10
        width: parent.width
        bottomPadding: 20
        
        Popup.FileDialog {
            id: fdiag
            onAccepted: {
                var filePath = fdiag.currentFile.toString().substr(7)
                settings.saveFilename = filePath
                if(exportMode) {
                    root.saveDiagram(filePath)
                } else {
                    root.loadDiagram(filePath)
                    if(xAxisLabel.find(settings.xlabel) == -1) xAxisLabel.model.append({text: settings.xlabel})
                    xAxisLabel.editText = settings.xlabel
                    if(yAxisLabel.find(settings.ylabel) == -1) yAxisLabel.model.append({text: settings.ylabel})
                    yAxisLabel.editText = settings.ylabel
                }
            }
        }
        
        // Zoom
        Setting.TextSetting {
            id: zoomX
            height: 30
            isDouble: true
            label: qsTr("X Zoom")
            min: 1
            icon: "settings/xzoom.svg"
            width: settings.settingWidth
            value: settings.xzoom.toFixed(2)
            onChanged: function(newValue) {
                settings.xzoom = newValue
                settings.changed()
            }
        }
        
        Setting.TextSetting {
            id: zoomY
            height: 30
            isDouble: true
            label: qsTr("Y Zoom")
            icon: "settings/yzoom.svg"
            width: settings.settingWidth
            value: settings.yzoom.toFixed(2)
            onChanged: function(newValue) {
                settings.yzoom = newValue
                settings.changed()
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
            defValue: settings.xmin
            onChanged: function(newValue) {
                if(parseFloat(maxX.value) > newValue) {
                    settings.xmin = newValue
                    settings.changed()
                } else {
                    alert.show("Minimum x value must be inferior to maximum.")
                }
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
            defValue: settings.ymax
            onChanged: function(newValue) {
                settings.ymax = newValue
                settings.changed()
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
            value: Modules.Canvas.px2x(canvas.width).toFixed(2)
            onChanged: function(xvaluemax) {
                if(xvaluemax > settings.xmin) {
                    settings.xzoom = settings.xzoom * canvas.width/(Modules.Canvas.x2px(xvaluemax)) // Adjusting zoom to fit. = (end)/(px of current point)
                    settings.changed()
                } else {
                    alert.show("Maximum x value must be superior to minimum.")
                }
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
            defValue: Modules.Canvas.px2y(canvas.height).toFixed(2)
            onChanged: function(yvaluemin) {
                if(yvaluemin < settings.ymax) {
                    settings.yzoom = settings.yzoom * canvas.height/(Modules.Canvas.y2px(yvaluemin)) // Adjusting zoom to fit. = (end)/(px of current point)
                    settings.changed()
                } else {
                    alert.show("Minimum y value must be inferior to maximum.")
                }
            }
        }
        
        Setting.TextSetting {
            id: xAxisStep
            height: 30
            category: "expression"
            label: qsTr("X Axis Step")
            icon: "settings/xaxisstep.svg"
            width: settings.settingWidth
            defValue: settings.xaxisstep
            visible: !settings.logscalex
            onChanged: function(newValue) {
                settings.xaxisstep = newValue
                settings.changed()
            }
        }
        
        Setting.TextSetting {
            id: yAxisStep
            height: 30
            category: "expression"
            label: qsTr("Y Axis Step")
            icon: "settings/yaxisstep.svg"
            width: settings.settingWidth
            defValue: settings.yaxisstep
            onChanged: function(newValue) {
                settings.yaxisstep = newValue
                settings.changed()
            }
        }
        
        Setting.TextSetting {
            id: lineWidth
            height: 30
            isDouble: true
            label: qsTr("Line width")
            min: 1
            icon: "settings/linewidth.svg"
            width: settings.settingWidth
            defValue: settings.linewidth
            onChanged: function(newValue) {
                settings.linewidth = newValue
                settings.changed()
            }
        }
        
        Setting.TextSetting {
            id: textSize
            height: 30
            isDouble: true
            label: qsTr("Text size (px)")
            min: 1
            icon: "settings/textsize.svg"
            width: settings.settingWidth
            defValue: settings.textsize
            onChanged: function(newValue) {
                settings.textsize = newValue
                settings.changed()
            }
        }
        
        Setting.ComboBoxSetting {
            id: xAxisLabel
            height: 30
            width: settings.settingWidth
            label: qsTr('X Label')
            icon: "settings/xlabel.svg"
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "x" }
                ListElement { text: "ω (rad/s)" }
            }
            currentIndex: find(settings.xlabel)
            editable: true
            onAccepted: function(){
                editText = Utils.parseName(editText, false)
                if (find(editText) === -1) model.append({text: editText})
                settings.xlabel = editText
                settings.changed()
            }
            onActivated: function(selectedId) {
                settings.xlabel = model.get(selectedId).text
                settings.changed()
            }
            Component.onCompleted: editText = settings.xlabel
        }
        
        Setting.ComboBoxSetting {
            id: yAxisLabel
            height: 30
            width: settings.settingWidth
            label: qsTr('Y Label')
            icon: "settings/ylabel.svg"
            model: ListModel {
                ListElement { text: "" }
                ListElement { text: "y" }
                ListElement { text: "G (dB)" }
                ListElement { text: "φ (°)" }
                ListElement { text: "φ (deg)" }
                ListElement { text: "φ (rad)" }
            }
            currentIndex: find(settings.ylabel)
            editable: true
            onAccepted: function(){
                editText = Utils.parseName(editText, false)
                if (find(editText) === -1) model.append({text: editText, yaxisstep: root.yaxisstep})
                settings.ylabel = editText
                settings.changed()
            }
            onActivated: function(selectedId) {
                settings.ylabel = model.get(selectedId).text
                settings.changed()
            }
            Component.onCompleted: editText = settings.ylabel
        }
        
        CheckBox {
            id: logScaleX
            checked: settings.logscalex
            text: qsTr('X Log scale')
            onClicked: {
                settings.logscalex = checked
                settings.changed()
            }
        }
        
        CheckBox {
            id: showXGrad
            checked: settings.showxgrad
            text: qsTr('Show X graduation')
            onClicked: {
                settings.showxgrad = checked
                settings.changed()
            }
        }
        
        CheckBox {
            id: showYGrad
            checked: settings.showygrad
            text: qsTr('Show Y graduation')
            onClicked: {
                settings.showygrad = checked
                settings.changed()
            }
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
        if(settings.saveFilename == "") {
            saveAs()
        } else {
            root.saveDiagram(settings.saveFilename)
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
}
