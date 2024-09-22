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

import EditedProperty from "editproperty.mjs"
import Objects from "../objects.mjs"

export default class ColorChanged extends EditedProperty {
    // Action used everytime when an object's color is changed
    type(){return 'ColorChanged'}
    
    icon(){return 'appearance'}
    
    
    constructor(targetName = "", targetType = "Point", oldColor = "black", newColor = "white") {
        super(targetName, targetType, "color", oldColor, newColor)
    }
    
    export() {
        return [this.targetName, this.targetType, this.previousValue, this.newValue]
    }
    
    color(darkVer=false){return darkVer ? 'purple' : 'plum'}
    
    getReadableString() {
        return qsTranslate("color", "%1 %2's color changed from %3 to %4.")
                .arg(Objects.types[this.targetType].displayType()).arg(this.targetName)
                .arg(this.previousValue).arg(this.newValue)
    }
    
    formatColor(color) {
        return `<span style="color: ${color}; font-family: monospace; padding: 2px;">██</span>`
    }
    
    getHTMLString() {
        return qsTranslate("color", "%1 %2's color changed from %3 to %4.")
                .arg(Objects.types[this.targetType].displayType())
                .arg('<b style="font-size: 15px;">&nbsp;' + this.targetName + "&nbsp;</b>")
                .arg(this.formatColor(this.previousValue)).arg(this.formatColor(this.newValue))
    }
}




