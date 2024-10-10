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

import { Module } from "./common.mjs"
import { HelperInterface, HistoryInterface, NUMBER, STRING } from "./interface.mjs"
import { BaseEvent } from "../events.mjs"
import { Action, Actions } from "../history/index.mjs"



class UpdatedEvent extends BaseEvent {
    constructor() {
        super("updated")
    }
}

class UndoneEvent extends BaseEvent {
    constructor(action) {
        super("undone")
        this.undid = action
    }
}

class RedoneEvent extends BaseEvent {
    constructor(action) {
        super("redone")
        this.redid = action
    }
}

class HistoryAPI extends Module {
    static emits = ["updated", "undone", "redone"]

    #helper

    constructor() {
        super("History", {
            helper: HelperInterface,
            themeTextColor: STRING,
            imageDepth: NUMBER,
            fontSize: NUMBER
        })
        // History QML object
        /** @type {Action[]} */
        this.undoStack = []
        /** @type {Action[]} */
        this.redoStack = []

        this.themeTextColor = "#FF0000"
        this.imageDepth = 2
        this.fontSize = 28
    }

    /**
     * @param {HelperInterface} historyObj
     * @param {string} themeTextColor
     * @param {number} imageDepth
     * @param {number} fontSize
     */
    initialize({ helper, themeTextColor, imageDepth, fontSize }) {
        super.initialize({ helper, themeTextColor, imageDepth, fontSize })
        this.#helper = helper
        this.themeTextColor = themeTextColor
        this.imageDepth = imageDepth
        this.fontSize = fontSize
    }

    /**
     * Undoes the Action at the top of the undo stack and pushes it to the top of the redo stack.
     */
    undo() {
        if(!this.initialized) throw new Error("Attempting undo before initialize!")
        if(this.undoStack.length > 0) {
            const action = this.undoStack.pop()
            action.undo()
            this.redoStack.push(action)
            this.emit(new UndoneEvent(action))
        }
    }

    /**
     * Redoes the Action at the top of the redo stack and pushes it to the top of the undo stack.
     */
    redo() {
        if(!this.initialized) throw new Error("Attempting redo before initialize!")
        if(this.redoStack.length > 0) {
            const action = this.redoStack.pop()
            action.redo()
            this.undoStack.push(action)
            this.emit(new RedoneEvent(action))
        }
    }

    /**
     * Clears both undo and redo stacks completely.
     */
    clear() {
        if(!this.initialized) throw new Error("Attempting clear before initialize!")
        this.undoStack = []
        this.redoStack = []
        this.emit(new UpdatedEvent())
    }

    /**
     * Adds an instance of HistoryLib.Action to history.
     * @param action
     */
    addToHistory(action) {
        if(!this.initialized) throw new Error("Attempting addToHistory before initialize!")
        if(action instanceof Action) {
            console.log("Added new entry to history: " + action.getReadableString())
            this.undoStack.push(action)
            if(this.#helper.getSettingBool("reset_redo_stack"))
                this.redoStack = []
            this.emit(new UpdatedEvent())
        }
    }

    /**
     * Unserializes both the undo stack and redo stack from serialized content.
     * @param {[string, any[]][]} undoSt
     * @param {[string, any[]][]} redoSt
     */
    unserialize(undoSt, redoSt) {
        if(!this.initialized) throw new Error("Attempting unserialize before initialize!")
        this.clear()
        for(const [name, args] of undoSt)
            this.undoStack.push(
                new Actions[name](...args)
            )
        for(const [name, args] of redoSt)
            this.redoStack.push(
                new Actions[name](...args)
            )
        this.emit(new UpdatedEvent())
    }

    /**
     * Serializes history into JSON-able content.
     * @return {[[string, any[]], [string, any[]]]}
     */
    serialize() {
        if(!this.initialized) throw new Error("Attempting serialize before initialize!")
        let undoSt = [], redoSt = [];
        for(const action of this.undoStack)
            undoSt.push([ action.type(), action.export() ])
        for(const action of this.redoStack)
            redoSt.push([ action.type(), action.export() ])
        return [undoSt, redoSt]
    }
}

/** @type {HistoryAPI} */
Modules.History = Modules.History || new HistoryAPI()

export default Modules.History
