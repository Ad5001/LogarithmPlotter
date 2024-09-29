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

import { Module } from "./common.mjs"
import { Parser } from "../lib/expr-eval/parser.mjs"

const evalVariables = {
    // Variables not provided by expr-eval.js, needs to be provided manually
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

class ExprParserAPI extends Module {
    constructor() {
        super("ExprParser")
        this.currentVars = {}
        this._parser = new Parser()

        this._parser.consts = Object.assign({}, this._parser.consts, evalVariables)

        this._parser.functions.integral = this.integral.bind(this)
        this._parser.functions.derivative = this.derivative.bind(this)
    }

    /**
     * Parses arguments for a function, returns the corresponding JS function if it exists.
     * Throws either usage error otherwise.
     * @param {array} args - Arguments of the function, either [ ExecutableObject ] or [ string, variable ].
     * @param {string} usage1 - Usage for executable object.
     * @param {string} usage2 - Usage for string function.
     * @return {function} JS function to call.
     */
    parseArgumentsForFunction(args, usage1, usage2) {
        let f, variable
        if(args.length === 1) {
            // Parse object
            f = args[0]
            if(typeof f !== "object" || !f.execute)
                throw EvalError(qsTranslate("usage", "Usage:\n%1").arg(usage1))
            let target = f
            f = (x) => target.execute(x)
        } else if(args.length === 2) {
            // Parse variable
            [f, variable] = args
            if(typeof f !== "string" || typeof variable !== "string")
                throw EvalError(qsTranslate("usage", "Usage:\n%1").arg(usage2))
            f = this._parser.parse(f).toJSFunction(variable, this.currentVars)
        } else
            throw EvalError(qsTranslate("usage", "Usage:\n%1\n%2").arg(usage1).arg(usage2))
        return f
    }

    /**
     * @param {string} expression - Expression to parse
     * @returns {ExprEvalExpression}
     */
    parse(expression) {
        return this._parser.parse(expression)
    }

    integral(a, b, ...args) {
        let usage1 = qsTranslate("usage", "integral(<from: number>, <to: number>, <f: ExecutableObject>)")
        let usage2 = qsTranslate("usage", "integral(<from: number>, <to: number>, <f: string>, <variable: string>)")
        let f = this.parseArgumentsForFunction(args, usage1, usage2)
        if(a == null || b == null)
            throw EvalError(qsTranslate("usage", "Usage:\n%1\n%2").arg(usage1).arg(usage2))

        // https://en.wikipedia.org/wiki/Simpson%27s_rule
        // Simpler, faster than tokenizing the expression
        return (b - a) / 6 * (f(a) + 4 * f((a + b) / 2) + f(b))
    }

    derivative(...args) {
        let usage1 = qsTranslate("usage", "derivative(<f: ExecutableObject>, <x: number>)")
        let usage2 = qsTranslate("usage", "derivative(<f: string>, <variable: string>, <x: number>)")
        let x = args.pop()
        let f = this.parseArgumentsForFunction(args, usage1, usage2)
        if(x == null)
            throw EvalError(qsTranslate("usage", "Usage:\n%1\n%2").arg(usage1).arg(usage2))

        let derivative_precision = x / 10
        return (f(x + derivative_precision / 2) - f(x - derivative_precision / 2)) / derivative_precision
    }
}

/** @type {ExprParserAPI} */
Modules.ExprParser = Modules.ExprParser || new ExprParserAPI()

export default Modules.ExprParser

