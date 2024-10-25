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

// Load prior tests
import "../basics/utils.mjs"
import "./base.mjs"
import "./expreval.mjs"

import { describe, it } from "mocha"
import { expect } from "chai"
import { existsSync } from "../mock/fs.mjs"

const { spy } = chaiPlugins

import ExprEval from "../../src/module/expreval.mjs"
import LatexAPI from "../../src/module/latex.mjs"

describe("Module/Latex", function() {
    it("is defined as a global", function() {
        expect(globalThis.Modules.Latex).to.equal(LatexAPI)
    })

    describe("#initialize", function() {
        it("isn't enabled before initialization", function() {
            expect(LatexAPI.enabled).to.be.false
        })

        it("is enabled after initialization", function() {
            LatexAPI.initialize({ latex: Latex, helper: Helper })
            expect(LatexAPI.enabled).to.equal(Helper.getSetting("enable_latex"))
            expect(LatexAPI.initialized).to.be.true
        })
    })

    describe("#requestAsyncRender", function() {
        it("returns a render result with a valid source, a width, and a height", async function() {
            const data = await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(data).to.be.an("object")
            expect(data.source).to.be.a("string")
            expect(data.source).to.satisfy(existsSync)
            expect(data.height).to.be.a("number")
            expect(data.width).to.be.a("number")
        })

        it("calls functions from the LaTeX module", async function() {
            const renderSyncSpy = spy.on(Latex, "renderSync")
            const renderAsyncSpy = spy.on(Latex, "renderAsync")
            Latex.supportsAsyncRender = true
            await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(renderAsyncSpy).to.have.been.called.once
            expect(renderSyncSpy).to.have.been.called.once // Called async
            Latex.supportsAsyncRender = false
            await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(renderAsyncSpy).to.have.been.called.once // From the time before
            expect(renderSyncSpy).to.have.been.called.twice
            Latex.supportsAsyncRender = true
        })

        it("should not reply with the same source for different markup, font size, or color.", async function() {
            const datas = [
                await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033"),
                await LatexAPI.requestAsyncRender("\\frac{x}{4}", 13, "#AA0033"),
                await LatexAPI.requestAsyncRender("\\frac{x}{3}", 14, "#AA0033"),
                await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#0033AA")
            ]
            const sources = datas.map(x => x.source)
            expect(new Set(sources)).to.have.a.lengthOf(4)
        })
    })

    describe("#findPrerendered", function() {
        it("returns the same data as async render for the same markup, font size, and color", async function() {
            const data = await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            const found = LatexAPI.findPrerendered("\\frac{x}{3}", 13, "#AA0033")
            expect(found).to.not.be.null
            expect(found.source).to.equal(data.source)
            expect(found.width).to.equal(data.width)
        })

        it("returns null if the markup hasn't been prerendered with the same markup, font size, and color", async function() {
            await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(LatexAPI.findPrerendered("\\frac{y}{3}", 13, "#AA0033")).to.be.null
            expect(LatexAPI.findPrerendered("\\frac{x}{3}", 12, "#AA0033")).to.be.null
            expect(LatexAPI.findPrerendered("\\frac{x}{3}", 13, "#3300AA")).to.be.null
        })
    })

    describe("#par", function() {
        it("adds parentheses to strings", function() {
            expect(LatexAPI.par("string")).to.equal("(string)")
            expect(LatexAPI.par("aaaa")).to.equal("(aaaa)")
            expect(LatexAPI.par("")).to.equal("()")
            expect(LatexAPI.par("(example)")).to.equal("((example))")
        })
    })

    describe("#parif", function() {
        it("adds parentheses to strings that contain one of the ones in the list", function() {
            expect(LatexAPI.parif("string", ["+"])).to.equal("string")
            expect(LatexAPI.parif("string+assert", ["+"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("string+assert", ["+", "-"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("string-assert", ["+", "-"])).to.equal("(string-assert)")
        })

        it("doesn't add new parentheses to strings that contains one of the ones in the list if they already have one", function() {
            expect(LatexAPI.parif("(string+assert", ["+"])).to.equal("((string+assert)")
            expect(LatexAPI.parif("string+assert)", ["+"])).to.equal("(string+assert))")
            expect(LatexAPI.parif("(string+assert)", ["+"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("(string+assert)", ["+", "-"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("(string-assert)", ["+", "-"])).to.equal("(string-assert)")
        })

        it("doesn't add parentheses to strings that does not contains one of the ones in the list", function() {
            expect(LatexAPI.parif("string", ["+"])).to.equal("string")
            expect(LatexAPI.parif("string+assert", ["-"])).to.equal("string+assert")
            expect(LatexAPI.parif("(string*assert", ["+", "-"])).to.equal("(string*assert")
            expect(LatexAPI.parif("string/assert)", ["+", "-"])).to.equal("string/assert)")
        })

        it("removes parentheses from strings that does not contains one of the ones in the list", function() {
            expect(LatexAPI.parif("(string)", ["+"])).to.equal("string")
            expect(LatexAPI.parif("(string+assert)", ["-"])).to.equal("string+assert")
            expect(LatexAPI.parif("((string*assert)", ["+", "-"])).to.equal("(string*assert")
            expect(LatexAPI.parif("(string/assert))", ["+", "-"])).to.equal("string/assert)")
        })
    })

    describe("#variable", function() {
        const from = [
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
        const to = [
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

        it("converts unicode characters to their latex equivalent", function() {
            for(let i = 0; i < from.length; i++)
                expect(LatexAPI.variable(from[i])).to.include(to[i])
        })

        it("wraps within dollar signs when the option is included", function() {
            for(let i = 0; i < from.length; i++) {
                expect(LatexAPI.variable(from[i], false)).to.equal(to[i])
                expect(LatexAPI.variable(from[i], true)).to.equal(`$${to[i]}$`)
            }
        })

        it("can convert multiple of them", function() {
            expect(LatexAPI.variable("α₂", false)).to.equal("\\alpha{}_{2}")
            expect(LatexAPI.variable("∞piΠ", false)).to.equal("\\infty\\pi\\Pi")
        })
    })

    describe("#functionToLatex", function() {
        it("transforms derivatives into latex fractions", function() {
            const d1 = LatexAPI.functionToLatex("derivative", ["'3t'", "'t'", "x+2"])
            const d2 = LatexAPI.functionToLatex("derivative", ["f", "x+2"])
            expect(d1).to.equal("\\frac{d3x}{dx}")
            expect(d2).to.equal("\\frac{df}{dx}(x+2)")
        })

        it("transforms integrals into latex limits", function() {
            const i1 = LatexAPI.functionToLatex("integral", ["0", "x", "'3y'", "'y'"])
            const i2 = LatexAPI.functionToLatex("integral", ["1", "2", "f"])
            expect(i1).to.equal("\\int\\limits_{0}^{x}3y dy")
            expect(i2).to.equal("\\int\\limits_{1}^{2}f(t) dt")
        })

        it("transforms sqrt functions to sqrt latex", function()  {
            const sqrt1 = LatexAPI.functionToLatex("sqrt", ["(x+2)"])
            const sqrt2 = LatexAPI.functionToLatex("sqrt", ["\\frac{x}{2}"])
            expect(sqrt1).to.equal("\\sqrt{x+2}")
            expect(sqrt2).to.equal("\\sqrt{\\frac{x}{2}}")
        })

        it("transforms abs, floor and ceil", function() {
            const abs = LatexAPI.functionToLatex("abs", ["x+3"])
            const floor = LatexAPI.functionToLatex("floor", ["x+3"])
            const ceil = LatexAPI.functionToLatex("ceil", ["x+3"])
            expect(abs).to.equal("\\left|x+3\\right|")
            expect(floor).to.equal("\\left\\lfloor{x+3}\\right\\rfloor")
            expect(ceil).to.equal("\\left\\lceil{x+3}\\right\\rceil")
        })

        it("transforms regular functions into latex", function() {
            const f1 = LatexAPI.functionToLatex("f", ["x+3", true])
            const f2 = LatexAPI.functionToLatex("h_1", ["10"])
            expect(f1).to.equal("\\mathrm{f}\\left(x+3, true\\right)")
            expect(f2).to.equal("\\mathrm{h_1}\\left(10\\right)")
        })
    })

    describe("#expression", function() {
        it("transforms parsed expressions", function() {
            const expr = ExprEval.parse("(+1! == 2/2 ? sin [-2.2][0] : f(t)^(1+1-1) + sqrt(A.t)) * 3 % 1")
            const expected = "((((+1!))==(\\frac{2}{2}) ? (\\mathrm{sin}\\left(([(-2.2)][0])\\right)) : (\\mathrm{f}\\left(t\\right)^{1+1-1}+\\sqrt{A.t})) \\times 3) \\mathrm{mod} 1"
            expect(LatexAPI.expression(expr.tokens)).to.equal(expected)
        })
    })
})