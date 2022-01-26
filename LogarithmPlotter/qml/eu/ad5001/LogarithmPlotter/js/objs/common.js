/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
 *  Copyright (C) 2022  Ad5001
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

.pragma library

.import "../utils.js" as Utils
.import "../objects.js" as Objects

// This file contains the default data to be imported from all other objects


function getNewName(allowedLetters) {
    // Allows to get a new name, based on the allowed letters, 
    // as well as adding a sub number when needs be.
    var newid = 0
    var ret
    do {
        var letter = allowedLetters[newid % allowedLetters.length]
        var num = Math.floor((newid - (newid % allowedLetters.length)) / allowedLetters.length)
        ret = letter + (num > 0 ? Utils.textsub(num-1) : '')
        newid += 1
    } while(Objects.getObjectByName(ret) != null)
    return ret
}

class DrawableObject {
    // Class to extend for every type of object that
    // can be drawn on the canvas.
    
    // Base name of the object. Needs to be constant over time.
    static type(){return 'Unknown'}
    
    // (Potentially translated) name of the object to be shown to the user. 
    static displayType(){return 'Unknown'}
    
    // Label used for the list on the ObjectsList sidebar. 
    static displayTypeMultiple(){return 'Unknowns'}
    
    // Whether this object can be created by the user
    // or are instantiated by other objects.
    static createable() {return true}
    // Properties are set with key as property name and 
    // value as it's type name (e.g 'Expression', 'string'...), 
    // an Enum for enumerations, an ObjectType for DrawableObjects
    // with a specific type, a List instance for lists, a 
    // Dictionary instance for dictionaries...
    // Used for property modifier in the sidebar.
    static properties() {return {}}
    
    // Whether the object can be executed (instance of ExecutableObject)
    static executable() {return false}
    
    constructor(name, visible = true, color = null, labelContent = 'name + value') {
        if(color == null) color = Utils.getRandomColor()
        this.type = 'Unknown'
        this.name = name
        this.visible = visible
        this.color = color
        this.labelContent = labelContent // "null", "name", "name + value"
        this.requiredBy = []
    }
    
    export() {
        // Should return what will be inputed as arguments when a file is loaded (serializable form)
        return [this.name, this.visible, this.color.toString(), this.labelContent]
    }
    
    getReadableString() {
        return `${this.name} = Unknown`
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return this.name
            case 'name + value':
                return this.getReadableString()
            case 'null':
                return ''
                
        }
    }
    
    update() {
        for(var req of this.requiredBy) {
            req.update()
        }
    }
    
    delete() {
        for(var toRemove of this.requiredBy) {
            toRemove.delete()
            Objects.currentObjects[toRemove.type] = Objects.currentObjects[toRemove.type].filter(obj => obj.name != toRemove.name)
        }
    }
    
    draw(canvas, ctx) {}
    
    toString() {
        return this.name;
    }
}

class ExecutableObject extends DrawableObject {
    // Class to be extended for every class upon which we
    // calculate an y for a x with the execute function.
    // If a value cannot be found during execute, it should
    // return null. However, theses values should
    // return false when passed to canExecute.
    execute(x = 1) {return 0}
    canExecute(x = 1) {return true}
    // Simplify returns the simplified string of the expression.
    simplify(x = 1) {return '0'}
    
    // Whether the object can be executed (instance of ExecutableObject)
    static executable() {return true}
}

function registerObject(obj) {
    // Registers an object to be used in LogarithmPlotter.
    // This function is called from autoload.js
    if(obj.prototype instanceof DrawableObject) {
        Objects.types[obj.type()] = obj
    } else {
        console.error("Could not register object " + (obj.type()) + ", as it isn't a DrawableObject.")
    }
}

