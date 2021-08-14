/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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
.import "mathlib.js" as MathLib
.import "parameters.js" as P

var types = {}

var currentObjects = {}

function getObjectByName(objName, objType = null) {
    var objectTypes = Object.keys(currentObjects)
    if(typeof objType == 'string') {
        if(objType == "ExecutableObject") {
            objectTypes = getExecutableTypes()
        } else if(currentObjects[objType] != undefined) {
            objectTypes = [objType]
        }
    }
    if(Array.isArray(objType)) objectTypes = objType
    var retObj = null
    objectTypes.forEach(function(objType){
        if(currentObjects[objType] == undefined) return null
        currentObjects[objType].forEach(function(obj){
            if(obj.name == objName) retObj = obj
        })
    })
    return retObj
}

function getObjectsName(objType) {
    if(objType == "ExecutableObject") {
        var types = getExecutableTypes()
        var elementNames = ['']
        types.forEach(function(elemType){
            elementNames = elementNames.concat(currentObjects[elemType].map(obj => obj.name))
        })
        console.log(elementNames)
        return elementNames
    }
    if(currentObjects[objType] == undefined) return []
    return currentObjects[objType].map(obj => obj.name)
}

function getExecutableTypes() {
    return Object.keys(currentObjects).filter(objType => types[objType].executable())
}

function createNewRegisteredObject(objType, args=[]) {
    if(Object.keys(types).indexOf(objType) == -1) return null // Object type does not exist.
    var newobj = new types[objType](...args)
    if(Object.keys(currentObjects).indexOf(objType) == -1) {
        currentObjects[objType] = []
    }
    currentObjects[objType].push(newobj)
    return newobj
}
