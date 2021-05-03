/**
 *  Logarithmic Plotter - Create graphs with logarithm scales.
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

class Enum {
    constructor(...values) {
        this.type = 'Enum'
        this.values = values
    }
}

class ObjectType {
    constructor(objType) {
        this.type = 'ObjectType'
        this.objType = objType
    }
}

class List {
    constructor(type, format = /^.+$/, label = '', forbidAdding = false) {
        // type can be string, int and double.
        this.type = 'List'
        this.valueType = type
        this.format = format
        this.label = label
        this.forbidAdding = forbidAdding
    }
}

class Dictionary {
    constructor(type, keyType = 'string', format = /^.+$/, keyFormat = /^.+$/, preKeyLabel = '', postKeyLabel = ': ', forbidAdding = false) {
        // type & keyType can be string, int and double.
        this.type = 'Dict'
        this.valueType = type
        this.keyType = keyType
        this.format = format
        this.keyFormat = keyFormat
        this.preKeyLabel = preKeyLabel
        this.postKeyLabel = postKeyLabel
        this.forbidAdding = forbidAdding
    }
}
