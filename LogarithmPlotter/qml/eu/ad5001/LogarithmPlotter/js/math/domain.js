/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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

.import "expression.js" as Expr

/**
 * Main abstract domain class
 * It doesn't represent any kind of domain and is meant to be extended.
 */
class Domain {
    constructor() {}
    
    /**
     * Checks whether x is included in the domain.
     * @param {number} x - The x value.
     * @return {bool} true if included, false otherwise.
     */
    includes(x) { return false }
    
    /**
     * Returns a string representation of the domain.
     * @return {string} String representation of the domain.
     */
    toString() { return '???' }
    
    /**
     * Returns a new domain that is the union between this domain and another.
     * @param {Domain} domain - Domain to unionise with this.
     * @return {Domain} newly created domain.
     */
    union(domain) { return domain }
    
    /**
     * Returns a new domain that is the intersection between this domain and another.
     * @param {Domain} domain - Domain to get the interscection with this.
     * @return {Domain} newly created domain.
     */
    intersection(domain) { return this }
    
    /**
     * Imports a domain from a string.
     * @return {Domain} Found domain, string otherwise.
     */
    static import(frm) {
        switch(frm.trim().toUpperCase()) {
            case "R":
            case "???":
                return Domain.R
                break;
            case "RE":
            case "R*":
            case "???*":
                return Domain.RE
                break;
            case "RP":
            case "R+":
            case "??????":
                return Domain.RP
                break;
            case "RM":
            case "R-":
            case "??????":
                return Domain.RM
                break;
            case "RPE":
            case "REP":
            case "R+*":
            case "R*+":
            case "???*???":
            case "??????*":
                return Domain.RPE
                break;
            case "RME":
            case "REM":
            case "R-*":
            case "R*-":
            case "??????*":
            case "???*???":
                return Domain.RME
                break;
            case "???":
            case "N":
            case "ZP":
            case "??????":
                return Domain.N
                break;
            case "NLOG":
            case "???????????":
                return Domain.NLog
                break;
            case "NE":
            case "NP":
            case "N*":
            case "N+":
            case "???*":
            case "??????":
            case "ZPE":
            case "ZEP":
            case "Z+*":
            case "Z*+":
            case "??????*":
            case "???*???":
                return Domain.NE
                break;
            case "Z":
            case "???":
                return Domain.Z
                break;
            case "ZM":
            case "Z-":
            case "??????":
                return Domain.ZM
                break;
            case "ZME":
            case "ZEM":
            case "Z-*":
            case "Z*-":
            case "??????*":
            case "???*???":
                return Domain.ZME
                break;
            case "ZE":
            case "Z*":
            case "???*":
                return Domain.ZE
                break;
            default:
                return new EmptySet()
                break;
        }
    }
}

/**
 * Represents an empty set.
 */
class EmptySet extends Domain {
    constructor() {
        super()
        this.displayName = "???"
        this.latexMarkup = "\\emptyset"
    }
    
    includes(x) { return false }
    
    toString() { return this.displayName }
    
    union(domain) { return domain }
    
    intersection(domain) { return this }
    
    static import(frm) { return new EmptySet() }
}

/**
 * Domain classes for ranges (e.g ]0;3[, [1;2[ ...)
 */
class Range extends Domain {
    constructor(begin, end, openBegin, openEnd) {
        super()
        if(typeof begin == 'number' || typeof begin == 'string') begin = new Expr.Expression(begin.toString())
        this.begin = begin
        if(typeof end == 'number' || typeof end == 'string') end = new Expr.Expression(end.toString())
        this.end = end
        this.openBegin = openBegin
        this.openEnd = openEnd
        this.displayName = (openBegin ? "]" : "[") + begin.toString() + ";" + end.toString() + (openEnd ? "[" : "]")
        this.latexMarkup = `\\mathopen${openBegin ? "]" : "["}${this.begin.latexMarkup};${this.end.latexMarkup}\\mathclose${openEnd ? "[" : "]"}`
    }
    
    includes(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
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
        if(domain instanceof Range) return new UnionDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return domain.intersection(this)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof Range) return new IntersectionDomain(this, domain)
    }
    
    static import(frm) {
        var openBegin = frm.trim().charAt(0) == "]"
        var openEnd = frm.trim().charAt(frm.length -1) == "["
        var [begin, end] = frm.substr(1, frm.length-2).split(";")
        return new Range(begin.trim(), end.trim(), openBegin, openEnd)
    }
}

/**
 * Domain classes for special domains (N, Z, ...)
 */
