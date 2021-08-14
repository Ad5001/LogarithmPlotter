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
.import "../parameters.js" as P


class SommePhasesBode extends Common.ExecutableObject {
    static type(){return 'Somme phases Bode'}
    static displayType(){return 'Bode Phases Sum'}
    static displayTypeMultiple(){return 'Bode Phases Sum'}
    static createable() {return false}
    static properties() {return {
        'labelPosition': new P.Enum('above', 'below', 'left', 'right', 'above-left', 'above-right', 'below-left', 'below-right'),
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPosition = 'above', labelX = 1) {
        if(name == null) name = 'φ'
        super(name, visible, color, labelContent)
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.recalculateCache()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name} = ${Objects.getObjectsName('Phase Bode').join(' + ')}`
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        for(var i = 0; i < this.om0xList.length-1; i++) {
            if(x >= this.om0xList[i] && x < this.om0xList[i+1]) return this.phasesList[i]
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        for(var i = 0; i < this.om0xList.length-1; i++) {
            if(xval >= this.om0xList[i] && xval < this.om0xList[i+1]) {
                return (new MathLib.Expression(this.phasesExprList[i])).simplify()
            }
        }
        return '0'
    }
    
    canExecute(x = 1) {
        return true
    }
    
    recalculateCache() {
        // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
        var drawMin = 0.001
        var drawMax = 100000
        this.om0xList = [drawMin, drawMax]
        this.phasesList = [0]
        this.phasesExprList = ['0']
        var phasesDict = {}
        var phasesExprDict = {}
        phasesDict[drawMax] = 0
        
        if(Objects.currentObjects['Phase Bode'] != undefined) {
            console.log('Recalculating cache phase')
            for(var obj of Objects.currentObjects['Phase Bode']) {
                this.om0xList.push(obj.om_0.x.execute())
                if(phasesDict[obj.om_0.x.execute()] == undefined) {
                    phasesDict[obj.om_0.x.execute()] = obj.phase.execute()
                    phasesExprDict[obj.om_0.x.execute()] = obj.phase.toEditableString()
                } else {
                    phasesDict[obj.om_0.x.execute()] += obj.phase.execute()
                    phasesExprDict[obj.om_0.x.execute()] += '+' + obj.phase.toEditableString()
                }
                this.phasesList[0] += obj.om_0.y.execute()
                this.phasesExprList[0] += '+' + obj.om_0.y.toEditableString()
            }
            this.om0xList.sort((a,b) => a - b)
            var totalAdded = this.phasesList[0]
            for(var i = 1; i < this.om0xList.length; i++) {
                this.phasesList[i] = this.phasesList[i-1] + phasesDict[this.om0xList[i]]
                this.phasesExprList[i] = this.phasesExprList[i-1] + '+' + phasesDict[this.om0xList[i]]
            }
        }
    }
    
    draw(canvas, ctx) {
        for(var i = 0; i < this.om0xList.length-1; i++) {
            var om0xBegin = canvas.x2px(this.om0xList[i])
            var om0xEnd = canvas.x2px(this.om0xList[i+1])
            var baseY = canvas.y2px(this.phasesList[i])
            var nextY = canvas.y2px(this.phasesList[i+1])
            canvas.drawLine(ctx, om0xBegin, baseY, om0xEnd, baseY)
            canvas.drawLine(ctx, om0xEnd, baseY, om0xEnd, nextY)
        }
        
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
}

