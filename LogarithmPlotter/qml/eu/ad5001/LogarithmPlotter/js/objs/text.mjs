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


export default class Text extends DrawableObject  {
    static type(){return 'Text'}
    static displayType(){return qsTranslate("text", 'Text')}
    static displayTypeMultiple(){return qsTranslate("text", 'Texts')}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','x')]:             new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','y')]:             new P.Expression(),
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Positioning,
        [QT_TRANSLATE_NOOP('prop','text')]:          'string',
                           'comment1':               QT_TRANSLATE_NOOP(
                                                         'comment',
                                                         'If you have latex enabled, you can use use latex markup in between $$ to create equations.'
                                                     ),
        [QT_TRANSLATE_NOOP('prop','disableLatex')]:  'boolean'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'null', 
                x = 1, y = 0, labelPosition = 'center', text = 'New text', disableLatex = false) {
        if(name == null) name = Objects.getNewName('t')
        super(name, visible, color, labelContent)
        if(typeof x == 'number' || typeof x == 'string') x = new Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new Expression(y.toString())
        this.y = y
        this.labelPosition = labelPosition
        this.text = text
        this.disableLatex = disableLatex
    }
    
    getReadableString() {
        return `${this.name} = "${this.text}"`
    }
    
    latexMarkupText() {
        // Check whether the text contains latex escaped elements.
        let txt = []
        this.text.split('$$').forEach(function(t) { txt = txt.concat(Latex.variable(t, true).replace(/\$\$/g, '').split('$')) })
        let newTxt = txt[0]
        let i
        // Split between normal text and latex escaped.
        for(i = 0; i < txt.length-1; i++)
            if(i & 0x01) // Every odd number
                newTxt += '\\textsf{'+Latex.variable(txt[i+1])
            else
                newTxt += '}'+txt[i+1]
        // Finished by a }
        if(i & 0x01) 
            newTxt += "{"
        return newTxt
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = "\\textsf{${this.latexMarkupText()}}"`
    }
    
    getLabel() {
        return this.text
    }
    
    getLatexLabel() {
        return `\\textsf{${this.latexMarkupText()}}`
    }
    
    draw(canvas) {
        let yOffset = this.disableLatex ? canvas.textsize-4 : 0
        this.drawLabel(canvas, this.labelPosition, canvas.x2px(this.x.execute()), canvas.y2px(this.y.execute())+yOffset, this.disableLatex)
    }
}

