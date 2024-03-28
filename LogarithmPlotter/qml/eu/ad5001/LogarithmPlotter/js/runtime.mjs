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

/**
 * Base class for global APIs in runtime.
 */
export class RuntimeAPI {

    /**
     *
     * @param {string} name - Name of the API
     * @param {(RuntimeAPI|undefined)[]} requires - List of APIs required to initialize this one.
     */
    constructor(name, requires = []) {
        console.log(`Loading module ${name}...`)
        this.__check_requirements(requires, name)
    }

    /**
     * Checks if all requirements are defined.
     * @param {(RuntimeAPI|undefined)[]} requires
     * @param {string} name
     */
    __check_requirements(requires, name) {
        for(let requirement of requires) {
            if(requirement === undefined)
                throw new Error(`Requirement ${requires.indexOf(requirement)} of ${name} has not been initialized.`)
        }
    }
}