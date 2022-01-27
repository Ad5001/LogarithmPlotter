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

.import "common.js" as Common
.import "function.js" as F
.import "../mathlib.js" as MathLib
.import "../parameters.js" as P


class Sequence extends Common.ExecutableObject {
    static type(){return 'Sequence'}
    static displayType(){return qsTr('Sequence')}
    static displayTypeMultiple(){return qsTr('Sequences')}
    
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','drawPoints')]:      'boolean',
        [QT_TRANSLATE_NOOP('prop','drawDashedLines')]: 'boolean',
                                  'comment1':          QT_TRANSLATE_NOOP(
                                                           'comment',
                                                           'Note: Use %1[n] to refer to %1ₙ, %1[n+1] for %1ₙ₊₁...'
                                                       ),
        [QT_TRANSLATE_NOOP('prop','baseValues')]:      new P.Dictionary('string', 'int', /^.+$/, /^\d+$/, '{name}[', '] = '),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:   P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:          'number',
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                drawPoints = true, drawDashedLines = true, defaultExp = {1: "n"}, 
                baseValues = {0: 0}, labelPosition = 'above', labelX = 1) {
        if(name == null) name = Common.getNewName('uvwPSUVWabcde')
        super(name, visible, color, labelContent)
        this.drawPoints = drawPoints
        this.drawDashedLines = drawDashedLines
        this.defaultExpression = defaultExp
        this.baseValues = baseValues
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.update()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent,
        this.drawPoints, this.drawDashedLines, this.defaultExpression, this.baseValues, this.labelPosition, this.labelX]
    }

    update() {
        super.update()
        if(
            this.sequence == null || this.baseValues != this.sequence.baseValues ||
            this.sequence.name != this.name || 
            this.sequence.expr != Object.values(this.defaultExpression)[0] ||
            this.sequence.valuePlus != Object.keys(this.defaultExpression)[0]
        )
            this.sequence = new MathLib.Sequence(
                this.name, this.baseValues, 
                Object.keys(this.defaultExpression)[0], 
                Object.values(this.defaultExpression)[0]
            )
    }
    
    
    getReadableString() {
        return this.sequence.toString()
    }
    
    execute(x = 1) {
        if(x % 1 == 0)
            return this.sequence.execute(x)
        return null
    }
    canExecute(x = 1) {return x%1 == 0}
    
    // Simplify returns the simplified string of the expression.
    simplify(x = 1) {
        if(x % 1 == 0)
            return this.sequence.simplify(x)
        return null
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return `(${this.name}ₙ)`
            case 'name + value':
                return this.getReadableString()
            case 'null':
                return ''
                
        }
    }
    
    draw(canvas, ctx) {
        F.Function.drawFunction(canvas, ctx, this.sequence, canvas.logscalex ? MathLib.Domain.NE : MathLib.Domain.N, MathLib.Domain.R, this.drawPoints, this.drawDashedLines)
        
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

