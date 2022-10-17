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



class Text extends Common.DrawableObject  {
    static type(){return 'Text'}
    static displayType(){return qsTr('Text')}
    static displayTypeMultiple(){return qsTr('Texts')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','y')]:             'Expression',
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Positioning,
        [QT_TRANSLATE_NOOP('prop','text')]:          'string',
                            'comment1':              QT_TRANSLATE_NOOP(
                                                         'comment',
                                                         'If you have latex enabled, you can use use latex markup in between $$ to create equations.'
                                                     ),
        [QT_TRANSLATE_NOOP('prop','disableLatex')]:  'boolean'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'null', 
                x = 1, y = 0, labelPosition = 'center', text = 'New text', disableLatex = false) {
        if(name == null) name = Common.getNewName('t')
        super(name, visible, color, labelContent)
        this.type = 'Point'
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new MathLib.Expression(y.toString())
        this.y = y
        this.labelPosition = labelPosition
        this.text = text
        this.disableLatex = disableLatex
    }
    
    getReadableString() {
        return `${this.name} = "${this.text}"`
    }
    
    latexMarkupText() {
        let txt = Latex.variable(this.text)
        let i
        for(i = 0; txt.includes('$$'); i++)
            if(i & 0x01) // Every odd number
                txt = txt.replace('$$', '\\textsf{')
            else
                txt = txt.replace('$$', '}')
        if(i & 0x01) // Finished by a }
            txt += "{"
        return txt
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = "\\textsf{${this.latexMarkupText()}}"`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.x.toEditableString(), this.y.toEditableString(), this.labelPosition, this.text, this.disableLatex]
    }
    
    getLabel() {
        return this.text
    }
    
    getLatexLabel() {
        return `\\textsf{${this.latexMarkupText()}}`
    }
    
    draw(canvas, ctx) {
        let yOffset = this.disableLatex ? canvas.textsize-4 : 0
        this.drawLabel(canvas, ctx, this.labelPosition, canvas.x2px(this.x.execute()), canvas.y2px(this.y.execute())+yOffset, this.disableLatex)
    }
}

