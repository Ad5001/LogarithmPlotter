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
    title: "Logarithmic Plotter " + (settings.saveFilename != "" ? " - " + settings.saveFilename : "")
    
    SystemPalette { id: sysPalette; colorGroup: SystemPalette.Active }
    SystemPalette { id: sysPaletteIn; colorGroup: SystemPalette.Disabled }
    
    menuBar: AppMenuBar {}
    
    Drawer {
        id: sidebar
        width: 290
        height: parent.height
        y: root.menuBar.height
        readonly property bool inPortrait: root.width < root.height
        modal: inPortrait
        interactive: inPortrait
        position: inPortrait ? 0 : 1
        visible: !inPortrait

        
        Rectangle {
            id: topSeparator
            color: sysPaletteIn.dark
            width: parent.width
            height: 2
        }
        
        TabBar {
            id: sidebarSelector
            width: parent.width
            anchors.top: topSeparator.bottom
            TabButton {
                text: qsTr("Settings")
            }
            TabButton {
                text: qsTr("Objects")
            }
        }
        
        StackLayout {
            width: parent.width
            currentIndex: sidebarSelector.currentIndex
            anchors.top: sidebarSelector.bottom
            height: parent.height - sidebarSelector.height

            Settings {
                id: settings
                onChanged: drawCanvas.requestPaint()
            }
            
            ObjectLists {
                id: objectLists
                onChanged: drawCanvas.requestPaint()
            }
        }
    }
    
    LogGraphCanvas {
        id: drawCanvas
        anchors.top: parent.top
        anchors.left: sidebar.right
        height: parent.height
        width: parent.width - sidebar.position*sidebar.width
        x: sidebar.position*sidebar.width
        
        xmin: settings.xmin
        ymax: settings.ymax
        xzoom: settings.xzoom
        yzoom: settings.yzoom
        xlabel: settings.xaxislabel
        ylabel: settings.yaxislabel
        yaxisstep: settings.yaxisstep
        
        onPaint: {
            var ctx = getContext("2d");
        }
    }
    
    function saveDiagram(filename) {
        var objs = {}
        Object.keys(Objects.currentObjects).forEach(function(objType){
            objs[objType] = []
            Objects.currentObjects[objType].forEach(function(obj){
                objs[objType].push(obj.export())
            })
        })
        Helper.write(filename, JSON.stringify({
            "xzoom":        settings.xzoom,
            "yzoom":        settings.yzoom,
            "xmin":         settings.xmin,
            "ymax":         settings.ymax,
            "yaxisstep":    settings.yaxisstep,
            "xaxislabel":   settings.xaxislabel,
            "yaxislabel":   settings.yaxislabel,
            "width":        root.width,
            "height":       root.height,
            "objects":      objs,
            "type":         "logplotv1"
        }))
    }
    
    function loadDiagram(filename) {
        var data = JSON.parse(Helper.load(filename))
        if(Object.keys(data).indexOf("type") != -1 && data["type"] == "logplotv1") {
            settings.xzoom = data["xzoom"]
            settings.yzoom = data["yzoom"]
            settings.xmin = data["xmin"]
            settings.ymax = data["ymax"]
            settings.yaxisstep = data["yaxisstep"]
            settings.xaxislabel = data["xaxislabel"]
            settings.yaxislabel = data["yaxislabel"]
            root.height = data["height"]
            root.width = data["width"]
            
            Object.keys(data['objects']).forEach(function(objType){
                Objects.currentObjects[objType] = []
                data['objects'][objType].forEach(function(objData){
                    var obj = new Objects.types[objType](...objData)
                    Objects.currentObjects[objType].push(obj)
                })
            })
            // Refreshing sidebar
            Object.keys(objectLists.listViews).forEach(function(type){
                objectLists.listViews[type].model = Objects.currentObjects[type]
            })
            drawCanvas.requestPaint()
        }
    }
    
    function copyDiagramToClipboard() {
        var file = Helper.gettmpfile()
        drawCanvas.save(file)
        Helper.copyImageToClipboard()
    }
    
    
}
