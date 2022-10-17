/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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

.import "utils.js" as Utils
.import "math/common.js" as MathCommons
.import "parameters.js" as P

var types = {}

var currentObjects = {}
var currentObjectsByName = {}
MathCommons.currentObjectsByName = currentObjectsByName // Required for using objects in variables.
 
function renameObject(oldName, newName) {
    /**
     * Renames an object from its old name to the new one.
     * @param {string} oldName - Current name of the object.
     * @param {string} newName - Name to rename the object to.
     */
    let obj = currentObjectsByName[oldName]
    delete currentObjectsByName[oldName]
    currentObjectsByName[newName] = obj
    obj.name = newName
}

function deleteObject(objName) {
    /**
     * Deletes an object by its given name.
     * @param {string} objName - Current name of the object.
     */
    let obj = currentObjectsByName[objName]
    delete currentObjectsByName[objName]
    currentObjects[obj.type].splice(currentObjects[obj.type].indexOf(obj),1)
    obj.delete()
}

function getObjectsName(objType) {
    /**
     * Gets a list of all names of a certain object type.
     * @param {string} objType - Type of the object to query. Can be ExecutableObject for all ExecutableObjects.
     * @return {array} List of names of the objects.
     */
    if(objType == "ExecutableObject") {
        var types = getExecutableTypes()
        var elementNames = ['']
        types.forEach(function(elemType){
            elementNames = elementNames.concat(currentObjects[elemType].map(obj => obj.name))
        })
        return elementNames
    }
    if(currentObjects[objType] == undefined) return []
    return currentObjects[objType].map(obj => obj.name)
}

function getExecutableTypes() {
    /**
     * Returns a list of all object types which are executable objects.
     * @return {array} List of all object types which are executable objects.
     */
    return Object.keys(currentObjects).filter(objType => types[objType].executable())
}

function createNewRegisteredObject(objType, args=[]) {
    /**
     * Creates and register an object in the database.
     * @param {string} objType - Type of the object to create.
     * @param {string} args - List of arguments for the objects (can be empty).
     * @return {[objType]} Newly created object.
     */
    if(Object.keys(types).indexOf(objType) == -1) return null // Object type does not exist.
    var newobj = new types[objType](...args)
    if(Object.keys(currentObjects).indexOf(objType) == -1) {
        currentObjects[objType] = []
    }
    currentObjects[objType].push(newobj)
    currentObjectsByName[newobj.name] = newobj
    return newobj
}
