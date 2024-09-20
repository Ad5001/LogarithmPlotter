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

import Objects from "../objects.mjs"              
import { DrawableObject } from "common.mjs"
import Point from "point.mjs"
import Text from "text.mjs"
import Function from "function.mjs"
import GainBode from "gainbode.mjs"
import PhaseBode from "phasebode.mjs"
import SommeGainsBode from "sommegainsbode.mjs"
import SommePhasesBode from "sommephasesbode.mjs"
import XCursor from "xcursor.mjs"
import Sequence from "sequence.mjs"
import RepartitionFunction from "repartition.mjs"

/**
 * Registers the object  obj in the object list.
 * @param {DrawableObject} obj - Object to be registered.
 */
function registerObject(obj) {
    // Registers an object to be used in LogarithmPlotter.
    if(obj.prototype instanceof DrawableObject) {
        if(!Objects.types[obj.type()])
            Objects.types[obj.type()] = obj
    } else {
        console.error("Could not register object " + (obj?.type() ?? obj.constructor.name) + ", as it isn't a DrawableObject.")
    }
}

if(Object.keys(Modules.Objects.types).length === 0) {
    registerObject(Point)
    registerObject(Text)
    registerObject(Function)
    registerObject(GainBode)
    registerObject(PhaseBode)
    registerObject(SommeGainsBode)
    registerObject(SommePhasesBode)
    registerObject(XCursor)
    registerObject(Sequence)
    registerObject(RepartitionFunction)
}
