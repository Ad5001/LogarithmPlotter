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

import { Sequence as MathSequence, Domain } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Latex from "../math/latex.mjs"

import { API as Common, ExecutableObject } from "common.mjs"
import Function from "function.mjs"


export default class Sequence extends ExecutableObject {
    static type(){return 'Sequence'}
    static displayType(){return qsTr('Sequence')}
    static displayTypeMultiple(){return qsTr('Sequences')}
    
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','drawPoints')]:        'boolean',
        [QT_TRANSLATE_NOOP('prop','drawDashedLines')]:   'boolean',
        [QT_TRANSLATE_NOOP('prop','defaultExpression')]: new P.Dictionary('string', 'int', /^.+$/, /^\d+$/, '{name}[n+', '] = ', true),
                                  'comment1':            QT_TRANSLATE_NOOP(
                                                             'comment',
                                                             'Note: Use %1[n] to refer to %1ₙ, %1[n+1] for %1ₙ₊₁...'
                                                         ),
        [QT_TRANSLATE_NOOP('prop','baseValues')]:        new P.Dictionary('string', 'int', /^.+$/, /^\d+$/, '{name}[', '] = '),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:     P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:            'number',
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
            this.drawPoints, this.drawDashedLines, this.defaultExpression, this.baseValues,
            this.labelPosition, this.labelX]
    }

    update() {
        console.log('Updating sequence', this.sequence)
        super.update()
        if(
            this.sequence == null || this.baseValues !== this.sequence.baseValues ||
            this.sequence.name !== this.name ||
            this.sequence.expr !== Object.values(this.defaultExpression)[0] ||
            this.sequence.valuePlus !== Object.keys(this.defaultExpression)[0]
        )
            this.sequence = new MathSequence(
                this.name, this.baseValues, 
                Object.keys(this.defaultExpression)[0], 
                Object.values(this.defaultExpression)[0]
            )
    }
    
    getReadableString() {
        return this.sequence.toString()
    }
    
    getLatexString() {
        return this.sequence.toLatexString()
    }
    
    execute(x = 1) {
        if(x % 1 === 0)
            return this.sequence.execute(x)
        return null
    }
    canExecute(x = 1) {return x%1 === 0}
    
    // Simplify returns the simplified string of the expression.
    simplify(x = 1) {
        if(x % 1 === 0)
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
    
    getLatexLabel() {
        switch(this.labelContent) {
            case 'name':
                return `(${Latex.variable(this.name)}_n)`
            case 'name + value':
                return this.getLatexString()
            case 'null':
                return ''
        }
    }
    
    draw(canvas) {
        Function.drawFunction(canvas, this.sequence, canvas.logscalex ? Domain.NE : Domain.N, Domain.R, this.drawPoints, this.drawDashedLines)
        
        // Label
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
    }
}

