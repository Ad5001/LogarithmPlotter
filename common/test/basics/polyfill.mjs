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

import { describe, it } from "mocha"
import { expect } from "chai"

import * as Polyfill from "../../src/lib/expr-eval/polyfill.mjs"
import {
    andOperator,
    cbrt,
    equal,
    expm1,
    hypot,
    lessThan,
    log1p,
    log2,
    notEqual
} from "../../src/lib/expr-eval/polyfill.mjs"

describe("Math/Polyfill", () => {
    describe("#add", function() {
        it("adds two numbers", function() {
            expect(Polyfill.add(2, 3)).to.equal(5)
            expect(Polyfill.add("2", "3")).to.equal(5)
        })
    })

    describe("#sub", function() {
        it("subtracts two numbers", function() {
            expect(Polyfill.sub(2, 1)).to.equal(1)
            expect(Polyfill.sub("2", "1")).to.equal(1)
        })
    })

    describe("#mul", function() {
        it("multiplies two numbers", function() {
            expect(Polyfill.mul(2, 3)).to.equal(6)
            expect(Polyfill.mul("2", "3")).to.equal(6)
        })
    })

    describe("#div", function() {
        it("divides two numbers", function() {
            expect(Polyfill.div(10, 2)).to.equal(5)
            expect(Polyfill.div("10", "2")).to.equal(5)
        })
    })

    describe("#mod", function() {
        it("returns the modulo of two numbers", function() {
            expect(Polyfill.mod(10, 3)).to.equal(1)
            expect(Polyfill.mod("10", "3")).to.equal(1)
        })
    })

    describe("#concat", function() {
        it("returns the concatenation of two strings", function() {
            expect(Polyfill.concat(10, 3)).to.equal("103")
            expect(Polyfill.concat("abc", "def")).to.equal("abcdef")
        })
    })

    describe("#equal", function() {
        it("returns whether its two arguments are equal", function() {
            expect(Polyfill.equal(10, 3)).to.be.false
            expect(Polyfill.equal(10, 10)).to.be.true
            expect(Polyfill.equal("abc", "def")).to.be.false
            expect(Polyfill.equal("abc", "abc")).to.be.true
        })
    })

    describe("#notEqual", function() {
        it("returns whether its two arguments are not equal", function() {
            expect(Polyfill.notEqual(10, 3)).to.be.true
            expect(Polyfill.notEqual(10, 10)).to.be.false
            expect(Polyfill.notEqual("abc", "def")).to.be.true
            expect(Polyfill.notEqual("abc", "abc")).to.be.false
        })
    })

    describe("#greaterThan", function() {
        it("returns whether its first argument is strictly greater than its second", function() {
            expect(Polyfill.greaterThan(10, 3)).to.be.true
            expect(Polyfill.greaterThan(10, 10)).to.be.false
            expect(Polyfill.greaterThan(10, 30)).to.be.false
        })
    })

    describe("#lessThan", function() {
        it("returns whether its first argument is strictly less than its second", function() {
            expect(Polyfill.lessThan(10, 3)).to.be.false
            expect(Polyfill.lessThan(10, 10)).to.be.false
            expect(Polyfill.lessThan(10, 30)).to.be.true
        })
    })

    describe("#greaterThanEqual", function() {
        it("returns whether its first argument is greater or equal to its second", function() {
            expect(Polyfill.greaterThanEqual(10, 3)).to.be.true
            expect(Polyfill.greaterThanEqual(10, 10)).to.be.true
            expect(Polyfill.greaterThanEqual(10, 30)).to.be.false
        })
    })

    describe("#lessThanEqual", function() {
        it("returns whether its first argument is strictly less than its second", function() {
            expect(Polyfill.lessThanEqual(10, 3)).to.be.false
            expect(Polyfill.lessThanEqual(10, 10)).to.be.true
            expect(Polyfill.lessThanEqual(10, 30)).to.be.true
        })
    })

    describe("#andOperator", function() {
        it("returns whether its arguments are both true", function() {
            expect(Polyfill.andOperator(true, true)).to.be.true
            expect(Polyfill.andOperator(true, false)).to.be.false
            expect(Polyfill.andOperator(false, true)).to.be.false
            expect(Polyfill.andOperator(false, false)).to.be.false
            expect(Polyfill.andOperator(10, 3)).to.be.true
            expect(Polyfill.andOperator(10, 0)).to.be.false
            expect(Polyfill.andOperator(0, 0)).to.be.false
        })
    })

    describe("#orOperator", function() {
        it("returns whether one of its arguments is true", function() {
            expect(Polyfill.orOperator(true, true)).to.be.true
            expect(Polyfill.orOperator(true, false)).to.be.true
            expect(Polyfill.orOperator(false, true)).to.be.true
            expect(Polyfill.orOperator(false, false)).to.be.false
            expect(Polyfill.orOperator(10, 3)).to.be.true
            expect(Polyfill.orOperator(10, 0)).to.be.true
            expect(Polyfill.orOperator(0, 0)).to.be.false
        })
    })

    describe("#inOperator", function() {
        it("checks if second argument contains first", function() {
            expect(Polyfill.inOperator("a", ["a", "b", "c"])).to.be.true
            expect(Polyfill.inOperator(3, [0, 1, 2])).to.be.false
            expect(Polyfill.inOperator(3, [0, 1, 3, 2])).to.be.true
            expect(Polyfill.inOperator("a", "abcdef")).to.be.true
            expect(Polyfill.inOperator("a", "bcdefg")).to.be.false
        })
    })

    describe("#sinh, #cosh, #tanh, #asinh, #acosh, #atanh", function() {
        const EPSILON = 1e-12
        for(let x = -.9; x < 1; x += 0.1) {
            expect(Polyfill.sinh(x)).to.be.approximately(Math.sinh(x), EPSILON)
            expect(Polyfill.cosh(x)).to.be.approximately(Math.cosh(x), EPSILON)
            expect(Polyfill.tanh(x)).to.be.approximately(Math.tanh(x), EPSILON)
            expect(Polyfill.asinh(x)).to.be.approximately(Math.asinh(x), EPSILON)
            expect(Polyfill.atanh(x)).to.be.approximately(Math.atanh(x), EPSILON)
        }
        for(let x = 1.1; x < 10; x += 0.1) {
            expect(Polyfill.sinh(x)).to.be.approximately(Math.sinh(x), EPSILON)
            expect(Polyfill.cosh(x)).to.be.approximately(Math.cosh(x), EPSILON)
            expect(Polyfill.tanh(x)).to.be.approximately(Math.tanh(x), EPSILON)
            expect(Polyfill.asinh(x)).to.be.approximately(Math.asinh(x), EPSILON)
            expect(Polyfill.acosh(x)).to.be.approximately(Math.acosh(x), EPSILON)
            expect(Polyfill.log10(x)).to.be.approximately(Math.log10(x), EPSILON)
        }
    })

    describe("#trunc", function() {
        it("returns the decimal part of floats", function() {
            for(let x = -10; x < 10; x += 0.1)
                expect(Polyfill.trunc(x)).to.equal(Math.trunc(x))
        })
    })

    describe("#gamma", function() {
        it("returns the product of factorial(x - 1)", function() {
            expect(Polyfill.gamma(0)).to.equal(Infinity)
            expect(Polyfill.gamma(1)).to.equal(1)
            expect(Polyfill.gamma(2)).to.equal(1)
            expect(Polyfill.gamma(3)).to.equal(2)
            expect(Polyfill.gamma(4)).to.equal(6)
            expect(Polyfill.gamma(5)).to.equal(24)
            expect(Polyfill.gamma(172)).to.equal(Infinity)
            expect(Polyfill.gamma(172.3)).to.equal(Infinity)
            expect(Polyfill.gamma(.2)).to.approximately(4.590_843_712, 1e-8)
            expect(Polyfill.gamma(5.5)).to.be.approximately(52.34277778, 1e-8)
            expect(Polyfill.gamma(90.2)).to.equal(4.0565358202825355e+136)
        })
    })

    describe("#hypot", function() {
        it("returns the hypothenus length of a triangle whose length are provided in arguments", function() {
            for(let x = 0; x < 10; x += 0.3) {
                expect(Polyfill.hypot(x)).to.be.approximately(Math.hypot(x), Number.EPSILON)
                for(let y = 0; y < 10; y += 0.3) {
                    expect(Polyfill.hypot(x, y)).to.be.approximately(Math.hypot(x, y), Number.EPSILON)
                }
            }
        })
    })

    describe("#sign, #cbrt, #exmp1", function() {
        for(let x = -10; x < 10; x += 0.3) {
            expect(Polyfill.sign(x)).to.approximately(Math.sign(x), 1e-12)
            expect(Polyfill.cbrt(x)).to.approximately(Math.cbrt(x), 1e-12)
            expect(Polyfill.expm1(x)).to.approximately(Math.expm1(x), 1e-12)
        }
    })

    describe("#log1p, #log2", function() {
        for(let x = 1; x < 10; x += 0.3) {
            expect(Polyfill.log1p(x)).to
                                     .be.approximately(Math.log1p(x), 1e-12)
            expect(Polyfill.log2(x)).to.be.approximately(Math.log2(x), 1e-12)
        }
    })
})