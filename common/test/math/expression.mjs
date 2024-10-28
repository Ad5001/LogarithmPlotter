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
import "../module/latex.mjs"
import "../module/expreval.mjs"
import "../module/objects.mjs"

import { describe, it } from "mocha"
import { expect } from "chai"

import { executeExpression, Expression } from "../../src/math/expression.mjs"
import ExprEval from "../../src/module/expreval.mjs"


describe("Math/Expression", function() {
    describe("#constructor", function() {
        it("accepts strings", function() {
            expect(() => new Expression("2+3")).to.not.throw
            expect(() => new Expression("x+2")).to.not.throw
        })

        it("accepts already parsed expressions", function() {
            expect(() => new Expression(ExprEval.parse("2+3"))).to.not.throw
            expect(() => new Expression(ExprEval.parse("x+2"))).to.not.throw
        })

        it("doesn't accept anything else", function() {
            expect(() => new Expression()).to.throw("Cannot create an expression with undefined.")
            expect(() => new Expression(12)).to.throw("Cannot create an expression with a Number.")
            expect(() => new Expression({})).to.throw("Cannot create an expression with a Object.")
            expect(() => new Expression(true)).to.throw("Cannot create an expression with a Boolean.")
        })
    })

    describe("#variables", function() {
        it("returns a list of variables for non-constant expressions", function() {
            expect(new Expression("x+1").variables()).to.deep.equal(["x"])
            expect(new Expression("x+n").variables()).to.deep.equal(["x", "n"])
            expect(new Expression("u[n] + A.x").variables()).to.deep.equal(["u", "n", "A"])
        })

        it("returns an empty array if the expression is constant", function() {
            expect(new Expression("2+1").variables()).to.deep.equal([])
            expect(new Expression("sin π").variables()).to.deep.equal([])
            expect(new Expression("e^3").variables()).to.deep.equal([])
        })
    })

    describe("#isConstant", function() {
        it("returns true if neither x nor n are included into the expression", function() {
            expect(new Expression("2+1").isConstant()).to.be.true
            expect(new Expression("e^3").isConstant()).to.be.true
            expect(new Expression("2+f(3)").isConstant()).to.be.true
            expect(new Expression("sin A.x").isConstant()).to.be.true
        })

        it("returns false if either x or n are included into the expression", function() {
            expect(new Expression("2+x").isConstant()).to.be.false
            expect(new Expression("e^n").isConstant()).to.be.false
            expect(new Expression("2+f(x)").isConstant()).to.be.false
            expect(new Expression("n + sin x").isConstant()).to.be.false
        })
    })

    describe("#requiredObjects", function() {
        it("returns the list of objects that need to be registered for this expression", function() {
            expect(new Expression("x^n").requiredObjects()).to.deep.equal([])
            expect(new Expression("2+f(3)").requiredObjects()).to.deep.equal(["f"])
            expect(new Expression("A.x+x").requiredObjects()).to.deep.equal(["A"])
            expect(new Expression("2+f(sin A.x)+n").requiredObjects()).to.deep.equal(["f", "A"])
        })
    })

    describe.skip("#allRequirementsFulfilled", function() {
        // TODO: Make tests for objects
    })

    describe.skip("#undefinedVariables", function() {
        // TODO: Make tests for objects
    })

    describe("#toEditableString", function() {
        it("should return a readable expression", function() {
            expect(new Expression("2+1").toEditableString()).to.equal("3")
            expect(new Expression("2+x").toEditableString()).to.equal("(2 + x)")
            expect(new Expression("x*2+x/3").toEditableString()).to.equal("((x * 2) + (x / 3))")
        })

        it("should be able to be reparsed and equal the same expression", function() {
            const exprs = ["5", "x/2", "4/2", "sin x"]
            for(const expr of exprs) {
                const exprObj = new Expression(expr)
                expect(new Expression(exprObj.toEditableString()).calc).to.deep.equal(exprObj.calc)
            }
        })
    })

    describe("#execute", function() {
        it("returns the result of the computation of the expression", function() {
            expect(new Expression("2+3").execute()).to.equal(5)
            expect(new Expression("2+3").execute(10)).to.equal(5)
            expect(new Expression("2+x").execute(10)).to.equal(12)
            expect(new Expression("sin x").execute(Math.PI)).to.be.approximately(0, Number.EPSILON)
        })

        it("returns the cached value if the expression can be cached", function() {
            const exprs = ["2+3", "x/2", "4/2", "sin x"]
            for(const expr of exprs) {
                const exprObj = new Expression(expr)
                if(exprObj.canBeCached)
                    expect(exprObj.execute()).to.equal(exprObj.cachedValue)
                else
                    expect(exprObj.execute()).to.not.equal(exprObj.cachedValue)
            }
        })

        it("throws an error if some variables are undefined.", function() {
            expect(() => new Expression("x+n").execute()).to.throw("Undefined variable n.")
            expect(() => new Expression("sin A.t").execute()).to.throw("Undefined variable A.")
            expect(() => new Expression("f(3)").execute()).to.throw("Undefined variable f.")
        })
    })

    describe("#simplify", function() {
        it("returns an expression with just the result when no constant or object are used", function() {
            expect(new Expression("2+2").simplify(Math.PI/2)).to.deep.equal(new Expression("4"))
            expect(new Expression("x+3").simplify(5)).to.deep.equal(new Expression("8"))
            expect(new Expression("sin x").simplify(Math.PI/2)).to.deep.equal(new Expression("1"))
            expect(new Expression("0*e^x").simplify(Math.PI/2)).to.deep.equal(new Expression("0"))
        })

        it("returns a simplified version of the expression if constants are used", function() {
            const original = new Expression("e^x").simplify(2)
            const to = new Expression("e^2")
            expect(original.toEditableString()).to.deep.equal(to.toEditableString())
        })
    })

    describe("#toString", function() {
        it("returns a human readable string of the expression", function() {
            expect(new Expression("-2-3").toString()).to.equal("-5")
            expect(new Expression("0.2+0.1").toString()).to.equal("0.3")
            expect(new Expression("sin x").toString()).to.equal("sin x")
            expect(new Expression("sin π").toString()).to.equal("sin π")
        })

        it("should add a sign if the option is passed", function() {
            expect(new Expression("-2-3").toString(true)).to.equal("-5")
            expect(new Expression("2+3").toString(true)).to.equal("+5")
        })
    })

    describe("#executeExpression", function() {
        it("directly computes the result of the expression with no variable", function() {
            expect(executeExpression("2+3")).to.equal(5)
            expect(executeExpression("sin (π/2)")).to.equal(1)
            expect(executeExpression("e^3")).to.be.approximately(Math.pow(Math.E, 3), Number.EPSILON)
        })

        it("throws an error if variables are employed", function() {
            expect(() => executeExpression("x+n")).to.throw("Undefined variable n.")
        })
    })
})
