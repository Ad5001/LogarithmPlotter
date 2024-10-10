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

import QtQuick
import QtQml
import QtQuick.Window
import "../js/index.mjs" as JS

/*!
    \qmltype History
    \inqmlmodule eu.ad5001.LogarithmPlotter.History
    \brief QObject holding persistantly for undo & redo stacks.
        
    \sa HistoryBrowser, HistoryLib
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
        Modules.History.clear()
    }
    
    
    /*!
        \qmlmethod var History::serialize()
        Serializes history into JSON-able content.
    */
    function serialize() {
        return Modules.History.serialize()
    }
    
    /*!
        \qmlmethod void History::unserialize(var undoSt, var redoSt)
        Unserializes both \c undoSt stack and \c redoSt stack from serialized content.
    */
    function unserialize(undoSt, redoSt) {
        Modules.History.unserialize(undoSt, redoSt)
    }
    
    /*!
        \qmlmethod void History::addToHistory(var action)
        Adds an instance of HistoryLib.Action to history.
    */
    function addToHistory(action) {
        Modules.History.addToHistory(action)
    }
    
    /*!
        \qmlmethod void History::undo(bool updateObjectList = true)
        Undoes the HistoryLib.Action at the top of the undo stack and pushes it to the top of the redo stack.
        By default, will update the graph and the object list. This behavior can be disabled by setting the \c updateObjectList to false.
    */
    function undo(updateObjectList = true) {
        Modules.History.undo()
    }
    
    /*!
        \qmlmethod void History::redo(bool updateObjectList = true)
        Redoes the HistoryLib.Action at the top of the redo stack and pushes it to the top of the undo stack.
        By default, will update the graph and the object list. This behavior can be disabled by setting the \c updateObjectList to false.
    */
    function redo(updateObjectList = true) {
        Modules.History.redo()
    }
}
