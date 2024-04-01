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
import {parseDomain, Expression as Expr, Domain} from "./mathlib.mjs"

const NONE = class Empty {}

let stringValuesValidators = {
    'int': [parseInt, (x) => !isNaN(x)],
    'double': [parseFloat, (x) => !isNaN(x)],
    'string': [(x) => x, () => true]
}
let stringValidatorTypes = Object.keys(stringValuesValidators)


class PropertyType {
    /**
     * Validates if a value corresponds to the current property type, and if so, returns it.
     * @param value
     * @returns {null|object}
     */
    parse(value) {
        throw new TypeError(`validate function of ${typeof this} has not been implemented.`)
    }

    /**
     * Exports the value of this property type.
     * @param value
     * @returns {string|number|bool|object}
     */
    export(value) {
        throw new TypeError(`export function of ${typeof this} has not been implemented.`)
    }
}


export class Expression extends PropertyType {
    constructor(...variables) {
        super()
        this.type = 'Expression'
        this.variables = variables
    }
    
    toString() {
        return this.variables.length === 0 ? 'Number' : `Expression(${this.variables.join(', ')})`
    }

    parse(value) {
        let result = NONE
        if(typeof value == 'string')
            try {
                result = new Expr(value)
            } catch(e) {
                // Silently error and return null
                console.trace()
                console.log(`Error parsing expression ${value}:`)
                console.error(e)
            }
        return result
    }

    export(value) {
        if(value instanceof Expr)
            return value.toEditableString()
        else
            throw new TypeError(`Exportation error: ${value} is not an expression.`)
    }
}


export class Enum extends PropertyType {
    constructor(...values) {
        super()
        this.type = 'Enum'
        this.values = values
        this.legacyValues = {}
        this.translatedValues = values.map(x => qsTr(x))
    }
    
    toString() {
        return `${this.type}(${this.values.join(', ')})`
    }

    parse(value) {
        let result = NONE
        if(this.values.includes(value))
            result = value
        else if(this.legacyValues[value])
            result = this.legacyValues[value]
        return result
    }

    export(value) {
        if(this.values.includes(value))
            return value
        else if(this.legacyValues[value])
            return this.legacyValues[value]
        else
            throw new TypeError(`Exportation error: ${value} not one of ${this.values.join(', ')}.`)
    }
}


export class ObjectType extends PropertyType {
    constructor(objType, allowNull=false) {
        super()
        this.type = 'ObjectType'
        this.objType = objType
        this.allowNull = allowNull
    }
    
    toString() {
        return this.objType
    }

    parse(name) {
        let result = NONE
        if(typeof name == 'string' && name in Modules.Objects.currentObjectsByName) {
            let obj = Modules.Objects.currentObjectsByName[name]
            if (obj.type === this.objType || (this.objType === 'ExecutableObject' && obj.execute)) {
                result = obj
            } else {
                // Silently error and return null
                console.trace()
                console.error(new TypeError(`Object ${name} is of not of type ${this.objType}:`))
            }
        } else if(this.allowNull && (name == null || name === "null"))
            result = null
        return result
    }

    export(value) {
        if(value.type === this.objType || (this.objType === 'ExecutableObject' && value.execute))
            return value
        else
            throw new TypeError(`Exportation error: ${value} not a ${this.objType}.`)
    }
}


export class List extends PropertyType {
    constructor(type, format = /^.+$/, label = '', forbidAdding = false) {
        super()
        // type can be string, int and double.
        this.type = 'List'
        this.valueType = type
        if(!stringValidatorTypes.includes(this.valueType))
            throw new TypeError(`${this.valueType} must be one of ${stringValidatorTypes.join(', ')}.`)
        this.format = format
        this.label = label
        this.forbidAdding = forbidAdding
    }
    
    toString() {
        return `${this.type}(${this.valueType}:${this.format})`
    }

