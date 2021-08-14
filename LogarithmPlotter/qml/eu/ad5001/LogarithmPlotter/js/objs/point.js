/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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


class Point extends Common.DrawableObject  {
    static type(){return 'Point'}
    static displayType(){return 'Point'}
    static displayTypeMultiple(){return 'Points'}
    
    static properties() {return {
        'x': 'Expression',
        'y': 'Expression',
        'labelPosition': new P.Enum('top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'),
        'pointStyle': new P.Enum('●', '✕', '＋'),
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, y = 0, labelPosition = 'top', pointStyle = '●') {
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
        var text = this.getLabel()
        ctx.font = `${canvas.textsize}px sans-serif`
        var textSize = ctx.measureText(text).width
        switch(this.labelPosition) {
            case 'top':
                canvas.drawVisibleText(ctx, text, canvasX-textSize/2, canvasY-16)
                break;
            case 'bottom':
                canvas.drawVisibleText(ctx, text, canvasX-textSize/2, canvasY+16)
                break;
            case 'left':
                canvas.drawVisibleText(ctx, text, canvasX-textSize-10, canvasY+4)
                break;
            case 'right':
                canvas.drawVisibleText(ctx, text, canvasX+10, canvasY+4)
                break;
            case 'top-left':
                canvas.drawVisibleText(ctx, text, canvasX-textSize-10, canvasY-16)
                break;
            case 'top-right':
                canvas.drawVisibleText(ctx, text, canvasX+10, canvasY-16)
                break;
            case 'bottom-left':
                canvas.drawVisibleText(ctx, text, canvasX-textSize-10, canvasY+16)
                break;
            case 'bottom-right':
                canvas.drawVisibleText(ctx, text, canvasX+10, canvasY+16)
                break;
                
        }
    }
}