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


class NameChanged extends EP.EditedProperty {
    // Action used everytime an object's property has been changed
    type(){return 'NameChanged'}
    
    icon(){return 'name'}
    
    
    color(darkVer=false){return darkVer ? 'darkorange' : 'orange'}
        
    constructor(targetName = "", targetType = "Point", newName = "") {
        super(targetName, targetType, "name", targetName, newName)
    }
    
    export() {
        return [this.targetName, this.targetType, this.newValue]
    }
    
    undo() {
        Objects.getObjectByName(this.newValue, this.targetType)['name'] = this.previousValue
    }
    
    redo() {
        Objects.getObjectByName(this.previousValue, this.targetType)['name'] = this.newValue
    }
    
    getReadableString() {
        return qsTr('%1 %2 renamed to %3.')
                .arg(Objects.types[this.targetType].displayType())
                .arg(this.targetName).arg(this.newValue)
    }
}


