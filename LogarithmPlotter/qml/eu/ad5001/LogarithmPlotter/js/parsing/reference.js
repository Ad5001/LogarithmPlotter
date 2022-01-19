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

const CONSTANTS = {
    "π": Math.PI,
    "pi": Math.PI,
    "inf": Infinity,
    "infinity": Infinity,
    "∞": Infinity,
    "e": Infinity
};
const CONSTANTS_LIST = Object.keys(CONSTANTS);

const FUNCTIONS = {
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
    "clz32": Math.clz32,
    "cos": Math.cos,
    "cosh": Math.cosh,
    "exp": Math.exp,
    "expm1": Math.expm1,
    "floor": Math.floor,
    "fround": Math.fround,
    "hypot": Math.hypot,
    "imul": Math.imul,
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
}
const FUNCTIONS_LIST = Object.keys(FUNCTIONS);
// TODO: Complete
const DERIVATIVES = {
    "abs": "abs(<1>)/<1>",
    "acos": "-derivate(<1>)/sqrt(1-(<1>)^2)",
    "acosh": "derivate(<1>)/sqrt((<1>)^2-1)",
    "asin": "derivate(<1>)/sqrt(1-(<1>)^2)",
    "asinh": "derivate(<1>)/sqrt((<1>)^2+1)",
    "atan": "derivate(<1>)/(1+(<1>)^2)",
    "atan2": "",
}
const INTEGRALS = {
    "abs": "integrate(<1>)*sign(<1>)",
    "acos": "",
    "acosh": "",
    "asin": "",
    "asinh": "",
    "atan": "",
    "atan2": "",
}

