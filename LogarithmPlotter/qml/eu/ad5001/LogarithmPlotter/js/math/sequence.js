/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
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

.import "common.js" as C
.import "expression.js" as Expr
.import "../utils.js" as Utils

/**
 * Represents mathematical object for sequences.
 */
class Sequence extends Expr.Expression {
    constructor(name, baseValues = {}, valuePlus = 1, expr = "") {
        // u[n+valuePlus] = expr
        super(expr)
        this.name = name
        this.baseValues = baseValues
        this.calcValues = Object.assign({}, baseValues)
        for(var n in this.calcValues)
            if(['string', 'number'].includes(typeof this.calcValues[n]))
                this.calcValues[n] = parser.parse(this.calcValues[n].toString()).simplify().evaluate(C.evalVariables)
        this.valuePlus = parseInt(valuePlus)
    }
    
    isConstant() {
        return this.expr.indexOf("n") == -1
    }
    
    execute(n = 1) {
        if(n in this.calcValues)
            return this.calcValues[n]
        this.cache(n)
        return this.calcValues[n]
    }
    
    simplify(n = 1) {
        if(n in this.calcValues) 
            return Utils.makeExpressionReadable(this.calcValues[n].toString())
        this.cache(n)
        return Utils.makeExpressionReadable(this.calcValues[n].toString())
    }
    
    cache(n = 1) {
        var str = Utils.simplifyExpression(this.calc.substitute('n', n-this.valuePlus).toString())
        var expr = parser.parse(str).simplify()
        var l = {'n': n-this.valuePlus} // Just in case, add n (for custom functions)
        l[this.name] = this.calcValues
        currentVars = Object.assign(l, C.evalVariables)
        this.calcValues[n] = expr.evaluate(currentVars)
    }
    
    toString(forceSign=false) {
        var str = Utils.makeExpressionReadable(this.calc.toString())
        if(str[0] != '-' && forceSign) str = '+' + str
        var subtxt = this.valuePlus == 0 ? 'ₙ' : Utils.textsub('n+' + this.valuePlus)
        var ret = `${this.name}${subtxt} = ${str}${this.baseValues.length == 0 ? '' : "\n"}`
        ret += Object.keys(this.baseValues).map(
            n => `${this.name}${Utils.textsub(n)} = ${this.baseValues[n]}`
        ).join('; ')
        return ret
    }
}
