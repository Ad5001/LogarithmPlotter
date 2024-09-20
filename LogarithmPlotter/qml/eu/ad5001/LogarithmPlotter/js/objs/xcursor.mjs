/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
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

import { Expression } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Latex from "../math/latex.mjs"
import Objects from "../objects.mjs"

import { DrawableObject } from "common.mjs"


export default class XCursor extends DrawableObject {
    static type(){return 'X Cursor'}
    static displayType(){return qsTr('X Cursor')}
    static displayTypeMultiple(){return qsTr('X Cursors')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:                   new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','targetElement')]:       new P.ObjectType('ExecutableObject', true),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:       P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','approximate')]:         'boolean',
        [QT_TRANSLATE_NOOP('prop','rounding')]:            'int',
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
        if(name == null) name = Objects.getNewName('X')
        super(name, visible, color, labelContent)
        this.approximate = approximate
        this.rounding = rounding
        if(typeof x == 'number' || typeof x == 'string') x = new Expression(x.toString())
        this.x = x
        this.targetElement = targetElement
        if(typeof targetElement == "string") {
            this.targetElement = Objects.currentObjectsByName[targetElement]
        }
        this.labelPosition = labelPosition
        this.displayStyle = displayStyle
        this.targetValuePosition = targetValuePosition
    }
    
    getReadableString() {
        if(this.targetElement == null) return `${this.name} = ${this.x.toString()}`
        return `${this.name} = ${this.x.toString()}\n${this.getTargetValueLabel()}`
    }
    
    getLatexString() {
        if(this.targetElement == null) return `${Latex.variable(this.name)} = ${this.x.latexMarkup}`
        return `\\begin{array}{l}
        ${Latex.variable(this.name)} = ${this.x.latexMarkup} \\\\
        ${this.getTargetValueLatexLabel()}
        \\end{array}`
    }
    
    getTargetValueLabel() {
        var t = this.targetElement
        var approx = ''
        if(this.approximate) {
            approx = (t.execute(this.x.execute()))
            let intLength = Math.round(approx).toString().length
            let rounding = Math.min(this.rounding, approx.toString().length - intLength - 1)
            approx = approx.toPrecision(rounding + intLength)
        }
        return `${t.name}(${this.name}) = ${t.simplify(this.x.toEditableString())}` +
            (this.approximate ? ' ≈ ' + approx : '')
    }
    
    getTargetValueLatexLabel() {
        let t = this.targetElement
        let approx = ''
        if(this.approximate) {
            approx = (t.execute(this.x.execute()))
            let intLength = Math.round(approx).toString().length
            let rounding = Math.min(this.rounding, approx.toString().length - intLength - 1)
            approx = approx.toPrecision(rounding + intLength)
        }
        let simpl = t.simplify(this.x.toEditableString())
        return `${Latex.variable(t.name)}(${Latex.variable(this.name)}) = ${simpl.latexMarkup ? simpl.latexMarkup : Latex.variable(simpl)}` +
            (this.approximate ? ' \\simeq ' + approx : '')
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
    
    getLatexLabel() {
        switch(this.labelContent) {
            case 'name':
                return Latex.variable(this.name)
                break;
            case 'name + value':
                switch(this.targetValuePosition) {
                    case 'Next to target':
                    case 'Hidden':
                        return `${Latex.variable(this.name)} = ${this.x.latexMarkup}`
                        break;
                    case 'With label':
                        return this.getLatexString()
                        break;
                }
            case 'null':
                return ''
        }
    }
    
    draw(canvas) {
        let xpos = canvas.x2px(this.x.execute())
        switch(this.displayStyle) {
            case '— — — — — — —':
                canvas.drawDashedLine(xpos, 0, xpos, canvas.height, 20)
                break;
            case '⸺⸺⸺⸺⸺⸺':
                canvas.drawXLine(this.x.execute())
                break;
            case '• • • • • • • • • •':
                let pointDistancePx = 10
                let pointSize = 2
                for(let i = 0; i < canvas.height; i += pointDistancePx)
                    canvas.disc(xpos, i, pointSize)
                break;
        }
        
        // Drawing label at the top of the canvas.
        this.drawLabel(canvas, this.labelPosition, xpos, 0, false, null, null,
                       (x,y,ltxImg) => canvas.drawVisibleImage(ltxImg.source, x, 5, ltxImg.width, ltxImg.height),
                       (x,y,text,textSize) => canvas.drawVisibleText(text, x, textSize.height+5))
        
        // Drawing label at the position of the target element.
        if(this.targetValuePosition === 'Next to target' && this.targetElement != null) {
            let ypos = canvas.y2px(this.targetElement.execute(this.x.execute()))
            this.drawLabel(canvas, this.labelPosition, xpos, ypos, false,
                           this.getTargetValueLatexLabel.bind(this), this.getTargetValueLabel.bind(this),
                           (x,y,ltxImg) => canvas.drawVisibleImage(ltxImg.source, x, y, ltxImg.width, ltxImg.height),
                           (x,y,text,textSize) => canvas.drawVisibleText(text, x, y+textSize.height))
        }
    }
}
