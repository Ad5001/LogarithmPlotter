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

class Expression {
    constructor(...variables) {
        this.type = 'Expression'
        this.variables = variables
    }
    
    toString() {
        return this.variables.length == 0 ? 'Number' : `Expression(${this.variables.join(', ')})`
    }
}

class Enum {
    constructor(...values) {
        this.type = 'Enum'
        this.values = values
        this.translatedValues = values.map(x => qsTr(x))
    }
    
    toString() {
        return this.type
    }
}

class ObjectType {
    constructor(objType) {
        this.type = 'ObjectType'
        this.objType = objType
    }
    
    toString() {
        return this.objType
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
    
    toString() {
        return this.objType
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
    
    toString() {
        return 'Dictionary'
    }
}

// Common parameters for Enums

Enum.Position = new Enum(
    QT_TR_NOOP('above'),
    QT_TR_NOOP('below'),
    QT_TR_NOOP('left'),
    QT_TR_NOOP('right'),
    QT_TR_NOOP('above-left'),
    QT_TR_NOOP('above-right'),
    QT_TR_NOOP('below-left'),  
    QT_TR_NOOP('below-right')
)

Enum.Positioning = new Enum(
    QT_TR_NOOP('center'),
    QT_TR_NOOP('top'),
    QT_TR_NOOP('bottom'),
    QT_TR_NOOP('left'),
    QT_TR_NOOP('right'),
    QT_TR_NOOP('top-left'),
    QT_TR_NOOP('top-right'),
    QT_TR_NOOP('bottom-left'),  
    QT_TR_NOOP('bottom-right')
)

Enum.FunctionDisplayType = new Enum(
    QT_TR_NOOP('application'), 
    QT_TR_NOOP('function')
)

Enum.BodePass = new Enum(
    QT_TR_NOOP('high'),
    QT_TR_NOOP('low')
)


Enum.XCursorValuePosition = new Enum(
    QT_TR_NOOP('Next to target'),
    QT_TR_NOOP('With label'),
    QT_TR_NOOP('Hidden')
)


