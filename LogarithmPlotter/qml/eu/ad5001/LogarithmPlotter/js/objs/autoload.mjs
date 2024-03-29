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

import { API as ObjectsCommonAPI } from "common.mjs"
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

if(Object.keys(Modules.Objects.types).length === 0) {
    ObjectsCommonAPI.registerObject(Point)
    ObjectsCommonAPI.registerObject(Text)
    ObjectsCommonAPI.registerObject(Function)
    ObjectsCommonAPI.registerObject(GainBode)
    ObjectsCommonAPI.registerObject(PhaseBode)
    ObjectsCommonAPI.registerObject(SommeGainsBode)
    ObjectsCommonAPI.registerObject(SommePhasesBode)
    ObjectsCommonAPI.registerObject(XCursor)
    ObjectsCommonAPI.registerObject(Sequence)
    ObjectsCommonAPI.registerObject(RepartitionFunction)
}