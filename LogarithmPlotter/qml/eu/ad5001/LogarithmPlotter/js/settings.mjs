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
import {Module} from "modules.mjs"
import General from "setting/general.mjs"
import Editor from "setting/expression.mjs"

class SettingsAPI extends Module {
    constructor() {
        super('Settings', [
            Modules.Canvas,
            Modules.Latex
        ])

        this.categories = {
            [QT_TRANSLATE_NOOP('settingCategory', 'general')]: General,
            [QT_TRANSLATE_NOOP('settingCategory', 'editor')]: Editor,
            [QT_TRANSLATE_NOOP('settingCategory', 'default')]: [],
        }
    }
}

/** @type {CanvasAPI} */
Modules.Settings = Modules.Settings || new SettingsAPI()
export const API = Modules.Settings