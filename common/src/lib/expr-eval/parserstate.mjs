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

import { TBRACKET, TCOMMA, TEOF, TNAME, TNUMBER, TOP, TPAREN, TSTRING } from "./tokens.mjs"
import {
    Instruction,
    IARRAY, IEXPR, IFUNCALL, IMEMBER,
    INUMBER, IVAR,
    ternaryInstruction, binaryInstruction, unaryInstruction
} from "./instruction.mjs"

const COMPARISON_OPERATORS = ["==", "!=", "<", "<=", ">=", ">", "in"]
const ADD_SUB_OPERATORS = ["+", "-", "||"]
const TERM_OPERATORS = ["*", "/", "%"]

export class ParserState {
    /**
     *
     * @param {Parser} parser
     * @param {TokenStream} tokenStream
     * @param {{[operators]: Object.<string, boolean>, [allowMemberAccess]: boolean}} options
     */
    constructor(parser, tokenStream, options) {
        this.parser = parser
        this.tokens = tokenStream
        this.current = null
        this.nextToken = null
        this.next()
        this.savedCurrent = null
        this.savedNextToken = null
        this.allowMemberAccess = options.allowMemberAccess !== false
    }

    /**
     * Queries the next token for parsing.
     * @return {Token}
     */
    next() {
        this.current = this.nextToken
        this.nextToken = this.tokens.next()
        return this.nextToken
    }

    /**
     * Checks if a given Token matches a condition (called if function, one of if array, and exact match otherwise)
     * @param {Token} token
     * @param {Array|function(Token): boolean|string|number|boolean} [value]
     * @return {boolean}
     */
    tokenMatches(token, value) {
        if(typeof value === "undefined") {
            return true
        } else if(Array.isArray(value)) {
            return value.includes(token.value)
        } else if(typeof value === "function") {
            return value(token)
        } else {
            return token.value === value
        }
    }

    /**
     * Saves the current state (current and next token) to be restored later.
     */
    save() {
        this.savedCurrent = this.current
        this.savedNextToken = this.nextToken
        this.tokens.save()
    }

    /**
     * Restores a previous state (current and next token) from last save.
     */
    restore() {
        this.tokens.restore()
        this.current = this.savedCurrent
        this.nextToken = this.savedNextToken
    }

    /**
     * Checks if the next token matches the given type and value, and if so, consume the current token.
     * Returns true if the check matches.
     * @param {string} type
     * @param {any} [value]
     * @return {boolean}
     */
    accept(type, value) {
        if(this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
            this.next()
            return true
        }
        return false
    }

    /**
     * Throws an error if the next token does not match the given type and value. Otherwise, consumes the current token.
     * @param {string} type
     * @param {any} [value]
     */
    expect(type, value) {
        if(!this.accept(type, value)) {
            throw new Error(qsTranslate("error", "Parse error [position %1]: %2")
                .arg(this.tokens.pos)
                .arg(qsTranslate("error", "Expected %1").arg(value || type)))
        }
    }

    /**
     * Converts enough Tokens to form an expression atom (generally the next part of the expression) into an instruction
     * and pushes it to the instruction list.
     * Throws an error if an unexpected token gets parsed.
     * @param {Instruction[]} instr
     */
    parseAtom(instr) {
        const prefixOperators = this.tokens.unaryOpsList

        if(this.accept(TNAME) || this.accept(TOP, prefixOperators)) {
            instr.push(new Instruction(IVAR, this.current.value))
        } else if(this.accept(TNUMBER)) {
            instr.push(new Instruction(INUMBER, this.current.value))
        } else if(this.accept(TSTRING)) {
            instr.push(new Instruction(INUMBER, this.current.value))
        } else if(this.accept(TPAREN, "(")) {
            this.parseExpression(instr)
            this.expect(TPAREN, ")")
        } else if(this.accept(TBRACKET, "[")) {
            if(this.accept(TBRACKET, "]")) {
                instr.push(new Instruction(IARRAY, 0))
            } else {
                const argCount = this.parseArrayList(instr)
                instr.push(new Instruction(IARRAY, argCount))
            }
        } else {
            throw new Error(qsTranslate("error", "Unexpected %1").arg(this.nextToken))
        }
    }

    /**
     * Consumes the next tokens to compile a general expression which should return a value, and compiles
     * the instructions into the list.
     * @param {Instruction[]} instr
     */
    parseExpression(instr) {
        const exprInstr = []
        this.parseConditionalExpression(exprInstr)
        instr.push(...exprInstr)
    }

    /**
     * Parses an array indice, and return the number of arguments found at the end.
     * @param {Instruction[]} instr
     * @return {number}
     */
    parseArrayList(instr) {
        let argCount = 0

        while(!this.accept(TBRACKET, "]")) {
            this.parseExpression(instr)
            ++argCount
            while(this.accept(TCOMMA)) {
                this.parseExpression(instr)
                ++argCount
            }
        }

        return argCount
    }

    /**
     * Parses a tertiary statement (<condition> ? <value if true> : <value if false>) and pushes it into the instruction
     * list.
     * @param {Instruction[]} instr
     */
    parseConditionalExpression(instr) {
        this.parseOrExpression(instr)
        while(this.accept(TOP, "?")) {
            const trueBranch = []
            const falseBranch = []
            this.parseConditionalExpression(trueBranch)
            this.expect(TOP, ":")
            this.parseConditionalExpression(falseBranch)
            instr.push(new Instruction(IEXPR, trueBranch))
            instr.push(new Instruction(IEXPR, falseBranch))
            instr.push(ternaryInstruction("?"))
        }
    }

