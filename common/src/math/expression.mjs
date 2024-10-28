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


import * as Utils from "../utils/index.mjs"
import { ExprEvalExpression } from "../lib/expr-eval/expression.mjs"
import Latex from "../module/latex.mjs"
import ExprParser from "../module/expreval.mjs"
import Objects from "../module/objects.mjs"

const NUMBER_MATCHER = /^\d*\.\d+(e[+-]\d+)?$/

/**
 * Represents any kind of x-based or non variable based expression.
 */
export class Expression {
    /**
     *
     * @param {string|ExprEvalExpression} expr
     */
    constructor(expr) {
        if(typeof expr === "string") {
            this.expr = Utils.exponentsToExpression(expr)
            this.calc = ExprParser.parse(this.expr).simplify()
        } else if(expr instanceof ExprEvalExpression) {
            // Passed an expression here directly.
            this.calc = expr.simplify()
            this.expr = expr.toString()
        } else {
            const type = expr != null ? "a " + expr.constructor.name : expr
            throw new Error(`Cannot create an expression with ${type}.`)
        }
        this.canBeCached = this.isConstant()
        this.cachedValue = null
        if(this.canBeCached && this.allRequirementsFulfilled())
            this.recache()
        this.latexMarkup = Latex.expression(this.calc.tokens)
    }

    /**
     * Return all the variables used in calc
     * @return {string[]}
     */
    variables() {
        return this.calc.variables()
    }

    /**
     * Checks if the current expression is constant (does not depend on a variable, be it x or n).
     * @return {boolean}
     */
    isConstant() {
        let vars = this.calc.variables()
        return !vars.includes("x") && !vars.includes("n")
    }

    /**
     * Returns the list of object names this expression is dependant on.
     * @return {string[]}
     */
    requiredObjects() {
        return this.calc.variables().filter(objName => objName !== "x" && objName !== "n")
    }

    /**
     * Checks if all the objects required for this expression are defined.
     * @return {boolean}
     */
    allRequirementsFulfilled() {
        return this.requiredObjects().every(objName => objName in Objects.currentObjectsByName)
    }

    /**
     * Returns a list of names whose corresponding objects this expression is dependant on and are missing.
     * @return {string[]}
     */
    undefinedVariables() {
        return this.requiredObjects().filter(objName => !(objName in Objects.currentObjectsByName))
    }

    recache() {
        this.cachedValue = this.calc.evaluate(Objects.currentObjectsByName)
    }

    execute(x = 1) {
        if(this.canBeCached) {
            if(this.cachedValue == null)
                this.recache()
            return this.cachedValue
        }
        ExprParser.currentVars = Object.assign({ "x": x }, Objects.currentObjectsByName)
        return this.calc.evaluate(ExprParser.currentVars)
    }

    simplify(x) {
        let expr = new Expression(this.calc.substitute("x", x).simplify())
        if(expr.allRequirementsFulfilled() && expr.execute() === 0)
            expr = new Expression("0")
        return expr
    }

    toEditableString() {
        return this.calc.toString()
    }

    toString(forceSign = false) {
        let str = Utils.makeExpressionReadable(this.calc.toString())
        if(str !== undefined && str.match(NUMBER_MATCHER)) {
            const decimals = str.split(".")[1].split("e")[0]
            const zeros = decimals.split("0").length
            const nines = decimals.split("9").length
            if(zeros > 7 || nines > 7) {
                // Likely rounding error
                str = parseFloat(str).toDecimalPrecision(8).toString()
            }
        }
        if(str[0] === "(" && str.at(-1) === ")")
            str = str.substring(1, str.length - 1)
        if(str[0] !== "-" && forceSign)
            str = "+" + str
        return str
    }
}

/**
 * Parses and executes the given expression
 * @param {string} expr
 * @return {number}
 */
export function executeExpression(expr) {
    return (new Expression(expr.toString())).execute()
}