class SpecialDomain extends Domain {
    /**
     * @constructs SpecialDomain
     * @param {string} displayName
     * @param {function} isValid - function returning true when number is in domain false when it isn't.
     * @param {function} next - function provides the next positive value in the domain after the one given.
     * @param {function} previous - function provides the previous positive value in the domain before the one given.
     * @param {bool} moveSupported - Only true if next and previous functions are valid.
     * @param items
     */
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
        if(typeof x == 'string') x = Expr.executeExpression(x)
        return this.isValid(x)
    }
    
    next(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
        return this.nextValue(x)
    }
    
    previous(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
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
        if(domain instanceof Range) return new UnionDomain(this, domain)
    }
    
    intersection(domain) {
        if(domain instanceof EmptySet) return domain
        if(domain instanceof DomainSet) return domain.intersection(this)
        if(domain instanceof UnionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof IntersectionDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof MinusDomain) return new IntersectionDomain(this, domain)
        if(domain instanceof Range) return new IntersectionDomain(this, domain)
    }
}

/**
 * Domain classes for sets (e.g {0;3}, {0;1;2;pi} ...)
 */
class DomainSet extends SpecialDomain {
    constructor(values) {
        super('', x => true, x => x, true)
        var newVals = {}
        this.executedValues = []
        for(var value of values) {
            var expr = new Expr.Expression(value.toString())
            var ex = expr.execute()
            newVals[ex] = expr
            this.executedValues.push(ex)
        }
        this.executedValues.sort((a,b) => a-b)
        this.values = this.executedValues.map(val => newVals[val])
        this.displayName = "{" + this.values.join(";") + "}"
        this.latexMarkup = `\\{${this.values.join(";")}\\}`
    }
    
    includes(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
        for(var value of this.values)
            if(x == value.execute()) return true
        return false
    }
    
    next(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
        if(x < this.executedValues[0]) return this.executedValues[0]
        for(var i = 1; i < this.values.length; i++) {
            var prevValue = this.executedValues[i-1]
            var value = this.executedValues[i]
            if(x >= prevValue && x < value) return value
        }
        return null
    }
    
    previous(x) {
        if(typeof x == 'string') x = Expr.executeExpression(x)
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
        return this.displayName
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
            if(domain instanceof Range) {
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
            if(domain instanceof Range) {
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

/**
 * Domain representing the union between two domains.
 */
class UnionDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
        this.displayName = this.dom1.toString() + " ??? " + this.dom2.toString()
        this.latexMarkup = `${dom1.latexMarkup}\\cup${dom2.latexMarkup}`
    }
    
    includes(x) {
        return this.dom1.includes(x) || this.dom2.includes(x)
    }
    
    toString() {
        return this.displayName
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof Range) return domain.union(this)
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
        var domains = frm.trim().split("???")
        if(domains.length == 1) domains = frm.trim().split("U") // Fallback
        var dom1 = parseDomain(domains.pop())
        var dom2 = parseDomain(domains.join('???'))
        return dom1.union(dom2)
    }
}

/**
 * Domain representing the intersection between two domains.
 */
class IntersectionDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
        this.displayName = dom1.toString() + " ??? " + dom2.toString()
        this.latexMarkup = `${dom1.latexMarkup}\\cap${dom2.latexMarkup}`
    }
    
    includes(x) {
        return this.dom1.includes(x) && this.dom2.includes(x)
    }
    
    toString() {
        return this.displayName
    }
    
    union(domain) {
        if(domain instanceof EmptySet) return this
        if(domain instanceof DomainSet) return domain.union(this)
        if(domain instanceof Range) return domain.union(this)
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
        var domains = frm.trim().split("???")
        var dom1 = parseDomain(domains.pop())
        var dom2 = parseDomain(domains.join('???'))
        return dom1.intersection(dom2)
    }
}

/**
 * Domain representing the minus between two domains.
 */
class MinusDomain extends Domain {
    constructor(dom1, dom2) {
        super()
        this.dom1 = dom1
        this.dom2 = dom2
        this.displayName = dom1.toString() + "???" + dom2.toString()
        this.latexMarkup = `${dom1.latexMarkup}\\setminus${dom2.latexMarkup}`
    }
    
    includes(x) {
        return this.dom1.includes(x) && !this.dom2.includes(x)
    }
    
    toString() {
        return this.displayName
    }
    
    static import(frm) {
        var domains = frm.trim().split("???")
        if(domains.length == 1) domains = frm.trim().split("\\") // Fallback
        var dom1 = parseDomain(domains.shift())
        var dom2 = parseDomain(domains.join('???'))
        return new MinusDomain(dom1, dom2)
    }
}

Domain.RE = new MinusDomain("R", "{0}")
Domain.RE.displayName = "???*"
Domain.RE.latexMarkup = "\\mathbb{R}^{*}"

