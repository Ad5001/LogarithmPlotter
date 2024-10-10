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

/**
 * We do not inherit the DOM's Event, because not only the DOM part is unnecessary,
 * but also because it does not exist within Qt environments.
 */


export class BaseEvent {
    /**
     * @property {string} name - Name of the event.
     */
    constructor(name) {
        this.name = name
    }
}


/**
 * Base class for all classes which can emit events.
 */
export class BaseEventEmitter {
    static emits = []
    
    /** @type {Record<string, Set<function>>} */
    #listeners = {}
    
    constructor() {
        for(const eventType of this.constructor.emits) {
            this.#listeners[eventType] = new Set()
        }
    }
    
    /**
     * Adds a listener to an event that can be emitted by this object.
     * 
     * @param {string} eventType - Name of the event to listen to. Throws an error if this object does not emit this kind of event.
     * @param {function(BaseEvent)} eventListener - The function to be called back when the event is emitted.
     */
    on(eventType, eventListener) {
        if(!this.constructor.emits.includes(eventType)) {
            const className = this.constructor.name
            const eventTypes = this.constructor.emits.join(", ")
            throw new Error(`Cannot listen to unknown event ${eventType} in class ${className}. ${className} only emits: ${eventTypes}`)
        }
        if(!this.#listeners[eventType].has(eventListener))
            this.#listeners[eventType].add(eventListener)
    }
    
    /**
     * Remvoes a listener from an event that can be emitted by this object.
     * 
     * @param {string} eventType - Name of the event that was listened to. Throws an error if this object does not emit this kind of event.
     * @param {function(BaseEvent)} eventListener - The function previously registered as a listener.
     * @returns {boolean} True if the listener was removed, false if it was not found.
     */
    off(eventType, eventListener) {
        if(!this.constructor.emits.includes(eventType)) {
            const className = this.constructor.name
            const eventTypes = this.constructor.emits.join(", ")
            throw new Error(`Cannot listen to unknown event ${eventType} in class ${className}. ${className} only emits: ${eventTypes}`)
        }
        return this.#listeners[eventType].delete(eventListener)
    }
    
    /**
     * Emits an event to all of its listeners.
     * 
     * @param {BaseEvent} e
     */
    emit(e) {
        if(!(e instanceof BaseEvent))
            throw new Error("Cannot emit non event object.")
        if(!this.constructor.emits.includes(e.name)) {
            const className = this.constructor.name
            const eventTypes = this.constructor.emits.join(", ")
            throw new Error(`Cannot emit event '${e.name}' from class ${className}. ${className} can only emit: ${eventTypes}`)
        }
        for(const listener of this.#listeners[e.name])
            listener(e)
    }
}
