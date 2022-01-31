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

.import "../objects.js" as Objects
.import "../mathlib.js" as MathLib
.import "../objs/common.js" as Common
.import "common.js" as C

class EditedProperty extends C.Action { 
    // Action used everytime an object's property has been changed
    type(){return 'EditedProperty'}
    
    icon(){return 'modify'}
    
    color(darkVer=false){return darkVer ? 'darkslateblue' : 'cyan'}
    
    constructor(targetName = "", targetType = "Point", targetProperty = "visible", previousValue = false, newValue = true, valueIsExpressionNeedingImport = false) {
        super(targetName, targetType)
        this.targetProperty = targetProperty
        this.targetPropertyReadable = qsTranslate("prop", this.targetProperty)
        this.previousValue = previousValue
        this.newValue = newValue
        this.propertyType = Objects.types[targetType].properties()[targetProperty]
        if(valueIsExpressionNeedingImport) {
            if(this.propertyType == "Expression") {
                this.previousValue = new MathLib.Expression(this.previousValue);
                this.newValue = new MathLib.Expression(this.newValue);
            } else if(this.propertyType == "Domain") {
                this.previousValue = MathLib.parseDomain(this.previousValue);
                this.newValue = MathLib.parseDomain(this.newValue);
            } else {
                // Objects
                this.previousValue = Objects.getObjectByName(this.previousValue);
                this.newValue = Objects.getObjectByName(this.newValue);
            }
        }
    }
    
    undo() {
        Objects.getObjectByName(this.targetName, this.targetType)[this.targetProperty] = this.previousValue
    }
    
    redo() {
        Objects.getObjectByName(this.targetName, this.targetType)[this.targetProperty] = this.newValue
    }
    
    export() {
        if(this.previousValue instanceof MathLib.Expression) {
            return [this.targetName, this.targetType, this.targetProperty, this.previousValue.toEditableString(), this.newValue.toEditableString(), true]
        } else if(this.previousValue instanceof Common.DrawableObject) {
            return [this.targetName, this.targetType, this.targetProperty, this.previousValue.name, this.newValue.name, true]
        } else {
            return [this.targetName, this.targetType, this.targetProperty, this.previousValue, this.newValue, false]
        }
    }
    
    getReadableString() {
        let prev = "";
        let next = "";
        if(this.propertyType instanceof Object) {
            switch(this.propertyType.type) {
                case "Enum":
                    prev = this.propertyType.translatedValues[this.propertyType.values.indexOf(this.previousValue)]
                    next = this.propertyType.translatedValues[this.propertyType.values.indexOf(this.newValue)]
                    break;
                case "ObjectType":
                    prev = this.previousValue.name
                    next = this.newValue.name
                    break;
                case "List":
                    prev = this.previousValue.join(",")
                    next = this.newValue.name.join(",")
                    break;
                case "Dict":
                    prev = JSON.stringify(this.previousValue).replace("'", "\\'").replace('"', "'")
                    next = JSON.stringify(this.newValue).replace("'", "\\'").replace('"', "'")
                    break;
            }
        } else {
            prev = this.previousValue == null ? "null" : this.previousValue.toString()
            next = this.newValue == null ? "null" : this.newValue.toString()
        }
        return qsTr('%1 of %2 %3 changed from "%4" to "%5".')
                .arg(this.targetPropertyReadable)
                .arg(Objects.types[this.targetType].displayType())
                .arg(this.targetName).arg(prev).arg(next)
    }
}
