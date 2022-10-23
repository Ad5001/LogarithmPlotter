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

.import "ast.js" as AST
.import "tokenizer.js" as TK


class ExpressionBuilder {
    constructor(tokenizer, rememberTokens = false) {
        this.tokenizer = tokenizer;
        if(tokenizer.tokenizeWhitespaces) {
            console.warn('WARNING: The ExpressionTokenizer for ExpressionBuilder was initialized with whitespace support. Disabled.')
            tokenizer.tokenizeWhitespaces = false
        }
        if(tokenizer.differentiateIdentifiers) {
            console.warn('WARNING: The ExpressionTokenizer for ExpressionBuilder was initialized with identifier differentiation support. Disabled.')
            tokenizer.differentiateIdentifiers = false
        }
        this.tokens = []
        this.rememberTokens = rememberTokens
        this.stack = []
    }
    
    /**
     * Parses an expression until the end is reached.
     * 
     * @throws {Error} When an unexpected token is encountered.
     * @returns {AbstractSyntaxElement}
     */
    parseFullExpression() {
        this.parseExpression([])
        return this.stack.pop()
    }
    
    /**
     * Parses an expression until the end is reached.
     * 
     * @param {string} punctuationDelimitators - List of deliminators that ends the expression
     * @throws {Error} When an unexpected token is encountered.
     */
    parseExpression(punctuationDelimitators = []) {
        let token
        while((token = this.tokenizer.peek()) != null) {
            if(token.type == TK.TokenType.PUNCT && token.value != '(') // Still allow expression creation.
                if(punctuationDelimitators.includes(token.value))
                    break
                else if(punctuationDelimitators.length == 1)
                    this.tokenizer.raise(`Unexpected ${token.value}. Expected '${punctuationDelimitators[0]}'.`)
                else
                    this.tokenizer.raise(`Unexpected ${token.value}. Expected one of: '${punctuationDelimitators[0].join("', '")}'.`)
            else
                this.handleSingle()
        }
        
        if(token == null && punctuationDelimitators.length > 0)
            if(punctuationDelimitators.length == 1)
                this.tokenizer.raise(`Unexpected end of expression. Expected '${punctuationDelimitators[0]}'.`)
            else
                this.tokenizer.raise(`Unexpected end of expression. Expected one of: '${punctuationDelimitators[0].join("', '")}'.`)
        
                
        if(this.stack.length == 0)
            if(token == null)
                this.tokenizer.raise(`Unexpected end of expression. Expected at least one element.`)
            else
                this.tokenizer.raise(`Unexpected ${token.value}. Expected at least one element.`)
            
        if(this.stack.length > 1)
            this.tokenizer.raise('Invalid expression.')
    }
    
    /**
     * Handles a single (assumed non-null) token based on its type.
     * 
     * @param {AbstractSyntaxElement} token
     * @throws {Error} When an unexpected token is encountered.
     */
    handleSingle(token) {
        switch(token.type) {
            case TK.TokenType.IDENTIFIER:
                this.parseIdentifier()
                break
            case TK.TokenType.OPERATOR:
                if(this.stack.length == 0 && Reference.UNARY_OPERATORS.includes(token.value))
                    this.parseSingleOperation()
                else if(this.stack.length > 0 && Reference.BINARY_OPERATORS.includes(token.value))
                    this.parseBinaryOperations()
                else if(this.stack.length > 0 && Reference.TERTIARY_OPERATORS.includes(token.value))
                    this.parseTertiaryOperation()
                break
            case TK.TokenType.NUMBER:
                this.stack.push(new AST.NumberElement(this.tokenizer.next().value))
                break
            case TK.TokenType.STRING:
                this.stack.push(new AST.StringElement(this.tokenizer.next().value))
                break
            case TK.TokenType.PUNCT:
                if(token.value == '(') {
                    this.tokenizer.skip(TK.TokenType.PUNCT, '(') // Skip the opening parentheses.
                    this.parseExpression([')'])
                } else
                    this.tokenizer.raise(`Unexpected ${token.value}. Expected a value.`)
                break
            default:
                this.tokenizer.raise(`Unknown token provided: ${token.value}.`)
                break
        }
        if(this.rememberTokens)
            this.tokens.push(token)
    }
    
