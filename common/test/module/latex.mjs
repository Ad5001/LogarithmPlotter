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
import "./base.mjs"
import "./expreval.mjs"

import { describe, it } from "mocha"
import { expect } from "chai"
import { existsSync } from "../mock/fs.mjs"

const { spy } = chaiPlugins

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
        it("should return a render result with a valid source, a width, and a height", async function() {
            const data = await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(data).to.be.an("object")
            expect(data.source).to.be.a("string")
            expect(data.source).to.satisfy(existsSync)
            expect(data.height).to.be.a("number")
            expect(data.width).to.be.a("number")
        })

        it("should call functions from the LaTeX module", async function() {
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
        it("should return the same data as async render for the same markup, font size, and color", async function() {
            const data = await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            const found = LatexAPI.findPrerendered("\\frac{x}{3}", 13, "#AA0033")
            expect(found).to.not.be.null
            expect(found.source).to.equal(data.source)
            expect(found.width).to.equal(data.width)
        })

        it("should return null if the markup hasn't been prerendered with the same markup, font size, and color", async function() {
            await LatexAPI.requestAsyncRender("\\frac{x}{3}", 13, "#AA0033")
            expect(LatexAPI.findPrerendered("\\frac{y}{3}", 13, "#AA0033")).to.be.null
            expect(LatexAPI.findPrerendered("\\frac{x}{3}", 12, "#AA0033")).to.be.null
            expect(LatexAPI.findPrerendered("\\frac{x}{3}", 13, "#3300AA")).to.be.null
        })
    })

    describe("#par", function() {
        it("should add parentheses to strings", function() {
            expect(LatexAPI.par("string")).to.equal("(string)")
            expect(LatexAPI.par("aaaa")).to.equal("(aaaa)")
            expect(LatexAPI.par("")).to.equal("()")
            expect(LatexAPI.par("(example)")).to.equal("((example))")
        })
    })

    describe("#parif", function() {
        it("should add parentheses to strings that contain one of the ones in the list", function() {
            expect(LatexAPI.parif("string", ["+"])).to.equal("string")
            expect(LatexAPI.parif("string+assert", ["+"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("string+assert", ["+", "-"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("string-assert", ["+", "-"])).to.equal("(string-assert)")
        })

        it("shouldn't add new parentheses to strings that contains one of the ones in the list if they already have one", function() {
            expect(LatexAPI.parif("(string+assert", ["+"])).to.equal("((string+assert)")
            expect(LatexAPI.parif("string+assert)", ["+"])).to.equal("(string+assert))")
            expect(LatexAPI.parif("(string+assert)", ["+"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("(string+assert)", ["+", "-"])).to.equal("(string+assert)")
            expect(LatexAPI.parif("(string-assert)", ["+", "-"])).to.equal("(string-assert)")
        })

        it("shouldn't add parentheses to strings that does not contains one of the ones in the list", function() {
            expect(LatexAPI.parif("string", ["+"])).to.equal("string")
            expect(LatexAPI.parif("string+assert", ["-"])).to.equal("string+assert)")
            expect(LatexAPI.parif("(string*assert", ["+", "-"])).to.equal("(string*assert")
            expect(LatexAPI.parif("string/assert)", ["+", "-"])).to.equal("string/assert)")
        })

        it("should remove parentheses from strings that does not contains one of the ones in the list", function() {
            expect(LatexAPI.parif("(string)", ["+"])).to.equal("string")
            expect(LatexAPI.parif("(string+assert)", ["-"])).to.equal("string+assert")
            expect(LatexAPI.parif("((string*assert)", ["+", "-"])).to.equal("(string*assert")
            expect(LatexAPI.parif("(string/assert))", ["+", "-"])).to.equal("string/assert)")
        })
    })

    describe("#variable", function() {
        
    })
})