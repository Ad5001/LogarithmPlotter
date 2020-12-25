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

var u = {1: 1, 2: 2, 3: 3}
console.log(parser.parse('u[n]+u[n+1]+u[n+2]').simplify().evaluate({"u": u, 'n': 1}))

var evalVariables = { // Variables not provided by expr-eval.js, needs to be provided manualy
    "pi": Math.PI,
    "π": Math.PI,
    "inf": Infinity,
    "Infinity": Infinity,
    "∞": Infinity,
    "e": Math.E,
    "E": Math.E
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
        var str = Utils.makeExpressionReadable(this.calc.toString())
        if(str[0] != '-' && forceSign) str = '+' + str
        return str
    }
}

function executeExpression(expr){
    return (new Expression(expr.toString())).execute()
}

class Sequence extends Expression {
    constructor(name, baseValues = {}, valuePlus = 1, expr = "") {
        // u[n+valuePlus] = expr
        console.log('Expression', expr)
        super(expr)
        this.name = name
        this.baseValues = baseValues
        this.valuePlus = valuePlus
    }
    
    isConstant() {
        return this.expr.indexOf("n") == -1
    }
    
    execute(n = 0) {
        if(this.cached) return this.cachedValue
        if(n in this.baseValues) return this.baseValues[n]
        var vars = Object.assign({'n': n-this.valuePlus}, evalVariables)
        vars[this.name] = this.baseValues
        var un = this.calc.evaluate(vars)
        this.baseValues[n] = un
        return un
    }
}

var test = new Sequence('u', {0: 0, 1: 1}, 2, '3*u[n]+3')
console.log(test)
for(var i=0; i<20; i++)
    console.log('u' + Utils.textsub(i) + ' = ' + test.execute(i))

// Domains
class Domain {
    constructor() {}
    
    includes(x) { return false }
    
    toString() { return '???' }
    
    union(domain) { return domain }
    
    intersection(domain) { return this }
    
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
            case "ℕ":
            case "N":
            case "ZP":
            case "ℤ⁺":
                return Domain.N
                break;
            case "NLOG":
            case "ℕˡᵒᵍ":
                return Domain.NLog
                break;
            case "NE":
            case "NP":
            case "N*":
            case "N+":
            case "ℕ*":
            case "ℕ⁺":
            case "ZPE":
            case "ZEP":
            case "Z+*":
            case "Z*+":
            case "ℤ⁺*":
            case "ℤ*⁺":
                return Domain.NE
                break;
            case "Z":
            case "ℤ":
                return Domain.Z
                break;
            case "ZM":
            case "Z-":
            case "ℤ⁻":
                return Domain.ZM
                break;
            case "ZME":
            case "ZEM":
            case "Z-*":
            case "Z*-":
            case "ℤ⁻*":
            case "ℤ*⁻":
                return Domain.ZME
                break;
            case "ZE":
            case "Z*":
            case "ℤ*":
                return Domain.ZE
                break;
            default:
                return new EmptySet()
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

class SpecialDomain extends Domain {
    // For special domains (N, Z...)
    // isValidExpr is function returning true when number is in domain
    // false when it isn't.
    // nextValue provides the next positive value in the domain
    // after the one given.
    constructor(displayName, isValid, next = x => true, previous = x => true, 
                moveSupported = true) {
        super()
        this.displayName = displayName
        this.isValid = isValid
        this.nextValue = next
        this.prevValue = previous
        this.moveSupported = moveSupported
    }
    
    includes(x) {
        if(typeof x == 'string') x = executeExpression(x)
        return this.isValid(x)
    }
    
    next(x) {
        if(typeof x == 'string') x = executeExpression(x)
        return this.nextValue(x)
    }
    
    previous(x) {
        if(typeof x == 'string') x = executeExpression(x)
        return this.prevValue(x)
    }
    
    toString() {
        return this.displayName
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof UnionDomain) return new UnionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return new UnionDomain(this, domain)
        if(domain instanceof MinusDomain) return new UnionDomain(this, domain)
        if(domain instanceof Interval) return new UnionDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof Interval) return new IntersectionDomain(this, domain)
    }
}


class DomainSet extends SpecialDomain {
    constructor(values) {
        super('', x => true, x => x, true)
        console.log(values)
        var newVals = {}
        this.executedValues = []
        for(var value of values) {
            var expr = new Expression(value.toString())
            var ex = expr.execute()
            newVals[ex] = expr
            this.executedValues.push(ex)
        }
        this.executedValues.sort((a,b) => a-b)
        this.values = this.executedValues.map(val => newVals[val])
    }
    
