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

import QtQuick.Controls
import QtQuick
import Qt5Compat.GraphicalEffects
import "../js/utils.mjs" as Utils
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
       \qmlproperty bool HistoryItem::darkTheme
       true when the system is running with a dark theme, false otherwise.
    */
    property bool darkTheme
    /*!
       \qmlproperty bool HistoryItem::hidden
       true when the item is filtered out, false otherwise.
    */
    property bool hidden: false
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
    /*!
       \qmlproperty string HistoryItem::clr
       Label description of the history item.
    */
    readonly property string content: historyAction.getReadableString()
    
    height: hidden ? 8 : Math.max(actionHeight, label.height + 15)
    
    
    LinearGradient {
        anchors.fill: parent
        //opacity: hidden ? 0.6 : 1
        start: Qt.point(0, 0)
        end: Qt.point(parent.width, 0)
        gradient: Gradient {
            GradientStop { position: 0.1; color: "transparent" }
            GradientStop { position: 1.5; color: clr }
        }
    }
    
    Setting.Icon {
        id: icon
        anchors.left: parent.left
        anchors.leftMargin: 6
        anchors.verticalCenter: parent.verticalCenter
        visible: !hidden
        width: 18
        height: 18
        
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
        visible: !hidden
        font.pixelSize: 14
        text: historyAction.getHTMLString().replace(/\$\{tag_color\}/g, clr)
        textFormat: Text.RichText
        clip: true
        wrapMode: Text.WordWrap
    }
    
    Rectangle {
        id: hiddenDot
        anchors.centerIn: parent
        visible: hidden
        width: 5
        height: 5
        radius: 5
        color: sysPalette.windowText
    }
    
    ToolTip.visible: hovered
    ToolTip.delay: 200
    ToolTip.text: content
    
    onClicked: {
        if(isRedo)
            history.redoMultipleDefered(history.redoCount-idx)
        else
            history.undoMultipleDefered(+idx+1)
    }
}


