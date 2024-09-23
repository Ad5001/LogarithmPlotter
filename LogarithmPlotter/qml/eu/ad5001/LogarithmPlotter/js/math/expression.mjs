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


import * as Utils from "../utils.mjs"
import Latex from "../module/latex.mjs"
import ExprParser from "../module/expreval.mjs"
import Objects from "../module/objects.mjs"

/**
 * Represents any kind of x-based or non variable based expression.
 */
export class Expression {
    constructor(expr) {
        if(typeof expr === "string") {
            this.expr = Utils.exponentsToExpression(expr)
            this.calc = ExprParser.parse(this.expr).simplify()
        } else {
            // Passed an expression here directly.
            this.calc = expr.simplify()
            this.expr = expr.toString()
        }
        this.cached = this.isConstant()
        this.cachedValue = null
        if(this.cached && this.allRequirementsFullfilled())
            this.cachedValue = this.calc.evaluate(Objects.currentObjectsByName)
        this.latexMarkup = Latex.expression(this.calc.tokens)
    }

    variables() {
        return this.calc.variables()
    }

    isConstant() {
        let vars = this.calc.variables()
        return !vars.includes("x") && !vars.includes("n")
    }
    
    requiredObjects() {
        return this.calc.variables().filter(objName => objName !== "x" && objName !== "n")
    }
    
    allRequirementsFullfilled() {
        return this.requiredObjects().every(objName => objName in Objects.currentObjectsByName)
    }
    
    undefinedVariables() {
        return this.requiredObjects().filter(objName => !(objName in Objects.currentObjectsByName))
    }
    
    recache() {
        if(this.cached)
            this.cachedValue = this.calc.evaluate(Objects.currentObjectsByName)
    }
    
    execute(x = 1) {
        if(this.cached) {
            if(this.cachedValue == null)
                this.cachedValue = this.calc.evaluate(Objects.currentObjectsByName)
            return this.cachedValue
        }
        ExprParser.currentVars = Object.assign({'x': x}, Objects.currentObjectsByName)
        return this.calc.evaluate(ExprParser.currentVars)
    }
    
    simplify(x) {
        let expr = this.calc.substitute('x', x).simplify()
        if(expr.evaluate() === 0) expr = '0'
        return new Expression(expr)
    }
    
    toEditableString() {
        return this.calc.toString()
    }
    
    toString(forceSign=false) {
        let str = Utils.makeExpressionReadable(this.calc.toString())
        if(str !== undefined && str.match(/^\d*\.\d+$/)) {
            if(str.split('.')[1].split('0').length > 7) {
                // Likely rounding error
                str = parseFloat(str.substring(0, str.length-1)).toString();
            }
        }
        if(str[0] !== '-' && forceSign) str = '+' + str
        return str
    }
}

export function executeExpression(expr){
    return (new Expression(expr.toString())).execute()
}
