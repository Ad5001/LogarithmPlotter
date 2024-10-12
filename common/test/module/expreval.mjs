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
    describe("#parse.evaluate", function() {
        const evaluate = (expr, vals = {}) => ExprEval.parse(expr).evaluate(vals)
        it("parses simple mathematical expressions", function() {
            expect(evaluate(`"\\'\\"\\\\\\/\\b\\f\\n\\r\\t\\u3509"`)).to.equal(`'"\\/\b\f\n\r\t\u3509`)
            expect(evaluate("1")).to.equal(1)
            expect(evaluate("    1   ")).to.equal(1)
            expect(evaluate("0xFF")).to.equal(255)
            expect(evaluate("0b11")).to.equal(3)
            expect(evaluate("-1")).to.equal(-1)
            expect(evaluate("-(-1)")).to.equal(1)
            expect(evaluate("+(-1)")).to.equal(-1)
            expect(evaluate("3!")).to.equal(6)
            expect(evaluate("1+1")).to.equal(2)
            expect(evaluate("4*3")).to.equal(12)
            expect(evaluate("4•3")).to.equal(12)
            expect(evaluate("64/4")).to.equal(16)
            expect(evaluate("2^10")).to.equal(1024)
            expect(evaluate("10%3")).to.equal(1)
            expect(evaluate("10%3")).to.equal(1)
            // Test priorities
            expect(evaluate("10*10+10*10")).to.equal(200)
            expect(evaluate("10/10+10/10")).to.equal(2)
            expect(evaluate("10/10+10/10")).to.equal(2)
            expect(evaluate("2^2-2^2")).to.equal(0)
            expect(evaluate("(2^2-2)^2")).to.equal(4)
        })

        it("parses equality and test statements", function() {
            expect(evaluate("10%3 == 1 ? 2 : 1")).to.equal(2)
            expect(evaluate("not(10%3 == 1) ? 2 : 1")).to.equal(1)
            expect(evaluate("10%3 != 1 ? 2 : 1")).to.equal(1)
            expect(evaluate("10 < 3 ? 2 : 1")).to.equal(1)
            expect(evaluate("10 > 3 ? (2+1) : 1")).to.equal(3)
            expect(evaluate("10 <= 3 ? 4 : 1")).to.equal(1)
            expect(evaluate("10 >= 3 ? 4 : 1")).to.equal(4)
            // Check equality
            expect(evaluate("10 < 10 ? 2 : 1")).to.equal(1)
            expect(evaluate("10 > 10 ? 2 : 1")).to.equal(1)
            expect(evaluate("10 <= 10 ? 4 : 1")).to.equal(4)
            expect(evaluate("10 >= 10 ? 4 : 1")).to.equal(4)
            // Check 'and' and 'or'
            expect(evaluate("10 <= 3 and 10 < 10 ? 4 : 1")).to.equal(1)
            expect(evaluate("10 <= 10 and 10 < 10 ? 4 : 1")).to.equal(1)
            expect(evaluate("10 <= 10 and 10 < 20 ? 4 : 1")).to.equal(4)
            expect(evaluate("10 <= 3 or 10 < 10 ? 4 : 1")).to.equal(1)
            expect(evaluate("10 <= 10 or 10 < 10 ? 4 : 1")).to.equal(4)
            expect(evaluate("10 <= 10 or 10 < 20 ? 4 : 1")).to.equal(4)
        })

        it("parses singular function operators (functions with one arguments and no parenthesis)", function() {
            // Trigonometric functions
            expect(evaluate("sin 0")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("cos 0")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("tan 0")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("asin 1")).to.be.approximately(Math.PI / 2, Number.EPSILON)
            expect(evaluate("acos 1")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("atan 1")).to.be.approximately(Math.PI / 4, Number.EPSILON)
            expect(evaluate("sinh 1")).to.be.approximately(Math.sinh(1), Number.EPSILON)
            expect(evaluate("cosh 1")).to.be.approximately(Math.cosh(1), Number.EPSILON)
            expect(evaluate("tanh 1")).to.be.approximately(Math.tanh(1), Number.EPSILON)
            expect(evaluate("asinh 1")).to.be.approximately(Math.asinh(1), Number.EPSILON)
            expect(evaluate("acosh 1")).to.be.approximately(Math.acosh(1), Number.EPSILON)
            expect(evaluate("atanh 0.5")).to.be.approximately(Math.atanh(0.5), Number.EPSILON)
            // Reverse trigonometric
            expect(evaluate("asin sin 1")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("acos cos 1")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("atan tan 1")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("asinh sinh 1")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("acosh cosh 1")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("atanh tanh 1")).to.be.approximately(1, Number.EPSILON)
            // Other functions
            expect(evaluate("sqrt 4")).to.be.approximately(2, Number.EPSILON)
            expect(evaluate("sqrt 2")).to.be.approximately(Math.sqrt(2), Number.EPSILON)
            expect(evaluate("cbrt 27")).to.be.approximately(3, Number.EPSILON)
            expect(evaluate("cbrt 14")).to.be.approximately(Math.cbrt(14), Number.EPSILON)
            expect(evaluate("log 1")).to.be.approximately(Math.log(1), Number.EPSILON)
            expect(evaluate("ln 1")).to.be.approximately(Math.log(1), Number.EPSILON)
            expect(evaluate("log2 8")).to.be.approximately(3, Number.EPSILON)
            expect(evaluate("log10 100")).to.be.approximately(2, Number.EPSILON)
            expect(evaluate("lg 100")).to.be.approximately(2, Number.EPSILON)
            expect(evaluate("expm1 0")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("expm1 10")).to.be.approximately(Math.expm1(10), Number.EPSILON)
            expect(evaluate("log1p 0")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("log1p 10")).to.be.approximately(Math.log1p(10), Number.EPSILON)
            // Roundings/Sign transformations
            expect(evaluate("abs -12.34")).to.equal(12.34)
            expect(evaluate("abs 12.45")).to.equal(12.45)
            expect(evaluate("ceil 12.45")).to.equal(13)
            expect(evaluate("ceil 12.75")).to.equal(13)
            expect(evaluate("ceil 12.0")).to.equal(12)
            expect(evaluate("ceil -12.6")).to.equal(-12)
            expect(evaluate("floor 12.45")).to.equal(12)
            expect(evaluate("floor 12.75")).to.equal(12)
            expect(evaluate("floor 12.0")).to.equal(12)
            expect(evaluate("floor -12.2")).to.equal(-13)
            expect(evaluate("round 12.45")).to.equal(12)
            expect(evaluate("round 12.75")).to.equal(13)
            expect(evaluate("round 12.0")).to.equal(12)
            expect(evaluate("round -12.2")).to.equal(-12)
            expect(evaluate("round -12.6")).to.equal(-13)
            expect(evaluate("trunc 12.45")).to.equal(12)
            expect(evaluate("trunc 12.75")).to.equal(12)
            expect(evaluate("trunc 12.0")).to.equal(12)
            expect(evaluate("trunc -12.2")).to.equal(-12)
            expect(evaluate("exp 1")).to.be.approximately(Math.E, Number.EPSILON)
            expect(evaluate("exp 10")).to.be.approximately(Math.pow(Math.E, 10), 1e-8)
            expect(evaluate("length \"string\"")).to.equal(6)
            expect(evaluate("sign 0")).to.equal(0)
            expect(evaluate("sign -0")).to.equal(0)
            expect(evaluate("sign -10")).to.equal(-1)
            expect(evaluate("sign 80")).to.equal(1)
        })

        it("parses regular functions", function() {
            for(let i = 0; i < 1000; i++) {
                expect(evaluate("random()")).to.be.within(0, 1)
                expect(evaluate("random(100)")).to.be.within(0, 100)
            }
            expect(evaluate("fac(3)")).to.equal(6)
            expect(evaluate("fac(10)")).to.equal(3628800)
            expect(evaluate("min(10, 20)")).to.equal(10)
            expect(evaluate("min(-10, -20)")).to.equal(-20)
            expect(evaluate("max(10, 20)")).to.equal(20)
            expect(evaluate("max(-10, -20)")).to.equal(-10)
            expect(evaluate("hypot(3, 4)")).to.equal(5)
            expect(evaluate("pyt(30, 40)")).to.equal(50)
            expect(evaluate("atan2(1, 1)")).to.be.approximately(Math.PI / 4, Number.EPSILON)
            expect(evaluate("atan2(1, 0)")).to.be.approximately(Math.PI / 2, Number.EPSILON)
            expect(evaluate("atan2(0, 1)")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("if(10 == 10, 1, 0)")).to.be.approximately(1, Number.EPSILON)
            expect(evaluate("if(10 != 10, 1, 0)")).to.be.approximately(0, Number.EPSILON)
            expect(evaluate("gamma(10) == 9!")).to.be.true
            expect(evaluate("Γ(30) == 29!")).to.be.true
            expect(evaluate("Γ(25) == 23!")).to.be.false
            expect(evaluate("roundTo(26.04)")).to.equal(26)
            expect(evaluate("roundTo(26.04, 2)")).to.equal(26.04)
            expect(evaluate("roundTo(26.04836432123, 5)")).to.equal(26.04836)
            expect(evaluate("roundTo(26.04836432123, 5)")).to.equal(26.04836)
        })

        it("parses arrays and access their members", function() {
            expect(evaluate("[6, 7, 9]")).to.have.lengthOf(3)
            expect(evaluate("[6, 7, 9]")).to.deep.equal([6, 7, 9])
            expect(evaluate("[6, \"8\", 9]")).to.have.lengthOf(3)
            expect(evaluate("[6, 7%2]")).to.deep.equal([6, 1])
            // Access array indices
            expect(evaluate("[6, 7][1]")).to.equal(7)
            expect(evaluate("[6, 7, 8, 9, 10][2*2-1]")).to.equal(9)
        })

        it("can apply functions to arrays", function() {
            expect(evaluate("length [6, 7, 9]")).to.equal(3)
            expect(evaluate("length [6, 7, 8, 9]")).to.equal(4)
            expect(evaluate("[6, 7, 9]||[10,11,12]")).to.deep.equal([6, 7, 9, 10, 11, 12])
            expect(evaluate("6 in [6, 7, 9]")).to.be.true
            expect(evaluate("2 in [6, 7, 9]")).to.be.false
            expect(evaluate("min([10, 6, 7, 8, 9])")).to.equal(6)
            expect(evaluate("max([6, 7, 8, 9, 2])")).to.equal(9)
        })

        it("throws errors when invalid function parameters are provided", function() {
            expect(() => evaluate("max()")).to.throw()
            expect(() => evaluate("min()")).to.throw()
        })

        it("parses constants", function() {
            expect(evaluate("pi")).to.equal(Math.PI)
            expect(evaluate("PI")).to.equal(Math.PI)
            expect(evaluate("π")).to.equal(Math.PI)
            expect(evaluate("e")).to.equal(Math.E)
            expect(evaluate("E")).to.equal(Math.E)
            expect(evaluate("true")).to.be.true
            expect(evaluate("false")).to.be.false
            // expect(evaluate("∞")).to.equal(Math.Infinity)
            // expect(evaluate("infinity")).to.equal(Math.Infinity)
            // expect(evaluate("Infinity")).to.equal(Math.Infinity)
        })

        it("can be provided variables", function() {
            const u = [1, 2, 3, 4]
            const x = 10
            const s_ = "string"
            const f = (x) => x * 2
            expect(evaluate("u", { u })).to.deep.equal([...u])
            expect(evaluate("x", { x })).to.equal(x)
            expect(evaluate("s_", { s_ })).to.equal(s_)
            expect(evaluate("f", { f })).to.equal(f)
            expect(evaluate("b", { b: true })).to.equal(true)
            expect(evaluate("u[1]", { u })).to.equal(u[1])
            expect(evaluate("x/2", { x })).to.equal(x / 2)
            expect(evaluate("f(2)", { f })).to.equal(f(2))
            expect(evaluate("if(x == f(2), u[0], s_)", { x, u, s_, f })).to.equal(s_)
        })

        it("can be provided objects", function() {
            const obj = { execute: (x) => x * 3, x: 10, y: { cached: true, execute: () => 20 } }
            expect(evaluate("O(3)+O(2)", { O: obj })).to.equal(9 + 6)
            expect(evaluate("O.x+O.y", { O: obj })).to.equal(30)
        })

        it("throws errors when trying to use variables wrongly", function() {
            const obj = { execute: (x) => x * 3 }
            expect(() => evaluate("O()", { O: obj })).to.throw()
            expect(() => evaluate("O.x", { O: obj })).to.throw()
            expect(() => evaluate("x()", { x: 10 })).to.throw()
            expect(() => evaluate("x")).to.throw()
            expect(() => evaluate("n")).to.throw()
        })

        it("can do it all at once", function() {
            const obj = { execute: (x) => x * 3, x: 20 }
            const u = [1, 2, 3, 4]
            const x = 10
            const s = "string"
            const expr = "random(e) <= e ? fac(x)+u[2]+O(pi) : O.x+length s"
            expect(evaluate(expr, { x, u, s, O: obj })).to.equal(3628803 + obj.execute(Math.PI))
        })

        it("cannot parse invalid expressions", function() {
            expect(() => evaluate("1+")).to.throw()
            expect(() => evaluate("@")).to.throw()
            expect(() => evaluate("]")).to.throw()
            expect(() => evaluate("")).to.throw()
            expect(() => evaluate(`"\\u35P2"`)).to.throw()
            expect(() => evaluate(`"\\x"`)).to.throw()
        })
    })

    describe("#parse.toString", function() {
        it("can be converted back into a string without changes", function() {
            const expressions = ["pi+2*(e+2)^4", "sin(1+2!+pi+cos -3)^2", "[2,3,4][(2-1)*2]", "true ? false : true"]
            for(const ogString of expressions) {
                const expr = ExprEval.parse(ogString)
                const convertedString = expr.toString()
                expect(ExprEval.parse(convertedString)).to.deep.equal(expr) // Can be reparsed just the same
            }
        })
    })

    describe("#parse.substitute", function() {
        const parsed = ExprEval.parse("if(x == 0, 1, 2+x)")
        it("can substitute a variable for a number", function() {
            expect(parsed.substitute("x", 10).evaluate({})).to.equal(12)
            expect(parsed.substitute("x", 0).evaluate({})).to.equal(1)
        })

        it("can substitute a variable for another", function() {
            expect(parsed.substitute("x", "b").evaluate({ b: 10 })).to.equal(12)
            expect(parsed.substitute("x", "b").evaluate({ b: 0 })).to.equal(1)
        })

        it("can substitute a variable for an expression", function() {
            expect(parsed.substitute("x", "sin α").evaluate({ "α": Math.PI / 2 })).to.be.approximately(3, Number.EPSILON)
            expect(parsed.substitute("x", "sin α").evaluate({ "α": 0 })).to.equal(1)
            expect(parsed.substitute("x", "α == 1 ? 0 : 1").evaluate({ "α": 1 })).to.equal(1)
        })
    })

    describe("#parse.variables", function() {
        it("can list all parsed undefined variables", function() {
            expect(ExprEval.parse("a+b+x+pi+sin(b)").variables()).to.deep.equal(["a", "b", "x"])
        })
    })

    describe("#parse.toJSFunction", function() {
        const func = ExprEval.parse("not(false) ? a+b+x+1/x : x!+random()+A.x+[][0]").toJSFunction("x", { a: "10", b: "0" })
        expect(func(10)).to.equal(20.1)
        expect(func(20)).to.equal(30.05)
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
        it("returns the derivative value of a function at a given number", function() {
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