    parse(value) {
        let result = NONE
        if(typeof value == 'object' && value.__proto__ === Array) {
            let list = []
            for(let v of value) {
                if (this.format.test(v)) {
                    v = stringValuesValidators[this.valueType][0](v)
                    if(stringValuesValidators[this.valueType][1](v))
                        list.append(v)
                }
            }
            if(list.length === value.length)
                result = value
        }
        return result
    }

    export(value) {
        if(typeof value == 'object' && value.__proto__ === Array)
            return value
        else
            throw new TypeError(`Exportation error: ${value} not a list.`)

    }
}


export class Dictionary extends PropertyType {
    constructor(type, keyType = 'string', format = /^.+$/, keyFormat = /^.+$/, preKeyLabel = '', postKeyLabel = ': ', forbidAdding = false) {
        super()
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
        return `${this.type}(${this.keyType}:${this.keyFormat}: ${this.valueType}:${this.format})`
    }

    parse(value) {
        let result = NONE
        if(typeof value == 'object' && value.__proto__ !== Array) {
            let dict = []
            for(let [k, v] of Object.entries(value)) {
                if (this.format.test(v) && this.keyFormat.test(k)) {
                    k = stringValuesValidators[this.keyType][0](k)
                    v = stringValuesValidators[this.valueType][0](v)
                    if(stringValuesValidators[this.keyType][1](k))
                        if(stringValuesValidators[this.valueType][1](v))
                            dict[k] = v
                }
            }
            if(Object.keys(dict).length === Object.keys(value).length)
                result = value
        }
        return result
    }

    export(value) {
        if(typeof value == 'object' && value.__proto__ !== Array)
            return value
        else
            throw new TypeError(`Exportation error: ${value} not a dictionary.`)
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
Enum.Position.legacyValues = {
    'top': 'above',
    'bottom': 'below',
    'top-left': 'above-left',
    'top-right': 'above-right',
    'bottom-left': 'below-left',
    'bottom-right': 'below-right',
}

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

/**
 * Ensures whether a provided value is of the corresponding type.
 * @param {string|PropertyType} propertyType
 * @param {string|number|boolean|array|object}value
 * @returns {Object}
 */
export function ensureTypeSafety(propertyType, value) {
    let result
    let error = false
    if(typeof propertyType == 'string')
        switch(propertyType) {
            case 'string':
                result = value
                error = typeof value !== 'string'
                break
            case 'number':
                result = parseFloat(value)
                error = isNaN(result)
                break
            case 'boolean':
                result = value
                error = value !== true && value !== false
                break
            case 'Domain':
                try {
                    error = typeof value !== 'string'
                    if(!error)
                        result = parseDomain(value)
                } catch(e) {
                    // Parse domain sometimes returns an empty set when it cannot parse a domain.
                    // It's okay though, it shouldn't be user parsed value, so returning an empty set
                    // is okay for a corrupted file, rather than erroring.
                    console.trace()
                    console.log(`Error parsing domain ${value}:`)
                    console.error(e)
                    error = true
                }
                break
        }
    else if(propertyType instanceof PropertyType) {
        result = propertyType.parse(value)
        error = result === NONE
    } else
        throw new TypeError(`Importation error: Unknown property type ${propertyType}.`)
    if(error) {
        console.trace()
        throw new TypeError(`Importation error: Couldn't parse ${JSON.stringify(value)} as ${propertyType}.`)
    }
    return result
}

/**
 * Serializes a property by its type to export into JSON.
 * @param {string|PropertyType} propertyType
 * @param value
 * @returns {Object}
 */
export function serializesByPropertyType(propertyType, value) {
    let result
    if(typeof propertyType == 'string')
        switch(propertyType) {
            case 'string':
                result = value.toString()
                break
            case 'number':
                result = parseFloat(value)
                break
            case 'boolean':
                result = value === true
                break
            case 'Domain':
                if(value instanceof Domain)
                    result = value.toString()
                else
                    throw new TypeError(`Exportation error: ${value} is not a domain.`)
                break
        }
    else if(propertyType instanceof PropertyType) {
        result = propertyType.export(value)
    } else
        throw new TypeError(`Exportation error: Unknown property type ${propertyType}.`)
    return result
}