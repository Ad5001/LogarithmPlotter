/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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


class EditedVisibility extends EP.EditedProperty {
    // Action used when an object's shown or hidden.
    type(){return 'EditedVisibility'}
    
    icon(){return 'visibility'}
    
    color(darkVer=false){
        return this.newValue ?
            (darkVer ? 'darkgray' : 'whitesmoke') :
            (darkVer ? 'dimgray' : 'lightgray')
    }
    
    constructor(targetName = "", targetType = "Point", newValue = true) {
        super(targetName, targetType, "visible", !newValue, newValue)
    }
    
    export() {
        return [this.targetName, this.targetType, this.newValue]
    }
    
    getReadableString() {
        return (this.newValue ? qsTr('%1 %2 shown.') : qsTr('%1 %2 hidden.'))
            .arg(Objects.types[this.targetType].displayType())
            .arg(this.targetName)
    }
    
    getHTMLString() {
        return (this.newValue ? qsTr('%1 %2 shown.') : qsTr('%1 %2 hidden.'))
            .arg(Objects.types[this.targetType].displayType())
            .arg('<b style="font-size: 15px;">' + this.targetName + "</b>")
    }
}

