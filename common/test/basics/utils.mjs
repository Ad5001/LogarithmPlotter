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

import { textsup, textsub, parseName, getRandomColor, escapeHTML, exponentsToExpression } from "../../src/utils.mjs"


import { describe, it } from "mocha"
import { expect } from "chai"

describe("Extensions", function() {
    describe("#String.toLatinUppercase", function() {
        it("should be able to transform latin characters from strings to their uppercase version", function() {
            expect("abc".toLatinUppercase()).to.equal("ABC")
            expect("abCd".toLatinUppercase()).to.equal("ABCD")
            expect("ab123cd456".toLatinUppercase()).to.equal("AB123CD456")
            expect("ABC".toLatinUppercase()).to.equal("ABC")
        })

        it("shouldn't transform non latin characters to their uppercase version", function() {
            expect("abαπ".toLatinUppercase()).to.equal("ABαπ")
            expect("abαπ".toLatinUppercase()).to.not.equal("abαπ".toUpperCase())
        })
    })

    describe("#String.removeEnclosure", function() {
        it("should be able to remove the first and last characters", function() {
            expect("[1+t]".removeEnclosure()).to.equal("1+t")
            expect('"a+b+c*d"'.removeEnclosure()).to.equal("a+b+c*d")
            expect("(pi/2)".removeEnclosure()).to.equal("pi/2")
        })
    })

    describe("#Number.toDecimalPrecision", function() {
        it("should be able to round a number to a fixed decimal precision", function() {
            expect(123.456789.toDecimalPrecision()).to.equal(123)
            expect(123.456789.toDecimalPrecision(1)).to.equal(123.5)
            expect(123.456789.toDecimalPrecision(2)).to.equal(123.46)
            expect(123.456789.toDecimalPrecision(3)).to.equal(123.457)
            expect(123.456789.toDecimalPrecision(4)).to.equal(123.4568)
            expect(123.456789.toDecimalPrecision(5)).to.equal(123.45679)
            expect(123.456789.toDecimalPrecision(6)).to.equal(123.456789)
            expect(123.111111.toDecimalPrecision(5)).to.equal(123.11111)
        })
    })
})

describe("Utils", function() {
    describe("#textsup", function() {
        it("should transform characters which have a sup unicode equivalent", function()  {
            expect(textsup("-+=()")).to.equal("⁻⁺⁼⁽⁾")
            expect(textsup("0123456789")).to.equal("⁰¹²³⁴⁵⁶⁷⁸⁹")
            expect(textsup("abcdefghijklmnoprstuvwxyz")).to.equal("ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ")
        })

        it("shouldn't transform characters without a sup equivalent", function() {
            expect(textsup("ABCDEFGHIJKLMNOPQRSTUVWXYZq")).to.equal("ABCDEFGHIJKLMNOPQRSTUVWXYZq")
        })

        it("should partially transform strings which only have a few characters with a sup equivalent", function() {
            expect(textsup("ABCabcABC")).to.equal("ABCᵃᵇᶜABC")
        })
    })

    describe("#textsub", function() {
        it("should transform characters which have a sub unicode equivalent", function()  {
            expect(textsub("-+=()")).to.equal("₋₊₌₍₎")
            expect(textsub("0123456789")).to.equal("₀₁₂₃₄₅₆₇₈₉")
            expect(textsub("aehijklmnoprstuvx")).to.equal("ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ")
        })

        it("shouldn't transform characters without a sub equivalent", function() {
            expect(textsub("ABCDEFGHIJKLMNOPQRSTUVWXYZ")).to.equal("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
            expect(textsub("bcdfgqyz")).to.equal("bcdfgqyz")
        })

        it("should partially transform strings which only have a few characters with a sub equivalent", function() {
            expect(textsub("ABC123ABC")).to.equal("ABC₁₂₃ABC")
        })
    })

    describe("#parseName", function() {
        it("should parse greek letter names", function() {
            const shorthands = {
                "α": ["al", "alpha"],
                "β": ["be", "beta"],
                "γ": ["ga", "gamma"],
                "δ": ["de", "delta"],
                "ε": ["ep", "epsilon"],
                "ζ": ["ze", "zeta"],
                "η": ["et", "eta"],
                "θ": ["th", "theta"],
                "κ": ["ka", "kappa"],
                "λ": ["la", "lambda"],
                "μ": ["mu"],
                "ν": ["nu"],
                "ξ": ["xi"],
                "ρ": ["rh", "rho"],
                "σ": ["si", "sigma"],
                "τ": ["ta", "tau"],
                "υ": ["up", "upsilon"],
                "φ": ["ph", "phi"],
                "χ": ["ch", "chi"],
                "ψ": ["ps", "psi"],
                "ω": ["om", "omega"],
                "Γ": ["gga", "ggamma"],
                "Δ": ["gde", "gdelta"],
                "Θ": ["gth", "gtheta"],
                "Λ": ["gla", "glambda"],
                "Ξ": ["gxi"],
                "Π": ["gpi"],
                "Σ": ["gsi", "gsigma"],
                "Φ": ["gph", "gphi"],
                "Ψ": ["gps", "gpsi"],
                "Ω": ["gom", "gomega"],
            }
            for(const [char, shorts] of Object.entries(shorthands)) {
                expect(parseName(char)).to.equal(char)
                for(const short of shorts)
                    expect(parseName(short)).to.equal(char)
            }
        })

        it("should parse array elements into sub", function() {
            expect(parseName("u[n+1]")).to.equal("uₙ₊₁")
            expect(parseName("u[(n+x)]")).to.equal("u₍ₙ₊ₓ₎")
            expect(parseName("u[A]")).to.equal("uA")
        })

        it("should remove disallowed characters when indicated", function() {
            const disallowed = "xnπℝℕ\\∪∩[] ()^/^/÷*×+=1234567890¹²³⁴⁵⁶⁷⁸⁹⁰-"
            expect(parseName(disallowed)).to.equal("")
            expect(parseName("AA" + disallowed)).to.equal("AA")
            expect(parseName(disallowed, false)).to.equal(disallowed)
        })

        it("should be able to do all three at once", function() {
            expect(parseName("al[n+1]+n")).to.equal("αₙ₊₁")
            expect(parseName("al[n+1]+n", false)).to.equal("αₙ₊₁+n")
        })
    })

    describe("#getRandomColor", function() {
        it("should provide a valid color", function() {
            const colorReg = /^#[A-F\d]{6}$/
            for(let i = 0; i < 50; i++)
                expect(getRandomColor()).to.match(colorReg)
        })
    })

    describe("#escapeHTML", function() {
        it("should should escape ampersands", function() {
            expect(escapeHTML("&")).to.equal("&amp;")
            expect(escapeHTML("High & Mighty")).to.equal("High &amp; Mighty")
        })

        it("should escape injected HTML tags", function() {
            expect(escapeHTML("<script>alert('Injected!')</script>")).to.equal("&lt;script&gt;alert('Injected!')&lt;/script&gt;")
            expect(escapeHTML('<a href="javascript:alert()">Link</a>')).to.equal('&lt;a href="javascript:alert()"&gt;Link&lt;/a&gt;')
        })
    })

    describe("#exponentsToExpression", function() {
        it("should transform exponents to power expression", function() {
            expect(exponentsToExpression("x¹²³⁴⁵⁶⁷⁸⁹⁰")).to.equal("x^1234567890")
            expect(exponentsToExpression("x¹²+y³⁴")).to.equal("x^12+y^34")
        })
    })
})
