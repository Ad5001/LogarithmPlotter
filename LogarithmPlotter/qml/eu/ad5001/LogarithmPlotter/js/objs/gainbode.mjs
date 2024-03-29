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

import { parseDomain, executeExpression, Expression, EmptySet, Domain } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Objects from "../objects.mjs"
import Latex from "../math/latex.mjs"

import { API as Common, ExecutableObject } from "common.mjs"
import Function from "function.mjs"

import { API as HistoryAPI } from "../history/common.mjs"
import { CreateNewObject } from "../historylib.mjs"


export default class GainBode extends ExecutableObject {
    static type(){return 'Gain Bode'}
    static displayType(){return qsTr('Bode Magnitude')}
    static displayTypeMultiple(){return qsTr('Bode Magnitudes')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','om_0')]:          new P.ObjectType('Point'),
        [QT_TRANSLATE_NOOP('prop','pass')]:          P.Enum.BodePass,
        [QT_TRANSLATE_NOOP('prop','gain')]:          new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:        'number',
        [QT_TRANSLATE_NOOP('prop','omGraduation')]:  'boolean'
    }}

    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                om_0 = '', pass = 'high', gain = '20', labelPosition = 'above', labelX = 1, omGraduation = false) {
        if(name == null) name = Common.getNewName('G')
        if(name === 'G') name = 'G₀' // G is reserved for sum of BODE magnitudes (Somme gains Bode).
        super(name, visible, color, labelContent)
        if(typeof om_0 == "string") {
            // Point name or create one
            om_0 = Objects.currentObjectsByName[om_0]
            if(om_0 == null) {
                // Create new point
                om_0 = Objects.createNewRegisteredObject('Point', [Common.getNewName('ω'), true, this.color, 'name'])
                HistoryAPI.addToHistory(new CreateNewObject(om_0.name, 'Point', om_0.export()))
                om_0.update()
                labelPosition = 'below'
            }
            om_0.requiredBy.push(this)
        }
        /** @type {Point} */
        this.om_0 = om_0
        this.pass = pass
        if(typeof gain == 'number' || typeof gain == 'string') gain = new Expression(gain.toString())
        this.gain = gain
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.omGraduation = omGraduation
    }
    
    getReadableString() {
        let pass = this.pass === "low" ? qsTr("low-pass") : qsTr("high-pass");
        return `${this.name}: ${pass}; ${this.om_0.name} = ${this.om_0.x}\n   ${' '.repeat(this.name.length)}${this.gain.toString(true)} dB/dec`
    }
    
    getLatexString() {
        let pass = this.pass === "low" ? qsTr("low-pass") : qsTr("high-pass");
        return `\\mathrm{${Latex.variable(this.name)}:}\\begin{array}{l}
        \\textsf{${pass}};${Latex.variable(this.om_0.name)} = ${this.om_0.x.latexMarkup} \\\\
        ${this.gain.latexMarkup}\\textsf{ dB/dec}
        \\end{array}`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.om_0.name, this.pass.toString(), this.gain.toEditableString(), this.labelPosition, this.labelX, this.omGraduation]
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = executeExpression(x)
        if((this.pass === 'high' && x < this.om_0.x) || (this.pass === 'low' && x > this.om_0.x)) {
            let dbfn = new Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.execute(x)
        } else {
            return this.om_0.y.execute()
        }
    }
    
    simplify(x = 1) {
        let xval = x
        if(typeof x == 'string') xval = executeExpression(x)
        if((this.pass === 'high' && xval < this.om_0.x.execute()) || (this.pass === 'low' && xval > this.om_0.x.execute())) {
            let dbfn = new Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.simplify(x)
        } else {
            return this.om_0.y.toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas) {
        let base = [canvas.x2px(this.om_0.x.execute()), canvas.y2px(this.om_0.y.execute())]
        let dbfn = new Expression(`${this.gain.execute()}*(log10(x)-log10(${this.om_0.x}))+${this.om_0.y}`)
        let inDrawDom = new EmptySet()

        if(this.pass === 'high') {
            // High pass, linear line from beginning, then constant to the end.
            canvas.drawLine(base[0], base[1], canvas.width, base[1])
            inDrawDom = parseDomain(`]-inf;${this.om_0.x}[`)
        } else {
            // Low pass, constant from the beginning, linear line to the end.
            canvas.drawLine(base[0], base[1], 0, base[1])
            inDrawDom = parseDomain(`]${this.om_0.x};+inf[`)
        }
        Function.drawFunction(canvas, dbfn, inDrawDom, Domain.R)
        // Dashed line representing break in function
        let xpos = canvas.x2px(this.om_0.x.execute())
        let dashPxSize = 10
        for(let i = 0; i < canvas.height && this.omGraduation; i += dashPxSize*2)
            canvas.drawLine(xpos, i, xpos, i+dashPxSize)
            
        // Label
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
    }
    
    update() {
        super.update()
        if(Objects.currentObjects['Somme gains Bode'] !== undefined && Objects.currentObjects['Somme gains Bode'].length > 0) {
            Objects.currentObjects['Somme gains Bode'][0].recalculateCache()
        } else {
            Objects.createNewRegisteredObject('Somme gains Bode')
        }
    }
}
