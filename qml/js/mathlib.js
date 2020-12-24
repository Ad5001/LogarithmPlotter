/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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

.import "expr-eval.js" as ExprEval
.import "utils.js" as Utils

const parser = new ExprEval.Parser()

var evalVariables = { // Variables not provided by expr-eval.js, needs to be provided manualy
    "pi": Math.PI,
    "π": Math.PI,
    "inf": Infinity,
    "Infinity": Infinity,
    "∞": Infinity,
    "e": Math.E
}

class Expression {
    constructor(expr) {
        this.expr = expr
        this.calc = parser.parse(expr).simplify()
        this.cached = this.isConstant()
        this.cachedValue = this.cached ? this.calc.evaluate(evalVariables) : null
    }
    
    isConstant() {
        return this.expr.indexOf("x") == -1
    }
    
    execute(x = 1) {
        if(this.cached) return this.cachedValue
        return this.calc.evaluate(Object.assign({'x': x}, evalVariables))
    }
    
    simplify(x) {
        var expr = this.calc.substitute('x', x).simplify()
        if(expr.evaluate(evalVariables) == 0) return '0'
        return Utils.makeExpressionReadable(expr.toString())
    }
    
    toEditableString() {
        return this.calc.toString()
    }
    
    toString(forceSign=false) {
        var str = this.calc.toString()
        if(str[0] == "(") str = str.substr(1)
        if(str[str.length - 1] == ")") str = str.substr(0, str.length - 1)
        str = Utils.makeExpressionReadable(str)
        if(str[0] != '-' && forceSign) str = '+' + str
        return str
    }
}

function executeExpression(expr){
    return (new Expression(expr.toString())).execute()
}

// Domains

class EmptySet {
    constructor() {}
    
    includes(x) { return false }
    
    toString() { return "∅" }
    
    static import(frm) { return new EmptySet() }
}

class Domain {
    constructor(begin, end, openBegin, openEnd) {
        if(typeof begin == 'number' || typeof begin == 'string') begin = new Expression(begin.toString())
        this.begin = begin
        if(typeof end == 'number' || typeof end == 'string') end = new Expression(end.toString())
        this.end = end
        this.openBegin = openBegin
        this.openEnd = openEnd
        this.displayName = (openBegin ? "]" : "[") + begin.toString() + ";" + end.toString() + (openEnd ? "[" : "]")
    }
    
    includes(x) {
        if(typeof x == 'string') x = executeExpression(x)
        return ((this.openBegin && x > this.begin.execute()) || (!this.openBegin && x >= this.begin.execute())) &&
            ((this.openEnd && x < this.end.execute()) || (!this.openEnd && x <= this.end.execute()))
    }
    
    toString() {
        return this.displayName
    }
    
    static importFrom(frm) {
        switch(frm.trim().toUpperCase()) {
            case "R":
            case "ℝ":
                return Domain.R
                break;
            case "RE":
            case "R*":
            case "ℝ*":
                return Domain.RE
                break;
            case "RP":
            case "R+":
            case "ℝ⁺":
                return Domain.RP
                break;
            case "RM":
            case "R-":
            case "ℝ⁻":
                return Domain.RM
                break;
            case "RPE":
            case "REP":
            case "R+*":
            case "R*+":
            case "ℝ*⁺":
            case "ℝ⁺*":
                return Domain.RPE
                break;
            case "RME":
            case "REM":
            case "R-*":
            case "R*-":
            case "ℝ⁻*":
            case "ℝ*⁻":
                return Domain.RME
                break;
            default:
                var openBegin = frm.trim().charAt(0) == "]"
                var openEnd = frm.trim().charAt(frm.length -1) == "["
                var [begin, end] = frm.substr(1, frm.length-2).split(";")
                return new Domain(begin.trim(), end.trim(), openBegin, openEnd)
                break;
        }
    }
}
Domain.R = new Domain(-Infinity,Infinity,true,true)
Domain.R.displayName = "ℝ"
Domain.RP = new Domain(0,Infinity,true,false)
Domain.RP.displayName = "ℝ⁺"
Domain.RM = new Domain(-Infinity,0,true,false)
Domain.RM.displayName = "ℝ⁻"
Domain.RPE = new Domain(0,Infinity,true,true)
Domain.RPE.displayName = "ℝ⁺*"
Domain.RME = new Domain(-Infinity,0,true,true)
Domain.RME.displayName = "ℝ⁻*"

class DomainSet {
    constructor(values) {
        var newVals = []
        values.forEach(function(value){
            newVals.push(new Expression(value.toString()))
        })
        this.values = newVals
    }
    
    includes(x) {
        if(typeof x == 'string') x = executeExpression(x)
        var found = false
        this.values.forEach(function(value){
            if(x == value.execute()) {
                found = true
                return
            }
        })
        return found
    }
    
    toString() {
        return "{" + this.values.join(";") + "}"
    }
    
    static importFrom(frm) {
        return new DomainSet(frm.substr(1, frm.length-2).split(";"))
    }
}

class UnionDomain {
    constructor(dom1, dom2) {
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) || this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + " ∪ " + this.dom2.toString()
    }
    
    static importFrom(frm) {
        var domains = frm.trim().split("∪")
        if(domains.length == 1) domains = frm.trim().split("U") // Fallback
        return new UnionDomain(parseDomain(domains[0].trim()), parseDomain(domains[1].trim()))
    }
}

class IntersectionDomain {
    constructor(dom1, dom2) {
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) && this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + " ∩ " + this.dom2.toString()
    }
    
    static importFrom(frm) {
        var domains = frm.trim().split("∩")
        return new IntersectionDomain(parseDomain(domains[0].trim()), parseDomain(domains[1].trim()))
    }
}

class MinusDomain {
    constructor(dom1, dom2) {
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) && !this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + "∖" + this.dom2.toString()
    }
    
    static importFrom(frm) {
        var domains = frm.trim().split("∖")
        if(domains.length == 1) domains = frm.trim().split("\\") // Fallback
        return new MinusDomain(parseDomain(domains[0].trim()), parseDomain(domains[1].trim()))
    }
}

Domain.RE = new MinusDomain("R", "{0}")
Domain.RE.displayName = "ℝ*"


function parseDomain(domain) {
    if(domain.indexOf("U") >= 0 || domain.indexOf("∪") >= 0) return UnionDomain.importFrom(domain)
    if(domain.indexOf("∩") >= 0) return IntersectionDomain.importFrom(domain)
    if(domain.indexOf("∖") >= 0 || domain.indexOf("\\") >= 0) return MinusDomain.importFrom(domain)
    if(domain.charAt(0) == "{" && domain.charAt(domain.length -1) == "}") return DomainSet.importFrom(domain)
    if(domain.indexOf("]") >= 0 || domain.indexOf("]") >= 0) return Domain.importFrom(domain)
    if(domain.toUpperCase().indexOf("R") >= 0 || domain.indexOf("ℝ") >= 0) return Domain.importFrom(domain)
    return new EmptySet()
}
