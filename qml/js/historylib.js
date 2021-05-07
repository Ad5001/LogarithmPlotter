/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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

.import "objects.js" as Objects
.import "utils.js" as Utils
.import "mathlib.js" as MathLib

class Action {
    // Type of the action done.
    type(){return 'Unknown'}
    
    // TargetName is the name of the object that's targeted by the event.
    constructor(targetName = "", targetType = "Point") {
        this.targetName = targetName
        this.targetType = targetType
    }
    
    undo() {}
    
    redo() {}
    
    export() {
        return [this.targetName, this.targetType]
    }
    
    getReadableString() {
        return 'Unknown action'
    }
}

class CreateNewObject extends Action {
    // Action used for the creation of an object
    type(){return 'CreateNewObject'}
    
    constructor(targetName = "", targetType = "Point", properties = []) {
        super(targetName, targetType)
        this.targetProperties = properties
    }

    
    undo() {
        var targetIndex = Objects.getObjectsName(this.targetType).indexOf(this.targetName)
        Objects.currentObjects[this.targetType][targetIndex].delete()
        Objects.currentObjects[this.targetType].splice(targetIndex, 1)
    }
    
    redo() {
        Objects.createNewRegisteredObject(this.targetType, this.targetProperties)
    }
    
    export() {
        return [this.targetName, this.targetType, this.targetProperties]
    }
    
    getReadableString() {
        return `New ${this.targetType} ${this.targetName} created.`
    }
}

class DeleteObject extends CreateNewObject {
    // Action used at the deletion of an object. Basicly the same thing as creating a new object, except Redo & Undo are reversed.
    type(){return 'DeleteObject'}
    
    undo() {
        super.redo()
    }
    
    redo() {
        super.undo()
    }
    
    getReadableString() {
        return `${this.targetType} ${this.targetName} deleted.`
    }
}

class EditedProperty extends Action {
    // Action used everytime an object's property has been changed
    type(){return 'EditedProperty'}
    
    constructor(targetName = "", targetType = "Point", targetProperty = "visible", previousValue = false, newValue = true, valueIsExpressionNeedingImport = false) {
        super(targetName, targetType)
        this.targetProperty = targetProperty
        this.targetPropertyReadable = Utils.camelCase2readable(this.targetProperty)
        this.previousValue = previousValue
        this.newValue = newValue
        if(valueIsExpressionNeedingImport) {
            this.previousValue = new MathLib.Expression(this.previousValue);
            this.newValue = new MathLib.Expression(this.newValue);
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
        } else {
            return [this.targetName, this.targetType, this.targetProperty, this.previousValue, this.newValue, false]
        }
    }
    
    getReadableString() {
        var prev = this.previousValue == null ? ""+this.previousValue : this.previousValue.toString()
        var next = this.newValue == null ? ""+this.newValue : this.newValue.toString()
        return `${this.targetPropertyReadable} of ${this.targetType} ${this.targetName} changed from "${prev}" to "${next}".`
    }
}

class EditedVisibility extends EditedProperty {
    // Action used everytime an object's property has been changed
    type(){return 'EditedVisibility'}
    
    constructor(targetName = "", targetType = "Point", newValue = true) {
        super(targetName, targetType, "visible", !newValue, newValue)
    }
    
    getReadableString() {
        if(this.newValue) {
            return `${this.targetType} ${this.targetName} shown.`
        } else {
            return `${this.targetType} ${this.targetName} hidden.`
        }
    }
}

class NameChanged extends EditedProperty {
    // Action used everytime an object's property has been changed
    type(){return 'EditedVisibility'}
    
    constructor(targetName = "", targetType = "Point", newName = "") {
        super(targetName, targetType, "name", targetName, newName)
    }
    
    undo() {
        Objects.getObjectByName(this.newValue, this.targetType)['name'] = this.previousValue
    }
    
    redo() {
        Objects.getObjectByName(this.previousValue, this.targetType)[this.targetProperty] = this.newValue
    }
}

var Actions = {
    "Action": Action,
    "CreateNewObject": CreateNewObject,
    "DeleteObject": DeleteObject,
    "EditedProperty": EditedProperty,
    "EditedVisibility": EditedVisibility,
}