Domain.R = new Range(-Infinity,Infinity,true,true)
Domain.R.displayName = "???"
Domain.R.latexMarkup = "\\mathbb{R}"
Domain.RP = new Range(0,Infinity,true,false)
Domain.RP.displayName = "??????"
Domain.RP.latexMarkup = "\\mathbb{R}^{+}"
Domain.RM = new Range(-Infinity,0,true,false)
Domain.RM.displayName = "??????"
Domain.RM.latexMarkup = "\\mathbb{R}^{-}"
Domain.RPE = new Range(0,Infinity,true,true)
Domain.RPE.displayName = "??????*"
Domain.RPE.latexMarkup = "\\mathbb{R}^{+*}"
Domain.RME = new Range(-Infinity,0,true,true)
Domain.RME.displayName = "??????*"
Domain.RME.latexMarkup = "\\mathbb{R}^{+*}"
Domain.N = new SpecialDomain('???', x => x%1==0 && x >= 0, 
                             x => Math.max(Math.floor(x)+1, 0), 
                             x => Math.max(Math.ceil(x)-1, 0))
Domain.N.latexMarkup = "\\mathbb{N}"
Domain.NE = new SpecialDomain('???*', x => x%1==0 && x > 0, 
                              x => Math.max(Math.floor(x)+1, 1), 
                              x => Math.max(Math.ceil(x)-1, 1))
Domain.NE.latexMarkup = "\\mathbb{N}^{*}"
Domain.Z = new SpecialDomain('???', x => x%1==0, x => Math.floor(x)+1, x => Math.ceil(x)-1)
Domain.Z.latexMarkup = "\\mathbb{Z}"
Domain.ZE = new SpecialDomain('???*', x => x%1==0 && x != 0, 
                              x => Math.floor(x)+1 == 0 ? Math.floor(x)+2 : Math.floor(x)+1, 
                              x => Math.ceil(x)-1 == 0 ? Math.ceil(x)-2 : Math.ceil(x)-1)
Domain.ZE.latexMarkup = "\\mathbb{Z}^{*}"
Domain.ZM = new SpecialDomain('??????', x => x%1==0 && x <= 0,
                              x => Math.min(Math.floor(x)+1, 0),
                              x => Math.min(Math.ceil(x)-1, 0))
Domain.ZM.latexMarkup = "\\mathbb{Z}^{-}"
Domain.ZME = new SpecialDomain('??????*', x => x%1==0 && x < 0, 
                               x => Math.min(Math.floor(x)+1, -1), 
                               x => Math.min(Math.ceil(x)-1, -1))
Domain.ZME.latexMarkup = "\\mathbb{Z}^{-*}"
Domain.NLog = new SpecialDomain('???????????', 
                                x => x/Math.pow(10, x.toString().length-1) % 1 == 0 && x > 0, 
                                function(x) {
                                    var x10pow = Math.pow(10, x.toString().length-1)
                                    return Math.max(1, (Math.floor(x/x10pow)+1)*x10pow)
                                }, 
                                function(x) {
                                    var x10pow = Math.pow(10, x.toString().length-1)
                                    return Math.max(1, (Math.ceil(x/x10pow)-1)*x10pow)
                                })
Domain.NLog.latexMarkup = "\\mathbb{N}^{log}"

var refedDomains = []

/**
 * Parses a domain, that can use parenthesises.
 * e.g (N ??? [-1;0[) ??? (Z \ {0;3})
 * @param {string} domain - string of the domain to be parsed.
 * @returns {Domain} Parsed domain.
 */
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

/**
 * Parses a domain, without parenthesises.
 * e.g N ??? [-1;0[, Z \ {0;3}, N+*...
 * @param {string} domain - string of the domain to be parsed.
 * @returns {Domain} Parsed domain.
 */
function parseDomainSimple(domain) {
    domain = domain.trim()
    if(domain.includes("U") || domain.includes("???")) return UnionDomain.import(domain)
    if(domain.includes("???")) return IntersectionDomain.import(domain)
    if(domain.includes("???") || domain.includes("\\")) return MinusDomain.import(domain)
    if(domain.charAt(0) == "{" && domain.charAt(domain.length -1) == "}") return DomainSet.import(domain)
    if(domain.includes("]") || domain.includes("[")) return Range.import(domain)
    if(["R", "???", "N", "???", "Z", "???"].some(str => domain.toUpperCase().includes(str)))
        return Domain.import(domain)
    if(domain[0] == 'D') return refedDomains[parseInt(domain.substr(1))]
    return new EmptySet()
}
