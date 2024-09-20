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

import { Module } from './modules.mjs'
import { textsub } from './utils.mjs'

class ObjectsAPI extends Module {

    constructor() {
        super('Objects')

        this.types = {}
        /**
         * List of objects for each type of object.
         * @type {Object.<string,DrawableObject[]>}
         */
        this.currentObjects = {}
        /**
         * List of objects matched by their name.
         * @type {Object.<string,DrawableObject>}
         */
        this.currentObjectsByName = {}
    }

    /**
     * Creates a new name for an object, based on the allowedLetters.
     * If variables with each of the allowedLetters is created, a subscript
     * number is added to the name.
     * @param {string} allowedLetters
     * @param {string} prefix - Prefix to the name.
     * @return {string} New unused name for a new object.
     */
    getNewName(allowedLetters, prefix='') {
        // Allows to get a new name, based on the allowed letters,
        // as well as adding a sub number when needs be.
        let newid = 0
        let ret
        do {
            let letter = allowedLetters[newid % allowedLetters.length]
            let num = Math.floor((newid - (newid % allowedLetters.length)) / allowedLetters.length)
            ret = prefix + letter + (num > 0 ? textsub(num-1) : '')
            newid += 1
        } while(ret in this.currentObjectsByName)
        return ret
    }

    /**
     * Renames an object from its old name to the new one.
     * @param {string} oldName - Current name of the object.
     * @param {string} newName - Name to rename the object to.
     */
    renameObject(oldName, newName) {
        let obj = this.currentObjectsByName[oldName]
        delete this.currentObjectsByName[oldName]
        this.currentObjectsByName[newName] = obj
        obj.name = newName
    }

    /**
     * Deletes an object by its given name.
     * @param {string} objName - Current name of the object.
     */
    deleteObject(objName) {
        let obj = this.currentObjectsByName[objName]
        if(obj !== undefined) {
            this.currentObjects[obj.type].splice(this.currentObjects[obj.type].indexOf(obj),1)
            obj.delete()
            delete this.currentObjectsByName[objName]
        }
    }

    /**
     * Gets a list of all names of a certain object type.
     * @param {string} objType - Type of the object to query. Can be ExecutableObject for all ExecutableObjects.
     * @returns {string[]} List of names of the objects.
     */
    getObjectsName(objType) {
        if(objType === "ExecutableObject") {
            // NOTE: QMLJS does not support flatMap.
            // return getExecutableTypes().flatMap(elemType => currentObjects[elemType].map(obj => obj.name))
            let types = this.getExecutableTypes()
            let elementNames = ['']
            for(let elemType of types)
                elementNames = elementNames.concat(this.currentObjects[elemType].map(obj => obj.name))
            return elementNames
        }
        if(this.currentObjects[objType] === undefined) return []
        return this.currentObjects[objType].map(obj => obj.name)
    }

    /**
     * Returns a list of all object types which are executable objects.
     * @return {string[]} List of all object types which are executable objects.
     */
    getExecutableTypes() {
        return Object.keys(this.currentObjects).filter(objType => this.types[objType].executable())
    }

    /**
     * Creates and register an object in the database.
     * @param {string} objType - Type of the object to create.
     * @param {string[]} args - List of arguments for the objects (can be empty).
     * @return {DrawableObject<objType>} Newly created object.
     */
    createNewRegisteredObject(objType, args= []) {
        if(Object.keys(this.types).indexOf(objType) === -1) return null // Object type does not exist.
        let newobj = new this.types[objType](...args)
        if(Object.keys(this.currentObjects).indexOf(objType) === -1) {
            this.currentObjects[objType] = []
        }
        this.currentObjects[objType].push(newobj)
        this.currentObjectsByName[newobj.name] = newobj
        return newobj
    }
}

/** @type {ObjectsAPI} */
Modules.Objects = Modules.Objects || new ObjectsAPI()

export default Modules.Objects
