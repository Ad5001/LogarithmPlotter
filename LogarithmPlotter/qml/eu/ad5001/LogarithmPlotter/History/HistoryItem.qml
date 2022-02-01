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
import QtGraphicalEffects 1.15
import "../js/utils.js" as Utils
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting


/*!
    \qmltype HistoryItem
    \inqmlmodule eu.ad5001.LogarithmPlotter.History
    \brief Item representing an history action.

    Creates a scrollable view containing a list of history actions based on the redo stack, then a "Now" indicator
    followed by the entirety of the saved undo stack. Each action can be click to restore a state of the graph at
    some point of the history.
    
    \sa HistoryBrowser
*/
Button {
    id: redoButton
    flat: true
    
    /*!
       \qmlproperty bool HistoryItem::isRedo
       true if the action is in the redo stack, false othewise.
    */
    property bool isRedo
    /*!
       \qmlproperty int HistoryItem::idx
       Index of the item within the HistoryBrowser list.
    */
    property int idx
    /*!
       \qmlproperty int HistoryItem::idx
       true when the system is running with a dark theme, false otherwise.
    */
    property bool darkTheme
    /*!
       \qmlproperty int HistoryItem::historyAction
       Associated history action.
    */
    readonly property var historyAction: isRedo ? history.redoStack[idx] : history.undoStack[history.undoCount-idx-1]
    
    /*!
       \qmlproperty int HistoryItem::actionHeight
       Base height of the action.
    */
    readonly property int actionHeight: 40
    /*!
       \qmlproperty color HistoryItem::clr
       Color of the history action.
    */
    readonly property color clr: historyAction.color(darkTheme)
    
    height: Math.max(actionHeight, label.height + 15)
    
    
    LinearGradient {
        anchors.fill: parent
        start: Qt.point(0, 0)
        end: Qt.point(parent.width, 0)
        gradient: Gradient {
            GradientStop { position: 0.1; color: "transparent" }
            GradientStop { position: 1.5; color: clr }
        }
    }
    
    Setting.Icon {
        id: icon
        width: 18
        height: 18
        anchors.left: parent.left
        anchors.leftMargin: 6
        anchors.verticalCenter: parent.verticalCenter
        
        color: sysPalette.windowText
        source: `../icons/history/${historyAction.icon()}.svg`
    }
    
    Label {
        id: label
        anchors.left: icon.right
        anchors.right: parent.right
        anchors.leftMargin: 6
        anchors.rightMargin: 20
        anchors.verticalCenter: parent.verticalCenter
        font.pixelSize: 14
        text: historyAction.getHTMLString().replace(/\$\{tag_color\}/g, clr)
        textFormat: Text.RichText
        clip: true
        wrapMode: Text.WordWrap
    }
    
    //text: historyAction.getReadableString()
    
    ToolTip.visible: hovered
    ToolTip.delay: 200
    ToolTip.text: historyAction.getReadableString()
    
    onClicked: {
        if(isRedo)
            history.redoMultipleDefered(history.redoCount-idx)
        else
            history.undoMultipleDefered(+idx+1)
    }
}


