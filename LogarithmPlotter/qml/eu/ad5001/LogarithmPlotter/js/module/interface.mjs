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

export const NUMBER = 0
export const STRING = "string"
export const BOOLEAN = true
export const OBJECT = {}
export const FUNCTION = () => {
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
                if(!classToCheck.hasOwnProperty(property))
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

    /**
     * Decorator to automatically check if a class conforms to the current interface.
     * @param {object} class_
     */
    implement(class_) {
        Interface.check_implementation(this, class_)
        return class_
    }
}


export class SettingsInterface extends Interface {
    constructor() {
        super()
        this.width = NUMBER
        this.height = NUMBER
        this.xmin = NUMBER
        this.ymax = NUMBER
        this.xzoom = NUMBER
        this.yzoom = NUMBER
        this.xaxisstep = STRING
        this.yaxisstep = STRING
        this.xlabel = STRING
        this.ylabel = STRING
        this.linewidth = NUMBER
        this.textsize = NUMBER
        this.logscalex = BOOLEAN
        this.showxgrad = BOOLEAN
        this.showygrad = BOOLEAN
    }
}

export class CanvasInterface extends SettingsInterface {
    constructor() {
        super()
        this.imageLoaders = OBJECT
        /** @type {function(string): CanvasRenderingContext2D} */
        this.getContext = FUNCTION
        /** @type {function(rect)} */
        this.markDirty = FUNCTION
        /** @type {function(string)} */
        this.loadImage = FUNCTION
        /** @type {function()} */
        this.requestPaint = FUNCTION
    }
}

export class RootInterface extends Interface {
    constructor() {
        super()
        this.width = NUMBER
        this.height = NUMBER
        this.updateObjectsLists = FUNCTION
    }
}

export class DialogInterface extends Interface {
    constructor() {
        super()
        this.show = FUNCTION
    }
}

export class HistoryInterface extends Interface {
    constructor() {
        super()
        this.undo = FUNCTION
        this.redo = FUNCTION
        this.clear = FUNCTION
        this.addToHistory = FUNCTION
        this.unserialize = FUNCTION
        this.serialize = FUNCTION
    }
}
