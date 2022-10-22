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
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
        this.stack = []
    }
    
    parseExpression(delimitors = '') {
        // Parse a sequence of operations, and orders them based on OPERATION_PRIORITY.
        let elements = []
        let operators = []
        let firstToken = this.tokenizer.peek();
        if(firstToken.type == TK.TokenType.OPERATOR) // First operations.
            if(firstToken.value == "-") {
                // TODO: Set initial argument.
                this.tokenizer.skip(TK.TokenType.OPERATOR)
            } else
                tokenizer.input.raise(`Invalid operator ${firstToken.value} at begining of statement.`)
        else {
            
        }
    }
    
    parseOperation()`
}
