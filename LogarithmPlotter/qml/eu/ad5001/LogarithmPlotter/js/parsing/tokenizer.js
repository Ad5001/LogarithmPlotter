/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
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

import "reference.js" as Reference

const WHITESPACES = " \t\n\r"
const STRING_LIMITORS = '"\'`';
const OPERATORS = "+-*/^%";
const PUNCTUTATION = "()[]{},";
const NUMBER_CHARS = "0123456789."
const IDENTIFIER_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789_₀₁₂₃₄₅₆₇₈₉αβγδεζηθκλμξρςστφχψωₐₑₒₓₔₕₖₗₘₙₚₛₜ"

enum TokenType {
    // Expression type
    VARIABLE,
    CONSTANT,
    FUNCTION,
    OPERATOR,
    PUNCT,
    NUMBER,
    STRING
}

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class ExpressionTokenizer {
    constructor(input) {
        this.input = input;
        this.currentToken = null;
    }
    
    skipWhitespaces() {
        while(!this.input.atEnd() && WHITESPACES.includes(this.input.peek()))
            this.input.next();
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
            return new Token(TokenType.STRING, included);
        } else {
            this.input.raise("Unexpected " + delimitation + ". Expected  string delimitator")
        }
    }
    
    readNumber() {
        let included = "";
        let hasDot = false;
        while(!this.input.atEnd() && NUMBER_CHARS.includes(this.input.peek())) {
            if(this.input.peek() == ".") {
                if(hasDot) this.input.raise("Unexpected '.'. Expected digit")
                hasDot = true;
            }
            included += this.input.next();
        }
    }
    
    readIdentifier() {
        let identifier = "";
        let hasDot = false;
        while(!this.input.atEnd() && IDENTIFIER_CHARS.includes(this.input.peek())) {
            identifier += this.input.next();
        }
        if(Reference.CONSTANTS_LIST.includes(identifier.toLowerCase())) {
            return new Token(TokenType.CONSTANT, identifier.toLowerCase())
        } else if(Reference.FUNCTIONS_LIST.includes(identifier.toLowerCase())) {
            return new Token(TokenType.FUNCTION, identifier.toLowerCase())
        } else {
            return new Token(TokenType.VARIABLE, identifier)
        }
    }
    
    readNextToken() {
        this.skipWhitespaces()
        if(input.atEnd()) return null;
        let c = input.peek();
        if(STRING_LIMITORS.includes(c)) return this.readString();
        if(NUMBER_CHARS.includes(c)) return this.readNumber();
        if(IDENTIFIER_CHARS.includes(c)) return this.readIdentifier();
        if(Reference.CONSTANTS_LIST.includes(c)) return new Token(TokenType.CONSTANT, c);
        if(OPERATORS.includes(c)) return new Token(TokenType.OPERATOR, c);
        if(PUNCTUTATION.includes(c)) return new Token(TokenType.PUNCT, c);
        this.input.throw("Unknown token character " + c)
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
        Token next = Next();
        if(next.type != type)
            input.raise("Unexpected token " + next.type.oLowerCase() + ' "' + next.value + '". Expected ' + type.toLowerCase());
    }
}
