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

import { Range, Expression, Domain } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Objects from "../objects.mjs"
import Latex from "../math/latex.mjs"

import { ExecutableObject } from "common.mjs"
import Function from "function.mjs"


export default class BodeMagnitudeSum extends ExecutableObject {
    static type(){return 'Somme gains Bode'}
    static displayType(){return qsTranslate("bodemagnitudesum", 'Bode Magnitudes Sum')}
    static displayTypeMultiple(){return qsTranslate("bodemagnitudesum", 'Bode Magnitudes Sum')}
    static createable() {return false}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:        'number',
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPosition = 'above', labelX = 1) {
        if(name == null) name = 'G'
        super(name, visible, color, labelContent)
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.recalculateCache()
    }
    
    getReadableString() {
        return `${this.name} = ${Objects.getObjectsName('Gain Bode').join(' + ')}`
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = ${Objects.getObjectsName('Gain Bode').map(name => Latex.variable(name)).join(' + ')}`
    }
    
    execute(x = 0) {
        for(let [limitedDrawFunction, inDrawDom] of this.cachedParts) {
            if(inDrawDom.includes(x)) {
                return limitedDrawFunction.execute(x)
            }
        }
        return null
    }
    
    canExecute(x = 1) {
        return true // Should always be true
    }
    
    simplify(x = 1) {
        for(let [limitedDrawFunction, inDrawDom] of this.cachedParts) {
            if(inDrawDom.includes(x)) {
                return limitedDrawFunction.simplify(x)
            }
        }
        return ''
    }
    
    recalculateCache() {
        this.cachedParts = []
        // Calculating this is fairly resource expansive so it's cached.
        let magnitudeObjects = Objects.currentObjects['Gain Bode']
        if(magnitudeObjects === undefined || magnitudeObjects.length < 1) {
            Objects.deleteObject(this.name)
        } else {
            console.log('Recalculating cache gain')
            // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
            const MIN_DRAW = 1e-20
            // Format: [[x value of where the filter transitions, magnitude, high-pass (bool)]]
            const magnitudes = [] 
            const XVALUE = 0
            const MAGNITUDE = 1
            const PASS = 2
            magnitudes.push([Number.MAX_VALUE, 0, true]) // Draw the ending section
            // Collect data from current magnitude (or gain in French) objects.
            let baseY = 0
            for(/** @type {Bodemagnitude} */ let magnitudeObj of magnitudeObjects) { // Sorting by their om_0 position.
                const om0x = magnitudeObj.om_0.x.execute()
                magnitudes.push([om0x, magnitudeObj.gain.execute(), magnitudeObj.pass === 'high'])
                baseY += magnitudeObj.execute(MIN_DRAW)
            }
            // Sorting the data by their x transitions value
            magnitudes.sort((a,b) => a[XVALUE] - b[XVALUE])
            // Adding the total gains.
            let magnitudesBeforeTransition = []
            let magnitudesAfterTransition = []
            let totalMagnitudeAtStart = 0 // Magnitude at the lowest x value (sum of all high-pass magnitudes)
            for(let [om0x, magnitude, highpass] of magnitudes){
                if(highpass) {
                    magnitudesBeforeTransition.push(magnitude)
                    magnitudesAfterTransition.push(0)
                    totalMagnitudeAtStart += magnitude
                } else {
                    magnitudesBeforeTransition.push(0)
                    magnitudesAfterTransition.push(magnitude)
                }
            }
            // Calculating parts
            let previousTransitionX = MIN_DRAW
            let currentMagnitude = totalMagnitudeAtStart
            for(let transitionID = 0; transitionID < magnitudes.length; transitionID++) {
                const transitionX = magnitudes[transitionID][XVALUE]
                // Create draw function that will be used during drawing.
                const limitedDrawFunction = new Expression(`${currentMagnitude}*(ln(x)-ln(${previousTransitionX}))/ln(10)+${baseY}`)
                const drawDomain = new Range(previousTransitionX, transitionX, true, false)
                this.cachedParts.push([limitedDrawFunction, drawDomain])
                // Prepare default values for next function.
                previousTransitionX = transitionX
                baseY = limitedDrawFunction.execute(transitionX)
                currentMagnitude += magnitudesAfterTransition[transitionID] - magnitudesBeforeTransition[transitionID]
            }
        }
    }
    
    draw(canvas) {
        if(this.cachedParts.length > 0) {
            for(let [limitedDrawFunction, drawDomain] of this.cachedParts) {
                Function.drawFunction(canvas, limitedDrawFunction, drawDomain, Domain.R)
                // Check if necessary to draw label
                if(drawDomain.includes(this.labelX)) {
                    this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
                }
            }
        }
    }
}
