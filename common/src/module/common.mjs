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
import { BaseEventEmitter } from "../events.mjs"

// Define Modules interface before they are imported.
globalThis.Modules = globalThis.Modules || {}

/**
 * Base class for global APIs in runtime.
 */
export class Module extends BaseEventEmitter {
    /** @type {string} */
    #name
    /** @type {Object.<string, (Interface|string|number|boolean)>} */
    #initializationParameters

    /**
     *
     * @param {string} name - Name of the API
     * @param {Object.<string, (Interface|string|number|boolean)>} initializationParameters - List of parameters for the initialize function.
     */
    constructor(name, initializationParameters = {}) {
        super()
        console.log(`Loading module ${name}...`)
        this.#name = name
        this.#initializationParameters = initializationParameters
        this.initialized = false

    }

    /**
     * Checks if all requirements are defined.
     * @param {Object.<string, any>} options
     */
    initialize(options) {
        if(this.initialized)
            throw new Error(`Cannot reinitialize module ${this.#name}.`)
        console.log(`Initializing ${this.#name}...`)
        for(const [name, value] of Object.entries(this.#initializationParameters)) {
            if(!options.hasOwnProperty(name))
                throw new Error(`Option '${name}' of initialize of module ${this.#name} does not exist.`)
            if(typeof value === "function" && value.prototype instanceof Interface)
                Interface.checkImplementation(value, options[name])
            else if(typeof value !== typeof options[name])
                throw new Error(`Option '${name}' of initialize of module ${this.#name} is not a '${value}' (${typeof options[name]}).`)
        }
        this.initialized = true
    }
}
