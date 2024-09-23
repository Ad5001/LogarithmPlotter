/**
 * Based on ndef.parser, by Raphael Graf <r@undefined.ch>
 * http://www.undefined.ch/mparser/index.html
 *
 * Ported to JavaScript and modified by Matthew Crumley <email@matthewcrumley.com>
 * https://silentmatt.com/javascript-expression-evaluator/
 *
 * Ported to QMLJS with modifications done accordingly done by Ad5001 <mail@ad5001.eu> (https://ad5001.eu)
 *
 * Copyright (c) 2015 Matthew Crumley, 2021-2024 Ad5001
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 * to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 * but don't feel like you have to let me know or ask permission.
 */

import {
    Instruction,
    IOP3, IOP2, IOP1,
    INUMBER, IARRAY,
    IVAR, IVARNAME,
    IEXPR, IEXPREVAL,
    IMEMBER, IFUNCALL,
    IENDSTATEMENT,
    unaryInstruction, binaryInstruction, ternaryInstruction
} from "./instruction.mjs"

/**
 * Simplifies the given instructions
 * @param {Instruction[]} tokens
 * @param {Record.<string, function(any): any>} unaryOps
 * @param {Record.<string, function(any, any): any>} binaryOps
 * @param {Record.<string, function(any, any, any): any>} ternaryOps
 * @param {Record.<string, any>} values
 * @return {Instruction[]}
 */
function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
    const nstack = []
    const newexpression = []
    let n1, n2, n3
    let f
    for(let i = 0; i < tokens.length; i++) {
        let item = tokens[i]
        const type = item.type
        if(type === INUMBER || type === IVARNAME) {
            if(Array.isArray(item.value)) {
                nstack.push.apply(nstack, simplify(item.value.map(function(x) {
                    return new Instruction(INUMBER, x)
                }).concat(new Instruction(IARRAY, item.value.length)), unaryOps, binaryOps, ternaryOps, values))
            } else {
                nstack.push(item)
            }
        } else if(type === IVAR && values.hasOwnProperty(item.value)) {
            item = new Instruction(INUMBER, values[item.value])
            nstack.push(item)
        } else if(type === IOP2 && nstack.length > 1) {
            n2 = nstack.pop()
            n1 = nstack.pop()
            f = binaryOps[item.value]
            item = new Instruction(INUMBER, f(n1.value, n2.value))
            nstack.push(item)
        } else if(type === IOP3 && nstack.length > 2) {
            n3 = nstack.pop()
            n2 = nstack.pop()
            n1 = nstack.pop()
            if(item.value === "?") {
                nstack.push(n1.value ? n2.value : n3.value)
            } else {
                f = ternaryOps[item.value]
                item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value))
                nstack.push(item)
            }
        } else if(type === IOP1 && nstack.length > 0) {
            n1 = nstack.pop()
            f = unaryOps[item.value]
            item = new Instruction(INUMBER, f(n1.value))
            nstack.push(item)
        } else if(type === IEXPR) {
            while(nstack.length > 0) {
                newexpression.push(nstack.shift())
            }
            newexpression.push(new Instruction(IEXPR, simplify(item.value, unaryOps, binaryOps, ternaryOps, values)))
        } else if(type === IMEMBER && nstack.length > 0) {
            n1 = nstack.pop()
            if(item.value in n1.value)
                nstack.push(new Instruction(INUMBER, n1.value[item.value]))
            else
                throw new Error(qsTranslate("error", "Cannot find property %1 of object %2.").arg(item.value).arg(n1))
        } else {
            while(nstack.length > 0) {
                newexpression.push(nstack.shift())
            }
            newexpression.push(item)
        }
    }
    while(nstack.length > 0) {
        newexpression.push(nstack.shift())
    }
    return newexpression
}

/**
 * In the given instructions, replaces variable by expr.
 * @param {Instruction[]} tokens
 * @param {string} variable
 * @param {number} expr
 * @return {Instruction[]}
 */