    /**
     * Parses a single token element.
     * 
     * @throws {Error} When an unexpected token is encountered.
     */
    parseSingle() {
        let token = this.tokenizer.peek()
        if(token != null)
            this.handleSingle(token)
    }
    
    parseIdentifier() {
        // Assuming the right type.
        let token = this.tokenizer.read(TK.TokenType.IDENTIFIER)
        if(Reference.CONSTANTS_LIST.includes(token.value))
            this.stack.push(new AST.Constant(token.value))
        else
            this.stack.push(new AST.Variable(token.value))
        this.checkIdentifierFollowupTokens()
    }
    
    /**
     * Parses a function based on a previously called identifier.
     * NOTE: Expects to have at least one stack element for function name.
     */
    parseFunction() {
        // TODO: Implement dynamic functions values instead of being based on names.
        let functionValue = this.stack.pop()
        if(!(functionValue instanceof AST.Variable))
            this.tokenizer.raise("Executing functions from dynamic variables is not implemented".)
        let functionName = functionValue.variableName
        let args = []
        let token
        while((token = this.tokenizer.peek()) != null && token.value != ')') {
            this.tokenizer.skip(TK.TokenType.PUNCT) // Skip the opening parenthesis and the commas.
            parseExpression([',',')'])
            args.push(this.stack.pop())
        }
            
        if(token == null)
            this.tokenizer.raise(`Unexpected end of expression. Expected ')'.`)
        
        if(this.functionName == 'derivation')
            this.stack.push(new AST.DerivationElement(args))
        else if(this.functionName == 'integral')
            this.stack.push(new AST.IntegralElement(args))
        else
            this.stack.push(new AST.FunctionElement(functionName, args))
    }
    
    
    /**
     * Parses an object property based on a previously called identifier.
     * NOTE: Expects to have at least one stack element for property object name.
     */
    parseProperty() {
        this.tokenizer.skip(TK.TokenType.PUNCT, '.') // Skipping the dot.
        let token = this.tokenizer.read(TK.TokenType.IDENTIFIER)
        this.stack.push(new AST.PropertyElement(this.stack.pop(), token.value))
        this.checkIdentifierFollowupTokens()
    }
    
    /**
     * Parses the value of the element of an array at a given index based on a previously called identifier.
     * NOTE: Expects to have at least one stack element for property object name.
     */
    parseArrayValue() {
        this.tokenizer.skip(TK.TokenType.PUNCT, '[') // Skipping the array opener.
        let obj = this.stack.pop()
        parseExpression([']'])
        this.stack.push(new AST.ArrayElement(obj, this.stack.pop()))
        this.checkIdentifierFollowupTokens()
    }
    
    /**
     * Checks for followup tokens following a value getting.
     * E.g: getting the property of an object, an array member, or calling a function.
     * NOTE: Expects to have at least one stack element for previous calling object.
     */
    checkIdentifierFollowupTokens() {
        let peeked = this.tokenizer.peek()
        if(peeked != null && peeked.type == TK.TokenType.PUNCT)
            switch(peeked.value) {
                case '(':
                    // Function call
                    this.parseFunction()
                    break
                case '.':
                    // Member property
                    this.parseProperty()
                    break
                case '[':
                    // Array value
                    this.parseArrayValue()
                    break
            }
    }
    
    parseBinaryOperations() {
        if((this.tokenizer.peek().value in AST.BINARY_OPERATION_PRIORITY))
            throw new Error("Current token is not a binary operator.")
        if(this.stack.length == 0)
            throw new Error(`The operator ${this.tokenizer.peek().value} can only be used after a value.`)
        // Parse a sequence of operations, and orders them based on OPERATION_PRIORITY.
        let elements = [this.stack.pop()]
        let operators = [this.tokenizer.next()]
        let token
        while((token = this.tokenizer.peek()) != null) {
        }
    }
}
