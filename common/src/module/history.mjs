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
import { HistoryInterface, NUMBER, STRING } from "./interface.mjs"


class HistoryAPI extends Module {
    constructor() {
        super("History", {
            historyObj: HistoryInterface,
            themeTextColor: STRING,
            imageDepth: NUMBER,
            fontSize: NUMBER
        })
        // History QML object
        this.history = null
        this.themeTextColor = "#FF0000"
        this.imageDepth = 2
        this.fontSize = 28
    }

    initialize({ historyObj, themeTextColor, imageDepth, fontSize }) {
        super.initialize({ historyObj, themeTextColor, imageDepth, fontSize })
        this.history = historyObj
        this.themeTextColor = themeTextColor
        this.imageDepth = imageDepth
        this.fontSize = fontSize
    }

    undo() {
        if(!this.initialized) throw new Error("Attempting undo before initialize!")
        this.history.undo()
    }

    redo() {
        if(!this.initialized) throw new Error("Attempting redo before initialize!")
        this.history.redo()
    }

    clear() {
        if(!this.initialized) throw new Error("Attempting clear before initialize!")
        this.history.clear()
    }

    addToHistory(action) {
        if(!this.initialized) throw new Error("Attempting addToHistory before initialize!")
        this.history.addToHistory(action)
    }

    unserialize(...data) {
        if(!this.initialized) throw new Error("Attempting unserialize before initialize!")
        this.history.unserialize(...data)
    }

    serialize() {
        if(!this.initialized) throw new Error("Attempting serialize before initialize!")
        return this.history.serialize()
    }
}

/** @type {HistoryAPI} */
Modules.History = Modules.History || new HistoryAPI()

export default Modules.History
