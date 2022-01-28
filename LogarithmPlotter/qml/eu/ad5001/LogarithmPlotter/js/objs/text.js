/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
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


class Text extends Common.DrawableObject  {
    static type(){return 'Text'}
    static displayType(){return qsTr('Text')}
    static displayTypeMultiple(){return qsTr('Texts')}
    /*static properties() {return {
        'x': 'Expression',
        'y': 'Expression',
        'labelPosition': new P.Enum('center', 'above', 'below', 'left', 'right', 'above-left', 'above-right', 'below-left', 'below-right'),
        'text': 'string',
    }}*/
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','y')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Positioning,
        [QT_TRANSLATE_NOOP('prop','text')]:          'string'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'null', 
                x = 1, y = 0, labelPosition = 'center', text = 'New text') {
        if(name == null) name = Common.getNewName('t')
        super(name, visible, color, labelContent)
        this.type = 'Point'
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new MathLib.Expression(y.toString())
        this.y = y
        this.labelPosition = labelPosition
        this.text = text
    }
    
    getReadableString() {
        return `${this.name} = "${this.text}"`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.x.toEditableString(), this.y.toEditableString(), this.labelPosition, this.text]
    }
    
    draw(canvas, ctx) {
        var [canvasX, canvasY] = [canvas.x2px(this.x.execute()), canvas.y2px(this.y.execute())]
        ctx.font = `${canvas.textsize}px sans-serif`
        var textSize = ctx.measureText(this.text).width
        switch(this.labelPosition) {
            case 'center':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize/2, canvasY+4)
                break;
            case 'top':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize/2, canvasY-16)
                break;
            case 'bottom':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize/2, canvasY+16)
                break;
            case 'left':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize-5, canvasY+4)
                break;
            case 'right':
                canvas.drawVisibleText(ctx, this.text, canvasX+5, canvasY+4)
                break;
            case 'top-left':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize-5, canvasY-16)
                break;
            case 'top-right':
                canvas.drawVisibleText(ctx, this.text, canvasX+5, canvasY-16)
                break;
            case 'bottom-left':
                canvas.drawVisibleText(ctx, this.text, canvasX-textSize-5, canvasY+16)
                break;
            case 'bottom-right':
                canvas.drawVisibleText(ctx, this.text, canvasX+5, canvasY+16)
                break;
                
        }
    }
}

