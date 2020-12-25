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
    
    duplicate() {
        return new Expression(this.toEditableString())
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
class Domain {
    constructor() {}
    
    includes(x) { return false }
    
    toString() { return '???' }
    
    union(domain) { return domain }
    
    intersection(domain) { return this }
    
    static import(frm) { return new EmptySet() }
    
    static import(frm) {
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
                return EmptySet()
                break;
        }
    }
}

class EmptySet extends Domain {
    
    includes(x) { return false }
    
    toString() { return "∅" }
    
    union(domain) { return domain }
    
    intersection(domain) { return this }
    
    static import(frm) { return new EmptySet() }
}

class Interval extends Domain {
    constructor(begin, end, openBegin, openEnd) {
        super()
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
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof UnionDomain) return domain.union(this)
        if(domain instanceof IntersectionDomain) return new UnionDomain(this, domain)
        if(domain instanceof MinusDomain) return new UnionDomain(this, domain)
        if(domain instanceof Interval) return new UnionDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return domain.intersection(this)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof Interval) return new IntersectionDomain(this, domain)
    }
    
    static import(frm) {
        var openBegin = frm.trim().charAt(0) == "]"
        var openEnd = frm.trim().charAt(frm.length -1) == "["
        var [begin, end] = frm.substr(1, frm.length-2).split(";")
        return new Interval(begin.trim(), end.trim(), openBegin, openEnd)
    }
}
Domain.R = new Interval(-Infinity,Infinity,true,true)
Domain.R.displayName = "ℝ"
Domain.RP = new Interval(0,Infinity,true,false)
Domain.RP.displayName = "ℝ⁺"
Domain.RM = new Interval(-Infinity,0,true,false)
Domain.RM.displayName = "ℝ⁻"
Domain.RPE = new Interval(0,Infinity,true,true)
Domain.RPE.displayName = "ℝ⁺*"
Domain.RME = new Interval(-Infinity,0,true,true)
Domain.RME.displayName = "ℝ⁻*"

class DomainSet extends Domain {
    constructor(values) {
        super()
        var newVals = []
        values.forEach(function(value){
            newVals.push(new Expression(value.toString()))
        })
        this.values = newVals
    }
    
    includes(x) {
        if(typeof x == 'string') x = executeExpression(x)
        for(var i = 0; i < this.values.length; i++)
            if(x == this.values[i].execute()) return true
        return false
    }
    
    toString() {
        return "{" + this.values.join(";") + "}"
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) {
            var newValues = []
            var values = this.values.concat(domain.values).filter(function(val){
                newValues.push(val.execute())
                return newValues.indexOf(val.execute()) == newValues.length - 1
            })
            return new DomainSet(values)
        }
        var notIncludedValues = []
        for(var i = 0; i < this.values.length; i++) {
            var value = this.values[i].execute()
            if(domain instanceof Interval) {
                if(domain.begin.execute() == value && domain.openBegin) {
                    domain.openBegin = false
                }
                if(domain.end.execute() == value && domain.openEnd) {
                    domain.openEnd = false
                }
            }
            if(!domain.includes(value)) 
                notIncludedValues.push(this.values[i].toEditableString())
        }
        if(notIncludedValues.length == 0) return domain
        return new UnionDomain(domain, new DomainSet(notIncludedValues))
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) {
            var domValues = domain.values.map(expr => expr.execute())
            this.values = this.values.filter(function(val){
                return domValues.indexOf(val.execute()) >= 0
            })
            return this
        }
        var includedValues = []
        for(var i = 0; i < this.values.length; i++) {
            var value = this.values[i].execute()
            if(domain instanceof Interval) {
                if(domain.begin.execute() == value && !domain.openBegin) {
                    domain.openBegin = false
                }
                if(domain.end.execute() == value && !domain.openEnd) {
                    domain.openEnd = false
                }
            }
            if(domain.includes(value)) 
                includedValues.push(this.values[i].toEditableString())
        }
        if(includedValues.length == 0) return new EmptySet()
        if(includedValues.length == this.values.length) return this
        return new IntersectionDomain(domain, new DomainSet(includedValues))
    }
    
    static import(frm) {
        return new DomainSet(frm.substr(1, frm.length-2).split(";"))
    }
}

class UnionDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) || this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + " ∪ " + this.dom2.toString()
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof Interval) return domain.union(this)
        if(domain instanceof UnionDomain) return new UnionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return new UnionDomain(this, domain)
        if(domain instanceof MinusDomain) return new MinusDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return this.dom1.intersection(domain.dom1).intersection(this.dom2).intersection(domain.dom2)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
    }
    
    static import(frm) {
        var domains = frm.trim().split("∪")
        if(domains.length == 1) domains = frm.trim().split("U") // Fallback
        var dom1 = parseDomain(domains.pop())
        var dom2 = parseDomain(domains.join('∪'))
        console.log('Union', dom1, dom2)
        return dom1.union(dom2)
    }
}

class IntersectionDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) && this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + " ∩ " + this.dom2.toString()
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof Interval) return domain.union(this)
        if(domain instanceof UnionDomain) return  this.dom1.union(domain.dom1).union(this.dom2).union(domain.dom2)
        if(domain instanceof IntersectionDomain) return new UnionDomain(this, domain)
        if(domain instanceof MinusDomain) return new MinusDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
    }
    
    static import(frm) {
        var domains = frm.trim().split("∩")
        var dom1 = parseDomain(domains.pop())
        var dom2 = parseDomain(domains.join('∪'))
        return dom1.intersection(dom2)
    }
}

class MinusDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
    }
    
    includes(x) {
        return this.dom1.includes(x) && !this.dom2.includes(x)
    }
    
    toString() {
        return this.dom1.toString() + "∖" + this.dom2.toString()
    }
    
    static import(frm) {
        var domains = frm.trim().split("∖")
        if(domains.length == 1) domains = frm.trim().split("\\") // Fallback
        var dom1 = parseDomain(domains.pop())
        var dom2 = parseDomain(domains.join('∪'))
        return new MinusDomain(dom1, dom2)
    }
}

Domain.RE = new MinusDomain("R", "{0}")
Domain.RE.displayName = "ℝ*"

var refedDomains = []

function parseDomain(domain) {
    if(!domain.includes(')') && !domain.includes('(')) return parseDomainSimple(domain)
    var domStr
    while((domStr = /\(([^)(]+)\)/.exec(domain)) !== null) {
        var dom = parseDomainSimple(domStr[1]);
        console.log(domain, domStr[0])
        domain = domain.replace(domStr[0], 'D' + refedDomains.length)
        refedDomains.push(dom)
    }
    return parseDomainSimple(domain)
}

function parseDomainSimple(domain) {
    console.log('Parsing domain', domain, typeof domain)
    if(domain[0] == 'D') return refedDomains[parseInt(domain.substr(1))]
    if(domain.indexOf("U") >= 0 || domain.indexOf("∪") >= 0) return UnionDomain.import(domain)
    if(domain.indexOf("∩") >= 0) return IntersectionDomain.import(domain)
    if(domain.indexOf("∖") >= 0 || domain.indexOf("\\") >= 0) return MinusDomain.import(domain)
    if(domain.charAt(0) == "{" && domain.charAt(domain.length -1) == "}") return DomainSet.import(domain)
    if(domain.indexOf("]") >= 0 || domain.indexOf("[") >= 0) return Interval.import(domain)
    if(domain.toUpperCase().indexOf("R") >= 0 || domain.indexOf("ℝ") >= 0) return Domain.import(domain)
    return new EmptySet()
}
