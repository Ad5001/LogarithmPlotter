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

import * as Polyfill from "../lib/expr-eval/polyfill.mjs"

export const CONSTANTS = {
    "π": Math.PI,
    "pi": Math.PI,
    "inf": Infinity,
    "infinity": Infinity,
    "∞": Infinity,
    "e": Math.E
}
export const CONSTANTS_LIST = Object.keys(CONSTANTS)

export const FUNCTIONS = {
    // The functions commented are the one either not implemented 
    // in the parser, or not to be used for autocompletion.
    // Unary operators
    //'+': Number,
    //'-': (x) => -x,
    //'!'
    // Other operations
    "length": (s) => Array.isArray(s) ? s.length : String(s).length,
    // Boolean functions
    "not": (x) => !x,
    // Math functions
    "abs": Math.abs,
    "acos": Math.acos,
    "acosh": Math.acosh,
    "asin": Math.asin,
    "asinh": Math.asinh,
    "atan": Math.atan,
    "atan2": Math.atan2,
    "atanh": Math.atanh,
    "cbrt": Math.cbrt,
    "ceil": Math.ceil,
    //'clz32': Math.clz32,
    "cos": Math.cos,
    "cosh": Math.cosh,
    "exp": Math.exp,
    "expm1": Math.expm1,
    "floor": Math.floor,
    //'fround': Math.fround,
    "hypot": Math.hypot,
    //'imul': Math.imul,
    "lg": Math.log10,
    "ln": Math.log,
    "log": Math.log,
    "log10": Math.log10,
    "log1p": Math.log1p,
    "log2": Math.log2,
    "max": Math.max,
    "min": Math.min,
    "pow": Math.log2,
    "random": Math.random,
    "round": Math.round,
    "sign": Math.sign,
    "sin": Math.sin,
    "sinh": Math.sinh,
    "sqrt": Math.sqrt,
    "tan": Math.tan,
    "tanh": Math.tanh,
    "trunc": Math.trunc,
    // Functions in expr-eval, ported here.
    "fac": Polyfill.factorial,
    "gamma": Polyfill.gamma,
    "Γ": Polyfill.gamma,
    "roundTo": (x, exp) => Number(x).toFixed(exp),
    // 'map': Polyfill.arrayMap,
    // 'fold': Polyfill.arrayFold,
    // 'filter': Polyfill.arrayFilter,
    // 'indexOf': Polyfill.indexOf,
    // 'join': Polyfill.arrayJoin,
    // Integral & derivative (only here for autocomplete).
    "integral": () => 0, // TODO: Implement
    "derivative": () => 0
}
export const FUNCTIONS_LIST = Object.keys(FUNCTIONS)

export class P {
    // Parameter class.
    constructor(type, name = "", optional = false, multipleAllowed = false) {
        this.name = name
        this.type = type
        this.optional = optional
        this.multipleAllowed = multipleAllowed
    }

    toString() {
        let base_string = this.type
        if(this.name !== "")
            base_string = `${this.name}: ${base_string}`
        if(this.multipleAllowed)
            base_string += "..."
        if(!this.optional)
            base_string = `<${base_string}>`
        else
            base_string = `[${base_string}]`
        return base_string
    }
}

export let string = new P("string")
export let bool = new P("bool")
export let number = new P("number")
export let array = new P("array")

export const FUNCTIONS_USAGE = {
    "length": [string],
    "not": [bool],
    // Math functions
    "abs": [number],
    "acos": [number],
    "acosh": [number],
    "asin": [number],
    "asinh": [number],
    "atan": [number],
    "atan2": [number],
    "atanh": [number],
    "cbrt": [number],
    "ceil": [number],
    //'clz32': [number],
    "cos": [number],
    "cosh": [number],
    "exp": [number],
    "expm1": [number],
    "floor": [number],
    //'fround': [number],
    "hypot": [number],
    //'imul': [number],
    "lg": [number],
    "ln": [number],
    "log": [number],
    "log10": [number],
    "log1p": [number],
    "log2": [number],
    "max": [number, number, new P("numbers", "", true, true)],
    "min": [number, number, new P("numbers", "", true, true)],
    "pow": [number, new P("number", "exp")],
    "random": [number, number],
    "round": [number],
    "sign": [number],
    "sin": [number],
    "sinh": [number],
    "sqrt": [number],
    "tan": [number],
    "tanh": [number],
    "trunc": [number],
    // Functions in expr-eval, ported here.
    "fac": [number],
    "gamma": [number],
    "Γ": [number],
    "roundTo": [number, new P("number")],
    // Function manipulation
    "derivative": [new P("f"), new P("string", "var", true), number],
    "integral": [new P("from"), new P("to"), new P("f"), new P("string", "var", true)]
}

