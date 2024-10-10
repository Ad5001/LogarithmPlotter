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

import QtQml
import QtQuick.Controls
import eu.ad5001.MixedMenu 1.1
import QtQuick.Layouts 1.12
import QtQuick

// Auto loading all modules.
import "js/index.mjs" as JS

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
    title: "LogarithmPlotter"
    
    SystemPalette { id: sysPalette; colorGroup: SystemPalette.Active }
    SystemPalette { id: sysPaletteIn; colorGroup: SystemPalette.Disabled }
    
    menuBar: appMenu.trueItem
    
    AppMenuBar {id: appMenu}
    
    History { id: history }
    
    Popup.GreetScreen {}
    
    Popup.Preferences {id: preferences}
    
    Popup.Changelog {id: changelog}
    
    Popup.About {id: about}
    
    Popup.ThanksTo {id: thanksTo}
    
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
        
        property bool firstDrawDone: false
        
        onPainted: if(!firstDrawDone) {
            firstDrawDone = true;
            console.info("First paint done in " + (new Date().getTime()-(StartTime*1000)) + "ms")
            if(TestBuild == true) {
                console.log("Plot drawn in canvas, terminating test of build in 100ms.")
                testBuildTimer.start()
            }
        }
        
        ViewPositionChangeOverlay {
            id: viewPositionChanger
            anchors.fill: parent
            canvas: parent
            settingsInstance: settings
        }
        
        PickLocationOverlay {
            id: positionPicker
            anchors.fill: parent
            canvas: parent
        }
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
    
    onClosing: function(close) {
        if(!history.saved) {
            close.accepted = false
            appMenu.openSaveUnsavedChangesDialog()
        }
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::updateObjectsLists()
        Updates the objects lists when loading a file.
    */
    function updateObjectsLists() {
        if(sidebarSelector.currentIndex === 0) {
            // For some reason, if we load a file while the tab is on object,
            // we get stuck in a Qt-side loop? Qt bug or side-effect here, I don't know.
            sidebarSelector.currentIndex = 1
            objectLists.update()
            delayRefreshTimer.start()
        } else {
            objectLists.update()
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
            onTriggered: Qt.openUrlExternally("https://apps.ad5001.eu/logarithmplotter/")
        }
    }
    
    /*!
        \qmlmethod void LogarithmPlotter::showUpdateMenu()
        Shows the update menu in the AppMenuBar.
    */
    function showUpdateMenu() {
        appMenu.addMenu(updateMenu)
    }
    
    // Initializing modules
    Component.onCompleted: {
        Modules.IO.initialize({ root, settings, alert })
        Modules.Latex.initialize({ latex: Latex, helper: Helper })
        Modules.Settings.on("changed", (evt) => {
            if(evt.property === "saveFilename") {
                const fileName = evt.newValue.split('/').pop().split('\\').pop()
                if(fileName !== "")
                    title = `${fileName}`
            }
        })
    }
}
