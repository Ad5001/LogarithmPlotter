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

import { Module } from "./common.mjs"
import * as Instruction from "../lib/expr-eval/instruction.mjs"
import { escapeValue } from "../lib/expr-eval/expression.mjs"
import { HelperInterface, LatexInterface } from "./interface.mjs"

const unicodechars = [
    "α", "β", "γ", "δ", "ε", "ζ", "η",
    "π", "θ", "κ", "λ", "μ", "ξ", "ρ",
    "ς", "σ", "τ", "φ", "χ", "ψ", "ω",
    "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ",
    "Φ", "Ψ", "Ω", "ₐ", "ₑ", "ₒ", "ₓ",
    "ₕ", "ₖ", "ₗ", "ₘ", "ₙ", "ₚ", "ₛ",
    "ₜ", "¹", "²", "³", "⁴", "⁵", "⁶",
    "⁷", "⁸", "⁹", "⁰", "₁", "₂", "₃",
    "₄", "₅", "₆", "₇", "₈", "₉", "₀",
    "pi", "∞"]
const equivalchars = [
    "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\zeta", "\\eta",
    "\\pi", "\\theta", "\\kappa", "\\lambda", "\\mu", "\\xi", "\\rho",
    "\\sigma", "\\sigma", "\\tau", "\\phi", "\\chi", "\\psi", "\\omega",
    "\\Gamma", "\\Delta", "\\Theta", "\\Lambda", "\\Xi", "\\Pi", "\\Sigma",
    "\\Phy", "\\Psi", "\\Omega", "{}_{a}", "{}_{e}", "{}_{o}", "{}_{x}",
    "{}_{h}", "{}_{k}", "{}_{l}", "{}_{m}", "{}_{n}", "{}_{p}", "{}_{s}",
    "{}_{t}", "{}^{1}", "{}^{2}", "{}^{3}", "{}^{4}", "{}^{5}", "{}^{6}",
    "{}^{7}", "{}^{8}", "{}^{9}", "{}^{0}", "{}_{1}", "{}_{2}", "{}_{3}",
    "{}_{4}", "{}_{5}", "{}_{6}", "{}_{7}", "{}_{8}", "{}_{9}", "{}_{0}",
    "\\pi", "\\infty"]

/**
 * Class containing the result of a LaTeX render.
 *
 * @property {string} source - Exported PNG file
 * @property {number} width
 * @property {number} height
 */
class LatexRenderResult {
    constructor(source, width, height) {
        this.source = source
        this.width = parseFloat(width)
        this.height = parseFloat(height)
    }
}

class LatexAPI extends Module {
    /** @type {LatexInterface} */
    #latex = null

    constructor() {
        super("Latex", {
            latex: LatexInterface,
            helper: HelperInterface
        })
        /**
         * true if latex has been enabled by the user, false otherwise.
         */
        this.enabled = false
    }

    /**
     * @param {LatexInterface} latex
     * @param {HelperInterface} helper
     */
    initialize({ latex, helper }) {
        super.initialize({ latex, helper })
        this.#latex = latex
        this.enabled = helper.getSetting("enable_latex")
    }

    /**
     * Checks if the given markup (with given font size and color) has already been
     * rendered, and if so, returns its data. Otherwise, returns null.
     *
     * @param {string} markup - LaTeX markup to render.
     * @param {number} fontSize - Font size (in pt) to render.
     * @param {string} color - Color of the text to render.
     * @returns {LatexRenderResult|null}
     */
    findPrerendered(markup, fontSize, color) {
        if(!this.initialized) throw new Error("Attempting findPrerendered before initialize!")
        const data = this.#latex.findPrerendered(markup, fontSize, color)
        let ret = null
        if(data !== "")
            ret = new LatexRenderResult(...data.split(","))
        return ret
    }

    /**
     * Prepares and renders a latex string into a png file asynchronously.
     *
     * @param {string} markup - LaTeX markup to render.
     * @param {number} fontSize - Font size (in pt) to render.
     * @param {string} color - Color of the text to render.
     * @returns {Promise<LatexRenderResult>}
     */
    async requestAsyncRender(markup, fontSize, color) {
        if(!this.initialized) throw new Error("Attempting requestAsyncRender before initialize!")
        let render
        if(this.#latex.supportsAsyncRender)
            render = await this.#latex.renderAsync(markup, fontSize, color)
        else
            render = this.#latex.renderSync(markup, fontSize, color)
        const args = render.split(",")
        return new LatexRenderResult(...args)
    }

    /**
     * Puts element within parenthesis.
     *
     * @param {string|number} elem - element to put within parenthesis.
     * @returns {string}
     */
    par(elem) {
        return `(${elem})`
    }

    /**
     * Checks if the element contains at least one of the elements of
     * the string array contents, but not at the first position of the string,
     * and returns the parenthesis version if so.
     *
     * @param {string|number} elem - element to put within parenthesis.
     * @param {Array} contents - Array of elements to put within parenthesis.
     * @returns {string}
     */
    parif(elem, contents) {
        elem = elem.toString()
        const contains = contents.some(x => elem.indexOf(x) > 0)
        if(elem[0] !== "(" && elem.at(-1) !== ")" && contains)
            return this.par(elem)
        if(elem[0] === "(" && elem.at(-1) === ")" && !contains)
            return elem.removeEnclosure()
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
                    return `\\frac{d${args[0].removeEnclosure().replaceAll(args[1].removeEnclosure(), "x")}}{dx}`
                else
                    return `\\frac{d${args[0]}}{dx}(${args[1]})`
            case "integral":
                if(args.length === 4)
                    return `\\int\\limits_{${args[0]}}^{${args[1]}}${args[2].removeEnclosure()} d${args[3].removeEnclosure()}`
                else
                    return `\\int\\limits_{${args[0]}}^{${args[1]}}${args[2]}(t) dt`
            case "sqrt":
                return `\\sqrt\\left(${args.join(", ")}\\right)`
            case "abs":
                return `\\left|${args.join(", ")}\\right|`
            case "floor":
                return `\\left\\lfloor${args.join(", ")}\\right\\rfloor`
            case "ceil":
                return `\\left\\lceil${args.join(", ")}\\right\\rceil`
            default:
                return `\\mathrm{${f}}\\left(${args.join(", ")}\\right)`
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
                    vari = vari.replaceAll(unicodechars[i], "$" + equivalchars[i] + "$")
            }
        else
            for(let i = 0; i < unicodechars.length; i++) {
                if(vari.includes(unicodechars[i]))
                    vari = vari.replaceAll(unicodechars[i], equivalchars[i])
            }
        return vari
    }

