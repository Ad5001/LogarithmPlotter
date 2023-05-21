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

import QtQuick
import QtQml
import QtQuick.Window
import "../js/objects.js" as Objects
import "../js/historylib.js" as HistoryLib
import "../js/history/common.js" as HistoryCommon

/*!
    \qmltype History
    \inqmlmodule eu.ad5001.LogarithmPlotter.History
    \brief QObject holding persistantly for undo & redo stacks.
        
    \sa HistoryBrowser, historylib
*/
Item {
    // Using a QtObject is necessary in order to have proper property propagation in QML
    id: historyObj

    /*!
       \qmlproperty int History::undoCount
       Count of undo actions.
    */
    property int undoCount: 0
    /*!
       \qmlproperty int History::redoCount
       Count of redo actions.
    */
    property int redoCount: 0
    /*!
       \qmlproperty var History::undoStack
       Stack of undo actions.
    */
    property var undoStack: []
    /*!
       \qmlproperty var History::redoStack
       Stack of redo actions.
    */
    property var redoStack: []
    /*!
       \qmlproperty bool History::saved
       true when no modification was done to the current working file, false otherwise.
    */
    property bool saved: true
    
    
    /*!
        \qmlmethod void History::clear()
        Clears both undo and redo stacks completly.
    */
    function clear() {
        undoCount = 0
        redoCount = 0
        undoStack = []
        redoStack = []
    }
    
    
    /*!
        \qmlmethod var History::serialize()
        Serializes history into JSON-able content.
    */
    function serialize() {
        let undoSt = [], redoSt = [];
        for(let i = 0; i < undoCount; i++)
            undoSt.push([
                undoStack[i].type(),
                undoStack[i].export()
            ]);
        for(let i = 0; i < redoCount; i++)
            redoSt.push([
                redoStack[i].type(),
                redoStack[i].export()
            ]);
        return [undoSt, redoSt]
    }
    
    /*!
        \qmlmethod void History::unserialize(var undoSt, var redoSt)
        Unserializes both \c undoSt stack and \c redoSt stack from serialized content.
    */
    function unserialize(undoSt, redoSt) {
        clear();
        for(let i = 0; i < undoSt.length; i++)
            undoStack.push(new HistoryLib.Actions[undoSt[i][0]](...undoSt[i][1]))
        for(let i = 0; i < redoSt.length; i++)
            redoStack.push(new HistoryLib.Actions[redoSt[i][0]](...redoSt[i][1]))
        undoCount = undoSt.length;
        redoCount = redoSt.length;
        objectLists.update()
    }
    
    /*!
        \qmlmethod void History::addToHistory(var action)
        Adds an instance of historylib.Action to history.
    */
    function addToHistory(action) {
        if(action instanceof HistoryLib.Action) {
            console.log("Added new entry to history: " + action.getReadableString())
            undoStack.push(action)
            undoCount++;
            if(Helper.getSettingBool("reset_redo_stack")) {
                redoStack = []
                redoCount = 0
            }
            saved = false
        }
    }
    
    /*!
        \qmlmethod void History::undo(bool updateObjectList = true)
        Undoes the historylib.Action at the top of the undo stack and pushes it to the top of the redo stack.
        By default, will update the graph and the object list. This behavior can be disabled by setting the \c updateObjectList to false.
    */
    function undo(updateObjectList = true) {
        if(undoStack.length > 0) {
            var action = undoStack.pop()
            action.undo()
            if(updateObjectList)
                objectLists.update()
            redoStack.push(action)
            undoCount--;
            redoCount++;
            saved = false
        }
    }
    
    /*!
        \qmlmethod void History::redo(bool updateObjectList = true)
        Redoes the historylib.Action at the top of the redo stack and pushes it to the top of the undo stack.
        By default, will update the graph and the object list. This behavior can be disabled by setting the \c updateObjectList to false.
    */
    function redo(updateObjectList = true) {
        if(redoStack.length > 0) {
            var action = redoStack.pop()
            action.redo()
            if(updateObjectList)
                objectLists.update()
            undoStack.push(action)
            undoCount++;
            redoCount--;
            saved = false
        }
    }
    
    /*!
        \qmlmethod void History::undoMultipleDefered(int toUndoCount)
        Undoes several historylib.Action at the top of the undo stack and pushes them to the top of the redo stack.
        It undoes them deferedly to avoid overwhelming the computer while creating a cool short accelerated summary of all changes.
    */
    function undoMultipleDefered(toUndoCount) {
        undoTimer.toUndoCount = toUndoCount;
        undoTimer.start()
        if(toUndoCount > 0)
            saved = false
    }
    
    
    /*!
        \qmlmethod void History::redoMultipleDefered(int toRedoCount)
        Redoes several historylib.Action at the top of the redo stack and pushes them to the top of the undo stack.
        It redoes them deferedly to avoid overwhelming the computer while creating a cool short accelerated summary of all changes.
    */
    function redoMultipleDefered(toRedoCount) {
        redoTimer.toRedoCount = toRedoCount;
        redoTimer.start()
        if(toRedoCount > 0)
            saved = false
    }
    
    Timer {
        id: undoTimer
        interval: 5; running: false; repeat: true
        property int toUndoCount: 0
        onTriggered: {
            if(toUndoCount > 0) {
                historyObj.undo(toUndoCount % 4 == 1) // Only redraw once every 4 changes.
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
                historyObj.redo(toRedoCount % 4 == 1) // Only redraw once every 4 changes.
                toRedoCount--;
            } else {
                running = false;
            }
        }
    }
    
    Component.onCompleted: {
        HistoryLib.history = historyObj
        HistoryCommon.themeTextColor = sysPalette.windowText
        HistoryCommon.imageDepth = Screen.devicePixelRatio
    }
}
