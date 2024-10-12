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

import { describe, it } from "mocha"
import { expect } from "chai"

import ExprEval from "../../src/module/expreval.mjs"

describe("Module/ExprEval", function() {
    describe("#parse", function() {
        const evaluate = (expr, vals) => ExprEval.parse(expr).evaluate(vals)
        it("parses simple mathematical expressions", function() {
            expect(evaluate("1", {})).to.equal(1)
            expect(evaluate("-1", {})).to.equal(-1)
            expect(evaluate("-(-1)", {})).to.equal(1)
            expect(evaluate("+(-1)", {})).to.equal(-1)
            expect(evaluate("3!", {})).to.equal(6)
            expect(evaluate("1+1", {})).to.equal(2)
            expect(evaluate("4*3", {})).to.equal(12)
            expect(evaluate("64/4", {})).to.equal(16)
            expect(evaluate("2^10", {})).to.equal(1024)
            expect(evaluate("10%3", {})).to.equal(1)
            expect(evaluate("10%3", {})).to.equal(1)
            // Test priorities
            expect(evaluate("10*10+10*10", {})).to.equal(200)
            expect(evaluate("10/10+10/10", {})).to.equal(2)
            expect(evaluate("10/10+10/10", {})).to.equal(2)
            expect(evaluate("2^2-2^2", {})).to.equal(0)
            expect(evaluate("(2^2-2)^2", {})).to.equal(4)
        })

        it("parses equality and test statements", function() {
            expect(evaluate("10%3 == 1 ? 2 : 1", {})).to.equal(2)
            expect(evaluate("10%3 != 1 ? 2 : 1", {})).to.equal(1)
            expect(evaluate("10 < 3 ? 2 : 1", {})).to.equal(1)
            expect(evaluate("10 > 3 ? (2+1) : 1", {})).to.equal(3)
            expect(evaluate("10 <= 3 ? 4 : 1", {})).to.equal(1)
            expect(evaluate("10 >= 3 ? 4 : 1", {})).to.equal(4)
            // Check equality
            expect(evaluate("10 < 10 ? 2 : 1", {})).to.equal(1)
            expect(evaluate("10 > 10 ? 2 : 1", {})).to.equal(1)
            expect(evaluate("10 <= 10 ? 4 : 1", {})).to.equal(4)
            expect(evaluate("10 >= 10 ? 4 : 1", {})).to.equal(4)
            // Check 'and' and 'or'
            expect(evaluate("10 <= 3 and 10 < 10 ? 4 : 1", {})).to.equal(1)
            expect(evaluate("10 <= 10 and 10 < 10 ? 4 : 1", {})).to.equal(1)
            expect(evaluate("10 <= 10 and 10 < 20 ? 4 : 1", {})).to.equal(4)
            expect(evaluate("10 <= 3 or 10 < 10 ? 4 : 1", {})).to.equal(1)
            expect(evaluate("10 <= 10 or 10 < 10 ? 4 : 1", {})).to.equal(4)
            expect(evaluate("10 <= 10 or 10 < 20 ? 4 : 1", {})).to.equal(4)
        })

        it("parses singular function operators (functions with one arguments and no parenthesis)", function() {
            // Trigonometric functions
            expect(evaluate("sin π", { })).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("cos π", { })).to.be.approximately(-1, Number.EPSILON)
            expect(evaluate("tan π", { })).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("asin 1", { })).to.be.approximately(Math.PI/2, Number.EPSILON)
            expect(evaluate("acos 1", { })).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("atan 1", { })).to.be.approximately(Math.PI/4, Number.EPSILON)
            expect(evaluate("sinh 1", { })).to.be.approximately(Math.sinh(1), Number.EPSILON)
            expect(evaluate("cosh 1", { })).to.be.approximately(Math.cosh(1), Number.EPSILON)
            expect(evaluate("tanh 1", { })).to.be.approximately(Math.tanh(1), Number.EPSILON)
            expect(evaluate("asinh 1", { })).to.be.approximately(Math.asinh(1), Number.EPSILON)
            expect(evaluate("acosh 1", { })).to.be.approximately(Math.acosh(1), Number.EPSILON)
            expect(evaluate("atanh 0.5", { })).to.be.approximately(Math.atanh(0.5), Number.EPSILON)
            // Reverse trigonometric
            expect(evaluate("asin sin 1", { })).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("acos cos 1", { })).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("atan tan 1", { })).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("asinh sinh 1", { })).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("acosh cosh 1", { })).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("atanh tanh 1", { })).to.be.approximately(1, Number.EPSILON)
            // Other functions
        })
    })


    describe("#integral", function() {
        it("returns the integral value between two integers", function() {
            expect(ExprEval.integral(0, 1, "1", "t")).to.be.approximately(1, Number.EPSILON)
            expect(ExprEval.integral(0, 1, "t", "t")).to.be.approximately(1 / 2, Number.EPSILON)
            expect(ExprEval.integral(0, 1, "t^2", "t")).to.be.approximately(1 / 3, Number.EPSILON)
            expect(ExprEval.integral(0, 1, "t^3", "t")).to.be.approximately(1 / 4, 0.01)
            expect(ExprEval.integral(0, 1, "t^4", "t")).to.be.approximately(1 / 5, 0.01)

            expect(ExprEval.integral(10, 40, "1", "t")).to.equal(30)
            expect(ExprEval.integral(20, 40, "1", "t")).to.equal(20)

            expect(ExprEval.integral(0, 10, { execute: (x) => 1 })).to.equal(10)
            expect(ExprEval.integral(0, 10, { execute: (x) => x })).to.equal(50)
            expect(ExprEval.integral(0, 1, { execute: (x) => Math.pow(x, 2) })).to.equal(1 / 3)
        })


        it("throws error when provided with invalid arguments", function() {
            const noArg1 = () => ExprEval.integral()
            const noArg2 = () => ExprEval.integral(0)
            const noFunction = () => ExprEval.integral(0, 1)
            const invalidObjectProvided = () => ExprEval.integral(0, 1, { a: 2 })
            const notAnObjectProvided = () => ExprEval.integral(0, 1, "string")
            const invalidFromProvided = () => ExprEval.integral("ze", 1, "t^2", "t")
            const invalidToProvided = () => ExprEval.integral(0, "ze", "t^2", "t")
            const notStringProvided1 = () => ExprEval.integral(0, 1, { a: 2 }, { b: 1 })
            const notStringProvided2 = () => ExprEval.integral(0, 1, { a: 2 }, "t")
            const notStringProvided3 = () => ExprEval.integral(0, 1, "t^2", { b: 1 })
            const invalidVariableProvided = () => ExprEval.integral(0, 1, "t^2", "93IO74")
            const invalidExpressionProvided = () => ExprEval.integral(0, 1, "t^2t", "t")
            const invalidVariableInExpression = () => ExprEval.integral(0, 1, "t^2+x", "t")
            expect(noArg1).to.throw()
            expect(noArg2).to.throw()
            expect(noFunction).to.throw()
            expect(invalidObjectProvided).to.throw()
            expect(invalidFromProvided).to.throw()
            expect(invalidToProvided).to.throw()
            expect(notAnObjectProvided).to.throw()
            expect(notStringProvided1).to.throw()
            expect(notStringProvided2).to.throw()
            expect(notStringProvided3).to.throw()
            expect(invalidVariableProvided).to.throw()
            expect(invalidExpressionProvided).to.throw()
            expect(invalidVariableInExpression).to.throw()
        })
    })

    describe("#derivative", function() {
        const DELTA = 1e-5
        it("returns the derivative value between two integers", function() {
            expect(ExprEval.derivative("1", "t", 2)).to.be.approximately(0, DELTA)
            expect(ExprEval.derivative("t", "t", 2)).to.be.approximately(1, DELTA)
            expect(ExprEval.derivative("t^2", "t", 2)).to.be.approximately(4, DELTA)
            expect(ExprEval.derivative("t^3", "t", 2)).to.be.approximately(12, DELTA)
            expect(ExprEval.derivative("t^4", "t", 2)).to.be.approximately(32, DELTA)

            expect(ExprEval.derivative({ execute: (x) => 1 }, 10)).to.equal(0)
            expect(ExprEval.derivative({ execute: (x) => x }, 10)).to.be.approximately(1, DELTA)
            expect(ExprEval.derivative({ execute: (x) => Math.pow(x, 2) }, 10)).to.be.approximately(20, DELTA)
        })

        it("throws error when provided with invalid arguments", function() {
            const noArg1 = () => ExprEval.derivative()
            const noArg2 = () => ExprEval.derivative("1")
            const noValue1 = () => ExprEval.derivative("0", "1")
            const noValue2 = () => ExprEval.derivative({ execute: (x) => 1 })
            const invalidObjectProvided = () => ExprEval.derivative({ a: 2 }, 1)
            const notAnObjectProvided = () => ExprEval.derivative("string", 1)
            const invalidXProvided = () => ExprEval.derivative("t^2+x", "t", "ze")
            const notStringProvided1 = () => ExprEval.derivative({ a: 2 }, { b: 1 }, 1)
            const notStringProvided2 = () => ExprEval.derivative({ a: 2 }, "t", 1)
            const notStringProvided3 = () => ExprEval.derivative("t^2", { b: 1 }, 1)
            const invalidVariableProvided = () => ExprEval.derivative("t^2", "93IO74", 1)
            const invalidExpressionProvided = () => ExprEval.derivative("t^2t", "t", 1)
            const invalidVariableInExpression = () => ExprEval.derivative("t^2+x", "t", 1)
            expect(noArg1).to.throw()
            expect(noArg2).to.throw()
            expect(noValue1).to.throw()
            expect(noValue2).to.throw()
            expect(invalidObjectProvided).to.throw()
            expect(invalidXProvided).to.throw()
            expect(notAnObjectProvided).to.throw()
            expect(notStringProvided1).to.throw()
            expect(notStringProvided2).to.throw()
            expect(notStringProvided3).to.throw()
            expect(invalidVariableProvided).to.throw()
            expect(invalidExpressionProvided).to.throw()
            expect(invalidVariableInExpression).to.throw()
        })
    })
})