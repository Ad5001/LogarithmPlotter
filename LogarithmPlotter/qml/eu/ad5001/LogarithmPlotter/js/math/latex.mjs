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

import { Module } from '../modules.mjs'

const unicodechars = ["α","β","γ","δ","ε","ζ","η",
    "π","θ","κ","λ","μ","ξ","ρ",
    "ς","σ","τ","φ","χ","ψ","ω",
    "Γ","Δ","Θ","Λ","Ξ","Π","Σ",
    "Φ","Ψ","Ω","ₐ","ₑ","ₒ","ₓ",
    "ₕ","ₖ","ₗ","ₘ","ₙ","ₚ","ₛ",
    "ₜ","¹","²","³","⁴","⁵","⁶",
    "⁷","⁸","⁹","⁰","₁","₂","₃",
    "₄","₅","₆","₇","₈","₉","₀",
    "pi", "∞"]
const equivalchars = ["\\alpha","\\beta","\\gamma","\\delta","\\epsilon","\\zeta","\\eta",
    "\\pi","\\theta","\\kappa","\\lambda","\\mu","\\xi","\\rho",
    "\\sigma","\\sigma","\\tau","\\phi","\\chi","\\psi","\\omega",
    "\\Gamma","\\Delta","\\Theta","\\Lambda","\\Xi","\\Pi","\\Sigma",
    "\\Phy","\\Psi","\\Omega","{}_{a}","{}_{e}","{}_{o}","{}_{x}",
    "{}_{h}","{}_{k}","{}_{l}","{}_{m}","{}_{n}","{}_{p}","{}_{s}",
    "{}_{t}","{}^{1}","{}^{2}","{}^{3}","{}^{4}","{}^{5}","{}^{6}",
    "{}^{7}","{}^{8}","{}^{9}","{}^{0}","{}_{1}","{}_{2}","{}_{3}",
    "{}_{4}","{}_{5}","{}_{6}","{}_{7}","{}_{8}","{}_{9}","{}_{0}",
    "\\pi", "\\infty"]


class LatexAPI extends Module {
    constructor() {
        super('Latex', [
            /** @type {ExprParserAPI} */
            Modules.ExprParser
        ])
        /**
         * true if latex has been enabled by the user, false otherwise.
         */
        this.enabled = Helper.getSettingBool("enable_latex")
        /**
         * Mirror method for Python object.
         * @type {function(string, number, string): string}.
         */
        this.render = Latex.render
    }

    /**
     * Puts element within parenthesis.
     *
     * @param {string} elem - element to put within parenthesis.
     * @returns {string}
     */
    par(elem) {
        return '(' + elem + ')'
    }

    /**
     * Checks if the element contains at least one of the elements of
     * the string array contents, but not at the first position of the string,
     * and returns the parenthesis version if so.
     *
     * @param {string} elem - element to put within parenthesis.
     * @param {Array} contents - Array of elements to put within parenthesis.
     * @returns {string}
     */
    parif(elem, contents) {
        elem = elem.toString()
        if(elem[0] !== "(" && elem[elem.length-1] !== ")" && contents.some(x => elem.indexOf(x) > 0))
            return this.par(elem)
        if(elem[0] === "(" && elem[elem.length-1] === ")")
            return elem.substr(1, elem.length-2)
        return elem
    }

