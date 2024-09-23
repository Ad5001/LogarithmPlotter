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

import { Interface } from "./interface.mjs"

/**
 * Base class for global APIs in runtime.
 */
export class Module {

    /**
     *
     * @param {string} name - Name of the API
     * @param {Object.<string, (Interface|string)>} initializationParameters - List of parameters for the initialize function.
     */
    constructor(name, initializationParameters = {}) {
        console.log(`Loading module ${name}...`)
        this.__name = name
        this.__initializationParameters = initializationParameters
        this.initialized = false
    }

    /**
     * Checks if all requirements are defined.
     * @param {Object.<string, any>} options
     */
    initialize(options) {
        if(this.initialized)
            throw new Error(`Cannot reinitialize module ${this.__name}.`)
        for(const [name, value] of Object.entries(this.__initializationParameters)) {
            if(!options.hasOwnProperty(name))
                throw new Error(`Option '${name}' of initialize of module ${this.__name} does not exist.`)
            if(typeof value === "function" && value.prototype instanceof Interface)
                Interface.check_implementation(value, options[name])
            else if(typeof value !== typeof options[name])
                throw new Error(`Option '${name}' of initialize of module ${this.__name} is not a '${value}' (${typeof options[name]}).`)
        }
        this.initialized = true
    }
}