    includes(x) {
        if(typeof x == 'string') x = executeExpression(x)
        for(var value of this.values)
            if(x == value.execute()) return true
        return false
    }
    
    next(x) {
        if(typeof x == 'string') x = executeExpression(x)
        if(x < this.executedValues[0]) return this.executedValues[0]
        for(var i = 1; i < this.values.length; i++) {
            var prevValue = this.executedValues[i-1]
            var value = this.executedValues[i]
            if(x >= prevValue && x < value) return value
        }
        return null
    }
    
    previous(x) {
        if(typeof x == 'string') x = executeExpression(x)
        if(x > this.executedValues[this.executedValues.length-1]) 
            return this.executedValues[this.executedValues.length-1]
        for(var i = 1; i < this.values.length; i++) {
            var prevValue = this.executedValues[i-1]
            var value = this.executedValues[i]
            if(x > prevValue && x <= value) return prevValue
        }
        return null
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
        for(var value in this.values) {
            var value = this.executedValues[i]
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
        for(var i in this.values) {
            var value = this.executedValues[i]
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
        var dom2 = parseDomain(domains.join('∩'))
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
Domain.N = new SpecialDomain('ℕ', x => x%1==0 && x >= 0, 
                             x => Math.max(Math.floor(x)+1, 0), 
                             x => Math.max(Math.ceil(x)-1, 0))
Domain.NE = new SpecialDomain('ℕ*', x => x%1==0 && x > 0, 
                              x => Math.max(Math.floor(x)+1, 1), 
                              x => Math.max(Math.ceil(x)-1, 1))
Domain.Z = new SpecialDomain('ℤ', x => x%1==0, x => Math.floor(x)+1, x => Math.ceil(x)-1)
Domain.ZE = new SpecialDomain('ℤ*', x => x%1==0 && x != 0, 
                              x => Math.floor(x)+1 == 0 ? Math.floor(x)+2 : Math.floor(x)+1, 
                              x => Math.ceil(x)-1 == 0 ? Math.ceil(x)-2 : Math.ceil(x)-1)
Domain.ZM = new SpecialDomain('ℤ⁻', x => x%1==0 && x <= 0,
                              x => Math.min(Math.floor(x)+1, 0),
                              x => Math.min(Math.ceil(x)-1, 0))
Domain.ZME = new SpecialDomain('ℤ⁻*', x => x%1==0 && x < 0, 
                               x => Math.min(Math.floor(x)+1, -1), 
                               x => Math.min(Math.ceil(x)-1, -1))
Domain.NLog = new SpecialDomain('ℕˡᵒᵍ', 
                                x => x/Math.pow(10, x.toString().length-1) % 1 == 0 && x > 0, 
                                function(x) {
                                    var x10pow = Math.pow(10, x.toString().length-1)
                                    return Math.max(1, (Math.floor(x/x10pow)+1)*x10pow)
                                }, 
                                function(x) {
                                    var x10pow = Math.pow(10, x.toString().length-1)
                                    return Math.max(1, (Math.ceil(x/x10pow)-1)*x10pow)
                                })

var refedDomains = []

function parseDomain(domain) {
    if(!domain.includes(')') && !domain.includes('(')) return parseDomainSimple(domain)
    var domStr
    while((domStr = /\(([^)(]+)\)/.exec(domain)) !== null) {
        var dom = parseDomainSimple(domStr[1].trim());
        domain = domain.replace(domStr[0], 'D' + refedDomains.length)
        refedDomains.push(dom)
    }
    return parseDomainSimple(domain)
}

function parseDomainSimple(domain) {
    domain = domain.trim()
    if(domain.includes("U") || domain.includes("∪")) return UnionDomain.import(domain)
    if(domain.includes("∩")) return IntersectionDomain.import(domain)
    if(domain.includes("∖") || domain.includes("\\")) return MinusDomain.import(domain)
    if(domain.charAt(0) == "{" && domain.charAt(domain.length -1) == "}") return DomainSet.import(domain)
    if(domain.includes("]") || domain.includes("[")) return Interval.import(domain)
    if(["R", "ℝ", "N", "ℕ", "Z", "ℤ"].some(str => domain.toUpperCase().includes(str)))
        return Domain.import(domain)
    if(domain[0] == 'D') return refedDomains[parseInt(domain.substr(1))]
    return new EmptySet()
}
