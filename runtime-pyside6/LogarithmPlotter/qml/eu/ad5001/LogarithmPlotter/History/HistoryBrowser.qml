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

pragma ComponentBehavior: Bound

import QtQuick.Controls
import QtQuick 
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting


/*!
    \qmltype HistoryBrowser
    \inqmlmodule eu.ad5001.LogarithmPlotter.History
    \brief Tab of the drawer that allows to navigate through the undo and redo history.

    Creates a scrollable view containing a list of history actions based on the redo stack, then a "Now" indicator
    followed by the entirety of the saved undo stack. Each action can be click to restore a state of the graph at
    some point of the history.
    
    \sa LogarithmPlotter, Settings, ObjectLists
*/
Item {
    id: historyBrowser
    
    /*!
       \qmlproperty int HistoryBrowser::actionWidth
       Width of the actions.
    */
    property int actionWidth: width-20
    
    /*!
       \qmlproperty int HistoryBrowser::darkTheme
       true when the system is running with a dark theme, false otherwise.
    */
    property bool darkTheme: isDarkTheme()

    /*!
       \qmlproperty int HistoryBrowser::undoCount
       Number of actions in the undo stack.
    */
    property int undoCount: 0

    /*!
       \qmlproperty int HistoryBrowser::redoCount
       Number of actions in the redo stack.
    */
    property int redoCount: 0
    
    Setting.TextSetting {
        id: filterInput
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.rightMargin: 5
        placeholderText: qsTr("Filter...")
        category: "all"
    }
    
    ScrollView {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.top: filterInput.bottom
    
        ScrollBar.horizontal.visible: false
        clip: true
        
        Flickable {
            width: parent.width
            height: parent.height
            contentHeight: redoColumn.height + nowRect.height + undoColumn.height
            contentWidth: parent.width
            
            Column {
                id: redoColumn
                anchors.right: parent.right
                anchors.top: parent.top
                width: historyBrowser.actionWidth
                
                Repeater {
                    model: historyBrowser.redoCount
                
                    HistoryItem {
                        id: redoButton
                        width: historyBrowser.actionWidth
                        //height: actionHeight
                        isRedo: true
                        darkTheme: historyBrowser.darkTheme
                        hidden: !(filterInput.value == "" || content.includes(filterInput.value))
                        onClicked: {
                            redoTimer.toRedoCount = Modules.History.redoStack.length-index
                            redoTimer.start()
                        }
                    }
                }
            }
            
            Text {
                anchors.left: parent.left
                anchors.bottom: nowRect.top
                text: qsTr("Redo >")
                color: sysPaletteIn.windowText
                transform: Rotation { origin.x: 30; origin.y: 30; angle: 270}
                height: 70
                width: 20
                visible: historyBrowser.redoCount > 0
            }
            
            Rectangle {
                id: nowRect
                anchors.right: parent.right
                anchors.top: redoColumn.bottom
                width: historyBrowser.actionWidth
                height: 40
                color: sysPalette.highlight
                Text {
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.left: parent.left
                    anchors.leftMargin: 5
                    text: qsTr("> Now")
                    color: sysPalette.windowText
                }
            }
            
            Column {
                id: undoColumn
                anchors.right: parent.right
                anchors.top: nowRect.bottom
                width: historyBrowser.actionWidth
                
                Repeater {
                    model: historyBrowser.undoCount
                
                    
                    HistoryItem {
                        id: undoButton
                        width: historyBrowser.actionWidth
                        //height: actionHeight
                        isRedo: false
                        darkTheme: historyBrowser.darkTheme
                        hidden: !(filterInput.value == "" || content.includes(filterInput.value))

                        onClicked: {
                            undoTimer.toUndoCount = +index+1
                            undoTimer.start()
                        }
                    }
                }
            }
            
            Text {
                anchors.left: parent.left
                anchors.top: undoColumn.top
                text: qsTr("< Undo")
                color: sysPaletteIn.windowText
                transform: Rotation { origin.x: 30; origin.y: 30; angle: 270}
                height: 60
                width: 20
                visible: historyBrowser.undoCount > 0
            }
        }
    }

    Timer {
        id: undoTimer
        interval: 5; running: false; repeat: true
        property int toUndoCount: 0
        onTriggered: {
            if(toUndoCount > 0) {
                Modules.History.undo()
                if(toUndoCount % 3 === 1)
                    Modules.Canvas.requestPaint()
                toUndoCount--;
            } else {
                running = false;
            }
        }
    }

    Timer {
        id: redoTimer
        interval: 5; running: false; repeat: true
        property int toRedoCount: 0
        onTriggered: {
            if(toRedoCount > 0) {
                Modules.History.redo()
                if(toRedoCount % 3 === 1)
                    Modules.Canvas.requestPaint()
                toRedoCount--;
            } else {
                running = false;
            }
        }
    }
    
    /*!
        \qmlmethod bool HistoryBrowser::isDarkTheme()
        Checks whether the system is running with a light or dark theme.
    */
    function isDarkTheme() {
        let hex = sysPalette.windowText.toString()
        // We only check the first parameter, as on all normal OSes, text color is grayscale.
        return parseInt(hex.substr(1,2), 16) > 128
    }

    Component.onCompleted: {
        Modules.History.initialize({
            helper: Helper,
            themeTextColor: sysPalette.windowText.toString(),
            imageDepth: Screen.devicePixelRatio,
            fontSize: 14
        })
        Modules.History.on("updated undone redone", () => {
            undoCount = Modules.History.undoStack.length
            redoCount = Modules.History.redoStack.length
        })
    }
}
