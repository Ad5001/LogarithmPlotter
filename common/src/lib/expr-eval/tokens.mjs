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

export const TEOF = "TEOF"
export const TOP = "TOP"
export const TNUMBER = "TNUMBER"
export const TSTRING = "TSTRING"
export const TPAREN = "TPAREN"
export const TBRACKET = "TBRACKET"
export const TCOMMA = "TCOMMA"
export const TNAME = "TNAME"


// Additional variable characters.
export const ADDITIONAL_VARCHARS = [
    "α", "β", "γ", "δ", "ε", "ζ", "η",
    "π", "θ", "κ", "λ", "μ", "ξ", "ρ",
    "ς", "σ", "τ", "φ", "χ", "ψ", "ω",
    "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ",
    "Φ", "Ψ", "Ω", "ₐ", "ₑ", "ₒ", "ₓ",
    "ₕ", "ₖ", "ₗ", "ₘ", "ₙ", "ₚ", "ₛ",
    "ₜ", "¹", "²", "³", "⁴", "⁵", "⁶",
    "⁷", "⁸", "⁹", "⁰", "₁", "₂", "₃",
    "₄", "₅", "₆", "₇", "₈", "₉", "₀",
    "∞", "π"
]

export class Token {
    /**
     *
     * @param {string} type - Type of the token (see above).
     * @param {any} value - Value of the token.
     * @param {number} index - Index in the string of the token.
     */
    constructor(type, value, index) {
        this.type = type
        this.value = value
        this.index = index
    }

    toString() {
        return this.type + ": " + this.value
    }
}

const unicodeCodePointPattern = /^[0-9a-f]{4}$/i

export class TokenStream {
    /**
     *
     * @param {Parser} parser
     * @param {string} expression
     */
    constructor(parser, expression) {
        this.pos = 0
        this.current = null
        this.unaryOps = parser.unaryOps
        this.unaryOpsList = parser.unaryOpsList
        this.binaryOps = parser.binaryOps
        this.ternaryOps = parser.ternaryOps
        this.builtinConsts = parser.builtinConsts
        this.expression = expression
        this.savedPosition = 0
        this.savedCurrent = null
        this.options = parser.options
        this.parser = parser
    }

    /**
     *
     * @param {string} type - Type of the token (see above).
     * @param {any} value - Value of the token.
     * @param {number} [pos] - Index in the string of the token.
     */
    newToken(type, value, pos) {
        return new Token(type, value, pos != null ? pos : this.pos)
    }

    /**
     * Saves the current position and token into the object.
     */
    save() {
        this.savedPosition = this.pos
        this.savedCurrent = this.current
    }


    /**
     * Restored the saved position and token into the current.
     */
    restore() {
        this.pos = this.savedPosition
        this.current = this.savedCurrent
    }

    /**
     * Consumes the character at the current position and advance it
     * until it makes a valid token, and returns it.
     * @returns {Token}
     */
    next() {
        if(this.pos >= this.expression.length) {
            return this.newToken(TEOF, "EOF")
        }

        if(this.isWhitespace()) {
            return this.next()
        } else if(this.isRadixInteger() ||
            this.isNumber() ||
            this.isOperator() ||
            this.isString() ||
            this.isParen() ||
            this.isBracket() ||
            this.isComma() ||
            this.isNamedOp() ||
            this.isConst() ||
            this.isName()) {
            return this.current
        } else {
            this.parseError(qsTranslate("error", "Unknown character \"%1\".").arg(this.expression.charAt(this.pos)))
        }
    }

