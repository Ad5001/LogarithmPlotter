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

import {BoolSetting, EnumIntSetting} from "common.mjs"

class AutocloseFormula extends BoolSetting {
    constructor() {
        super(qsTr("Automatically close parenthesises and brackets"), 'expression_editor.autoclose', 'Text')
    }
}

class EnableSyntaxHighlighting extends BoolSetting {
    constructor() {
        super(qsTr("Enable syntax highlighting"), 'expression_editor.colorize', 'appearance')
    }
}

class EnableAutocomplete extends BoolSetting {
    constructor() {
        super(qsTr("Enable autocompletion"), 'autocompletion.enabled', 'label')
    }
}

class PickColorScheme extends EnumIntSetting {
    constructor() {
        super(qsTr("Color Scheme"), 'expression_editor.color_scheme', 'color')
    }

    values() {
        return ["Breeze Light", "Breeze Dark", "Solarized", "Github Light", "Github Dark", "Nord", "Monokai"]
    }
}

export default [
    new AutocloseFormula(),
    new EnableAutocomplete(),
    new EnableSyntaxHighlighting(),
    new PickColorScheme()
]