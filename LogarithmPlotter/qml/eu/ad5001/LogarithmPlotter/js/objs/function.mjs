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

import { textsub } from "../utils.mjs"
import { API as Common, ExecutableObject } from "common.mjs"
import { parseDomain, Expression, SpecialDomain } from "../mathlib.mjs"
import * as P from "../parameters.mjs"
import Latex from "../math/latex.mjs"


export default class Function extends ExecutableObject {
    static type(){return 'Function'}
    static displayType(){return qsTr('Function')}
    static displayTypeMultiple(){return qsTr('Functions')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','expression')]:         new P.Expression('x'),
        [QT_TRANSLATE_NOOP('prop','definitionDomain')]:   'Domain',
        [QT_TRANSLATE_NOOP('prop','destinationDomain')]:  'Domain',
                                  'comment1':             QT_TRANSLATE_NOOP(
                                                              'comment',
                                                              'Ex: R+* (ℝ⁺*), N (ℕ), Z-* (ℤ⁻*), ]0;1[, {3;4;5}'
                                                          ),
        [QT_TRANSLATE_NOOP('prop','displayMode')]:        P.Enum.FunctionDisplayType,
        [QT_TRANSLATE_NOOP('prop','labelPosition')]:      P.Enum.Position,
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
        if(typeof expression == 'number' || typeof expression == 'string') expression = new Expression(expression.toString())
        this.expression = expression
        if(typeof definitionDomain == 'string') definitionDomain = parseDomain(definitionDomain)
        this.definitionDomain = definitionDomain
        if(typeof destinationDomain == 'string') destinationDomain = parseDomain(destinationDomain)
        this.destinationDomain = destinationDomain
        this.displayMode = displayMode
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.drawPoints = drawPoints
        this.drawDashedLines = drawDashedLines
    }
    
    getReadableString() {
        if(this.displayMode === 'application') {
            return `${this.name}: ${this.definitionDomain} ⟶ ${this.destinationDomain}\n   ${' '.repeat(this.name.length)}x ⟼ ${this.expression.toString()}`
        } else {
            return `${this.name}(x) = ${this.expression.toString()}\nD${textsub(this.name)} = ${this.definitionDomain}`
        }
    }
    
    getLatexString() {
        if(this.displayMode === 'application') {
            return `${Latex.variable(this.name)}:\\begin{array}{llll}${this.definitionDomain.latexMarkup}\\textrm{ } & \\rightarrow & \\textrm{ }${this.destinationDomain.latexMarkup}\\\\
            x\\textrm{ } & \\mapsto & \\textrm{ }${this.expression.latexMarkup}\\end{array}`
        } else {
            return `\\begin{array}{l}${Latex.variable(this.name)}(x) = ${this.expression.latexMarkup}\\\\ D_{${this.name}} = ${this.definitionDomain.latexMarkup}\\end{array}`
        }
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
    
    draw(canvas) {
        Function.drawFunction(canvas, this.expression, this.definitionDomain, this.destinationDomain, this.drawPoints, this.drawDashedLines)
        // Label
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
    }

    /**
     * Reusable in other objects.
     * Drawing small traits every few pixels
     */
    static drawFunction(canvas, expr, definitionDomain, destinationDomain, drawPoints = true, drawDash = true) {
        let pxprecision = 10
        let previousX = canvas.px2x(0)
        let previousY = null;
        if(definitionDomain instanceof SpecialDomain && definitionDomain.moveSupported) {
            // Point based functions.
            previousX = definitionDomain.next(previousX)
            if(previousX === null) previousX = definitionDomain.next(canvas.px2x(0))
            previousY = expr.execute(previousX)
            if(!drawPoints && !drawDash) return
            while(previousX !== null && canvas.x2px(previousX) < canvas.width) {
                // Reconverted for canvas to fix for logarithmic scales.
                let currentX = definitionDomain.next(canvas.px2x(canvas.x2px(previousX)+pxprecision));
                let currentY = expr.execute(currentX)
                if(currentX === null) break;
                if((definitionDomain.includes(currentX) || definitionDomain.includes(previousX)) &&
                    (destinationDomain.includes(currentY) || destinationDomain.includes(previousY))) {
                    if(drawDash)
                        canvas.drawDashedLine(canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                    if(drawPoints) {
                        canvas.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
                        canvas.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
                    }
                }
                previousX = currentX
                previousY = currentY
            }
            if(drawPoints) {
                // Drawing the last cross
                canvas.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
                canvas.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
            }
        } else {
            // Use max precision if function is trigonometrical on log scale.
            let exprString = expr.expr
            if(exprString.includes("sin") || exprString.includes("cos") || exprString.includes("tan"))
                pxprecision = (canvas.logscalex || exprString.includes("tan")) ? 1 : 3
            // Calculate the previousY at the start of the canvas
            if(definitionDomain.includes(previousX))
                previousY = expr.execute(previousX)
            for(let px = pxprecision; px < canvas.width; px += pxprecision) {
                let currentX = canvas.px2x(px)
                if(!definitionDomain.includes(previousX) && definitionDomain.includes(currentX)) {
                    // Should draw up to currentX, but NOT at previousX.
                    // Need to find the starting point.
                    let tmpPx = px-pxprecision
                    do {
                        tmpPx++;
                        previousX = canvas.px2x(tmpPx)
                    } while(!definitionDomain.includes(previousX))
                    // Recaclulate previousY
                    previousY = expr.execute(previousX)
                } else if(!definitionDomain.includes(currentX)) {
                    // Next x is NOT in the definition domain.
                    // Augmenting the pixel precision until this condition is fulfilled.
                    let tmpPx = px
                    do {
                        tmpPx--;
                        currentX = canvas.px2x(tmpPx)
                    } while(!definitionDomain.includes(currentX) && currentX !== previousX)
                }
                // This max variation is needed for functions with asymptotical vertical lines (e.g. 1/x, tan x...)
                let maxvariation = (canvas.px2y(0)-canvas.px2y(canvas.height))
                if(definitionDomain.includes(previousX) && definitionDomain.includes(currentX)) {
                    let currentY = expr.execute(currentX)
                    if(destinationDomain.includes(currentY)) {
                        if(previousY != null && destinationDomain.includes(previousY) && Math.abs(previousY-currentY) < maxvariation) {
                            canvas.drawLine(canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                        }
                    }
                    previousY = currentY
                } else {
                    previousY = null // Last y was invalid, so let's not draw anything from it.
                }
                previousX = canvas.px2x(px)
            }
        }
    }
}