    /**
     * Checks if the character at the current position starts a string, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isString() {
        const startPos = this.pos
        const quote = this.expression.charAt(startPos)
        let r = false

        if(quote === "'" || quote === "\"") {
            let index = this.expression.indexOf(quote, startPos + 1)
            while(index >= 0 && this.pos < this.expression.length) {
                this.pos = index + 1
                if(this.expression.charAt(index - 1) !== "\\") {
                    const rawString = this.expression.substring(startPos + 1, index)
                    this.current = this.newToken(TSTRING, this.unescape(rawString), startPos)
                    r = true
                    break
                }
                index = this.expression.indexOf(quote, index + 1)
            }
        }
        return r
    }

    /**
     * Checks if the character at the current pos is a parenthesis, and if so consumes it into current
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isParen() {
        const c = this.expression.charAt(this.pos)
        if(c === "(" || c === ")") {
            this.current = this.newToken(TPAREN, c)
            this.pos++
            return true
        }
        return false
    }

    /**
     * Checks if the character at the current pos is a bracket, and if so consumes it into current
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isBracket() {
        const c = this.expression.charAt(this.pos)
        if((c === "[" || c === "]") && this.isOperatorEnabled("[")) {
            this.current = this.newToken(TBRACKET, c)
            this.pos++
            return true
        }
        return false
    }

    /**
     * Checks if the character at the current pos is a comma, and if so consumes it into current
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isComma() {
        const c = this.expression.charAt(this.pos)
        if(c === ",") {
            this.current = this.newToken(TCOMMA, ",")
            this.pos++
            return true
        }
        return false
    }

    /**
     * Checks if the current character is an identifier and makes a const, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isConst() {
        const startPos = this.pos
        let i = startPos
        for(; i < this.expression.length; i++) {
            const c = this.expression.charAt(i)
            if(c.toUpperCase() === c.toLowerCase() && !ADDITIONAL_VARCHARS.includes(c)) {
                if(i === this.pos || (c !== "_" && c !== "." && (c < "0" || c > "9"))) {
                    break
                }
            }
        }
        if(i > startPos) {
            const str = this.expression.substring(startPos, i)
            if(str in this.builtinConsts) {
                this.current = this.newToken(TNUMBER, this.builtinConsts[str])
                this.pos += str.length
                return true
            }
        }
        return false
    }

    /**
     * Checks if the current character is an identifier and makes a function or an operator, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isNamedOp() {
        const startPos = this.pos
        let i = startPos
        for(; i < this.expression.length; i++) {
            const c = this.expression.charAt(i)
            if(c.toUpperCase() === c.toLowerCase()) {
                if(i === this.pos || (c !== "_" && (c < "0" || c > "9"))) {
                    break
                }
            }
        }
        if(i > startPos) {
            const str = this.expression.substring(startPos, i)
            if(this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
                this.current = this.newToken(TOP, str)
                this.pos += str.length
                return true
            }
        }
        return false
    }

    /**
     * Checks if the current character is an identifier and makes a variable, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isName() {
        const startPos = this.pos
        let i = startPos
        let hasLetter = false
        for(; i < this.expression.length; i++) {
            const c = this.expression.charAt(i)
            if(c.toUpperCase() === c.toLowerCase() && !ADDITIONAL_VARCHARS.includes(c)) {
                if(i === this.pos && (c === "$" || c === "_")) {
                    if(c === "_") {
                        hasLetter = true
                    }
                } else if(i === this.pos || !hasLetter || (c !== "_" && (c < "0" || c > "9"))) {
                    break
                }
            } else {
                hasLetter = true
            }
        }
        if(hasLetter) {
            const str = this.expression.substring(startPos, i)
            this.current = this.newToken(TNAME, str)
            this.pos += str.length
            return true
        }
        return false
    }

    /**
     * Checks if the character at the current position is a whitespace, and if so, consumes all consecutive whitespaces
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     *
     */
    isWhitespace() {
        let r = false
        let c = this.expression.charAt(this.pos)
        while(c === " " || c === "\t" || c === "\n" || c === "\r") {
            r = true
            this.pos++
            if(this.pos >= this.expression.length) {
                break
            }
            c = this.expression.charAt(this.pos)
        }
        return r
    }

