/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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

var evalVariables = { // Variables not provided by expr-eval.js, needs to be provided manually
    "pi": Math.PI,
    "PI": Math.PI,
    "π": Math.PI,
    "inf": Infinity,
    "infinity": Infinity,
    "Infinity": Infinity,
    "∞": Infinity,
    "e": Math.E,
    "E": Math.E,
    "true": true,
    "false": false
    
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

parser.functions.derivative = function(...args) {
    let f, target, variable, x
    if(args.length == 2) {
        [f, x] = args
        if(typeof f != 'object' || !f.execute)
            throw EvalError(qsTranslate('usage', 'Usage: %1')
                                .arg(qsTranslate('usage', 'derivative(<function: ExecutableObject>, <x: variable>)')))
        target = f
        f = (x) => target.execute(x)
    } else if(args.length == 3) {
        [f, variable, x] = args
        if(typeof f != 'string')
            throw EvalError(qsTranslate('usage', 'Usage: %1')
                                .arg(qsTranslate('usage', 'derivative(<function: string>, <variable: string>, <x: variable>)')))
        f = parser.parse(f).toJSFunction(variable, currentVars)
    } else
        throw EvalError(qsTranslate('usage', 'Usage: %1 or\n%2')
                            .arg(qsTranslate('usage', 'derivative(<function: string>, <variable: string>, <x: variable>)')
                            .arg(qsTranslate('usage', 'derivative(<function: string>, <variable: string>, <x: variable>)'))))

    let derivative_precision = x/10
    return (f(x+derivative_precision/2)-f(x-derivative_precision/2))/derivative_precision
}