function substitute(tokens, variable, expr) {
    const newexpression = []
    for(let i = 0; i < tokens.length; i++) {
        let item = tokens[i]
        const type = item.type
        if(type === IVAR && item.value === variable) {
            for(let j = 0; j < expr.tokens.length; j++) {
                const expritem = expr.tokens[j]
                let replitem
                if(expritem.type === IOP1) {
                    replitem = unaryInstruction(expritem.value)
                } else if(expritem.type === IOP2) {
                    replitem = binaryInstruction(expritem.value)
                } else if(expritem.type === IOP3) {
                    replitem = ternaryInstruction(expritem.value)
                } else {
                    replitem = new Instruction(expritem.type, expritem.value)
                }
                newexpression.push(replitem)
            }
        } else if(type === IEXPR) {
            newexpression.push(new Instruction(IEXPR, substitute(item.value, variable, expr)))
        } else {
            newexpression.push(item)
        }
    }
    return newexpression
}

/**
 * Evaluates the given instructions for a given Expression with given values.
 * @param {Instruction[]} tokens
 * @param {ExprEvalExpression} expr
 * @param {Record.<string, number>} values
 * @return {number}
 */
function evaluate(tokens, expr, values) {
    const nstack = []
    let n1, n2, n3
    let f, args, argCount

    if(isExpressionEvaluator(tokens)) {
        return resolveExpression(tokens, values)
    }

    for(let i = 0; i < tokens.length; i++) {
        const item = tokens[i]
        const type = item.type
        if(type === INUMBER || type === IVARNAME) {
            nstack.push(item.value)
        } else if(type === IOP2) {
            n2 = nstack.pop()
            n1 = nstack.pop()
            if(item.value === "and") {
                nstack.push(n1 ? !!evaluate(n2, expr, values) : false)
            } else if(item.value === "or") {
                nstack.push(n1 ? true : !!evaluate(n2, expr, values))
            } else if(item.value === "=") {
                f = expr.binaryOps[item.value]
                nstack.push(f(n1, evaluate(n2, expr, values), values))
            } else {
                f = expr.binaryOps[item.value]
                nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)))
            }
        } else if(type === IOP3) {
            n3 = nstack.pop()
            n2 = nstack.pop()
            n1 = nstack.pop()
            if(item.value === "?") {
                nstack.push(evaluate(n1 ? n2 : n3, expr, values))
            } else {
                f = expr.ternaryOps[item.value]
                nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)))
            }
        } else if(type === IVAR) {
            // Check for variable value
            if(/^__proto__|prototype|constructor$/.test(item.value)) {
                throw new Error("WARNING: Prototype access detected and denied. If you downloaded this file from the internet, this file might be a virus.")
            } else if(item.value in expr.functions) {
                nstack.push(expr.functions[item.value])
            } else if(item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
                nstack.push(expr.unaryOps[item.value])
            } else {
                const v = values[item.value]
                if(v !== undefined) {
                    nstack.push(v)
                } else {
                    throw new Error(qsTranslate("error", "Undefined variable %1.").arg(item.value))
                }
            }
        } else if(type === IOP1) {
            n1 = nstack.pop()
            f = expr.unaryOps[item.value]
            nstack.push(f(resolveExpression(n1, values)))
        } else if(type === IFUNCALL) {
            argCount = item.value
            args = []
            while(argCount-- > 0) {
                args.unshift(resolveExpression(nstack.pop(), values))
            }
            f = nstack.pop()
            if(f.apply && f.call) {
                nstack.push(f.apply(undefined, args))
            } else if(f.execute) {
                // Objects & expressions execution
                if(args.length >= 1)
                    nstack.push(f.execute.apply(f, args))
                else
                    throw new Error(qsTranslate("error", "In order to be executed, object %1 must have at least one argument.").arg(f))
            } else {
                throw new Error(qsTranslate("error", "%1 cannot be executed.").arg(f))
            }
        } else if(type === IEXPR) {
            nstack.push(createExpressionEvaluator(item, expr))
        } else if(type === IEXPREVAL) {
            nstack.push(item)
        } else if(type === IMEMBER) {
            n1 = nstack.pop()
            if(item.value in n1)
                if(n1[item.value].execute && n1[item.value].cached)
                    nstack.push(n1[item.value].execute())
                else
                    nstack.push(n1[item.value])
            else
                throw new Error(qsTranslate("error", "Cannot find property %1 of object %2.").arg(item.value).arg(n1))
        } else if(type === IENDSTATEMENT) {
            nstack.pop()
        } else if(type === IARRAY) {
            argCount = item.value
            args = []
            while(argCount-- > 0) {
                args.unshift(nstack.pop())
            }
            nstack.push(args)
        } else {
            throw new Error(qsTranslate("error", "Invalid expression."))
        }
    }
    if(nstack.length > 1) {
        throw new Error(qsTranslate("error", "Invalid expression (parity)."))
    }
    // Explicitly return zero to avoid test issues caused by -0
    return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values)
}

