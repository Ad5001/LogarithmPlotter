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

// JS polyfills to add because they're not implemented in the QML Scripting engine.
// CoreJS does not work well with it (as well as doubles the compiled size), so this is preferable.
function notPolyfilled(name) {
    return function() { throw new Error(`${name} not polyfilled`) }
}

/**
 * @param {number} depth
 * @this {Array}
 * @returns {Array}
 */
function arrayFlat(depth = 1) {
    const newArray = []
    for(const element of this) {
        if(element instanceof Array)
            newArray.push(...(depth > 1 ? element.flat(depth - 1) : element))
        else
            newArray.push(element)
    }
    return newArray
}

/**
 * @param {function(any, number, Array): any} callbackFn
 * @param {object} thisArg
 * @this {Array}
 * @returns {Array}
 */
function arrayFlatMap(callbackFn, thisArg) {
    const newArray = []
    for(let i = 0; i < this.length; i++) {
        const value = callbackFn.call(thisArg ?? this, this[i], i, this)
        if(value instanceof Array)
            newArray.push(...value)
        else
            newArray.push(value)
    }
    return newArray
}

/**
 * Replaces all instances of from by to.
 * @param {string} from
 * @param {string} to
 * @this {string}
 * @return {String}
 */
function stringReplaceAll(from, to) {
    let str = this
    while(str.includes(from))
        str = str.replace(from, to)
    return str
}


const polyfills = {
    2017: [
        [Object, "entries", notPolyfilled("Object.entries")],
        [Object, "values", notPolyfilled("Object.values")],
        [Object, "getOwnPropertyDescriptors", notPolyfilled("Object.getOwnPropertyDescriptors")],
        [String.prototype, "padStart", notPolyfilled("String.prototype.padStart")],
        [String.prototype, "padEnd", notPolyfilled("String.prototype.padEnd")]
    ],
    2018: [
        [Promise.prototype, "finally", notPolyfilled("Object.entries")]
    ],
    2019: [
        [String.prototype, "trimStart", notPolyfilled("String.prototype.trimStart")],
        [String.prototype, "trimEnd", notPolyfilled("String.prototype.trimEnd")],
        [Object, "fromEntries", notPolyfilled("Object.fromEntries")],
        [Array.prototype, "flat", arrayFlat],
        [Array.prototype, "flatMap", arrayFlatMap]
    ],
    2020: [
        [String.prototype, "matchAll", notPolyfilled("String.prototype.matchAll")],
        [Promise, "allSettled", notPolyfilled("Promise.allSettled")]
    ],
    2021: [
        [Promise, "any", notPolyfilled("Promise.any")],
        [String.prototype, "replaceAll", stringReplaceAll]
    ],
    2022: [
        [Array.prototype, "at", notPolyfilled("Array.prototype.at")],
        [String.prototype, "at", notPolyfilled("String.prototype.at")],
        [Object, "hasOwn", notPolyfilled("Object.hasOwn")]
    ],
    2023: [
        [Array.prototype, "findLast", notPolyfilled("Array.prototype.findLast")],
        [Array.prototype, "toReversed", notPolyfilled("Array.prototype.toReversed")],
        [Array.prototype, "toSorted", notPolyfilled("Array.prototype.toSorted")],
        [Array.prototype, "toSpliced", notPolyfilled("Array.prototype.toSpliced")],
        [Array.prototype, "with", notPolyfilled("Array.prototype.with")]
    ],
    2024: [
        [Object, "groupBy", notPolyfilled("Object.groupBy")],
        [Map, "groupBy", notPolyfilled("Map.groupBy")]
    ]
}

// Fulfill polyfill.
for(const [year, entries] of Object.entries(polyfills)) {
    const defined = entries.filter(x => x[0][x[1]] !== undefined)
    console.info(`ES${year} support: ${defined.length === entries.length} (${defined.length}/${entries.length})`)
    // Apply polyfills
    for(const [context, functionName, polyfill] of entries.filter(x => x[0][x[1]] === undefined)) {
        context[functionName] = polyfill
    }
}