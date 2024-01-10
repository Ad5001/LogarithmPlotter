/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
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

.import "reference.js" as Reference

const WHITESPACES = " \t\n\r"
const STRING_LIMITORS = '"\'`';
const OPERATORS = "+-*/^%?:=!><";
const PUNCTUTATION = "()[]{},.";
const NUMBER_CHARS = "0123456789"
const IDENTIFIER_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789_₀₁₂₃₄₅₆₇₈₉αβγδεζηθκλμξρςστφχψωₐₑₒₓₔₕₖₗₘₙₚₛₜ"

var TokenType = {
    // Expression type
    "WHITESPACE": "WHITESPACE",
    "VARIABLE": "VARIABLE",
    "CONSTANT": "CONSTANT",
    "FUNCTION": "FUNCTION",
    "OPERATOR": "OPERATOR",
    "PUNCT": "PUNCT",
    "NUMBER": "NUMBER",
    "STRING": "STRING",
    "UNKNOWN": "UNKNOWN"
}

class Token {
    constructor(type, value, startPosition) {
        this.type = type;
        this.value = value;
        this.startPosition = startPosition
    }
}

class ExpressionTokenizer {
    constructor(input, tokenizeWhitespaces = false, errorOnUnknown = true) {
        this.input = input;
        this.currentToken = null;
        this.tokenizeWhitespaces = tokenizeWhitespaces
        this.errorOnUnknown = errorOnUnknown
    }
    
    skipWhitespaces() {
        while(!this.input.atEnd() && WHITESPACES.includes(this.input.peek()))
            this.input.next();
    }
    
    readWhitespaces() {
        let included = "";
        while(!this.input.atEnd() && WHITESPACES.includes(this.input.peek())) {
            included += this.input.next();
        }
        return new Token(TokenType.WHITESPACE, included, this.input.position-included.length)
    }
    
    readString() {
        let delimitation = this.input.peek();
        if(STRING_LIMITORS.includes(delimitation)) {
            this.input.skip(delimitation)
            let included = "";
            let justEscaped = false;
            while(!this.input.atEnd() && (!STRING_LIMITORS.includes(this.input.peek()) || justEscaped)) {
                justEscaped = this.input.peek() == "\\"
                if(!justEscaped)
                    included += this.input.next();
            }
            this.input.skip(delimitation)
            let token = new Token(TokenType.STRING, included, this.input.position-included.length)
            token.limitator = delimitation
            return token
        } else {
            this.input.raise("Unexpected " + delimitation + ". Expected  string delimitator")
        }
    }
    
    readNumber() {
        let included = "";
        let hasDot = false;
        while(!this.input.atEnd() && (NUMBER_CHARS.includes(this.input.peek()) || this.input.peek() == '.')) {
            if(this.input.peek() == ".") {
                if(hasDot) this.input.raise("Unexpected '.'. Expected digit")
                hasDot = true;
            }
            included += this.input.next();
        }
        return new Token(TokenType.NUMBER, included, this.input.position-included.length)
    }
    
    readOperator() {
        let included = "";
        while(!this.input.atEnd() && OPERATORS.includes(this.input.peek())) {
            included += this.input.next();
        }
        return new Token(TokenType.OPERATOR, included, this.input.position-included.length)
    }
    
    readIdentifier() {
        let identifier = "";
        while(!this.input.atEnd() && IDENTIFIER_CHARS.includes(this.input.peek().toLowerCase())) {
            identifier += this.input.next();
        }
        if(Reference.CONSTANTS_LIST.includes(identifier.toLowerCase())) {
            return new Token(TokenType.CONSTANT, identifier.toLowerCase(), this.input.position-identifier.length)
        } else if(Reference.FUNCTIONS_LIST.includes(identifier.toLowerCase())) {
            return new Token(TokenType.FUNCTION, identifier.toLowerCase(), this.input.position-identifier.length)
        } else {
            return new Token(TokenType.VARIABLE, identifier, this.input.position-identifier.length)
        }
    }
    
    readNextToken() {
        if(!this.tokenizeWhitespaces)
            this.skipWhitespaces()
        if(this.input.atEnd()) return null;
        let c = this.input.peek();
        if(this.tokenizeWhitespaces && WHITESPACES.includes(c)) return this.readWhitespaces();
        if(STRING_LIMITORS.includes(c)) return this.readString();
        if(NUMBER_CHARS.includes(c)) return this.readNumber();
        if(IDENTIFIER_CHARS.includes(c.toLowerCase())) return this.readIdentifier();
        if(OPERATORS.includes(c)) return this.readOperator();
        if(Reference.CONSTANTS_LIST.includes(c)) return new Token(TokenType.CONSTANT, this.input.next(), this.input.position-1);
        if(PUNCTUTATION.includes(c)) return new Token(TokenType.PUNCT, this.input.next(), this.input.position-1);
        if(this.errorOnUnknown)
            this.input.throw("Unknown token character " + c)
        else
            return new Token(TokenType.UNKNOWN, this.input.next(), this.input.position-1);
    }

    peek() {
        if(this.currentToken == null) this.currentToken = this.readNextToken();
        return this.currentToken;
    }

    next() {
        let tmp;
        if(this.currentToken == null)
            tmp = this.readNextToken();
        else
            tmp = this.currentToken;
        this.currentToken = null;
        return tmp;
    }
    
    atEnd() {
        return this.peek() == null;
    }
    
    skip(type) {
        let next = this.next();
        if(next.type != type)
            input.raise("Unexpected token " + next.type.toLowerCase() + ' "' + next.value + '". Expected ' + type.toLowerCase());
    }
}
