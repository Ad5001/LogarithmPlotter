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

.import "../objects.js" as Objects
.import "../mathlib.js" as MathLib
.import "../objs/common.js" as Common
.import "common.js" as C

class EditedProperty extends C.Action { 
    // Action used everytime an object's property has been changed
    type(){return 'EditedProperty'}
    
    icon(){return 'modify'}
    
    color(darkVer=false){
        return darkVer ? 'darkslateblue' : 'cyan';
    }
    
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
                this.previousValue = Objects.currentObjectsByName[this.previousValue] // Objects.getObjectByName(this.previousValue);
                this.newValue = Objects.currentObjectsByName[this.newValue] // Objects.getObjectByName(this.newValue);
            }
        }
        this.setReadableValues()
    }
    
    undo() {
        Objects.currentObjectsByName[this.targetName][this.targetProperty] = this.previousValue
        Objects.currentObjectsByName[this.targetName].update()
    }
    
    redo() {
        Objects.currentObjectsByName[this.targetName][this.targetProperty] = this.newValue
        Objects.currentObjectsByName[this.targetName].update()
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
    
    setReadableValues() {
        this.prev = "";
        this.next = "";
        if(this.propertyType instanceof Object) {
            switch(this.propertyType.type) {
                case "Enum":
                    this.prev = this.propertyType.translatedValues[this.propertyType.values.indexOf(this.previousValue)]
                    this.next = this.propertyType.translatedValues[this.propertyType.values.indexOf(this.newValue)]
                    break;
                case "ObjectType":
                    this.prev = this.previousValue == null ? "null" : this.previousValue.name
                    this.next = this.newValue == null ? "null" : this.newValue.name
                    break;
                case "List":
                    this.prev = this.previousValue.join(",")
                    this.next = this.newValue.name.join(",")
                    break;
                case "Dict":
                    this.prev = JSON.stringify(this.previousValue)
                    this.next = JSON.stringify(this.newValue)
                    break;
            }
        } else {
            this.prev = this.previousValue == null ? "null" : this.previousValue.toString()
            this.next = this.newValue == null ? "null" : this.newValue.toString()
        }
    }
    
    getReadableString() {
        return qsTr('%1 of %2 %3 changed from "%4" to "%5".')
                .arg(this.targetPropertyReadable)
                .arg(Objects.types[this.targetType].displayType())
                .arg(this.targetName).arg(this.prev).arg(this.next)
    }
    
    getHTMLString() {
        return qsTr('%1 of %2 changed from %3 to %4.')
                .arg(this.targetPropertyReadable)
                .arg('<b style="font-size: 15px;">&nbsp;' + this.targetName + '&nbsp;</b>')
                .arg('<tt style="background: rgba(128,128,128,0.1);">&nbsp;'+this.prev+'&nbsp;</tt>')
                .arg('<tt style="background: rgba(128,128,128,0.1);">&nbsp;'+this.next+'&nbsp;</tt>')
//                 .arg('<b style="font-size: 15px;">' + Objects.types[this.targetType].displayType())
                
    }
}
