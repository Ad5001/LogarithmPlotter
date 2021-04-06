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

import QtQuick 2.12
import "js/objects.js" as Objects
import "js/historylib.js" as HistoryLib


QtObject {
    // Using a QtObject is necessary in order to have proper property propagation in QML
    id: historyObj
    property int undoCount: 0
    property int redoCount: 0
    property var undoStack: []
    property var redoStack: []
    
    function empty() {
        undoStack = []
        redoStack = []
    }

    function addToHistory(action) {
        if(action instanceof HistoryLib.Action) {
            console.log("Added new entry to history: " + action.getReadableString())
            undoStack.push(action)
            undoCount++;
            redoStack = []
        }
    }

    function undo() {
        if(undoStack.length > 0) {
            var action = undoStack.pop()
            action.undo()
            objectLists.update()
            redoStack.push(action)
            undoCount--;
            redoCount++;
        }
    }

    function redo() {
        if(redoStack.length > 0) {
            var action = redoStack.pop()
            action.redo()
            objectLists.update()
            undoStack.push(action)
            undoCount++;
            redoCount--;
        }
    }
    
    Component.onCompleted: {
        Objects.history = historyObj
        Objects.HistoryLib = HistoryLib
    }
}
