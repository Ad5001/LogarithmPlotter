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
.import "../math/latex.js" as Latex
.import "../utils.js" as Utils
.import "../objs/common.js" as Common
.import "common.js" as C

class EditedPosition extends C.Action { 
    // Action used for objects that have a X and Y expression properties (points, texts...)
    type(){return 'EditedPosition'}
    
    icon(){return 'position'}
    
    color(darkVer=false){
        return darkVer ? 'seagreen' : 'lightseagreen';
    }
    
    constructor(targetName = "", targetType = "Point", previousXValue = "", newXValue = "", previousYValue = "", newYValue = "") {
        super(targetName, targetType)        
        let imports = {
            'previousXValue': previousXValue,
            'previousYValue': previousYValue, 
            'newXValue': newXValue,
            'newYValue': newYValue
        }
        for(let name in imports)
            this[name] = (typeof imports[name]) == 'string' ? new MathLib.Expression(imports[name]) : imports[name]
        this.setReadableValues()
    }
    
    undo() {
        Objects.currentObjectsByName[this.targetName].x = this.previousXValue
        Objects.currentObjectsByName[this.targetName].y = this.previousYValue
        Objects.currentObjectsByName[this.targetName].update()
    }
    
    redo() {
        Objects.currentObjectsByName[this.targetName].x = this.newXValue
        Objects.currentObjectsByName[this.targetName].y = this.newYValue
        Objects.currentObjectsByName[this.targetName].update()
    }
    
    setReadableValues() {
        this.prevString = `(${this.previousXValue.toString()},${this.previousYValue.toString()})`
        this.nextString = `(${this.newXValue.toString()},${this.newYValue.toString()})`
        // Render as LaTeX
        if(Latex.enabled) {
            this.prevHTML = this.renderLatexAsHtml(`\\left(${this.previousXValue.latexMarkup},${this.previousYValue.latexMarkup}\\right)`)
            this.nextHTML = this.renderLatexAsHtml(`\\left(${this.newXValue.latexMarkup},${this.newYValue.latexMarkup}\\right)`)
        } else {
            this.prevHTML = '<tt style="background: rgba(128,128,128,0.1);">&nbsp;'+Utils.escapeHTML(this.prevString)+'&nbsp;</tt>'
            this.nextHTML = '<tt style="background: rgba(128,128,128,0.1);">&nbsp;'+Utils.escapeHTML(this.nextString)+'&nbsp;</tt>'
        }
        
    }
    
    export() {
        return [this.targetName, this.targetType, this.targetProperty, 
                this.previousXValue.toEditableString(), this.newXValue.toEditableString(),
                this.previousYValue.toEditableString(), this.newYValue.toEditableString()]
    }
    
    getReadableString() {
        return qsTr('Position of %1 %2 set from "%3" to "%4".')
                .arg(Objects.types[this.targetType].displayType())
                .arg(this.targetName).arg(this.prevString).arg(this.nextString)
    }
    
    getHTMLString() {
        return qsTr('Position of %1 set from %2 to %3.')
                .arg('<b style="font-size: 15px;">&nbsp;' + this.targetName + '&nbsp;</b>')
                .arg(this.prevHTML)
                .arg(this.nextHTML)                
    }
}
