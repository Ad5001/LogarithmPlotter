/**
 * LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 * 
 * @author Ad5001 <mail@ad5001.eu>
 * @license GPL-3.0-or-later
 * @copyright (C) 2021-2024  Ad5001
 * @preserve
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export const NUMBER = 0
export const STRING = "string"
export const BOOLEAN = true
export const OBJECT = {}
export const FUNCTION = () => {
    throw new Error("Cannot call function of an interface.")
}


export class Interface {
    /**
     * Checks if the class to check implements the given interface.
     * Throws an error if the implementation does not conform to the interface.
     * @param {typeof Interface} interface_
     * @param {object} classToCheck
     * @return {boolean}
     */
    static check_implementation(interface_, classToCheck) {
        const properties = new interface_()
        const interfaceName = interface_.name
        const toCheckName = classToCheck.constructor.name
        for(const [property, value] of Object.entries(properties))
            if(property !== "implement") {
                if(classToCheck[property] === undefined)
                    // Check if the property exist
                    throw new Error(`Property '${property}' (${typeof value}) is present in interface ${interfaceName}, but not in implementation ${toCheckName}.`)
                else if((typeof value) !== (typeof classToCheck[property]))
                    // Compare the types
                    throw new Error(`Property '${property}' of ${interfaceName} implementation ${toCheckName} is a '${typeof classToCheck[property]}' and not a '${typeof value}'.`)
                else if((typeof value) === "object")
                    // Test type of object.
                    if(value instanceof Interface)
                        Interface.check_implementation(value, classToCheck[property])
                    else if(value.prototype && !(classToCheck[property] instanceof value))
                        throw new Error(`Property '${property}' of ${interfaceName} implementation ${toCheckName} is not '${value.constructor.name}'.`)
            }
    }
}


export class SettingsInterface extends Interface {
    width = NUMBER
    height = NUMBER
    xmin = NUMBER
    ymax = NUMBER
    xzoom = NUMBER
    yzoom = NUMBER
    xaxisstep = STRING
    yaxisstep = STRING
    xlabel = STRING
    ylabel = STRING
    linewidth = NUMBER
    textsize = NUMBER
    logscalex = BOOLEAN
    showxgrad = BOOLEAN
    showygrad = BOOLEAN
}

export class CanvasInterface extends SettingsInterface {
    imageLoaders = OBJECT
    /** @type {function(string): CanvasRenderingContext2D} */
    getContext = FUNCTION
    /** @type {function(rect)} */
    markDirty = FUNCTION
    /** @type {function(string)} */
    loadImage = FUNCTION
    /** @type {function(string)} */
    isImageLoading = FUNCTION
    /** @type {function(string)} */
    isImageLoaded = FUNCTION
    /** @type {function()} */
    requestPaint = FUNCTION
}

export class RootInterface extends Interface {
    width = NUMBER
    height = NUMBER
    updateObjectsLists = FUNCTION
}

export class DialogInterface extends Interface {
    show = FUNCTION
}

export class HistoryInterface extends Interface {
    undo = FUNCTION
    redo = FUNCTION
    clear = FUNCTION
    addToHistory = FUNCTION
    unserialize = FUNCTION
    serialize = FUNCTION
}

export class LatexInterface extends Interface {
    /**
     * @param {string} markup - LaTeX markup to render
     * @param {number} fontSize - Font size (in pt) to render
     * @param {string} color - Color of the text to render
     * @returns {string} - Comma separated data of the image (source, width, height)
     */
    render = FUNCTION
    /**
     * @param {string} markup - LaTeX markup to render
     * @param {number} fontSize - Font size (in pt) to render
     * @param {string} color - Color of the text to render
     * @returns {string} - Comma separated data of the image (source, width, height)
     */
    findPrerendered = FUNCTION
    /**
     * Checks if the Latex installation is valid
     * @returns {boolean}
     */
    checkLatexInstallation = FUNCTION
}

export class HelperInterface extends Interface {
    /**
     * Gets a setting from the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to get (e.g. "default_graph.xmin")
     * @returns {boolean} Value of the setting
     */
    getSettingBool = FUNCTION
    /**
     * Gets a setting from the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to get (e.g. "default_graph.xmin")
     * @returns {number} Value of the setting
     */
    getSettingInt = FUNCTION
    /**
     * Gets a setting from the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to get (e.g. "default_graph.xmin")
     * @returns {string} Value of the setting
     */
    getSetting = FUNCTION
    /**
     * Sets a setting in the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to set (e.g. "default_graph.xmin")
     * @param {boolean} value
     */
    setSettingBool = FUNCTION
    /**
     * Sets a setting in the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to set (e.g. "default_graph.xmin")
     * @param {number} value
     */
    setSettingInt = FUNCTION
    /**
     * Sets a setting in the config
     * @param {string} settingName - Setting (and its dot-separated namespace) to set (e.g. "default_graph.xmin")
     * @param {string} value
     */
    setSetting = FUNCTION
    /**
     * Sends data to be written
     * @param {string} file
     * @param {string} dataToWrite - just JSON encoded, requires the "LPFv1" mime to be added before writing
     */
    write = FUNCTION
    /**
     * Requests data to be read from a file
     * @param {string} file
     * @returns {string} the loaded data - just JSON encoded, requires the "LPFv1" mime to be stripped
     */
    load = FUNCTION
}
