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

import { BaseEventEmitter, BaseEvent } from "../../src/events.mjs"

import { describe, it } from "mocha"
import { expect, use } from "chai"
import spies from "chai-spies"

// Setting up modules
const { spy } = use(spies)


class MockEmitter extends BaseEventEmitter {
    static emits = ["example1", "example2"]
}

class MockEvent1 extends BaseEvent {
    constructor() {
        super("example1")
    }
}

class MockEvent2 extends BaseEvent {
    constructor(parameter) {
        super("example2")
        this.parameter = parameter
    }
}

const sandbox = spy.sandbox()

describe("Events", function() {

    afterEach(() => {
        sandbox.restore()
    })

    it("should forward events to all of its listeners", function() {
        const emitter = new MockEmitter()
        const listener1 = spy()
        const listener2 = spy()
        emitter.on("example1", listener1)
        emitter.on("example1", listener2)
        emitter.emit(new MockEvent1())
        expect(listener1).to.have.been.called.once
        expect(listener2).to.have.been.called.once
    })

    it("should forward multiple events to a singular listener", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        const mockEvent1 = new MockEvent1()
        const mockEvent2 = new MockEvent2(3)
        emitter.on("example1 example2", listener)
        emitter.emit(mockEvent1)
        emitter.emit(mockEvent2)
        expect(listener).to.have.been.called.twice
        expect(listener).to.have.been.called.with.exactly(mockEvent1)
        expect(listener).to.have.been.called.with.exactly(mockEvent2)
    })

    it("should be able to remove listeners", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        emitter.on("example1", listener)
        const removedFromEventItDoesntListenTo = emitter.off("example2", listener)
        const removedFromEventItListensTo = emitter.off("example1", listener)
        const removedFromEventASecondTime = emitter.off("example1", listener)
        expect(removedFromEventItDoesntListenTo).to.be.false
        expect(removedFromEventItListensTo).to.be.true
        expect(removedFromEventASecondTime).to.be.false
        emitter.on("example1 example2", listener)
        const removedFromBothEvents = emitter.off("example1 example2", listener)
        expect(removedFromBothEvents).to.be.true
        emitter.on("example1", listener)
        const removedFromOneOfTheEvents = emitter.off("example1 example2", listener)
        expect(removedFromOneOfTheEvents).to.be.true
    })

    it("should be able to remove listening to one event when listener listens to multiple", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        const mockEvent1 = new MockEvent1()
        const mockEvent2 = new MockEvent2(3)
        emitter.on("example1 example2", listener)
        // Disable listener for example1
        emitter.off("example1", listener)
        emitter.emit(mockEvent1)
        emitter.emit(mockEvent2)
        expect(listener).to.have.been.called.once
        expect(listener).to.have.been.called.with.exactly(mockEvent2)
    })

    it("shouldn't be able to listen/unlisten/emit inexistant events", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        expect(() => emitter.on("inexistant", listener)).to.throw(Error)
        expect(() => emitter.off("inexistant", listener)).to.throw(Error)
        expect(() => emitter.emit(new BaseEvent("inexistant"))).to.throw(Error)
    })

    it("shouldn't be able to emit non-events", function() {
        const emitter = new MockEmitter()
        expect(() => emitter.emit("not-an-event")).to.throw(Error)
    })
})