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

import QtQuick.Controls 2.12
import QtQuick 2.12 
import "js/utils.js" as Utils

ScrollView {
    id: historyBrowser
    
    property int actionWidth: width-20
    
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
                model: history.redoCount
            
                Button {
                    id: redoButton
                    width: historyBrowser.actionWidth
                    height: 30
                    flat: true
                    text: history.redoStack[index].getReadableString()
                    
                    
                    onClicked: {
                        history.redoMultipleDefered(history.redoCount-index)
                    }
                }
            }
        }
        
        Text {
            anchors.left: parent.left
            anchors.bottom: nowRect.top
            text: "Redo >"
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
            width: historyBrowser.actionWidth
            height: 30
            color: sysPalette.highlight
            Text {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.leftMargin: 5
                text: "> Now"
                color: sysPalette.windowText
            }
        }
        
        Column {
            id: undoColumn
            anchors.right: parent.right
            anchors.top: nowRect.bottom
            width: historyBrowser.actionWidth
            
            Repeater {
                model: history.undoCount
            
                Button {
                    id: undoButton
                    width: historyBrowser.actionWidth
                    height: 30
                    flat: true
                    text: history.undoStack[history.undoCount-index-1].getReadableString()
                    
                    
                    onClicked: {
                        history.undoMultipleDefered(index+1)
                    }
                }
            }
        }
        
        Text {
            anchors.left: parent.left
            anchors.top: undoColumn.top
            text: "< Undo"
            color: sysPaletteIn.windowText
            transform: Rotation { origin.x: 30; origin.y: 30; angle: 270}
            height: 60
            width: 20
            visible: history.undoCount > 0
        }
    }
}
