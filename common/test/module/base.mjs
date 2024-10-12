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
import "../basics/events.mjs"
import "../basics/interface.mjs"

import { describe, it } from "mocha"
import { expect } from "chai"
import { MockDialog } from "../mock/dialog.mjs"
import { BOOLEAN, DialogInterface, FUNCTION, NUMBER, STRING } from "../../src/module/interface.mjs"
import { Module } from "../../src/module/common.mjs"

class MockModule extends Module {
    constructor() {
        super("mock", {
            number: NUMBER,
            bool: BOOLEAN,
            str: STRING,
            func: FUNCTION,
            dialog: DialogInterface
        })
    }
}

describe("Module/Base", function() {
    it("defined a Modules global", function() {
        expect(globalThis.Modules).to.not.be.undefined
    })

    it("is not be initialized upon construction", function() {
        const module = new MockModule()
        expect(module.name).to.equal("mock")
        expect(module.initialized).to.be.false
    })

    it("is only be initialized with the right arguments", function() {
        const module = new MockModule()
        const initializeWithNoArg = () => module.initialize({})
        const initializeWithSomeArg = () => module.initialize({ number: 0, str: "" })
        const initializeWithWrongType = () => module.initialize({
            number: () => {},
            str: 0,
            bool: "",
            func: false,
            dialog: null
        })
        const initializeProperly = () => module.initialize({
            number: 0,
            str: "",
            bool: true,
            func: FUNCTION,
            dialog: new MockDialog()
        })
        expect(initializeWithNoArg).to.throw(Error)
        expect(initializeWithSomeArg).to.throw(Error)
        expect(initializeWithWrongType).to.throw(Error)
        expect(initializeProperly).to.not.throw(Error)
        expect(module.initialized).to.be.true
    })

    it("cannot be initialized twice", function() {
        const module = new MockModule()
        const initialize = () => module.initialize({
            number: 0,
            str: "",
            bool: true,
            func: FUNCTION,
            dialog: new MockDialog()
        })
        expect(initialize).to.not.throw(Error)
        expect(initialize).to.throw(Error)
    })
})