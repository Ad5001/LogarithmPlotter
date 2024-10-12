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

const { spy } = chaiPlugins

import { BaseEventEmitter, BaseEvent } from "../../src/events.mjs"

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

describe("Lib/EventsEmitters", function() {
    it("sends events with unique and readonly names", function() {
        const event = new MockEvent1()
        expect(event.name).to.equal("example1")
        expect(() => event.name = "not").to.throw()
    })

    it("forwards events to all of its listeners", function() {
        const emitter = new MockEmitter()
        const listener1 = spy()
        const listener2 = spy()
        emitter.on("example1", listener1)
        emitter.on("example1", listener2)
        emitter.emit(new MockEvent1())
        expect(listener1).to.have.been.called.once
        expect(listener2).to.have.been.called.once
    })

    it("forwards multiple events to a singular listener", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        const mockEvent1 = new MockEvent1()
        const mockEvent2 = new MockEvent2(3)
        emitter.on("example1 example2", listener)
        emitter.emit(mockEvent1)
        emitter.emit(mockEvent2)
        expect(listener).to.have.been.called.twice
        expect(listener).to.have.been.first.called.with.exactly(mockEvent1)
        expect(listener).to.have.been.second.called.with.exactly(mockEvent2)
    })

    it("is able to have listeners removed", function() {
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

    it("is able to have one listener's listening to a single event removed when said listener listens to multiple", function() {
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
        expect(listener).to.also.have.been.called.with.exactly(mockEvent2)
    })

    it("is not able to emit or add/remove listeners for inexistant events", function() {
        const emitter = new MockEmitter()
        const listener = spy()
        expect(() => emitter.on("inexistant", listener)).to.throw(Error)
        expect(() => emitter.off("inexistant", listener)).to.throw(Error)
        expect(() => emitter.emit(new BaseEvent("inexistant"))).to.throw(Error)
    })

    it("isn't able to emit non-events", function() {
        const emitter = new MockEmitter()
        expect(() => emitter.emit("not-an-event")).to.throw(Error)
    })
})