    /**
     * Parses a binary or statement (<condition 1> or <condition 2>) and pushes it into the instruction list.
     * @param {Instruction[]} instr
     */
    parseOrExpression(instr) {
        this.parseAndExpression(instr)
        while(this.accept(TOP, "or")) {
            const falseBranch = []
            this.parseAndExpression(falseBranch)
            instr.push(new Instruction(IEXPR, falseBranch))
            instr.push(binaryInstruction("or"))
        }
    }

    /**
     * Parses a binary and statement (<condition 1> and <condition 2>) and pushes it into the instruction list.
     * @param {Instruction[]} instr
     */
    parseAndExpression(instr) {
        this.parseComparison(instr)
        while(this.accept(TOP, "and")) {
            const trueBranch = []
            this.parseComparison(trueBranch)
            instr.push(new Instruction(IEXPR, trueBranch))
            instr.push(binaryInstruction("and"))
        }
    }

    /**
     * Parses a binary equality statement (<condition 1> == <condition 2> and so on) and pushes it into the instruction list.
     * @param {Instruction[]} instr
     */
    parseComparison(instr) {
        this.parseAddSub(instr)
        while(this.accept(TOP, COMPARISON_OPERATORS)) {
            const op = this.current
            this.parseAddSub(instr)
            instr.push(binaryInstruction(op.value))
        }
    }

    /**
     * Parses add, minus and concat operations and pushes them into the instruction list.
     * @param {Instruction[]} instr
     */
    parseAddSub(instr) {
        this.parseTerm(instr)
        while(this.accept(TOP, ADD_SUB_OPERATORS)) {
            const op = this.current
            this.parseTerm(instr)
            instr.push(binaryInstruction(op.value))
        }
    }

    /**
     * Parses times, divide and modulo operations and pushes them into the instruction list.
     * @param {Instruction[]} instr
     */
    parseTerm(instr) {
        this.parseFactor(instr)
        while(this.accept(TOP, TERM_OPERATORS)) {
            const op = this.current
            this.parseFactor(instr)
            instr.push(binaryInstruction(op.value))
        }
    }

    /**
     * Parses prefix operations (+, -, but also functions like sin or cos which don't need parentheses)
     * @param {Instruction[]} instr
     */
    parseFactor(instr) {
        const prefixOperators = this.tokens.unaryOpsList

        this.save()
        if(this.accept(TOP, prefixOperators)) {
            if(this.current.value !== "-" && this.current.value !== "+") {
                if(this.nextToken.type === TPAREN && this.nextToken.value === "(") {
                    this.restore()
                    this.parseExponential(instr)
                    return
                } else if(this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || (this.nextToken.type === TPAREN && this.nextToken.value === ")")) {
                    this.restore()
                    this.parseAtom(instr)
                    return
                }
            }

            const op = this.current
            this.parseFactor(instr)
            instr.push(unaryInstruction(op.value))
        } else {
            this.parseExponential(instr)
        }
    }

    /**
     *
     * @param {Instruction[]} instr
     */
    parseExponential(instr) {
        this.parsePostfixExpression(instr)
        while(this.accept(TOP, "^")) {
            this.parseFactor(instr)
            instr.push(binaryInstruction("^"))
        }
    }


    /**
     * Parses factorial '!' (after the expression to apply it to).
     * @param {Instruction[]} instr
     */
    parsePostfixExpression(instr) {
        this.parseFunctionCall(instr)
        while(this.accept(TOP, "!")) {
            instr.push(unaryInstruction("!"))
        }
    }

    /**
     * Parse a function (name + parentheses + arguments).
     * @param {Instruction[]} instr
     */
    parseFunctionCall(instr) {
        const prefixOperators = this.tokens.unaryOpsList

        if(this.accept(TOP, prefixOperators)) {
            const op = this.current
            this.parseAtom(instr)
            instr.push(unaryInstruction(op.value))
        } else {
            this.parseMemberExpression(instr)
            while(this.accept(TPAREN, "(")) {
                if(this.accept(TPAREN, ")")) {
                    instr.push(new Instruction(IFUNCALL, 0))
                } else {
                    const argCount = this.parseArgumentList(instr)
                    instr.push(new Instruction(IFUNCALL, argCount))
                }
            }
        }
    }

    /**
     * Parses a list of arguments, return their quantity.
     * @param {Instruction[]} instr
     * @return {number}
     */
    parseArgumentList(instr) {
        let argCount = 0

        while(!this.accept(TPAREN, ")")) {
            this.parseExpression(instr)
            ++argCount
            while(this.accept(TCOMMA)) {
                this.parseExpression(instr)
                ++argCount
            }
        }

        return argCount
    }

    parseMemberExpression(instr) {
        this.parseAtom(instr)
        while(this.accept(TOP, ".") || this.accept(TBRACKET, "[")) {
            const op = this.current

            if(op.value === ".") {
                if(!this.allowMemberAccess) {
                    throw new Error(qsTranslate("error", "Unexpected \".\": member access is not permitted"))
                }

                this.expect(TNAME)
                instr.push(new Instruction(IMEMBER, this.current.value))
            } else if(op.value === "[") {
                if(!this.tokens.isOperatorEnabled("[")) {
                    throw new Error(qsTranslate("error", "Unexpected \"[]\": arrays are disabled."))
                }

                this.parseExpression(instr)
                this.expect(TBRACKET, "]")
                instr.push(binaryInstruction("["))
            } else {
                throw new Error(qsTranslate("error", "Unexpected symbol: %1.").arg(op.value))
            }
        }
    }
}
