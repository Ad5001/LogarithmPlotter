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

import * as Expr from "expression.mjs"
import * as Utils from "../utils.mjs"
import Latex from "./latex.mjs"
import Objects from "../objects.mjs"
import ExprParser from "../lib/expr-eval/integration.mjs"

/**
 * Represents mathematical object for sequences.
 */
export class Sequence extends Expr.Expression {
    constructor(name, baseValues = {}, valuePlus = 1, expr = "") {
        // u[n+valuePlus] = expr
        super(expr)
        this.name = name
        this.baseValues = baseValues
        this.calcValues = Object.assign({}, baseValues)
        this.latexValues = Object.assign({}, baseValues)
        for(let n in this.calcValues)
            if(['string', 'number'].includes(typeof this.calcValues[n])) {
                let parsed = ExprParser.parse(this.calcValues[n].toString()).simplify()
                this.latexValues[n] = Latex.expression(parsed.tokens)
                this.calcValues[n] = parsed.evaluate()
            }
        this.valuePlus = parseInt(valuePlus)
    }
    
    isConstant() {
        return this.expr.indexOf("n") === -1
    }
    
    execute(n = 1) {
        if(n in this.calcValues)
            return this.calcValues[n]
        this.cache(n)
        return this.calcValues[n]
    }
    
    simplify(n = 1) {
        if(!(n in this.calcValues))
            this.cache(n)
        return this.calcValues[n].toString()
    }
    
    cache(n = 1) {
        let str = Utils.simplifyExpression(this.calc.substitute('n', n-this.valuePlus).toString())
        let expr = ExprParser.parse(str).simplify()
        // Cache values required for this one.
        if(!this.calcValues[n-this.valuePlus] && n-this.valuePlus > 0)
            this.cache(n-this.valuePlus)
        // Setting current variables
        ExprParser.currentVars = Object.assign(
            {'n': n-this.valuePlus}, // Just in case, add n (for custom functions)
            Objects.currentObjectsByName,
            {[this.name]: this.calcValues}
        )
        this.calcValues[n] = expr.evaluate(ExprParser.currentVars)
    }
    
    toString(forceSign=false) {
        let str = Utils.makeExpressionReadable(this.calc.toString())
        if(str[0] !== '-' && forceSign) str = '+' + str
        let subtxt = this.valuePlus === 0 ? 'ₙ' : Utils.textsub('n+' + this.valuePlus)
        let ret = `${this.name}${subtxt} = ${str}${this.baseValues.length === 0 ? '' : "\n"}`
        ret += Object.keys(this.baseValues).map(
            n => `${this.name}${Utils.textsub(n)} = ${this.baseValues[n]}`
        ).join('; ')
        return ret
    }
    
    toLatexString(forceSign=false) {
        let str = this.latexMarkup
        if(str[0] !== '-' && forceSign) str = '+' + str
        let subtxt = '_{n' + (this.valuePlus === 0 ? '' : '+' + this.valuePlus) + '}'
        let ret = `\\begin{array}{l}${Latex.variable(this.name)}${subtxt} = ${str}${this.latexValues.length === 0 ? '' : "\n"}\\\\`
        ret += Object.keys(this.latexValues).map(
            n => `${this.name}_{${n}} = ${this.latexValues[n]}`
        ).join('; ') + "\\end{array}"
        return ret
    }
}
