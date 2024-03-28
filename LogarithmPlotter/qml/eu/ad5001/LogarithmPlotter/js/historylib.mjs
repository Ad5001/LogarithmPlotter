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

// This library helps containing actions to be undone or redone (in other words, editing history)
// Each type of event is repertoried as an action that can be listed for everything that's undoable.

import { Action as A } from "history/common.mjs"
import Create from "history/create.mjs"
import Delete from "history/delete.mjs"
import EP from "history/editproperty.mjs"
import Pos from "history/position.mjs"
import V from "history/visibility.mjs"
import Name from "history/name.mjs"
import Color from "history/color.mjs"


export const Action = A
export const CreateNewObject = Create
export const DeleteObject = Delete
export const EditedProperty = EP
export const EditedPosition = Pos
export const EditedVisibility = V
export const NameChanged = Name
export const ColorChanged = Color

export const Actions = {
    "Action": Action,
    "CreateNewObject": CreateNewObject,
    "DeleteObject": DeleteObject,
    "EditedProperty": EditedProperty,
    "EditedPosition": EditedPosition,
    "EditedVisibility": EditedVisibility,
    "NameChanged": NameChanged,
    "ColorChanged": ColorChanged,
}
