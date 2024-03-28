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
import { Action } from "common.mjs"

export default class CreateNewObject extends Action {
    // Action used for the creation of an object
    type(){return 'CreateNewObject'}
    
    icon(){return 'create'}
    
    color(darkVer=false){return darkVer ? 'green' : 'lime'}
    
    constructor(targetName = "", targetType = "Point", properties = []) {
        super(targetName, targetType)
        this.targetProperties = properties
    }

    
    undo() {
        Objects.deleteObject(this.targetName)
    }
    
    redo() {
        Objects.createNewRegisteredObject(this.targetType, this.targetProperties)
        Objects.currentObjectsByName[this.targetName].update()
    }
    
    export() {
        return [this.targetName, this.targetType, this.targetProperties]
    }
    
    getReadableString() {
        return qsTr("New %1 %2 created.").arg(Objects.types[this.targetType].displayType()).arg(this.targetName)
    }
    
    getHTMLString() {
        return qsTr("New %1 %2 created.")
                .arg(Objects.types[this.targetType].displayType())
                .arg('<b style="font-size: 15px;">' + this.targetName + "</b>")
    }
}

