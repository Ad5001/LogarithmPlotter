/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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
.import "../mathlib.js" as MathLib
.import "../parameters.js" as P
.import "../math/latex.js" as Latex


class Point extends Common.DrawableObject  {
    static type(){return 'Point'}
    static displayType(){return qsTr('Point')}
    static displayTypeMultiple(){return qsTr('Points')}
    
    /*static properties() {return {
        'x': 'Expression',
        'y': 'Expression',
        'labelPosition': new P.Enum('above', 'below', 'left', 'right', 'above-left', 'above-right', 'below-left', 'below-right'),
        'pointStyle': new P.Enum('●', '✕', '＋'),
    }}*/
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','y')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','pointStyle')]:    new P.Enum('●', '✕', '＋')
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, y = 0, labelPosition = 'above', pointStyle = '●') {
        if(name == null) name = Common.getNewName('ABCDEFJKLMNOPQRSTUVW')
        super(name, visible, color, labelContent)
        this.type = 'Point'
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new MathLib.Expression(y.toString())
        this.y = y
        this.labelPosition = labelPosition
        this.pointStyle = pointStyle
    }
    
    getReadableString() {
        return `${this.name} = (${this.x}, ${this.y})`
    }
    
    toLatexString() {
        return `${Latex.variableToLatex(this.name)} = \\left(${this.x.latexMarkup}, ${this.y.latexMarkup}\\right)`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.x.toEditableString(), this.y.toEditableString(), this.labelPosition, this.pointStyle]
    }
    
    draw(canvas, ctx) {
        var [canvasX, canvasY] = [canvas.x2px(this.x.execute()), canvas.y2px(this.y.execute())]
        var pointSize = 8+(ctx.lineWidth*2)
        switch(this.pointStyle) {
            case '●':
                ctx.beginPath();
                ctx.ellipse(canvasX-pointSize/2, canvasY-pointSize/2, pointSize, pointSize)
                ctx.fill();
                break;
            case '✕':
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY-pointSize/2, canvasX+pointSize/2, canvasY+pointSize/2)
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY+pointSize/2, canvasX+pointSize/2, canvasY-pointSize/2)
                break;
            case '＋':
                ctx.fillRect(canvasX-pointSize/2, canvasY-1, pointSize, 2)
                ctx.fillRect(canvasX-1, canvasY-pointSize/2, 2, pointSize)
                break;
        }
    
        let drawLabel = function(canvas, ctx, ltxImg) {
            switch(this.labelPosition) {
                case 'top':
                case 'above':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX-ltxImg.width/2, canvasY-(ltxImg.height+10), ltxImg.width, ltxImg.height)
                    break;
                case 'bottom':
                case 'below':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX-ltxImg.width/2, canvasY+10, ltxImg.width, ltxImg.height)
                    break;
                case 'left':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX-(ltxImg.width+10), canvasY-ltxImg.height/2, ltxImg.width, ltxImg.height)
                    break;
                case 'right':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX+10, canvasY-ltxImg.height/2, ltxImg.width, ltxImg.height)
                    break;
                case 'top-left':
                case 'above-left':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX-(ltxImg.width+10), canvasY-(ltxImg.height+10), ltxImg.width, ltxImg.height)
                    break;
                case 'top-right':
                case 'above-right':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX+10, canvasY-(ltxImg.height+10), ltxImg.width, ltxImg.height)
                    break;
                case 'bottom-left':
                case 'below-left':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX-(ltxImg.width+10), canvasY+10, ltxImg.width, ltxImg.height)
                    break;
                case 'bottom-right':
                case 'below-right':
                    canvas.drawVisibleImage(ctx, ltxImg.source, canvasX+10, canvasY+10, ltxImg.width, ltxImg.height)
                    break;
            }
        }
        let ltxLabel = this.getLatexLabel();
        if(ltxLabel != "")
            canvas.renderLatexImage(ltxLabel, this.color, drawLabel.bind(this))
        //canvas.drawVisibleImage(ctx, ltxImg.source, canvasX, canvasY)
    }
}