function createExpressionEvaluator(token, expr) {
    if(isExpressionEvaluator(token)) return token
    return {
        type: IEXPREVAL,
        value: function(scope) {
            return evaluate(token.value, expr, scope)
        }
    }
}

function isExpressionEvaluator(n) {
    return n && n.type === IEXPREVAL
}

function resolveExpression(n, values) {
    return isExpressionEvaluator(n) ? n.value(values) : n
}

/**
 * Converts the given instructions to a string
 * If toJS is active, can be evaluated with eval, otherwise it can be reparsed by the parser.
 * @param {Instruction[]} tokens
 * @param {boolean} toJS
 * @return {string}
 */
function expressionToString(tokens, toJS) {
    let nstack = []
    let n1, n2, n3
    let f, args, argCount
    for(let i = 0; i < tokens.length; i++) {
        const item = tokens[i]
        const type = item.type
        if(type === INUMBER) {
            if(typeof item.value === "number" && item.value < 0) {
                nstack.push("(" + item.value + ")")
            } else if(Array.isArray(item.value)) {
                nstack.push("[" + item.value.map(escapeValue).join(", ") + "]")
            } else {
                nstack.push(escapeValue(item.value))
            }
        } else if(type === IOP2) {
            n2 = nstack.pop()
            n1 = nstack.pop()
            f = item.value
            if(toJS) {
                if(f === "^") {
                    nstack.push("Math.pow(" + n1 + ", " + n2 + ")")
                } else if(f === "and") {
                    nstack.push("(!!" + n1 + " && !!" + n2 + ")")
                } else if(f === "or") {
                    nstack.push("(!!" + n1 + " || !!" + n2 + ")")
                } else if(f === "||") {
                    nstack.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((" + n1 + "),(" + n2 + ")))")
                } else if(f === "==") {
                    nstack.push("(" + n1 + " === " + n2 + ")")
                } else if(f === "!=") {
                    nstack.push("(" + n1 + " !== " + n2 + ")")
                } else if(f === "[") {
                    nstack.push(n1 + "[(" + n2 + ") | 0]")
                } else {
                    nstack.push("(" + n1 + " " + f + " " + n2 + ")")
                }
            } else {
                if(f === "[") {
                    nstack.push(n1 + "[" + n2 + "]")
                } else {
                    nstack.push("(" + n1 + " " + f + " " + n2 + ")")
                }
            }
        } else if(type === IOP3) {
            n3 = nstack.pop()
            n2 = nstack.pop()
            n1 = nstack.pop()
            f = item.value
            if(f === "?") {
                nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")")
            } else {
                throw new Error(qsTranslate("error", "Invalid expression."))
            }
        } else if(type === IVAR || type === IVARNAME) {
            nstack.push(item.value)
        } else if(type === IOP1) {
            n1 = nstack.pop()
            f = item.value
            if(f === "-" || f === "+") {
                nstack.push("(" + f + n1 + ")")
            } else if(toJS) {
                if(f === "not") {
                    nstack.push("(" + "!" + n1 + ")")
                } else if(f === "!") {
                    nstack.push("fac(" + n1 + ")")
                } else {
                    nstack.push(f + "(" + n1 + ")")
                }
            } else if(f === "!") {
                nstack.push("(" + n1 + "!)")
            } else {
                nstack.push("(" + f + " " + n1 + ")")
            }
        } else if(type === IFUNCALL) {
            argCount = item.value
            args = []
            while(argCount-- > 0) {
                args.unshift(nstack.pop())
            }
            f = nstack.pop()
            nstack.push(f + "(" + args.join(", ") + ")")
        } else if(type === IMEMBER) {
            n1 = nstack.pop()
            nstack.push(n1 + "." + item.value)
        } else if(type === IARRAY) {
            argCount = item.value
            args = []
            while(argCount-- > 0) {
                args.unshift(nstack.pop())
            }
            nstack.push("[" + args.join(", ") + "]")
        } else if(type === IEXPR) {
            nstack.push("(" + expressionToString(item.value, toJS) + ")")
        } else if(type === IENDSTATEMENT) {

        } else {
            throw new Error(qsTranslate("error", "Invalid expression."))
        }
    }
    if(nstack.length > 1) {
        if(toJS) {
            nstack = [nstack.join(",")]
        } else {
            nstack = [nstack.join(";")]
        }
    }
    return String(nstack[0])
}

