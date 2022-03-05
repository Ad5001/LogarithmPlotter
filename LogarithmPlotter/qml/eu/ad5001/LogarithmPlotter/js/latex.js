/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
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


.import "expr-eval.js" as ExprEval

/**
 * Puts element within parenthesis.
 * 
 * @param {string} elem - element to put within parenthesis.
 * @returns {string}
 */
function par(elem) {
    return '(' + elem + ')'
}

/**
 * Checks if the element contains at least one of the elements of 
 * the string array contents , and returns the parenthesis version if so.
 * 
 * @param {string} elem - element to put within parenthesis.
 * @param {Array} contents - Array of elements to put within parenthesis.
 * @returns {string}
 */
function parif(elem, contents) {
    return contents.some(elem.includes) ? par(elem) : elem
}

/**
 * This function converts expr-eval tokens to a latex string.
 * 
 * @param {Array} tokens - expr-eval tokens list
 * @returns {string}
 */
function expressionToLatex(tokens) {
    var nstack = [];
    var n1, n2, n3;
    var f, args, argCount;
    for (var i = 0; i < tokens.length; i++) {
        var item = tokens[i];
        var type = item.type;
        
        switch(type) {
            case ExprEval.INUMBER:
                if (typeof item.value === 'number' && item.value < 0) {
                    nstack.push(par(item.value));
                } else if (Array.isArray(item.value)) {
                    nstack.push('[' + item.value.map(escapeValue).join(', ') + ']');
                } else {
                    nstack.push(escapeValue(item.value));
                }
                break;
            case ExprEval.IOP2:
                n2 = nstack.pop();
                n1 = nstack.pop();
                f = item.value;
                switch(f) {
                    case '-':
                    case '+':
                        nstack.push(n1 + this.ope + n2);
                        break;
                    case '||':
                    case 'or':
                    case '&&':
                    case 'and':
                    case '==':
                    case '!=':
                        nstack.push(par(n1) + this.ope + par(n2));
                        break;
                    case '*':
                        nstack.push(parif(n1,['+','-']) + " \\times " + parif(n2,['+','-']));
                        break;
                    case '/':
                        nstack.push("\\frac{" + n1 + "}{" + n2 + "}");
                        break;
                    case '^':
                        nstack.push(parif(n1,['+','-','*','/','!'])  + "^{" + n2 + "}");
                        break;
                    case '%':
                        nstack.push(parif(n1,['+','-','*','/','!','^']) + " \\mathrm{mod} " + parif(n2,['+','-','*','/','!','^']));
                        break;
                    case '[':
                        nstack.push(n1 + '[' + n2 + ']');
                        break;
                    default:
                        throw new EvalError("Unknown operator " + ope + ".");
                }
                break;
            case ExprEval.IOP3: // Thirdiary operator
                n3 = nstack.pop();
                n2 = nstack.pop();
                n1 = nstack.pop();
                f = item.value;
                if (f === '?') {
                    nstack.push('(' + n1 + ' ? ' + n2 + ' : ' + n3 + ')');
                } else {
                    throw new EvalError('Unknown operator ' + ope + '.');
                }
                break;
            case ExprEval.IVAR:
            case ExprEval.IVARNAME:
                nstack.push(item.value);
                break;
            case ExprEval.IOP1: // Unary operator
                n1 = nstack.pop();
                f = item.value;
                switch(f) {
                    case '-':
                    case '+':
                        nstack.push(par(f + n1));
                        break;
                    case '!':
                        nstack.push(parif(n1,['+','-','*','/','^']) + '!');
                        break;
                    default:
                        nstack.push(f + parif(n1,['+','-','*','/','^']));
                        break;
                }
                break;
            case ExprEval.IFUNCALL:
                argCount = item.value;
                args = [];
                while (argCount-- > 0) {
                    args.unshift(nstack.pop());
                }
                f = nstack.pop();
                nstack.push(f + '(' + args.join(', ') + ')');
                break;
            case ExprEval.IFUNDEF:
                nstack.push(par(n1 + '(' + args.join(', ') + ') = ' + n2));
                break;
            case ExprEval.IMEMBER:
                n1 = nstack.pop();
                nstack.push(n1 + '.' + item.value);
                break;
            case ExprEval.IARRAY:
                argCount = item.value;
                args = [];
                while (argCount-- > 0) {
                    args.unshift(nstack.pop());
                }
                nstack.push('[' + args.join(', ') + ']');
                break;
            case ExprEval.IEXPR:
                nstack.push('(' + expressionToLatex(item.value) + ')');
                break;
            case ExprEval.IENDSTATEMENT:
                break;
            default:
                throw new EvalError('invalid Expression');
                break;
        }
    }
    if (nstack.length > 1) {
        if (toJS) {
            nstack = [ nstack.join(',') ];
        } else {
            nstack = [ nstack.join(';') ];
        }
    }
    return Utils.makeExpressionReadable(String(nstack[0]));
}
