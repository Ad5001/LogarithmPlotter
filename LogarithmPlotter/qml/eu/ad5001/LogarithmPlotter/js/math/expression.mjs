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


import Latex from "latex.mjs"
import * as Utils from "../utils.mjs"

/**
 * Represents any kind of x-based or non variable based expression.
 */
export class Expression {
    constructor(expr) {
        if(!Modules.ExprParser)
            throw new Error('Expression parser not initialized.')
        if(!Modules.Objects)
            throw new Error('Objects API not initialized.')
        this.expr = Utils.exponentsToExpression(expr)
        this.calc = Modules.ExprParser.parse(this.expr).simplify()
        this.cached = this.isConstant()
        this.cachedValue = null
        if(this.cached && this.allRequirementsFullfilled())
            this.cachedValue = this.calc.evaluate(Modules.Objects.currentObjectsByName)
        this.latexMarkup = Latex.expression(this.calc.tokens)
    }
    
    isConstant() {
        let vars = this.calc.variables()
        return !vars.includes("x") && !vars.includes("n")
    }
    
    requiredObjects() {
        return this.calc.variables().filter(objName => objName !== "x" && objName !== "n")
    }
    
    allRequirementsFullfilled() {
        return this.requiredObjects().every(objName => objName in Modules.Objects.currentObjectsByName)
    }
    
    undefinedVariables() {
        return this.requiredObjects().filter(objName => !(objName in Modules.Objects.currentObjectsByName))
    }
    
    recache() {
        if(this.cached)
            this.cachedValue = this.calc.evaluate(Modules.Objects.currentObjectsByName)
    }
    
    execute(x = 1) {
        if(this.cached) {
            if(this.cachedValue == null)
                this.cachedValue = this.calc.evaluate(Modules.Objects.currentObjectsByName)
            return this.cachedValue
        }
        Modules.ExprParser.currentVars = Object.assign({'x': x}, Modules.Objects.currentObjectsByName)
        return this.calc.evaluate(Modules.ExprParser.currentVars)
    }
    
    simplify(x) {
        let expr = this.calc.substitute('x', x).simplify()
        if(expr.evaluate() === 0) return '0'
        let str = Utils.makeExpressionReadable(expr.toString());
        if(str !== undefined && str.match(/^\d*\.\d+$/)) {
            if(str.split('.')[1].split('0').length > 7) {
                // Likely rounding error
                str = parseFloat(str.substring(0, str.length-1)).toString();
            }
        }
        return str
    }
    
    duplicate() {
        return new Expression(this.toEditableString())
    }
    
    toEditableString() {
        return this.calc.toString()
    }
    
    toString(forceSign=false) {
        let str = Utils.makeExpressionReadable(this.calc.toString())
        if(str[0] !== '-' && forceSign) str = '+' + str
        return str
    }
}

export function executeExpression(expr){
    return (new Expression(expr.toString())).execute()
}
