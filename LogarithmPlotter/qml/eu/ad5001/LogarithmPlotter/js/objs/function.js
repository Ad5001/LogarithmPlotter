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
.import "../utils.js" as Utils
.import "../mathlib.js" as MathLib
.import "../parameters.js" as P


class Function extends Common.ExecutableObject {
    static type(){return 'Function'}
    static displayType(){return qsTr('Function')}
    static displayTypeMultiple(){return qsTr('Functions')}
    /*static properties() {return {
        'expression':               'Expression',
        'definitionDomain':         'Domain',
        'destinationDomain':        'Domain',
        'comment1':                 'Ex: R+* (ℝ⁺*), N (ℕ), Z-* (ℤ⁻*), ]0;1[, {3;4;5}',
        'labelPosition':            P.Enum.Position,
        'displayMode':              new P.Enum('application', 'function'),
        'labelX':                   'number',
        'comment2':                 'The following parameters are used when the definition domain is a non-continuous set. (Ex: ℕ, ℤ, sets like {0;3}...)',
        'drawPoints':               'boolean',
        'drawDashedLines':          'boolean'
    }}*/
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','expression')]:         'Expression',
        [QT_TRANSLATE_NOOP('prop','definitionDomain')]:   'Domain',
        [QT_TRANSLATE_NOOP('prop','destinationDomain')]:  'Domain',
                                  'comment1':             QT_TRANSLATE_NOOP(
                                                              'comment',
                                                              'Ex: R+* (ℝ⁺*), N (ℕ), Z-* (ℤ⁻*), ]0;1[, {3;4;5}'
                                                          ),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:      P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','displayMode')]:        P.Enum.FunctionDisplayType,
        [QT_TRANSLATE_NOOP('prop','labelX')]:             'number',
                                  'comment2':             QT_TRANSLATE_NOOP(
                                                              'comment',
                                                              'The following parameters are used when the definition domain is a non-continuous set. (Ex: ℕ, ℤ, sets like {0;3}...)'
                                                          ),
        [QT_TRANSLATE_NOOP('prop','drawPoints')]:         'boolean',
        [QT_TRANSLATE_NOOP('prop','drawDashedLines')]:    'boolean'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                expression = 'x', definitionDomain = 'RPE', destinationDomain = 'R', 
                displayMode = 'application', labelPosition = 'above', labelX = 1,
                drawPoints = true, drawDashedLines = true) {
        if(name == null) name = Common.getNewName('fghjqlmnopqrstuvwabcde')
        super(name, visible, color, labelContent)
        this.type = 'Function'
        if(typeof expression == 'number' || typeof expression == 'string') expression = new MathLib.Expression(expression.toString())
        this.expression = expression
        if(typeof definitionDomain == 'string') definitionDomain = MathLib.parseDomain(definitionDomain)
        this.definitionDomain = definitionDomain
        if(typeof destinationDomain == 'string') destinationDomain = MathLib.parseDomain(destinationDomain)
        this.destinationDomain = destinationDomain
        this.displayMode = displayMode
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.drawPoints = drawPoints
        this.drawDashedLines = drawDashedLines
    }
    
    getReadableString() {
        if(this.displayMode == 'application') {
            return `${this.name}: ${this.definitionDomain} ⟶ ${this.destinationDomain}\n   ${' '.repeat(this.name.length)}x ⟼ ${this.expression.toString()}`
        } else {
            return `${this.name}(x) = ${this.expression.toString()}\nD${Utils.textsub(this.name)} = ${this.definitionDomain}`
        }
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.expression.toEditableString(), this.definitionDomain.toString(), this.destinationDomain.toString(), 
        this.displayMode, this.labelPosition, this.labelX, this.drawPoints, this.drawDashedLines]
    }
    
    execute(x = 1) {
        if(this.definitionDomain.includes(x))
            return this.expression.execute(x)
        return null
    }
    
    canExecute(x = 1) {
        return this.definitionDomain.includes(x)
    }
    
    simplify(x = 1) {
        if(this.definitionDomain.includes(x))
            return this.expression.simplify(x)
        return ''
    }
    
    draw(canvas, ctx) {
        Function.drawFunction(canvas, ctx, this.expression, this.definitionDomain, this.destinationDomain, this.drawPoints, this.drawDashedLines)
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
    
    static drawFunction(canvas, ctx, expr, definitionDomain, destinationDomain, drawPoints = true, drawDash = true) {
        // Reusable in other objects.
        // Drawing small traits every 2px
        var pxprecision = 0.2
        var previousX = canvas.px2x(0)
        var previousY;
        if(definitionDomain instanceof MathLib.SpecialDomain && definitionDomain.moveSupported) {
            // Point based functions.
            previousX = definitionDomain.next(previousX)
            if(previousX === null) previousX = definitionDomain.next(canvas.px2x(0))
            previousY = expr.execute(previousX)
            if(!drawPoints && !drawDash) return
            while(previousX !== null && canvas.x2px(previousX) < canvas.canvasSize.width) {
                // Reconverted for canvas to fix for logarithmic scales.
                var currentX = definitionDomain.next(canvas.px2x(canvas.x2px(previousX)+pxprecision));
                var currentY = expr.execute(currentX)
                if(currentX === null) break;
                if((definitionDomain.includes(currentX) || definitionDomain.includes(previousX)) &&
                    (destinationDomain.includes(currentY) || destinationDomain.includes(previousY))) {
                    if(drawDash)
                        canvas.drawDashedLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                    if(drawPoints) {
                        ctx.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
                        ctx.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
                    }
                }
                previousX = currentX
                previousY = currentY
            }
            if(drawPoints) {
                // Drawing the last cross
                ctx.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
                ctx.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
            }
        } else {
            previousY = expr.execute(previousX)
            for(var px = pxprecision; px < canvas.canvasSize.width; px += pxprecision) {
                var currentX = canvas.px2x(px)
                var currentY = expr.execute(currentX)
                if((definitionDomain.includes(currentX) || definitionDomain.includes(previousX)) &&
                    (destinationDomain.includes(currentY) || destinationDomain.includes(previousY)) &&
                    Math.abs(previousY-currentY)<100) {
                        canvas.drawLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                    }
                previousX = currentX
                previousY = currentY
            }
        }
    }
}
