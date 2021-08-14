/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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

.import "common.js" as Common
.import "../objects.js" as Objects
.import "../mathlib.js" as MathLib
.import "../historylib.js" as HistoryLib
.import "../parameters.js" as P


class PhaseBode extends Common.ExecutableObject {
    static type(){return 'Phase Bode'}
    static displayType(){return 'Bode Phase'}
    static displayTypeMultiple(){return 'Bode Phases'}
    static properties() {return {
        'om_0': new P.ObjectType('Point'),
        'phase': 'Expression',
        'unit': new P.Enum('°', 'deg', 'rad'),
        'labelPosition': new P.Enum('above', 'below', 'left', 'right', 'above-left', 'above-right', 'below-left', 'below-right'),
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                om_0 = '', phase = 90, unit = '°', labelPosition = 'above', labelX = 1) {
        if(name == null) name = Common.getNewName('φ')
        if(name == 'φ') name = 'φ₀' // φ is reserved for sum of BODE phases (Somme phases Bode).
        super(name, visible, color, labelContent)
        this.type = 'Phase Bode'
        if(typeof phase == 'number' || typeof phase == 'string') phase = new MathLib.Expression(phase.toString())
        this.phase = phase
        if(typeof om_0 == "string") {
            // Point name or create one
            om_0 = Objects.getObjectByName(om_0, 'Point')
            if(om_0 == null) {
                // Create new point
                om_0 = Objects.createNewRegisteredObject('Point')
                om_0.name = Common.getNewName('ω')
                om_0.color = this.color
                om_0.labelContent = 'name'
                om_0.labelPosition = this.phase.execute() >= 0 ? 'bottom' : 'top'
                HistoryLib.history.addToHistory(new HistoryLib.CreateNewObject(om_0.name, 'Point', om_0.export()))
                labelPosition = 'below'
            }
            om_0.requiredBy.push(this)
        }
        this.om_0 = om_0
        this.unit = unit
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.om_0.name, this.phase.toEditableString(), this.unit, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name}: ${this.phase.toString(true)}${this.unit} at ${this.om_0.name} = ${this.om_0.x}`
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        if(x < this.om_0.x) {
            return this.om_0.y.execute()
        } else {
            return this.om_0.y.execute() + this.phase.execute()
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        if(xval < this.om_0.x) {
            return this.om_0.y.toString()
        } else {
            var newExp = this.om_0.y.toEditableString() + ' + ' + this.phase.toEditableString()
            return (new MathLib.Expression(newExp)).toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas, ctx) {
        var baseX = canvas.x2px(this.om_0.x.execute())
        var omy = this.om_0.y.execute()
        var augmt = this.phase.execute()
        var baseY = canvas.y2px(omy)
        var augmtY = canvas.y2px(omy+augmt)
        // Before change line.
        canvas.drawLine(ctx, 0, baseY, Math.min(baseX, canvas.canvasSize.height), baseY)
        // Transition line.
        canvas.drawLine(ctx, baseX, baseY, baseX, augmtY)
        // After change line
        canvas.drawLine(ctx, Math.max(0, baseX), augmtY, canvas.canvasSize.width, augmtY)
        
        // Label
        var text = this.getLabel()
        ctx.font = `${canvas.textsize}px sans-serif`
        var textSize = canvas.measureText(ctx, text)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+textSize.height)
                break;
            case 'left':
                canvas.drawVisibleText(ctx, text, posX-textSize.width, posY-textSize.height/2)
                break;
            case 'right':
                canvas.drawVisibleText(ctx, text, posX, posY-textSize.height/2)
                break;
            case 'above-left':
                canvas.drawVisibleText(ctx, text, posX-textSize.width, posY-textSize.height)
                break;
            case 'above-right':
                canvas.drawVisibleText(ctx, text, posX, posY-textSize.height)
                break;
            case 'below-left':
                canvas.drawVisibleText(ctx, text, posX-textSize.width, posY+textSize.height)
                break;
            case 'below-right':
                canvas.drawVisibleText(ctx, text, posX, posY+textSize.height)
                break;
        }
    }
    
    update() {
        if(Objects.currentObjects['Somme phases Bode'] != undefined) {
            Objects.currentObjects['Somme phases Bode'][0].recalculateCache()
        } else {
            Objects.createNewRegisteredObject('Somme phases Bode')
        }
    }
}

