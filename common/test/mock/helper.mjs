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

import { readFileSync, writeFileSync, existsSync } from "./fs.mjs"

const DEFAULT_SETTINGS = {
    "check_for_updates": true,
    "reset_redo_stack": true,
    "last_install_greet": "0",
    "enable_latex": true,
    "enable_latex_threaded": true,
    "expression_editor": {
        "autoclose": true,
        "colorize": true,
        "color_scheme": 0
    },
    "autocompletion": {
        "enabled": true
    },
    "default_graph": {
        "xzoom": 100,
        "yzoom": 10,
        "xmin": 5 / 10,
        "ymax": 25,
        "xaxisstep": "4",
        "yaxisstep": "4",
        "xlabel": "",
        "ylabel": "",
        "linewidth": 1,
        "textsize": 18,
        "logscalex": true,
        "showxgrad": true,
        "showygrad": true
    }
}

export class MockHelper {
    constructor() {
        this.__settings = { ...DEFAULT_SETTINGS }
    }


    /**
     * Gets a setting from the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to get (e.g. "default_graph.xmin")
     * @returns {string|number|boolean} Value of the setting
     */
    getSetting(settingName) {
        const namespace = settingName.split(".")
        let data = this.__settings
        for(const name of namespace)
            if(data.hasOwnProperty(name))
                data = data[name]
            else
                throw new Error(`Setting ${namespace} does not exist.`)
        return data
    }

    /**
     * Sets a setting in the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to set (e.g. "default_graph.xmin")
     * @param {string|number|boolean} value
     */
    setSetting(settingName, value) {
        const namespace = settingName.split(".")
        const finalName = namespace.pop()
        let data = this.__settings
        for(const name of namespace)
            if(data.hasOwnProperty(name))
                data = data[name]
            else
                throw new Error(`Setting ${namespace} does not exist.`)
        data[finalName] = value
    }

    /**
     * Sends data to be written
     * @param {string} file
     * @param {string} dataToWrite - just JSON encoded, requires the "LPFv1" mime to be added before writing
     */
    write(file, dataToWrite) {
        writeFileSync(file, "LPFv1" + dataToWrite)
    }

    /**
     * Requests data to be read from a file
     * @param {string} file
     * @returns {string} the loaded data - just JSON encoded, requires the "LPFv1" mime to be stripped
     */
    load(file) {
        if(existsSync(file)) {
            const data = readFileSync(file, "utf8")
            if(data.startsWith("LPFv1"))
                return data.substring(5)
            else
                throw new Error(`Invalid LogarithmPlotter file.`)
        } else
            throw new Error(`File not found.`)
    }

}
