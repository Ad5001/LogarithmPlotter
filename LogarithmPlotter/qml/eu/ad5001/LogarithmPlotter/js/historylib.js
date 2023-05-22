/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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
.pragma library

.import "history/common.js" as Common
.import "history/create.js" as Create
.import "history/delete.js" as Delete
.import "history/editproperty.js" as EP
.import "history/position.js" as Pos
.import "history/visibility.js" as V
.import "history/name.js" as Name
.import "history/color.js" as Color

var history = null;


var Action = Common.Action
var CreateNewObject = Create.CreateNewObject
var DeleteObject = Delete.DeleteObject
var EditedProperty = EP.EditedProperty
var EditedPosition = Pos.EditedPosition
var EditedVisibility = V.EditedVisibility
var NameChanged = Name.NameChanged
var ColorChanged = Color.ColorChanged

var Actions = {
    "Action": Action,
    "CreateNewObject": CreateNewObject,
    "DeleteObject": DeleteObject,
    "EditedProperty": EditedProperty,
    "EditedPosition": EditedPosition,
    "EditedVisibility": EditedVisibility,
    "NameChanged": NameChanged,
    "ColorChanged": ColorChanged,
}
