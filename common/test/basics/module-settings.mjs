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
import "./module-base.mjs"
import "./utils.mjs"

import { describe, it } from "mocha"
import { expect } from "chai"

const { spy } = chaiPlugins

import Settings from "../../src/module/settings.mjs"
import { BaseEvent } from "../../src/events.mjs"

describe("Module/Settings", function() {
    it("is defined as a global", function() {
        expect(globalThis.Modules.Settings).to.equal(Settings)
    })

    it("has base defined properties even before initialization", function() {
        expect(Settings.saveFilename).to.be.a("string")
        expect(Settings.xzoom).to.be.a("number")
        expect(Settings.yzoom).to.be.a("number")
        expect(Settings.xmin).to.be.a("number")
        expect(Settings.ymax).to.be.a("number")
        expect(Settings.xaxisstep).to.be.a("string")
        expect(Settings.yaxisstep).to.be.a("string")
        expect(Settings.xlabel).to.be.a("string")
        expect(Settings.ylabel).to.be.a("string")
        expect(Settings.linewidth).to.be.a("number")
        expect(Settings.textsize).to.be.a("number")
        expect(Settings.logscalex).to.be.a("boolean")
        expect(Settings.showxgrad).to.be.a("boolean")
        expect(Settings.showygrad).to.be.a("boolean")
    })

    it("can be set values, but only of the right type", function() {
        expect(() => Settings.set("xzoom", "", false)).to.throw()
        expect(() => Settings.set("xlabel", true, false)).to.throw()
        expect(() => Settings.set("showxgrad", 2, false)).to.throw()

        expect(() => Settings.set("xzoom", 200, false)).to.not.throw()
        expect(() => Settings.set("xlabel", "x", false)).to.not.throw()
        expect(() => Settings.set("showxgrad", false, false)).to.not.throw()
    })

    it("cannot be set unknown settings", function() {
        expect(() => Settings.set("unknown", "", false)).to.throw()
    })

    it("sends an event when a value is set", function() {
        const listener = spy((e) => {
            expect(e).to.be.an.instanceof(BaseEvent)
            expect(e.name).to.equal("changed")
            expect(e.property).to.equal("xzoom")
            expect(e.newValue).to.equal(300)
            expect(e.byUser).to.be.true
        })
        Settings.on("changed", listener)
        Settings.set("xzoom", 300, true)
        expect(listener).to.have.been.called.once
        Settings.off("changed", listener)
    })

    it("requires a helper to set default values", function() {
        spy.on(Settings, "set")
        expect(() => Settings.initialize({})).to.throw()
        expect(() => Settings.initialize({ helper: globalThis.Helper })).to.not.throw()
        expect(Settings.set).to.have.been.called.exactly(13)
        expect(Settings.set).to.not.have.been.called.with("saveFilename")
        expect(Settings.set).to.have.been.called.with("xzoom")
        expect(Settings.set).to.have.been.called.with("yzoom")
        expect(Settings.set).to.have.been.called.with("xmin")
        expect(Settings.set).to.have.been.called.with("ymax")
        expect(Settings.set).to.have.been.called.with("xaxisstep")
        expect(Settings.set).to.have.been.called.with("yaxisstep")
        expect(Settings.set).to.have.been.called.with("xlabel")
        expect(Settings.set).to.have.been.called.with("ylabel")
        expect(Settings.set).to.have.been.called.with("linewidth")
        expect(Settings.set).to.have.been.called.with("textsize")
        expect(Settings.set).to.have.been.called.with("logscalex")
        expect(Settings.set).to.have.been.called.with("showxgrad")
        expect(Settings.set).to.have.been.called.with("showygrad")
    })
})