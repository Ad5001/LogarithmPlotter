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

import {BoolSetting} from "common.mjs"

const CHECK_FOR_UPDATES = new BoolSetting(
    QT_TR_NOOP("Check for updates on startup"),
    'check_for_updates',
    'update'
)

const RESET_REDO_STACK = new BoolSetting(
    QT_TR_NOOP("Reset redo stack automaticly"),
    'reset_redo_stack',
    'timeline'
)

class EnableLatex extends BoolSetting {
    constructor() {
        super(qsTr("Enable LaTeX rendering"), 'enable_latex', 'Expression')
    }

    set(value) {
        if(!value || Latex.checkLatexInstallation()) {
            super.set(value)
            Modules.Latex.enabled = value
            Modules.Canvas.requestPaint()
        }
    }
}

export default [
    CHECK_FOR_UPDATES,
    RESET_REDO_STACK,
    new EnableLatex()
]
