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
.import "../objects.js" as Objects
.import "../mathlib.js" as MathLib
.import "../parameters.js" as P


class XCursor extends Common.DrawableObject {
    static type(){return 'X Cursor'}
    static displayType(){return qsTr('X Cursor')}
    static displayTypeMultiple(){return qsTr('X Cursors')}
    /*static properties() {
        return {
            'x': 'Expression',
            'targetElement': new P.ObjectType('ExecutableObject'),
            'labelPosition': new P.Enum('left', 'right'),
            'approximate': 'boolean',
            'rounding': 'number',
            'displayStyle': new P.Enum(
                '— — — — — — —',
                '⸺⸺⸺⸺⸺⸺',
                '• • • • • • • • • •'
            ),
            'targetValuePosition' : new P.Enum('Next to target', 'With label', 'Hidden')
        }
    }*/
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:                   'Expression',
        [QT_TRANSLATE_NOOP('prop','targetElement')]:       new P.ObjectType('ExecutableObject'),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:       P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','approximate')]:         'boolean',
        [QT_TRANSLATE_NOOP('prop','rounding')]:            'number',
        [QT_TRANSLATE_NOOP('prop','displayStyle')]:        new P.Enum(
                                                               '— — — — — — —',
                                                               '⸺⸺⸺⸺⸺⸺',
                                                               '• • • • • • • • • •'
                                                           ),
        [QT_TRANSLATE_NOOP('prop','targetValuePosition')]: P.Enum.XCursorValuePosition,
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, targetElement = null, labelPosition = 'left', approximate = true,
                rounding = 3, displayStyle = '— — — — — — —', targetValuePosition = 'Next to target') {
        if(name == null) name = Common.getNewName('X')
        super(name, visible, color, labelContent)
        this.type = 'X Cursor'
        this.approximate = approximate
        this.rounding = rounding
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        this.targetElement = targetElement
        if(typeof targetElement == "string") {
            this.targetElement = Objects.getObjectByName(targetElement, elementTypes)
        }
        this.labelPosition = labelPosition
        this.displayStyle = displayStyle
        this.targetValuePosition = targetValuePosition
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.x.toEditableString(), this.targetElement == null ? null : this.targetElement.name, this.labelPosition, 
        this.approximate, this.rounding, this.displayStyle, this.targetValuePosition]
    }
    
    getReadableString() {
        if(this.targetElement == null) return `${this.name} = ${this.x.toString()}`
        return `${this.name} = ${this.x.toString()}\n${this.getTargetValueLabel()}`
    }
    
    getTargetValueLabel() {
        var t = this.targetElement
        var approx = ''
        if(this.approximate) {
            approx = t.execute(this.x.execute())
            approx = approx.toPrecision(this.rounding + Math.round(approx).toString().length)
        }
        return `${t.name}(${this.name}) = ${t.simplify(this.x.toEditableString())}` +
            (this.approximate ? ' ≈ ' + approx : '')
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return this.name
                break;
            case 'name + value':
                switch(this.targetValuePosition) {
                    case 'Next to target':
                    case 'Hidden':
                        return `${this.name} = ${this.x.toString()}`
                        break;
                    case 'With label':
                        return this.getReadableString()
                        break;
                }
            case 'null':
                return ''
        }
    }
    
    draw(canvas, ctx) {
        var xpos = canvas.x2px(this.x.execute())
        switch(this.displayStyle) {
            case '— — — — — — —':
                var dashPxSize = 10
                for(var i = 0; i < canvas.canvasSize.height; i += dashPxSize*2)
                    canvas.drawLine(ctx, xpos, i, xpos, i+dashPxSize)
                break;
            case '⸺⸺⸺⸺⸺⸺':
                canvas.drawXLine(ctx, this.x.execute())
                break;
            case '• • • • • • • • • •':
                var pointDistancePx = 10
                var pointSize = 2
                ctx.beginPath();
                for(var i = 0; i < canvas.canvasSize.height; i += pointDistancePx)
                    ctx.ellipse(xpos-pointSize/2, i-pointSize/2, pointSize, pointSize)
                ctx.fill();
                break;
        }
        
        // Label
        var text = this.getLabel()
        ctx.font = `${canvas.textsize}px sans-serif`
        var textSize = canvas.measureText(ctx, text)
        
        switch(this.labelPosition) {
            case 'left':
            case 'above-left':
            case 'below-left':
            case 'below':
            case 'above':
                canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, textSize.height+5)
                break;
            case 'right':
            case 'above-right':
            case 'below-right':
                canvas.drawVisibleText(ctx, text, xpos+5, textSize.height+5)
                break;
        }
        
        if(this.targetValuePosition == 'Next to target' && this.targetElement != null) {
            var text = this.getTargetValueLabel()
            var textSize = canvas.measureText(ctx, text)
            var ypox = canvas.y2px(this.targetElement.execute(this.x.execute()))
            switch(this.labelPosition) {
                case 'left':
                case 'below':
                case 'above':
                    canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, ypox+textSize.height)
                    break;
                case 'above-left':
                    canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, ypox+textSize.height+12)
                    break;
                case 'below-left':
                    canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, ypox+textSize.height-12)
                    break;
                case 'right':
                    canvas.drawVisibleText(ctx, text, xpos+5, ypox+textSize.height)
                    break;
                case 'above-right':
                    canvas.drawVisibleText(ctx, text, xpos+5, ypox+textSize.height+12)
                    break;
                case 'below-right':
                    canvas.drawVisibleText(ctx, text, xpos+5, ypox+textSize.height-12)
                    break;
            }
        }
    }
}