    /**
     * Creates a latex expression for a function.
     *
     * @param {string} f - Function to convert
     * @param {(number,string)[]} args - Arguments of the function
     * @returns {string}
     */
    functionToLatex(f, args) {
        switch(f) {
            case "derivative":
                if(args.length === 3)
                    return '\\frac{d' + args[0].substr(1, args[0].length-2).replace(new RegExp(args[1].substr(1, args[1].length-2), 'g'), 'x') + '}{dx}';
                else
                    return '\\frac{d' + args[0] + '}{dx}(x)';
                break;
            case "integral":
                if(args.length === 4)
                    return '\\int\\limits_{' + args[0] + '}^{' + args[1] + '}' + args[2].substr(1, args[2].length-2) + ' d' + args[3].substr(1, args[3].length-2);
                else
                    return '\\int\\limits_{' + args[0] + '}^{' + args[1] + '}' + args[2] + '(t) dt';
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
     * @param {string} vari - variable text to convert
     * @param {boolean} wrapIn$ - checks whether the escaped chars should be escaped
     * @returns {string}
     */
    variable(vari, wrapIn$ = false) {
        if(wrapIn$)
            for(let i = 0; i < unicodechars.length; i++) {
                if(vari.includes(unicodechars[i]))
                    vari = vari.replace(new RegExp(unicodechars[i], 'g'), '$'+equivalchars[i]+'$')
            }
        else
            for(let i = 0; i < unicodechars.length; i++) {
                if(vari.includes(unicodechars[i]))
                    vari = vari.replace(new RegExp(unicodechars[i], 'g'), equivalchars[i])
            }
        return vari;
    }

    /**
     * Converts expr-eval tokens to a latex string.
     *
     * @param {Array} tokens - expr-eval tokens list
     * @returns {string}
     */
    expression(tokens) {
        let nstack = []
        let n1, n2, n3
        let f, args, argCount
        for (let i = 0; i < tokens.length; i++) {
            let item = tokens[i]
            let type = item.type

            switch(type) {
                case Modules.ExprParser.Internals.INUMBER:
                    if(item.value === Infinity) {
                        nstack.push("\\infty")
                    } else if(typeof item.value === 'number' && item.value < 0) {
                        nstack.push(this.par(item.value));
                    } else if(Array.isArray(item.value)) {
                        nstack.push('[' + item.value.map(Modules.ExprParser.Internals.escapeValue).join(', ') + ']');
                    } else {
                        nstack.push(Modules.ExprParser.Internals.escapeValue(item.value));
                    }
                    break;
                case Modules.ExprParser.Internals.IOP2:
                    n2 = nstack.pop();
                    n1 = nstack.pop();
                    f = item.value;
                    switch(f) {
                        case '-':
                        case '+':
                            nstack.push(n1 + f + n2);
                            break;
                        case '||':
                        case 'or':
                        case '&&':
                        case 'and':
                        case '==':
                        case '!=':
                            nstack.push(this.par(n1) + f + this.par(n2));
                            break;
                        case '*':
                            if(n2 == "\\pi" || n2 == "e" || n2 == "x" || n2 == "n")
                                nstack.push(this.parif(n1,['+','-']) + n2)
                            else
                                nstack.push(this.parif(n1,['+','-']) + " \\times " + this.parif(n2,['+','-']));
                            break;
                        case '/':
                            nstack.push("\\frac{" + n1 + "}{" + n2 + "}");
                            break;
                        case '^':
                            nstack.push(this.parif(n1,['+','-','*','/','!'])  + "^{" + n2 + "}");
                            break;
                        case '%':
                            nstack.push(this.parif(n1,['+','-','*','/','!','^']) + " \\mathrm{mod} " + parif(n2,['+','-','*','/','!','^']));
                            break;
                        case '[':
                            nstack.push(n1 + '[' + n2 + ']');
                            break;
                        default:
                            throw new EvalError("Unknown operator " + ope + ".");
                    }
                    break;
                case Modules.ExprParser.Internals.IOP3: // Thirdiary operator
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
                case Modules.ExprParser.Internals.IVAR:
                case Modules.ExprParser.Internals.IVARNAME:
                    nstack.push(this.variable(item.value.toString()));
                    break;
                case Modules.ExprParser.Internals.IOP1: // Unary operator
                    n1 = nstack.pop();
                    f = item.value;
                    switch(f) {
                        case '-':
                        case '+':
                            nstack.push(this.par(f + n1));
                            break;
                        case '!':
                            nstack.push(this.parif(n1,['+','-','*','/','^']) + '!');
                            break;
                        default:
                            nstack.push(f + this.parif(n1,['+','-','*','/','^']));
                            break;
                    }
                    break;
                case Modules.ExprParser.Internals.IFUNCALL:
                    argCount = item.value;
                    args = [];
                    while (argCount-- > 0) {
                        args.unshift(nstack.pop());
                    }
                    f = nstack.pop();
                    // Handling various functions
                    nstack.push(this.functionToLatex(f, args))
                    break;
                case Modules.ExprParser.Internals.IFUNDEF:
                    nstack.push(this.par(n1 + '(' + args.join(', ') + ') = ' + n2));
                    break;
                case Modules.ExprParser.Internals.IMEMBER:
                    n1 = nstack.pop();
                    nstack.push(n1 + '.' + item.value);
                    break;
                case Modules.ExprParser.Internals.IARRAY:
                    argCount = item.value;
                    args = [];
                    while (argCount-- > 0) {
                        args.unshift(nstack.pop());
                    }
                    nstack.push('[' + args.join(', ') + ']');
                    break;
                case Modules.ExprParser.Internals.IEXPR:
                    nstack.push('(' + this.expression(item.value) + ')');
                    break;
                case Modules.ExprParser.Internals.IENDSTATEMENT:
                    break;
                default:
                    throw new EvalError('invalid Expression');
            }
        }
        if (nstack.length > 1) {
            nstack = [ nstack.join(';') ]
        }
        return String(nstack[0]);
    }
}

/** @type {LatexAPI} */
Modules.Latex = Modules.Latex || new LatexAPI()

export default Modules.Latex
