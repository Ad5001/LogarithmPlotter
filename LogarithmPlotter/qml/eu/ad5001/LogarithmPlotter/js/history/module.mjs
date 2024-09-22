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

import { Module } from "../modules.mjs"
import Latex from "../math/latex.mjs"


class HistoryAPI extends Module {
    constructor() {
        super('History', [
            Modules.Latex
        ])
        // History QML object
        this.history = null;
        this.themeTextColor = "#ff0000";
        this.imageDepth = 2;
        this.fontSize = 14;
    }

    undo() { this.history.undo() }
    redo() { this.history.redo() }
    clear() { this.history.clear() }
    addToHistory(action) { this.history.addToHistory(action) }
    unserialize(...data) { this.history.unserialize(...data) }
    serialize() { return this.history.serialize() }
}

/** @type {HistoryAPI} */
Modules.History = Modules.History || new HistoryAPI()

export default Modules.History