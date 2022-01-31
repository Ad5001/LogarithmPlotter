/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
 *  Copyright (C) 2022  Ad5001
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

.pragma library

.import "editproperty.js" as EP
.import "../objects.js" as Objects


class ColorChanged extends EP.EditedProperty {
    // Action used everytime when an object's color is changed
    type(){return 'ColorChanged'}
    
    icon(){return 'appearance'}
    
    
    color(darkVer=false){return darkVer ? 'purple' : 'plum'}
    
    getReadableString() {
        return qsTr("%1 %2's color changed from %3 to %4.")
                .arg(Objects.types[this.targetType].displayType()).arg(this.targetName)
                .arg(this.previousValue).arg(this.newValue)
    }
    
    formatColor(color) {
        return `<span style="background: ${color}; color: white; font-family: monospace; border: solid 1px ${color}; border-style: outset; padding: 4px;">&nbsp;&nbsp;</span>`
    }
    
    getHTMLString() {
        return qsTr("%1 %2's color changed from %3 to %4.")
                .arg(Objects.types[this.targetType].displayType()).arg(this.targetName)
                .arg(this.formatColor(this.previousValue)).arg(this.formatColor(this.newValue))
    }
}




