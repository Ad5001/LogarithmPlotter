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
.import "latex.js" as Latex
.import "../utils.js" as Utils

/**
 * Represents any kind of x-based or non variable based expression.
 */
class Expression {
    constructor(expr) {
        this.expr = expr
        this.calc = C.parser.parse(expr).simplify()
        this.cached = this.isConstant()
        this.cachedValue = this.cached ? this.calc.evaluate(C.evalVariables) : null
        this.latexMarkup = Latex.expressionToLatex(this.calc.tokens)
    }
    
    isConstant() {
        return !this.expr.includes("x") && !this.expr.includes("n")
    }
    
    execute(x = 1) {
        if(this.cached) return this.cachedValue
        C.currentVars = Object.assign({'x': x}, C.evalVariables)
        return this.calc.evaluate(C.currentVars)
    }
    
    simplify(x) {
        var expr = this.calc.substitute('x', x).simplify()
        if(expr.evaluate(C.evalVariables) == 0) return '0'
        var str = Utils.makeExpressionReadable(expr.toString());
        if(str != undefined && str.match(/^\d*\.\d+$/)) {
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
        var str = Utils.makeExpressionReadable(this.calc.toString())
        if(str[0] != '-' && forceSign) str = '+' + str
        return str
    }
}

function executeExpression(expr){
    return (new Expression(expr.toString())).execute()
}
