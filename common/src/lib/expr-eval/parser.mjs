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

import * as Polyfill from "./polyfill.mjs"
import { ParserState } from "./parserstate.mjs"
import { TEOF, TokenStream } from "./tokens.mjs"
import { ExprEvalExpression } from "./expression.mjs"

const optionNameMap = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    "%": "remainder",
    "^": "power",
    "!": "factorial",
    "<": "comparison",
    ">": "comparison",
    "<=": "comparison",
    ">=": "comparison",
    "==": "comparison",
    "!=": "comparison",
    "||": "concatenate",
    "and": "logical",
    "or": "logical",
    "not": "logical",
    "?": "conditional",
    ":": "conditional",
    "[": "array"
}

export class Parser {
    constructor(options) {
        this.options = options || {}
        this.unaryOps = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sinh: Math.sinh || Polyfill.sinh,
            cosh: Math.cosh || Polyfill.cosh,
            tanh: Math.tanh || Polyfill.tanh,
            asinh: Math.asinh || Polyfill.asinh,
            acosh: Math.acosh || Polyfill.acosh,
            atanh: Math.atanh || Polyfill.atanh,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt || Polyfill.cbrt,
            log: Math.log,
            log2: Math.log2 || Polyfill.log2,
            ln: Math.log,
            lg: Math.log10 || Polyfill.log10,
            log10: Math.log10 || Polyfill.log10,
            expm1: Math.expm1 || Polyfill.expm1,
            log1p: Math.log1p || Polyfill.log1p,
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            trunc: Math.trunc || Polyfill.trunc,
            "-": Polyfill.neg,
            "+": Number,
            exp: Math.exp,
            not: Polyfill.not,
            length: Polyfill.stringOrArrayLength,
            "!": Polyfill.factorial,
            sign: Math.sign || Polyfill.sign
        }
        this.unaryOpsList = Object.keys(this.unaryOps)

        this.binaryOps = {
            "+": Polyfill.add,
            "-": Polyfill.sub,
            "*": Polyfill.mul,
            "/": Polyfill.div,
            "%": Polyfill.mod,
            "^": Math.pow,
            "||": Polyfill.concat,
            "==": Polyfill.equal,
            "!=": Polyfill.notEqual,
            ">": Polyfill.greaterThan,
            "<": Polyfill.lessThan,
            ">=": Polyfill.greaterThanEqual,
            "<=": Polyfill.lessThanEqual,
            and: Polyfill.andOperator,
            or: Polyfill.orOperator,
            "in": Polyfill.inOperator,
            "[": Polyfill.arrayIndex
        }

        this.ternaryOps = {
            "?": Polyfill.condition
        }

        this.functions = {
            random: Polyfill.random,
            fac: Polyfill.factorial,
            min: Polyfill.min,
            max: Polyfill.max,
            hypot: Math.hypot || Polyfill.hypot,
            pyt: Math.hypot || Polyfill.hypot, // backward compat
            pow: Math.pow,
            atan2: Math.atan2,
            "if": Polyfill.condition,
            gamma: Polyfill.gamma,
            "Γ": Polyfill.gamma,
            roundTo: Polyfill.roundTo,
            map: Polyfill.arrayMap,
            fold: Polyfill.arrayFold,
            filter: Polyfill.arrayFilter,
            indexOf: Polyfill.stringOrArrayIndexOf,
            join: Polyfill.arrayJoin
        }

        // These constants will automatically be replaced the MOMENT they are parsed.
        // (Original consts from the parser)
        this.builtinConsts = {}
        // These consts will only be replaced when the expression is evaluated.
        this.consts = {}

    }

    parse(expr) {
        const instr = []
        const parserState = new ParserState(
            this,
            new TokenStream(this, expr),
            { allowMemberAccess: this.options.allowMemberAccess }
        )

        parserState.parseExpression(instr)
        parserState.expect(TEOF, QT_TRANSLATE_NOOP("error", "EOF"))

        return new ExprEvalExpression(instr, this)
    }

    evaluate(expr, variables) {
        return this.parse(expr).evaluate(variables)
    }

    isOperatorEnabled(op) {
        const optionName = optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op
        const operators = this.options.operators || {}

        return !(optionName in operators) || !!operators[optionName]
    }
}