    /**
     * Converts expr-eval instructions to a latex string.
     *
     * @param {Instruction[]} instructions - expr-eval tokens list
     * @returns {string}
     */
    expression(instructions) {
        let nstack = []
        let n1, n2, n3
        let f, args, argCount
        for(let item of instructions) {
            let type = item.type

            switch(type) {
                case Instruction.INUMBER:
                    if(item.value === Infinity) {
                        nstack.push("\\infty")
                    } else if(typeof item.value === "number" && item.value < 0) {
                        nstack.push(this.par(item.value))
                    } else if(Array.isArray(item.value)) {
                        nstack.push("[" + item.value.map(escapeValue).join(", ") + "]")
                    } else {
                        nstack.push(escapeValue(item.value))
                    }
                    break
                case Instruction.IOP2:
                    n2 = nstack.pop()
                    n1 = nstack.pop()
                    f = item.value
                    switch(f) {
                        case "-":
                        case "+":
                            nstack.push(n1 + f + n2)
                            break
                        case "||":
                        case "or":
                        case "&&":
                        case "and":
                        case "==":
                        case "!=":
                            nstack.push(this.par(n1) + f + this.par(n2))
                            break
                        case "*":
                            if(n2 === "\\pi" || n2 === "e" || n2 === "x" || n2 === "n")
                                nstack.push(this.parif(n1, ["+", "-"]) + n2)
                            else
                                nstack.push(this.parif(n1, ["+", "-"]) + " \\times " + this.parif(n2, ["+", "-"]))
                            break
                        case "/":
                            nstack.push("\\frac{" + n1 + "}{" + n2 + "}")
                            break
                        case "^":
                            nstack.push(this.parif(n1, ["+", "-", "*", "/", "!"]) + "^{" + n2 + "}")
                            break
                        case "%":
                            nstack.push(this.parif(n1, ["+", "-", "*", "/", "!", "^"]) + " \\mathrm{mod} " + this.parif(n2, ["+", "-", "*", "/", "!", "^"]))
                            break
                        case "[":
                            nstack.push(n1 + "[" + n2 + "]")
                            break
                        default:
                            throw new EvalError("Unknown operator " + item.value + ".")
                    }
                    break
                case Instruction.IOP3: // Ternary operator
                    n3 = nstack.pop()
                    n2 = nstack.pop()
                    n1 = nstack.pop()
                    f = item.value
                    if(f === "?") {
                        nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")")
                    } else {
                        throw new EvalError("Unknown operator " + item.value + ".")
                    }
                    break
                case Instruction.IVAR:
                case Instruction.IVARNAME:
                    nstack.push(this.variable(item.value.toString()))
                    break
                case Instruction.IOP1: // Unary operator
                    n1 = nstack.pop()
                    f = item.value
                    switch(f) {
                        case "-":
                        case "+":
                            nstack.push(this.par(f + n1))
                            break
                        case "!":
                            nstack.push(this.parif(n1, ["+", "-", "*", "/", "^"]) + "!")
                            break
                        default:
                            nstack.push(f + this.parif(n1, ["+", "-", "*", "/", "^"]))
                            break
                    }
                    break
                case Instruction.IFUNCALL:
                    argCount = item.value
                    args = []
                    while(argCount-- > 0) {
                        args.unshift(nstack.pop())
                    }
                    f = nstack.pop()
                    // Handling various functions
                    nstack.push(this.functionToLatex(f, args))
                    break
                case Instruction.IMEMBER:
                    n1 = nstack.pop()
                    nstack.push(n1 + "." + item.value)
                    break
                case Instruction.IARRAY:
                    argCount = item.value
                    args = []
                    while(argCount-- > 0) {
                        args.unshift(nstack.pop())
                    }
                    nstack.push("[" + args.join(", ") + "]")
                    break
                case Instruction.IEXPR:
                    nstack.push("(" + this.expression(item.value) + ")")
                    break
                case Instruction.IENDSTATEMENT:
                    break
                default:
                    throw new EvalError("invalid Expression")
            }
        }
        if(nstack.length > 1) {
            nstack = [nstack.join(";")]
        }
        return String(nstack[0])
    }
}

/** @type {LatexAPI} */
Modules.Latex = Modules.Latex || new LatexAPI()
/** @type {LatexAPI} */
export default Modules.Latex
