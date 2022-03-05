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

.import "../expr-eval.js" as ExprEval

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
    return contents.some(x => elem.toString().includes(x)) ? par(elem) : elem
}


/**
 * Creates a latex expression for a function.
 * 
 * @param {string} f - Function to convert
 * @param {Array} args - Arguments of the function
 * @returns {string}
 */
function functionToLatex(f, args) {
    switch(f) {
        case "derivative":
            return '\\frac{d' + args[0].substr(1, args[0].length-2).replace(new RegExp(by, 'g'), 'x') + '}{dx}';
            break;
        case "integral":
            return '\\int\\limits^{' + args[0] + '}_{' + args[1] + '}' + args[2].substr(1, args[2].length-2) + ' d' + args[3];
            break;
        case "sqrt":
            return '\\sqrt\\left(' + args.join(', ') + '\\right)';
            break;
        case "abs":
            return '\\left|' + args.join(', ') + '\\right|';
            break;
        case "floor":
            return '\\left\\lfloor' + args.join(', ') + '\\right\\rfloor';
            break;
        case "ceil":
            return '\\left\\lceil' + args.join(', ') + '\\right\\rceil';
            break;
        default:
            return '\\mathrm{' + f + '}\\left(' + args.join(', ') + '\\right)';
            break;
    }
}


/**
 * Creates a latex variable from a variable.
 * 
 * @param {string} vari - variable to convert
 * @returns {string}
 */
function variableToLatex(vari) {
    unicodechars = ["α","β","γ","δ","ε","ζ","η",
                    "π","θ","κ","λ","μ","ξ","ρ",
                    "ς","σ","τ","φ","χ","ψ","ω",
                    "Γ","Δ","Θ","Λ","Ξ","Π","Σ",
                    "Φ","Ψ","Ω","ₐ","ₑ","ₒ","ₓ",
                    "ₕ","ₖ","ₗ","ₘ","ₙ","ₚ","ₛ",
                    "ₜ","¹","²","³","⁴","⁵","⁶",
                    "⁷","⁸","⁹","⁰","₁","₂","₃",
                    "₄","₅","₆","₇","₈","₉","₀"]
    equivalchars = ["alpha","beta","gamma","delta","epsilon","zeta","eta",
                    "pi","theta","kappa","lambda","mu","xi","rho",
                    "sigma","sigma","tau","phi","chi","psi","omega",
                    "Gamma","Delta","Theta","Lambda","Xi","Pi","Sigma",
                    "Phy","Psi","Omega","{}_{a}","{}_{e}","{}_{o}","{}_{x}",
                    "{}_{h}","{}_{k}","{}_{l}","{}_{m}","{}_{n}","{}_{p}","{}_{s}",
                    "{}_{t}","{}^{1}","{}^{2}","{}^{3}","{}^{4}","{}^{5}","{}^{6}",
                    "{}^{7}","{}^{8}","{}^{9}","{}^{0}","{}_{1}","{}_{2}","{}_{3}",
                    "{}_{4}","{}_{5}","{}_{6}","{}_{7}","{}_{8}","{}_{9}","{}_{0}"]
    for(int i = 0; i < unicodechars.length; i++) {
        if(vari.includes(unicodechars[i]))
            vari = vari.replaceAll(unicodechars[i], equivalchars[i])
    }
    return vari;
}

/**
 * Converts expr-eval tokens to a latex string.
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
                    nstack.push('[' + item.value.map(ExprEval.escapeValue).join(', ') + ']');
                } else {
                    nstack.push(ExprEval.escapeValue(item.value));
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
                nstack.push(variableToLatex(item.value));
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
                // Handling various functions
                nstack.push(functionToLatex(f, args))
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
    console.log(nstack[0]);
    return String(nstack[0]);
}