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

import { Expression } from "../math/index.mjs"
import * as P from "../parameters.mjs"
import Objects from "../module/objects.mjs"
import Latex from "../module/latex.mjs"

import { DrawableObject } from "./common.mjs"


export default class Point extends DrawableObject  {
    static type(){return 'Point'}
    static displayType(){return qsTranslate("point", 'Point')}
    static displayTypeMultiple(){return qsTranslate("point", 'Points')}
    
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:             new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','y')]:             new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','pointStyle')]:    new P.Enum('●', '✕', '＋')
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, y = 0, labelPosition = 'above', pointStyle = '●') {
        if(name == null) name = Objects.getNewName('ABCDEFJKLMNOPQRSTUVW')
        super(name, visible, color, labelContent)
        if(typeof x == 'number' || typeof x == 'string') x = new Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new Expression(y.toString())
        this.y = y
        this.labelPosition = labelPosition
        this.pointStyle = pointStyle
    }
    
    getReadableString() {
        return `${this.name} = (${this.x}, ${this.y})`
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = \\left(${this.x.latexMarkup}, ${this.y.latexMarkup}\\right)`
    }
    
    draw(canvas) {
        let [canvasX, canvasY] = [canvas.x2px(this.x.execute()), canvas.y2px(this.y.execute())]
        let pointSize = 8+(canvas.linewidth*2)
        switch(this.pointStyle) {
            case '●':
                canvas.disc(canvasX, canvasY, pointSize/2)
                break;
            case '✕':
                canvas.drawLine(canvasX-pointSize/2, canvasY-pointSize/2, canvasX+pointSize/2, canvasY+pointSize/2)
                canvas.drawLine(canvasX-pointSize/2, canvasY+pointSize/2, canvasX+pointSize/2, canvasY-pointSize/2)
                break;
            case '＋':
                canvas.fillRect(canvasX-pointSize/2, canvasY-1, pointSize, 2)
                canvas.fillRect(canvasX-1, canvasY-pointSize/2, 2, pointSize)
                break;
        }
        this.drawLabel(canvas, this.labelPosition, canvasX, canvasY)
    }
}