    /**
     * Checks if the current character is a zero, and checks whether it forms a radix number, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isRadixInteger() {
        let pos = this.pos

        if(pos >= this.expression.length - 2 || this.expression.charAt(pos) !== "0") {
            return false
        }
        ++pos

        let radix
        let validDigit
        if(this.expression.charAt(pos) === "x") {
            radix = 16
            validDigit = /^[0-9a-f]$/i
            pos++
        } else if(this.expression.charAt(pos) === "b") {
            radix = 2
            validDigit = /^[01]$/i
            pos++
        } else {
            return false
        }

        let valid = false
        const startPos = pos

        while(pos < this.expression.length) {
            const c = this.expression.charAt(pos)
            if(validDigit.test(c)) {
                pos++
                valid = true
            } else {
                break
            }
        }

        if(valid) {
            this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix))
            this.pos = pos
        }
        return valid
    }

    /**
     * Checks if the current character is a digit, and checks whether it forms a number, and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @returns {boolean}
     */
    isNumber() {
        const startPos = this.pos
        let valid = false
        let pos = startPos
        let resetPos = startPos
        let foundDot = false
        let foundDigits = false
        let c

        // Check for digit with dot.
        while(pos < this.expression.length) {
            c = this.expression.charAt(pos)
            if((c >= "0" && c <= "9") || (!foundDot && c === ".")) {
                if(c === ".") {
                    foundDot = true
                } else {
                    foundDigits = true
                }
                pos++
                valid = foundDigits
            } else {
                break
            }
        }

        if(valid) {
            resetPos = pos
        }

        // Check for e exponents.
        if(c === "e" || c === "E") {
            pos++
            let acceptSign = true
            let validExponent = false
            while(pos < this.expression.length) {
                c = this.expression.charAt(pos)
                if(acceptSign && (c === "+" || c === "-")) {
                    acceptSign = false
                } else if(c >= "0" && c <= "9") {
                    validExponent = true
                    acceptSign = false
                } else {
                    break
                }
                pos++
            }

            if(!validExponent) {
                pos = resetPos
            }
        }

        // Use parseFloat now that we've identified the number.
        if(valid) {
            this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)))
            this.pos = pos
        } else {
            this.pos = resetPos
        }
        return valid
    }

    /**
     * Checks if the current character is an operator, checks whether it's enabled and if so, consumes it as the current token
     * and returns true. Otherwise, returns false.
     * @return {boolean}
     */
    isOperator() {
        const startPos = this.pos
        const c = this.expression.charAt(this.pos)

        if(c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === "^" || c === "?" || c === ":" || c === ".") {
            this.current = this.newToken(TOP, c)
        } else if(c === "∙" || c === "•") {
            this.current = this.newToken(TOP, "*")
        } else if(c === ">") {
            if(this.expression.charAt(this.pos + 1) === "=") {
                this.current = this.newToken(TOP, ">=")
                this.pos++
            } else {
                this.current = this.newToken(TOP, ">")
            }
        } else if(c === "<") {
            if(this.expression.charAt(this.pos + 1) === "=") {
                this.current = this.newToken(TOP, "<=")
                this.pos++
            } else {
                this.current = this.newToken(TOP, "<")
            }
        } else if(c === "|") {
            if(this.expression.charAt(this.pos + 1) === "|") {
                this.current = this.newToken(TOP, "||")
                this.pos++
            } else {
                return false
            }
        } else if(c === "=") {
            if(this.expression.charAt(this.pos + 1) === "=") {
                this.current = this.newToken(TOP, "==")
                this.pos++
            } else {
                this.current = this.newToken(TOP, c)
            }
        } else if(c === "!") {
            if(this.expression.charAt(this.pos + 1) === "=") {
                this.current = this.newToken(TOP, "!=")
                this.pos++
            } else {
                this.current = this.newToken(TOP, c)
            }
        } else {
            return false
        }
        this.pos++

        if(this.isOperatorEnabled(this.current.value)) {
            return true
        } else {
            this.pos = startPos
            return false
        }
    }

    /**
     * Replaces a backslash and a character by its unescaped value.
     * @param {string} v - string to un escape.
     */
    unescape(v) {
        let index = v.indexOf("\\")
        if(index < 0) {
            return v
        }

        let buffer = v.substring(0, index)
        while(index >= 0) {
            const c = v.charAt(++index)
            switch(c) {
                case "'":
                    buffer += "'"
                    break
                case "\"":
                    buffer += "\""
                    break
                case "\\":
                    buffer += "\\"
                    break
                case "/":
                    buffer += "/"
                    break
                case "b":
                    buffer += "\b"
                    break
                case "f":
                    buffer += "\f"
                    break
                case "n":
                    buffer += "\n"
                    break
                case "r":
                    buffer += "\r"
                    break
                case "t":
                    buffer += "\t"
                    break
                case "u":
                    // interpret the following 4 characters as the hex of the unicode code point
                    const codePoint = v.substring(index + 1, index + 5)
                    if(!unicodeCodePointPattern.test(codePoint)) {
                        this.parseError(qsTranslate("error", "Illegal escape sequence: %1.").arg("\\u" + codePoint))
                    }
                    buffer += String.fromCharCode(parseInt(codePoint, 16))
                    index += 4
                    break
                default:
                    throw this.parseError(qsTranslate("error", "Illegal escape sequence: %1.").arg("\\" + c))
            }
            ++index
            const backslash = v.indexOf("\\", index)
            buffer += v.substring(index, backslash < 0 ? v.length : backslash)
            index = backslash
        }

        return buffer
    }

    /**
     * Shorthand for the parser's method to check if an operator is enabled.
     * @param {string} op
     * @return {boolean}
     */
    isOperatorEnabled(op) {
        return this.parser.isOperatorEnabled(op)
    }

    /**
     * Throws a translated error.
     * @param {string} msg
     */
    parseError(msg) {
        throw new Error(qsTranslate("error", "Parse error [position %1]: %2").arg(this.pos).arg(msg))
    }
}
