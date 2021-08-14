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
.import "function.js" as F
.import "../objects.js" as Objects
.import "../utils.js" as Utils
.import "../mathlib.js" as MathLib
.import "../historylib.js" as HistoryLib
.import "../parameters.js" as P

class GainBode extends Common.ExecutableObject {
    static type(){return 'Gain Bode'}
    static displayType(){return 'Bode Magnitude'}
    static displayTypeMultiple(){return 'Bode Magnitudes'}
    static properties() {return {
        'om_0': new P.ObjectType('Point'),
        'pass': new P.Enum('high', 'low'),
        'gain': 'Expression',
        'labelPosition': new P.Enum('above', 'below', 'left', 'right', 'above-left', 'above-right', 'below-left', 'below-right'),
        'labelX': 'number',
        'omGraduation': 'boolean'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                om_0 = '', pass = 'high', gain = '20', labelPosition = 'above', labelX = 1, omGraduation = false) {
        if(name == null) name = Common.getNewName('G')
        if(name == 'G') name = 'G₀' // G is reserved for sum of BODE magnitudes (Somme gains Bode).
        super(name, visible, color, labelContent)
        this.type = 'Gain Bode'
        if(typeof om_0 == "string") {
            // Point name or create one
            om_0 = Objects.getObjectByName(om_0, 'Point')
            if(om_0 == null) {
                // Create new point
                om_0 = Objects.createNewRegisteredObject('Point')
                om_0.name = Common.getNewName('ω')
                om_0.labelContent = 'name'
                om_0.color = this.color
                HistoryLib.history.addToHistory(new HistoryLib.CreateNewObject(om_0.name, 'Point', om_0.export()))
                labelPosition = 'below'
            }
            om_0.requiredBy.push(this)
        }
        this.om_0 = om_0
        this.pass = pass
        if(typeof gain == 'number' || typeof gain == 'string') gain = new MathLib.Expression(gain.toString())
        this.gain = gain
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.omGraduation = omGraduation
    }
    
    getReadableString() {
        return `${this.name}: ${this.pass}-pass; ${this.om_0.name} = ${this.om_0.x}\n   ${' '.repeat(this.name.length)}${this.gain.toString(true)} dB/dec`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.om_0.name, this.pass.toString(), this.gain.toEditableString(), this.labelPosition, this.labelX, this.omGraduation]
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        if((this.pass == 'high' && x < this.om_0.x) || (this.pass == 'low' && x > this.om_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.execute(x)
        } else {
            return this.om_0.y.execute()
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        if((this.pass == 'high' && xval < this.om_0.x) || (this.pass == 'low' && xval > this.om_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.simplify(x)
        } else {
            return this.om_0.y.toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas, ctx) {
        var base = [canvas.x2px(this.om_0.x), canvas.y2px(this.om_0.y)]
        var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
        var inDrawDom = new MathLib.EmptySet()

        if(this.pass == 'high') {
            // High pass, linear line from begining, then constant to the end.
            canvas.drawLine(ctx, base[0], base[1], canvas.canvasSize.width, base[1])
            inDrawDom = MathLib.parseDomain(`]-inf;${this.om_0.x}[`)
        } else {
            // Low pass, constant from the beginning, linear line to the end.
            canvas.drawLine(ctx, base[0], base[1], 0, base[1])
            inDrawDom = MathLib.parseDomain(`]${this.om_0.x};+inf[`)
        }
        F.Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
        // Dashed line representing break in function
        var xpos = canvas.x2px(this.om_0.x.execute())
        var dashPxSize = 10
        for(var i = 0; i < canvas.canvasSize.height && this.omGraduation; i += dashPxSize*2)
            canvas.drawLine(ctx, xpos, i, xpos, i+dashPxSize)
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
        super.update()
        if(Objects.currentObjects['Somme gains Bode'] != undefined) {
            Objects.currentObjects['Somme gains Bode'][0].recalculateCache()
        } else {
            Objects.createNewRegisteredObject('Somme gains Bode')
        }
    }
}
