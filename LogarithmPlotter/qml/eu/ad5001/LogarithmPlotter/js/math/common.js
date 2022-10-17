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

.import "../expr-eval.js" as ExprEval
.import "../utils.js" as Utils
.import "latex.js" as Latex

const DERIVATION_PRECISION = 0.1

var evalVariables = { // Variables not provided by expr-eval.js, needs to be provided manually
    "pi": Math.PI,
    "π": Math.PI,
    "inf": Infinity,
    "Infinity": Infinity,
    "∞": Infinity,
    "e": Math.E,
    "E": Math.E
}

var currentVars = {}
var currentObjectsByName = {} // Mirror of currentObjectsByName in objects.js

const parser = new ExprEval.Parser()

parser.consts = Object.assign({}, parser.consts, evalVariables)

// Function definition
parser.functions.integral = function(a, b, f, variable) {
    // https://en.wikipedia.org/wiki/Simpson%27s_rule
    // Simpler, faster than tokenizing the expression
    f = parser.parse(f).toJSFunction(variable, currentVars)
    return (b-a)/6*(f(a)+4*f((a+b)/2)+f(b))
}

parser.functions.derivative = function(f, variable, x) {
    f = parser.parse(f).toJSFunction(variable, currentVars)
    return (f(x+DERIVATION_PRECISION/2)-f(x-DERIVATION_PRECISION/2))/DERIVATION_PRECISION
}
