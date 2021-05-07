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

import QtQml 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.15
import QtQuick 2.12
import "js/objects.js" as Objects


ApplicationWindow {
    id: root
    visible: true
    width: 1000
    height: 500
    color: sysPalette.window
    title: "Logarithmic Plotter " + (settings.saveFilename != "" ? " - " + settings.saveFilename.split('/')[settings.saveFilename.split('/').length -1] : "")
    
    SystemPalette { id: sysPalette; colorGroup: SystemPalette.Active }
    SystemPalette { id: sysPaletteIn; colorGroup: SystemPalette.Disabled }
    History { id: history }
    
    menuBar: AppMenuBar {}
    
    Drawer {
        id: sidebar
        width: 300
        height: parent.height
        y: root.menuBar.height
        readonly property bool inPortrait: root.width < root.height
        modal: inPortrait
        interactive: inPortrait
        position: inPortrait ? 0 : 1
        visible: !inPortrait

        
        TabBar {
            id: sidebarSelector
            width: parent.width
            anchors.top: parent.top
            TabButton {
                text: qsTr("Objects")
            }
            TabButton {
                text: qsTr("Settings")
            }
            TabButton {
                text: qsTr("History")
            }
        }
        
        StackLayout {
            id: sidebarContents
            anchors.top: sidebarSelector.bottom
            anchors.left: parent.left
            anchors.topMargin: 5
            anchors.leftMargin: 5
            anchors.bottom: parent.bottom
            anchors.bottomMargin: 20
            width: parent.width - 10
            currentIndex: sidebarSelector.currentIndex
            z: -1
            clip: true
            
            ObjectLists {
                id: objectLists
                onChanged: drawCanvas.requestPaint()
            }

            Settings {
                id: settings
                onChanged: drawCanvas.requestPaint()
            }

            HistoryBrowser {
                id: historyBrowser
            }
        }
    }
    
    LogGraphCanvas {
        id: drawCanvas
        anchors.top: parent.top
        anchors.left: sidebar.inPortrait ? parent.left : sidebar.right
        height: parent.height
        width: sidebar.inPortrait ? parent.width : parent.width - sidebar.position*sidebar.width
        x: sidebar.position*sidebar.width
        
        xmin: settings.xmin
        ymax: settings.ymax
        xzoom: settings.xzoom
        yzoom: settings.yzoom
        xlabel: settings.xaxislabel
        ylabel: settings.yaxislabel
        yaxisstep: settings.yaxisstep
        xaxisstep: settings.xaxisstep
        logscalex: settings.logscalex
        linewidth: settings.linewidth
        textsize: settings.textsize
        showxgrad: settings.showxgrad
        showygrad: settings.showygrad
    }
    
    function saveDiagram(filename) {
        if(['json', 'lpf', 'lgg'].indexOf(filename.split('.')[filename.split('.').length-1]) == -1)
            filename += '.lpf'
        settings.saveFilename = filename
        var objs = {}
        for(var objType in Objects.currentObjects){
            objs[objType] = []
            for(var obj of Objects.currentObjects[objType]) {
                objs[objType].push(obj.export())
            }
        }
        Helper.write(filename, JSON.stringify({
            "xzoom":        settings.xzoom,
            "yzoom":        settings.yzoom,
            "xmin":         settings.xmin,
            "ymax":         settings.ymax,
            "xaxisstep":    settings.xaxisstep,
            "yaxisstep":    settings.yaxisstep,
            "xaxislabel":   settings.xaxislabel,
            "yaxislabel":   settings.yaxislabel,
            "logscalex":    settings.logscalex,
            "linewidth":    settings.linewidth,
            "showxgrad":    settings.showxgrad,
            "showygrad":    settings.showygrad,
            "textsize":     settings.textsize,
            "history":      history.serialize(),
            "width":        root.width,
            "height":       root.height,
            "objects":      objs,
            "type":         "logplotv1"
        }))
    }
    
    function loadDiagram(filename) {
        var data = JSON.parse(Helper.load(filename))
        var error = "";
        if(Object.keys(data).includes("type") && data["type"] == "logplotv1") {
            history.clear()
            // Importing settings
            settings.saveFilename = filename
            settings.xzoom = data["xzoom"]
            settings.yzoom = data["yzoom"]
            settings.xmin = data["xmin"]
            settings.ymax = data["ymax"]
            settings.xaxisstep = data["xaxisstep"]
            settings.yaxisstep = data["yaxisstep"]
            settings.xaxislabel = data["xaxislabel"]
            settings.yaxislabel = data["yaxislabel"]
            settings.logscalex = data["logscalex"]
            if("showxgrad" in data)
                settings.showxgrad = data["showxgrad"]
            if("showygrad" in data)
                settings.textsize = data["showygrad"]
            if("linewidth" in data)
                settings.linewidth = data["linewidth"]
            if("textsize" in data)
                settings.textsize = data["textsize"]
            if("history" in data)
                history.unserialize(...data["history"])
            root.height = data["height"]
            root.width = data["width"]
            
            // Importing objectw
            Objects.currentObjects = {}
            for(var objType in data['objects']) {
                if(Object.keys(Objects.types).indexOf(objType) > -1) {
                    Objects.currentObjects[objType] = []
                    for(var objData of data['objects'][objType]) {
                        var obj = new Objects.types[objType](...objData)
                        Objects.currentObjects[objType].push(obj)
                    }
                } else {
                    error += "Unknown object type: " +objType + "\n";
                }
            }
            // Refreshing sidebar
            if(sidebarSelector.currentIndex == 0) {
                // For some reason, if we load a file while the tab is on object,
                // we get stuck in a Qt-side loop? Qt bug or side-effect here, I don't know.
                sidebarSelector.currentIndex = 1
                objectLists.update()
                delayRefreshTimer.start()
            } else {
                objectLists.update()
            }
        } else {
            error = "Invalid file provided."
        }
        if(error != "") {
            
        }
    }
    
    Timer {
        id: delayRefreshTimer
        repeat: false
        interval: 1
        onTriggered: sidebarSelector.currentIndex = 0
    }
    
    function copyDiagramToClipboard() {
        var file = Helper.gettmpfile()
        drawCanvas.save(file)
        Helper.copyImageToClipboard()
    }
}
