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

import { API as Common, ExecutableObject } from "common.mjs"
import * as P from "../parameters.mjs"
import Latex from "../math/latex.mjs"


export default class RepartitionFunction extends ExecutableObject {
    static type(){return 'Repartition'}
    static displayType(){return qsTr('Repartition')}
    static displayTypeMultiple(){return qsTr('Repartition functions')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:        'number',
                                  'comment1':        QT_TRANSLATE_NOOP(
                                                         'comment',
                                                         'Note: Specify the probability for each value.'
                                                     ),
        [QT_TRANSLATE_NOOP('prop','probabilities')]: new P.Dictionary('string', 'float', /^-?[\d.,]+$/, /^-?[\d.,]+$/, 'P({name_} = ', ') = '),
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                beginIncluded = true, drawLineEnds = true, probabilities = {'0': '0'}, labelPosition = 'above', labelX = 1) {
        if(name == null) name = Common.getNewName('XYZUVW', "F_")
        super(name, visible, color, labelContent)
        this.beginIncluded = beginIncluded
        this.drawLineEnds = drawLineEnds
        this.probabilities = probabilities
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.update()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent,
        this.beginIncluded, this.drawLineEnds, this.probabilities, this.labelPosition, this.labelX]
    }
    
    
    getReadableString() {
        let keys = Object.keys(this.probabilities).sort((a,b) => a-b);
        let varname = this.name.substring(this.name.indexOf("_")+1)
        return `${this.name}(x) = P(${varname} ≤ x)\n` + keys.map(idx => `P(${varname}=${idx})=${this.probabilities[idx]}`).join("; ")
    }
    
    getLatexString() {
        let keys = Object.keys(this.probabilities).sort((a,b) => a-b);
        let funcName = Latex.variable(this.name)
        let varName = Latex.variable(this.name.substring(this.name.indexOf("_")+1))
        return `\\begin{array}{l}{${funcName}}(x) = P(${varName} \\le x)\\\\` + keys.map(idx => `P(${varName}=${idx})=${this.probabilities[idx]}`).join("; ") + '\\end{array}'
    }
    
    execute(x = 1) {
        let ret = 0;
        Object.keys(this.probabilities).sort((a,b) => a-b).forEach(idx => {
            if(x >= idx) ret += parseFloat(this.probabilities[idx].replace(/,/g, '.'))
        })
        return ret
    }
    
    canExecute(x = 1) {return true}

    // Simplify returns the simplified string of the expression.
    simplify(x = 1) {
        return this.execute(x)
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return `${this.name}(x)`
            case 'name + value':
                return this.getReadableString()
            case 'null':
                return ''
        }
    }
    
    draw(canvas) {
        let currentY = 0;
        let keys = Object.keys(this.probabilities).map(idx => parseInt(idx)).sort((a,b) => a-b)
        if(canvas.isVisible(keys[0],this.probabilities[keys[0]].replace(/,/g, '.'))) {
            canvas.drawLine(0, canvas.y2px(0), canvas.x2px(keys[0]), canvas.y2px(0))
            if(canvas.isVisible(keys[0],0)) {
                canvas.arc(canvas.x2px(keys[0])+4,canvas.y2px(0), 4, Math.PI / 2, 3 * Math.PI / 2);
            }
        }
        for(let i = 0; i < keys.length-1; i++) {
            let idx = keys[i];
            currentY += parseFloat(this.probabilities[idx].replace(/,/g, '.'));
            if(canvas.isVisible(idx,currentY) || canvas.isVisible(keys[i+1],currentY)) {
                canvas.drawLine(
                    Math.max(0,canvas.x2px(idx)),
                    canvas.y2px(currentY),
                    Math.min(canvas.width,canvas.x2px(keys[i+1])),
                    canvas.y2px(currentY)
                )
                if(canvas.isVisible(idx,currentY)) {
                    canvas.disc(canvas.x2px(idx), canvas.y2px(currentY), 4)
                }
                if(canvas.isVisible(keys[i+1],currentY)) {
                    canvas.arc(canvas.x2px(keys[i+1])+4,canvas.y2px(currentY), 4, Math.PI / 2, 3 * Math.PI / 2);
                }
            }
        }
        if(canvas.isVisible(keys[keys.length-1],currentY+parseFloat(this.probabilities[keys[keys.length-1]]))) {
            canvas.drawLine(
                Math.max(0,canvas.x2px(keys[keys.length-1])),
                canvas.y2px(currentY+parseFloat(this.probabilities[keys[keys.length-1]].replace(/,/g, '.'))),
                canvas.width,
                canvas.y2px(currentY+parseFloat(this.probabilities[keys[keys.length-1]].replace(/,/g, '.')))
            )
            canvas.disc(
                canvas.x2px(keys[keys.length-1]),
                canvas.y2px(
                    currentY+parseFloat(this.probabilities[keys[keys.length-1]].replace(/,/g, '.'))
                ),
                4
            )
        }
        
        // Label
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
    }
}

