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

import { executeExpression, Expression } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Objects from "../objects.mjs"
import Latex from "../math/latex.mjs"

import { ExecutableObject } from "common.mjs"

export default class BodePhaseSum extends ExecutableObject {
    static type(){return 'Somme phases Bode'}
    static displayType(){return qsTr('Bode Phases Sum')}
    static displayTypeMultiple(){return qsTr('Bode Phases Sum')}
    static createable() {return false}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:        'number',
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPosition = 'above', labelX = 1) {
        if(name == null) name = 'φ'
        super(name, visible, color, labelContent)
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.recalculateCache()
    }
    
    getReadableString() {
        return `${this.name} = ${Objects.getObjectsName('Phase Bode').join(' + ')}`
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = ${Objects.getObjectsName('Phase Bode').map(name => Latex.variable(name)).join(' + ')}`
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = executeExpression(x)
        for(let i = 0; i < this.om0xList.length-1; i++) {
            if(x >= this.om0xList[i] && x < this.om0xList[i+1]) return this.phasesList[i]
        }
    }
    
    simplify(x = 1) {
        let xval = x
        if(typeof x == 'string') xval = executeExpression(x)
        for(let i = 0; i < this.om0xList.length-1; i++) {
            if(xval >= this.om0xList[i] && xval < this.om0xList[i+1]) {
                return (new Expression(this.phasesExprList[i])).simplify()
            }
        }
        return '0'
    }
    
    canExecute(x = 1) {
        return true
    }
    
    recalculateCache() {
        // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
        let drawMin = 1e-20
        let drawMax = 1e20
        this.om0xList = [drawMin, drawMax]
        this.phasesList = [0]
        this.phasesExprList = ['0']
        let phasesDict = new Map()
        let phasesExprDict = new Map()
        phasesDict.set(drawMax, 0)
        
        let phaseObjects = Objects.currentObjects['Phase Bode']
        if(phaseObjects === undefined || phaseObjects.length < 1) {
            Objects.deleteObject(this.name)
        } else {
            console.log('Recalculating cache phase')
            for(/** @type {Bodephase} */ let obj of phaseObjects) {
                this.om0xList.push(obj.om_0.x.execute())
                if(!phasesDict.has(obj.om_0.x.execute())) {
                    phasesDict.set(obj.om_0.x.execute(), obj.phase.execute())
                    phasesExprDict.set(obj.om_0.x.execute(), obj.phase.toEditableString())
                } else {
                    phasesDict.set(obj.om_0.x.execute(), obj.phase.execute() + phasesDict.get(obj.om_0.x.execute()))
                    phasesExprDict.set(obj.om_0.x.execute(), obj.phase.toEditableString() + '+' + phasesExprDict.get(obj.om_0.x.execute()))
                }
                this.phasesList[0] += obj.om_0.y.execute()
                this.phasesExprList[0] += '+' + obj.om_0.y.toEditableString()
            }
            this.om0xList.sort((a,b) => a - b)
            let totalAdded = this.phasesList[0]
            for(let i = 1; i < this.om0xList.length; i++) {
                this.phasesList[i] = this.phasesList[i-1] + phasesDict.get(this.om0xList[i])
                this.phasesExprList[i] = this.phasesExprList[i-1] + '+' + phasesDict.get(this.om0xList[i])
            }
        }
    }
    
    draw(canvas) {
        for(let i = 0; i < this.om0xList.length-1; i++) {
            let om0xBegin = canvas.x2px(this.om0xList[i])
            let om0xEnd = canvas.x2px(this.om0xList[i+1])
            let baseY = canvas.y2px(this.phasesList[i])
            let nextY = canvas.y2px(this.phasesList[i+1])
            canvas.drawLine(om0xBegin, baseY, om0xEnd, baseY)
            canvas.drawLine(om0xEnd, baseY, om0xEnd, nextY)
        }
        
        // Label
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
    }
}

