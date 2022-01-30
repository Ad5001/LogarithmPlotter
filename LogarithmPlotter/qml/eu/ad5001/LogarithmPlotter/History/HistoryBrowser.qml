/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
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

import QtQuick.Controls 2.12
import QtQuick 2.12 
import "../js/utils.js" as Utils


/*!
    \qmltype HistoryBrowser
    \inqmlmodule eu.ad5001.LogarithmPlotter.History
    \brief Tab of the drawer that allows to navigate through the undo and redo history.

    Creates a scrollable view containing a list of history actions based on the redo stack, then a "Now" indicator
    followed by the entirety of the saved undo stack. Each action can be click to restore a state of the graph at
    some point of the history.
    
    \sa LogarithmPlotter, Settings, ObjectLists
*/
ScrollView {
    id: historyBrowser
    
    /*!
       \qmlproperty int HistoryBrowser::actionWidth
       Width of the actions.
    */
    property int actionWidth: width-20
    
    /*!
       \qmlproperty int HistoryBrowser::actionHeight
       Height of the actions.
    */
    property int actionHeight: 40
    /*!
       \qmlproperty int HistoryBrowser::darkTheme
       true when the system is running with a dark theme, false otherwise.
    */
    property bool darkTheme: isDarkTheme()
    
    Flickable {
        width: parent.width
        height: parent.height
        contentHeight: redoColumn.height + nowRect.height + undoColumn.height
        contentWidth: parent.width
        
        Column {
            id: redoColumn
            anchors.right: parent.right
            anchors.top: parent.top
            width: actionWidth
            
            Repeater {
                model: history.redoCount
            
                HistoryItem {
                    id: redoButton
                    width: actionWidth
                    height: actionHeight
                    isRedo: true
                    idx: index
                    darkTheme: historyBrowser.darkTheme
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
            visible: history.redoCount > 0
        }
        
        Rectangle {
            id: nowRect
            anchors.right: parent.right
            anchors.top: redoColumn.bottom
            width: actionWidth
            height: actionHeight
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
            width: actionWidth
            
            Repeater {
                model: history.undoCount
            
                
                HistoryItem {
                    id: undoButton
                    width: actionWidth
                    height: actionHeight
                    isRedo: false
                    idx: index
                    darkTheme: historyBrowser.darkTheme
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
            visible: history.undoCount > 0
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
}