export function escapeValue(v) {
    if(typeof v === "string") {
        return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")
    }
    return v
}

/**
 * Pushes all symbols from tokens into the symbols array.
 * @param {Instruction[]} tokens
 * @param {string[]} symbols
 * @param {{withMembers: (boolean|undefined)}}options
 */
function getSymbols(tokens, symbols, options) {
    options = options || {}
    const withMembers = !!options.withMembers
    let prevVar = null

    for(let i = 0; i < tokens.length; i++) {
        const item = tokens[i]
        if(item.type === IVAR || item.type === IVARNAME) {
            if(!withMembers && !symbols.includes(item.value)) {
                symbols.push(item.value)
            } else if(prevVar !== null) {
                if(!symbols.includes(prevVar)) {
                    symbols.push(prevVar)
                }
                prevVar = item.value
            } else {
                prevVar = item.value
            }
        } else if(item.type === IMEMBER && withMembers && prevVar !== null) {
            prevVar += "." + item.value
        } else if(item.type === IEXPR) {
            getSymbols(item.value, symbols, options)
        } else if(prevVar !== null) {
            if(!symbols.includes(prevVar)) {
                symbols.push(prevVar)
            }
            prevVar = null
        }
    }

    if(prevVar !== null && !symbols.includes(prevVar)) {
        symbols.push(prevVar)
    }
}

export class ExprEvalExpression {
    /**
     * @param {Instruction[]} tokens
     * @param {Parser} parser
     */
    constructor(tokens, parser) {
        this.tokens = tokens
        this.parser = parser
        this.unaryOps = parser.unaryOps
        this.binaryOps = parser.binaryOps
        this.ternaryOps = parser.ternaryOps
        this.functions = parser.functions
    }

    /**
     * Simplifies the expression.
     * @param {Object<string, number|ExprEvalExpression>|undefined} values
     * @returns {ExprEvalExpression}
     */
    simplify(values) {
        values = values || {}
        return new ExprEvalExpression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser)
    }

    /**
     * Creates a new expression where the variable is substituted by the given expression.
     * @param {string} variable
     * @param {string|ExprEvalExpression} expr
     * @returns {ExprEvalExpression}
     */
    substitute(variable, expr) {
        if(!(expr instanceof ExprEvalExpression)) {
            expr = this.parser.parse(String(expr))
        }

        return new ExprEvalExpression(substitute(this.tokens, variable, expr), this.parser)
    }

    /**
     * Calculates the value of the expression by giving all variables and their corresponding values.
     * @param {Object<string, number>} values
     * @returns {number}
     */
    evaluate(values) {
        values = Object.assign({}, values, this.parser.consts)
        return evaluate(this.tokens, this, values)
    }

    /**
     * Returns a list of symbols (string of characters) in the expressions.
     * Can be functions, constants, or variables.
     * @returns {string[]}
     */
    symbols(options) {
        options = options || {}
        const vars = []
        getSymbols(this.tokens, vars, options)
        return vars
    }

    toString() {
        return expressionToString(this.tokens, false)
    }


    /**
     * Returns the list of symbols (string of characters) which are not defined
     * as constants or functions.
     * @returns {string[]}
     */
    variables(options) {
        options = options || {}
        const vars = []
        getSymbols(this.tokens, vars, options)
        const functions = this.functions
        const consts = this.parser.consts
        return vars.filter((name) => {
            return !(name in functions) && !(name in consts)
        })
    }


    /**
     * Converts the expression to a JS function.
     * @param {string} param - Parsed variables for the function.
     * @param {Object.<string, (ExprEvalExpression|string)>} variables - Default variables to provide.
     * @returns {function(...any)}
     */
    toJSFunction(param, variables) {
        const expr = this
        const f = new Function(param, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + expressionToString(this.simplify(variables).tokens, true) + "; }") // eslint-disable-line no-new-func
        return function() {
            return f.apply(expr, arguments)
        }
    }
}