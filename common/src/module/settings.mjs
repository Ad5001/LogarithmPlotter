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
import { BaseEvent } from "../events.mjs"
import { HelperInterface } from "./interface.mjs"


/**
 * Base event for when a setting was changed.
 */
class ChangedEvent extends BaseEvent {
    /**
     * 
     * @param {string} property - Name of the property that was chagned
     * @param {string|number|boolean} oldValue - Old value of the property
     * @param {string|number|boolean} newValue - Current (new) value of the property
     * @param {boolean} byUser - True if the user is at the source of the change in the setting.
     */
    constructor(property, oldValue, newValue, byUser) {
        super("changed")
        
        this.property = property
        this.oldValue = oldValue
        this.newValue = newValue
        this.byUser = byUser
    }
}

/**
 * Module for graph settings.
 */
class SettingsAPI extends Module {
    static emits = ["changed"]
    
    #nonConfigurable = ["saveFilename"]
    
    #properties = new Map([
        ["saveFilename", ""],
        ["xzoom", 100],
        ["yzoom", 10],
        ["xmin", .5],
        ["ymax", 25],
        ["xaxisstep", "4"],
        ["yaxisstep", "4"],
        ["xlabel", ""],
        ["ylabel", ""],
        ["linewidth", 1],
        ["textsize", 18],
        ["logscalex", true],
        ["showxgrad", true],
        ["showygrad", true]
    ])
    
    constructor() {
        super("Settings", {
            helper: HelperInterface
        })
    }

    /**
     *
     * @param {HelperInterface} helper
     */
    initialize({ helper }) {
        super.initialize({ helper })
        // Initialize default values.
        for(const key of this.#properties.keys()) {
            if(!this.#nonConfigurable.includes(key)) {
                switch(typeof this.#properties.get(key)) {
                    case "boolean":
                        this.set(key, helper.getSettingBool("default_graph."+key), false)
                        break
                    case "number":
                        this.set(key, helper.getSettingInt("default_graph."+key), false)
                        break
                    case "string":
                        this.set(key, helper.getSetting("default_graph."+key), false)
                        break
                }
            }
        }
    }
    
    /**
     * Sets a setting to a given value
     *
     * @param {string} property
     * @param {string|number|boolean} value
     * @param {boolean} byUser - Set to true if the user is at the origin of this change.
     */
    set(property, value, byUser) {
        if(!this.#properties.has(property)) {
            throw new Error(`Property ${property} is not a setting.`)
        }
        const oldValue = this.#properties.get(property)
        const propType = typeof oldValue
        if(byUser)
            console.debug("Setting", property, "from", oldValue, "to", value, `(${typeof value}, ${byUser})`)
        if(propType !== typeof value)
            throw new Error(`Value of ${property} must be a ${propType} (${typeof value} provided).`)
        this.#properties.set(property, value)
        this.emit(new ChangedEvent(property, oldValue, value, byUser === true))
    }
    
    /**
     * Name of the currently opened file.
     * @returns {string}
     */
    get saveFilename() { return this.#properties.get("saveFilename") }
    
    /**
     * Zoom on the x axis of the diagram.
     * @returns {number}
     */
    get xzoom() { return this.#properties.get("xzoom") }
    /**
     * Zoom on the y axis of the diagram.
     * @returns {number}
     */
    get yzoom() { return this.#properties.get("yzoom") }
    /**
     * Minimum x of the diagram.
     * @returns {number}
     */
    get xmin() { return this.#properties.get("xmin") }
    /**
     * Maximum y of the diagram.
     * @returns {number}
     */
    get ymax() { return this.#properties.get("ymax") }
    /**
     * Step of the x axis graduation (expression).
     * @note Only available in non-logarithmic mode.
     * @returns {string}
     */
    get xaxisstep() { return this.#properties.get("xaxisstep") }
    /**
     * Step of the y axis graduation (expression).
     * @returns {string}
     */
    get yaxisstep() { return this.#properties.get("yaxisstep") }
    /**
     * Label used on the x axis.
     * @returns {string}
     */
    get xlabel() { return this.#properties.get("xlabel") }
    /**
     * Label used on the y axis.
     * @returns {string}
     */
    get ylabel() { return this.#properties.get("ylabel") }
    /**
     * Width of lines that will be drawn into the canvas.
     * @returns {number}
     */
    get linewidth() { return this.#properties.get("linewidth") }
    /**
     * Font size of the text that will be drawn into the canvas.
     * @returns {number}
     */
    get textsize() { return this.#properties.get("textsize") }
    /**
     * true if the canvas should be in logarithmic mode, false otherwise.
     * @returns {boolean}
     */
    get logscalex() { return this.#properties.get("logscalex") }
    /**
     * true if the x graduation should be shown, false otherwise.
     * @returns {boolean}
     */
    get showxgrad() { return this.#properties.get("showxgrad") }
    /**
     * true if the y graduation should be shown, false otherwise.
     * @returns {boolean}
     */
    get showygrad() { return this.#properties.get("showygrad") }
}

Modules.Settings = Modules.Settings || new SettingsAPI()
export default Modules.Settings

