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

import { describe, it } from "mocha"
import { expect } from "chai"

import { MockLatex } from "../mock/latex.mjs"
import { MockHelper } from "../mock/helper.mjs"
import {
    CanvasInterface,
    DialogInterface,
    HelperInterface,
    Interface,
    LatexInterface,
    RootInterface
} from "../../src/module/interface.mjs"
import { MockDialog } from "../mock/dialog.mjs"
import { MockRootElement } from "../mock/root.mjs"
import { MockCanvas } from "../mock/canvas.mjs"

describe("Interface", function() {
    describe("#checkImplementation", function() {
        it("should validate the implementation of mocks", function() {
            const checkMockLatex = () => Interface.checkImplementation(LatexInterface, new MockLatex())
            const checkMockHelper = () => Interface.checkImplementation(HelperInterface, new MockHelper())
            const checkMockDialog = () => Interface.checkImplementation(DialogInterface, new MockDialog())
            const checkMockRoot = () => Interface.checkImplementation(RootInterface, new MockRootElement())
            const checkMockCanvas = () => Interface.checkImplementation(CanvasInterface, new MockCanvas())
            expect(checkMockLatex).to.not.throw()
            expect(checkMockHelper).to.not.throw()
            expect(checkMockDialog).to.not.throw()
            expect(checkMockRoot).to.not.throw()
            expect(checkMockCanvas).to.not.throw()
        })
    })
})