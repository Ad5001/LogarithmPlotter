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

import { BoolSetting } from "./common.mjs"
import Canvas from "../module/canvas.mjs"
import LatexAPI from "../module/latex.mjs"

const CHECK_FOR_UPDATES = new BoolSetting(
    qsTranslate("general", "Check for updates on startup"),
    "check_for_updates",
    "update"
)

const RESET_REDO_STACK = new BoolSetting(
    qsTranslate("general", "Reset redo stack automaticly"),
    "reset_redo_stack",
    "timeline"
)

class EnableLatex extends BoolSetting {
    constructor() {
        super(qsTranslate("general", "Enable LaTeX rendering"), "enable_latex", "Expression")
    }

    set(value) {
        if(!value || Latex.checkLatexInstallation()) {
            super.set(value)
            LatexAPI.enabled = value
            Canvas.requestPaint()
        }
    }
}

const ENABLE_LATEX_ASYNC = new BoolSetting(
    qsTranslate("general", "Enable threaded LaTeX renderer (experimental)"),
    "enable_latex_threaded",
    "new"
)

export default [
    CHECK_FOR_UPDATES,
    RESET_REDO_STACK,
    new EnableLatex(),
    ENABLE_LATEX_ASYNC
]
