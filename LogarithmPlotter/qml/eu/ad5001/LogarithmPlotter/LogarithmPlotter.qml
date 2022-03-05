/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2022  Ad5001
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
import eu.ad5001.MixedMenu 1.1
import QtQuick.Layouts 1.12
import QtQuick 2.12
// Auto loading all objects.
import "js/objs/autoload.js" as ALObjects

import "js/objects.js" as Objects
import eu.ad5001.LogarithmPlotter.History 1.0
import eu.ad5001.LogarithmPlotter.ObjectLists 1.0
import eu.ad5001.LogarithmPlotter.Popup 1.0 as Popup

/*!
    \qmltype LogarithmPlotter
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Main window of LogarithmPlotter
        
    \sa AppMenuBar, History, GreetScreen, Changelog, Alert, ObjectLists, Settings, HistoryBrowser, LogGraphCanvas, PickLocationOverlay.
*/
ApplicationWindow {
    id: root
    visible: true
    width: 1000
    height: 500
    color: sysPalette.window
    title: "LogarithmPlotter " + (settings.saveFilename != "" ? " - " + settings.saveFilename.split('/').pop() : "") + (history.saved ? "" : "*")
    
    SystemPalette { id: sysPalette; colorGroup: SystemPalette.Active }
    SystemPalette { id: sysPaletteIn; colorGroup: SystemPalette.Disabled }
    
    menuBar: appMenu.trueItem
    
    AppMenuBar {id: appMenu}
    
    History { id: history }
    
    Popup.GreetScreen {}
    
    Popup.Changelog {id: changelog}
    
    Popup.About {id: about}
    
    Popup.Alert {
        id: alert
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 5
        z: 3
    }
    
    Item {
        id: sidebar
        width: 300
        height: parent.height
        //y: root.menuBar.height
        readonly property bool inPortrait: root.width < root.height
        /*modal: true// inPortrait
        interactive: inPortrait
        position: inPortrait ? 0 : 1
        */
        visible: !inPortrait

        
        TabBar {
            id: sidebarSelector
            width: parent.width
            anchors.top: parent.top
            TabButton {
                text: qsTr("Objects")
                icon.name: 'polygon-add-nodes'
                icon.color: sysPalette.windowText
                //height: 24
            }
            TabButton {
                text: qsTr("Settings")
                icon.name: 'preferences-system-symbolic'
                icon.color: sysPalette.windowText
                //height: 24
            }
            TabButton {
                text: qsTr("History")
                icon.name: 'view-history'
                icon.color: sysPalette.windowText
                //height: 24
            }
        }
        
        StackLayout {
            id: sidebarContents
            anchors.top: sidebarSelector.bottom
            anchors.left: parent.left
            anchors.topMargin: 5
            anchors.leftMargin: 5
            anchors.bottom: parent.bottom
            //anchors.bottomMargin: sidebarSelector.height
            width: parent.width - 5
            currentIndex: sidebarSelector.currentIndex
            z: -1
            clip: true
            
            ObjectLists {
                id: objectLists
                onChanged: drawCanvas.requestPaint()
            }

            Settings {
                id: settings
                canvas: drawCanvas
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
        width: sidebar.inPortrait ? parent.width : parent.width - sidebar.width//*sidebar.position
        x: sidebar.width//*sidebar.position
        
        xmin: settings.xmin
        ymax: settings.ymax
        xzoom: settings.xzoom
        yzoom: settings.yzoom
        xlabel: settings.xlabel
        ylabel: settings.ylabel
        yaxisstep: settings.yaxisstep
        xaxisstep: settings.xaxisstep
        logscalex: settings.logscalex
        linewidth: settings.linewidth
        textsize: settings.textsize
        showxgrad: settings.showxgrad
        showygrad: settings.showygrad
        
        property bool firstDrawDone: false
        
        onPainted: if(!firstDrawDone) {
            firstDrawDone = true;
            console.info("First paint done in " + (new Date().getTime()-(StartTime*1000)) + "ms")
            if(TestBuild == true) {
                console.log("Plot drawn in canvas, terminating test of build in 100ms.")
                testBuildTimer.start()
            }
        }
        
        PickLocationOverlay {
            id: positionPicker
            anchors.fill: parent
            canvas: parent
        }
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::saveDiagram(string filename)
        Saves the diagram to a certain \c filename.
    */
    function saveDiagram(filename) {
        if(['lpf'].indexOf(filename.split('.')[filename.split('.').length-1]) == -1)
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
            "xaxislabel":   settings.xlabel,
            "yaxislabel":   settings.ylabel,
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
        alert.show(qsTr("Saved plot to '%1'.").arg(filename.split("/").pop()))
        history.saved = true
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::saveDiagram(string filename)
        Loads the diagram from a certain \c filename.
    */
    function loadDiagram(filename) {
        let basename = filename.split("/").pop()
        alert.show(qsTr("Loading file '%1'.").arg(basename))
        let data = JSON.parse(Helper.load(filename))
        let error = "";
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
            settings.xlabel = data["xaxislabel"]
            settings.ylabel = data["yaxislabel"]
            settings.logscalex = data["logscalex"]
            if("showxgrad" in data)
                settings.showxgrad = data["showxgrad"]
            if("showygrad" in data)
                settings.textsize = data["showygrad"]
            if("linewidth" in data)
                settings.linewidth = data["linewidth"]
            if("textsize" in data)
                settings.textsize = data["textsize"]
            root.height = data["height"]
            root.width = data["width"]
            
            // Importing objects
            Objects.currentObjects = {}
            for(var objType in data['objects']) {
                if(Object.keys(Objects.types).indexOf(objType) > -1) {
                    Objects.currentObjects[objType] = []
                    for(var objData of data['objects'][objType]) {
                        var obj = new Objects.types[objType](...objData)
                        Objects.currentObjects[objType].push(obj)
                    }
                } else {
                    error += qsTr("Unknown object type: %1.").arg(objType) + "\n";
                }
            }
            
            // Importing history
            if("history" in data)
                history.unserialize(...data["history"])
            
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
            error = qsTr("Invalid file provided.")
        }
        if(error != "") {
            console.log(error)
            alert.show(qsTr("Could not save file: ") + error)
            // TODO: Error handling
            return
        }
        drawCanvas.requestPaint()
        alert.show(qsTr("Loaded file '%1'.").arg(basename))
        history.saved = true
    }
    
    Timer {
        id: delayRefreshTimer
        repeat: false
        interval: 1
        onTriggered: sidebarSelector.currentIndex = 0
    }
    
    Timer {
        id: testBuildTimer
        repeat: false
        interval: 100
        onTriggered: Qt.quit() // Quit after paint on test build
    }
    
    onClosing: {
        if(!history.saved) {
            close.accepted = false
            appMenu.showSaveUnsavedChangesDialog()
        }
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::copyDiagramToClipboard()
        Copies the current diagram image to the clipboard.
    */
    function copyDiagramToClipboard() {
        var file = Helper.gettmpfile()
        drawCanvas.save(file)
        Helper.copyImageToClipboard()
        alert.show(qsTr("Copied plot screenshot to clipboard!"))
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::showAlert(string alertText)
        Shows an alert on the diagram.
    */
    function showAlert(alertText) {
        // This function is called from the backend and is used to show alerts from there.
        alert.show(alertText)
    }
    
    
    Menu {
        id: updateMenu
        title: qsTr("&Update")
        Action {
            text: qsTr("&Update LogarithmPlotter")
            icon.name: 'update'
            onTriggered: Qt.openUrlExternally("https://dev.apps.ad5001.eu/logarithmplotter")
        }
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::showUpdateMenu()
        Shows the update menu in the AppMenuBar.
    */
    function showUpdateMenu() {
        appMenu.addMenu(updateMenu)
    }
}
