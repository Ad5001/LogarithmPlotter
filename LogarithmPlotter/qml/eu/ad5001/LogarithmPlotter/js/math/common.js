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

/**
 * Parses arguments for a function, returns the corresponding JS function if it exists.
 * Throws either usage error otherwise.
 * @param {array} args - Arguments of the function, either [ ExecutableObject ] or [ string, variable ].
 * @param {string} usage1 - Usage for executable object.
 * @param {string} usage2 - Usage for string function.
 * @return {callable} JS function to call..
 */
function parseArgumentsForFunction(args, usage1, usage2) {
    let f, target, variable
    if(args.length == 1) {
        // Parse object
        f = args[0]
        if(typeof f != 'object' || !f.execute)
            throw EvalError(qsTranslate('usage', 'Usage: %1').arg(usage1))
        let target = f
        f = (x) => target.execute(x)
    } else if(args.length == 2) {
        // Parse variable
        [f,variable] = args
        if(typeof f != 'string' || typeof variable != 'string')
            throw EvalError(qsTranslate('usage', 'Usage: %1').arg(usage2))
        f = parser.parse(f).toJSFunction(variable, currentVars)
    } else
        throw EvalError(qsTranslate('usage', 'Usage: %1 or\n%2').arg(usage1).arg(usage2))
    return f
}

// Function definition
parser.functions.integral = function(a, b, ...args) {
    let usage1 = qsTranslate('usage', 'integral(<from: number>, <to: number>, <f: ExecutableObject>)')
    let usage2 = qsTranslate('usage', 'integral(<from: number>, <to: number>, <f: string>, <variable: string>)')
    let f = parseArgumentsForFunction(args, usage1, usage2)
    if(a == null || b == null)
        throw EvalError(qsTranslate('usage', 'Usage: %1 or\n%2').arg(usage1).arg(usage2))

    // https://en.wikipedia.org/wiki/Simpson%27s_rule
    // Simpler, faster than tokenizing the expression
    return (b-a)/6*(f(a)+4*f((a+b)/2)+f(b))
}

parser.functions.derivative = function(...args) {
    let usage1 = qsTranslate('usage', 'derivative(<f: ExecutableObject>, <x: number>)')
    let usage2 = qsTranslate('usage', 'derivative(<f: string>, <variable: string>, <x: number>)')
    let x = args.pop()
    let f = parseArgumentsForFunction(args, usage1, usage2)
    if(x == null)
        throw EvalError(qsTranslate('usage', 'Usage: %1 or\n%2').arg(usage1).arg(usage2))
        
    let derivative_precision = x/10
    return (f(x+derivative_precision/2)-f(x-derivative_precision/2))/derivative_precision
}

