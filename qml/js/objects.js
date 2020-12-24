/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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

.import "utils.js" as Utils
.import "mathlib.js" as MathLib



function getNewName(allowedLetters) {
    var newid = 0
    var ret
    do {
        var letter = allowedLetters[newid % allowedLetters.length]
        var num = Math.floor((newid - (newid % allowedLetters.length)) / allowedLetters.length)
        ret = letter + (num > 0 ? Utils.textsub(num-1) : '')
        newid += 1
    } while(getObjectByName(ret) != null)
    return ret
}

class DrawableObject {
    // Class to extend for every type of object that
    // can be drawn on the canvas.
    static type(){return 'Unknown'}
    // Label used for the list on the ObjectsList sidebar. 
    static typeMultiple(){return 'Unknown'}
    // Whether this object can be created by the user
    // or are instanciated by other objects.
    static createable() {return true}
    // Properties are set with key as property name and 
    // value as it's type name (e.g 'Expression', 'string', 
    // 'Point'...) or an array with possibilities for enums.
    // Used for property modifier in the sidebar.
    static properties() {return {}}
    
    constructor(name, visible = true, color = null, labelContent = 'name + value') {
        if(color == null) color = Utils.getRandomColor()
        this.type = 'Unknown'
        this.name = name
        this.visible = visible
        this.color = color
        this.labelContent = labelContent // "null", "name", "name + value"
        this.requiredBy = []
    }
    
    export() {
        // Should return what will be input as arguments when a file is loaded (serializable form)
        return [this.name, this.visible, this.color.toString(), this.labelContent]
    }
    
    getReadableString() {
        return `${this.name} = Unknown`
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return this.name
            case 'name + value':
                return this.getReadableString()
            case 'null':
                return ''
                
        }
    }
    
    update() {
        for(var i = 0; i < this.requiredBy.length; i++) {
            this.requiredBy[i].update()
        }
    }
    
    delete() {
        for(var i = 0; i < this.requiredBy.length; i++) {
            var toRemove = this.requiredBy[i]
            toRemove.delete()
            currentObjects[toRemove.type] = currentObjects[toRemove.type].filter(obj => obj.name != toRemove.name)
        }
    }
    
    draw(canvas, ctx) {}
}

class ExecutableObject extends DrawableObject {
    // Class to be extended for every class upon which we
    // calculate an y for a x with the execute function.
    // If a value cannot be found during execute, it should
    // return null. However, theses values should
    // return false when passed to canExecute.
    execute(x = 1) {return 0}
    canExecute(x = 1) {return true}
    // Simplify returns the simplified string of the expression.
    simplify(x = 1) {return '0'}
}

class Point extends DrawableObject  {
    static type(){return 'Point'}
    static typeMultiple(){return 'Points'}
    static properties() {return {
        'x': 'Expression',
        'y': 'Expression',
        'labelPosition': ['top', 'bottom', 'left', 'right'],
        'pointStyle': ['●', '✕', '＋'],
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, y = 0, labelPosition = 'top', pointStyle = '●') {
        if(name == null) name = getNewName('ABCDEFJKLMNOPQRSTUVW')
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
        var pointSize = 8
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
                canvas.drawLine(ctx, canvasX, canvasY-pointSize/2, canvasX, canvasY+pointSize/2)
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY, canvasX+pointSize/2, canvasY)
                break;
        }
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
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
                
        }
    }
}

class Function extends ExecutableObject {
    static type(){return 'Function'}
    static typeMultiple(){return 'Functions'}
    static properties() {return {
        'expression': 'Expression',
        'inDomain': 'Domain',
        'outDomain': 'Domain',
        'labelPosition': ['above', 'below'],
        'displayMode': ['application', 'function'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                expression = 'x', inDomain = 'RPE', outDomain = 'R', 
                displayMode = 'application', labelPosition = 'above', labelX = 1) {
        if(name == null) name = getNewName('fghjqlmnopqrstuvwabcde')
        super(name, visible, color, labelContent)
        this.type = 'Function'
        if(typeof expression == 'number' || typeof expression == 'string') expression = new MathLib.Expression(expression.toString())
        this.expression = expression
        if(typeof inDomain == 'string') inDomain = MathLib.parseDomain(inDomain)
        this.inDomain = inDomain
        if(typeof outDomain == 'string') outDomain = MathLib.parseDomain(outDomain)
        this.outDomain = outDomain
        this.displayMode = displayMode
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    getReadableString() {
        if(this.displayMode == 'application') {
            return `${this.name}: ${this.inDomain} ⸺> ${this.outDomain}\n   ${' '.repeat(this.name.length)}x ⸺> ${this.expression.toString()}`
        } else {
            return `${this.name}(x) = ${this.expression.toString()}`
        }
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.expression.toEditableString(), this.inDomain.toString(), this.outDomain.toString(), 
        this.displayMode, this.labelPosition, this.labelX]
    }
    
    execute(x = 1) {
        if(this.inDomain.includes(x))
            return this.expression.execute(x)
        return null
    }
    
    canExecute(x = 1) {
        return this.inDomain.includes(x)
    }
    
    simplify(x = 1) {
        if(this.inDomain.includes(x))
            return this.expression.simplify(x)
        return ''
    }
    
    draw(canvas, ctx) {
        Function.drawFunction(canvas, ctx, this.expression, this.inDomain, this.outDomain)
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.expression.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+textSize.height)
                break;
                
        }
    }
    
    static drawFunction(canvas, ctx, expr, inDomain, outDomain) {
        // Reusable in other objects.
        // Drawing small traits every 2px
        var pxprecision = 2
        var previousX = canvas.px2x(0)
        var previousY = expr.execute(previousX)
        for(var px = pxprecision; px < canvas.canvasSize.width; px += pxprecision) {
            var currentX = canvas.px2x(px)
            var currentY = expr.execute(currentX)
            if((inDomain.includes(currentX) || inDomain.includes(previousX)) &&
                (outDomain.includes(currentY) || outDomain.includes(previousY)) &&
                Math.abs(previousY-currentY)<100) { // 100 per 2px is a lot (probably inf to inf issue)
                    canvas.drawLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                }
            previousX = currentX
            previousY = currentY
        }
    }
}

class GainBode extends ExecutableObject {
    static type(){return 'Gain Bode'}
    static typeMultiple(){return 'Gains Bode'}
    static properties() {return {
        'ω_0': 'Point',
        'pass': ['high', 'low'],
        'gain': 'Expression',
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                ω_0 = '', pass = 'high', gain = '20', labelPosition = 'above', labelX = 1) {
        if(name == null) name = getNewName('G')
        if(name == 'G') name = 'G₀' // G is reserved for sum of BODE magnitudes (Somme gains Bode).
        super(name, visible, color, labelContent)
        this.type = 'Gain Bode'
        if(typeof ω_0 == "string") {
            // Point name or create one
            ω_0 = getObjectByName(ω_0, 'Point')
            if(ω_0 == null) {
                // Create new point
                ω_0 = createNewRegisteredObject('Point')
                ω_0.name = getNewName('ω')
                ω_0.color = this.color
                labelPosition = 'below'
            }
            ω_0.requiredBy.push(this)
        }
        this.ω_0 = ω_0
        this.pass = pass
        if(typeof gain == 'number' || typeof gain == 'string') gain = new MathLib.Expression(gain.toString())
        this.gain = gain
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    getReadableString() {
        return `${this.name}: ${this.pass}-pass; ω₀ = ${this.ω_0.x}\n   ${' '.repeat(this.name.length)}${this.gain.toString(true)} dB/dec`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.ω_0.name, this.pass.toString(), this.gain.toEditableString(), this.labelPosition, this.labelX]
    }
    
    execute(x=1) {
        if((this.pass == 'high' && x < this.ω_0.x) || (this.pass == 'low' && x > this.ω_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.ω_0.x}))/ln(10)+${this.ω_0.y}`)
            return dbfn.execute(x)
        } else {
            return this.ω_0.y.execute()
        }
    }
    
    simplify(x = 1) {
        if((this.pass == 'high' && x < this.ω_0.x) || (this.pass == 'low' && x > this.ω_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.ω_0.x}))/ln(10)+${this.ω_0.y}`)
            return dbfn.simplify(x)
        } else {
            return this.ω_0.y.toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas, ctx) {
        var base = [canvas.x2px(this.ω_0.x), canvas.y2px(this.ω_0.y)]
        var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.ω_0.x}))/ln(10)+${this.ω_0.y}`)
        var inDrawDom = new MathLib.EmptySet()

        if(this.pass == 'high') {
            // High pass, linear line from begining, then constant to the end.
            canvas.drawLine(ctx, base[0], base[1], canvas.canvasSize.width, base[1])
            inDrawDom = MathLib.parseDomain(`]-inf;${this.ω_0.x}[`)
        } else {
            // Low pass, constant from the beginning, linear line to the end.
            canvas.drawLine(ctx, base[0], base[1], 0, base[1])
            inDrawDom = MathLib.parseDomain(`]${this.ω_0.x};+inf[`)
        }
        Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
        
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+textSize.height)
                break;
        }
    }
    
    update() {
        if(currentObjects['Somme gains Bode'] != undefined) {
            currentObjects['Somme gains Bode'][0].recalculateCache()
        } else {
            createNewRegisteredObject('Somme gains Bode')
        }
    }
}

class SommeGainsBode extends DrawableObject {
    static type(){return 'Somme gains Bode'}
    static typeMultiple(){return 'Somme gains Bode'}
    static createable() {return false}
    static properties() {return {
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPosition = 'above', labelX = 1) {
        if(name == null) name = 'G'
        super(name, visible, color, labelContent)
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.recalculateCache()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name} = ${getObjectsName('Gain Bode').join(' + ')}`
    }
    
    execute(x = 0) {
        for(var i=0; i<this.cachedParts.length; i++) {
            var [dbfn, inDrawDom] = this.cachedParts[i]
            if(inDrawDom.includes(x)) {
                return dbfn.execute(x)
            }
        }
        return null
    }
    
    canExecute(x = 1) {
        return true // Should always be true
    }
    
    simplify(x = 1) {
        for(var i=0; i<this.cachedParts.length; i++) {
            var [dbfn, inDrawDom] = this.cachedParts[i]
            if(inDrawDom.includes(x)) {
                return dbfn.simplify(x)
            }
        }
        return ''
    }
    
    recalculateCache() {
        this.cachedParts = []
        // Calculating this is fairly resource expansive so it's cached.
        if(currentObjects['Gain Bode'] != undefined) {
            console.log('Recalculating cache gain')
            // Minimum to draw (can be expended if needed, just not inifite or it'll cause issues.
            var drawMin = 0.01
            
            var baseY = 0
            var ω0xGains = {100000: 0} // To draw the last part
            var ω0xPass = {100000: 'high'} // To draw the last part
            currentObjects['Gain Bode'].forEach(function(gainObj) { // Sorting by their ω_0 position.
                if(ω0xGains[gainObj.ω_0.x.execute()] == undefined) {
                    ω0xGains[gainObj.ω_0.x.execute()] = gainObj.gain.execute()
                    ω0xPass[gainObj.ω_0.x.execute()] = gainObj.pass == 'high'
                } else {
                    ω0xGains[gainObj.ω_0.x.execute()+0.001] = gainObj.gain.execute()
                    ω0xPass[gainObj.ω_0.x.execute()+0.001] = gainObj.pass == 'high'
                }
                baseY += gainObj.execute(drawMin)
            })
            // Sorting the ω_0x
            var ω0xList = Object.keys(ω0xGains).map(x => parseFloat(x)) // THEY WERE CONVERTED TO STRINGS...
            ω0xList.sort((a,b) => a - b)
            // Adding the total gains.
            var gainsBeforeP = []
            var gainsAfterP = []
            var gainTotal = 0
            for(var i=0; i < ω0xList.length; i++){
                if(ω0xPass[ω0xList[i]]) { // High-pass
                    gainsBeforeP.push(ω0xGains[ω0xList[i]])
                    gainsAfterP.push(0)
                    gainTotal += ω0xGains[ω0xList[i]] // Gain at first
                } else {
                    gainsBeforeP.push(0)
                    gainsAfterP.push(ω0xGains[ω0xList[i]])
                }
            }
            console.log(gainsBeforeP, gainsAfterP)
            // Calculating parts
            var previousPallier = drawMin
            for(var pallier = 0; pallier < ω0xList.length; pallier++) {
                var dbfn = new MathLib.Expression(`${gainTotal}*(ln(x)-ln(${previousPallier}))/ln(10)+${baseY}`)
                var inDrawDom = MathLib.parseDomain(`]${previousPallier};${ω0xList[pallier]}]`)
                this.cachedParts.push([dbfn, inDrawDom])
                previousPallier = ω0xList[pallier]
                baseY = dbfn.execute(ω0xList[pallier])
                gainTotal += gainsAfterP[pallier] - gainsBeforeP[pallier]
            }
        }
    }
    
    draw(canvas, ctx) {
        if(this.cachedParts.length > 0) {
            for(var i=0; i<this.cachedParts.length; i++) {
                var [dbfn, inDrawDom] = this.cachedParts[i]
                Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
                if(inDrawDom.includes(this.labelX)) {
                    // Label
                    var text = this.getLabel()
                    ctx.font = "14px sans-serif"
                    var textSize = canvas.measureText(ctx, text)
                    var posX = canvas.x2px(this.labelX)
                    var posY = canvas.y2px(dbfn.execute(this.labelX))
                    switch(this.labelPosition) {
                        case 'above':
                            canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height)
                            break;
                        case 'below':
                            canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+textSize.height)
                            break;
                    }
                }
            }
        }
    }
}

class PhaseBode extends ExecutableObject {
    static type(){return 'Phase Bode'}
    static typeMultiple(){return 'Phases Bode'}
    static properties() {return {
        'ω_0': 'Point',
        'phase': 'Expression',
        'unit': ['°', 'deg', 'rad'],
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                ω_0 = '', phase = 90, unit = '°', labelPosition = 'above', labelX = 1) {
        if(name == null) name = getNewName('φ')
        if(name == 'φ') name = 'φ₀' // φ is reserved for sum of BODE phases (Somme phases Bode).
        super(name, visible, color, labelContent)
        this.type = 'Phase Bode'
        if(typeof ω_0 == "string") {
            // Point name or create one
            ω_0 = getObjectByName(ω_0, 'Point')
            if(ω_0 == null) {
                // Create new point
                ω_0 = createNewRegisteredObject('Point')
                ω_0.name = getNewName('ω')
                ω_0.color = this.color
                labelPosition = 'below'
            }
            ω_0.requiredBy.push(this)
        }
        this.ω_0 = ω_0
        if(typeof phase == 'number' || typeof phase == 'string') phase = new MathLib.Expression(phase.toString())
        this.phase = phase
        this.unit = unit
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.ω_0.name, this.phase.toEditableString(), this.unit, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name}: ${this.phase.toString(true)}${this.unit} at ω₀ = ${this.ω_0.x}\n`
    }
}

class CursorX extends DrawableObject {
    static type(){return 'X Cursor'}
    static typeMultiple(){return 'X Cursors'}
    static properties() {
        var elementTypes = Object.keys(currentObjects).filter(objType => types[objType].prototype instanceof ExecutableObject)
        var elementNames = ['']
        elementTypes.forEach(function(elemType){
            elementNames = elementNames.concat(currentObjects[elemType].map(obj => obj.name))
        })
        return {
            'x': 'Expression',
            'targetElement': elementNames,
            'labelPosition': ['left', 'right'],
            'approximate': 'Boolean',
            'rounding': 'number',
            'displayStyle': [
                '— — — — — — —',
                '⸺⸺⸺⸺⸺⸺',
                '• • • • • • • • • •'
            ],
            'targetValuePosition' : ['Next to target', 'With label', 'Hidden']
        }
    }
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, targetElement = null, labelPosition = 'left', approximate = true,
                rounding = 3, displayStyle = '— — — — — — —', targetValuePosition = 'Next to target') {
        if(name == null) name = getNewName('X')
        super(name, visible, color, labelContent)
        this.type = 'X Cursor'
        this.approximate = approximate
        this.rounding = rounding
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        var elementTypes = Object.keys(currentObjects).filter(objType => types[objType].prototype instanceof ExecutableObject)
        this.targetElement = getObjectByName(this.targetElement, elementTypes)
        this.labelPosition = labelPosition
        this.displayStyle = displayStyle
        this.targetValuePosition = targetValuePosition
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.x.toEditableString(), this.targetElement.name, this.labelPosition, 
        this.approximate, this.rounding, this.displayStyle, this.targetValuePosition]
    }
    
    getReadableString() {
        if(this.targetElement == null) return `${this.name} = ${this.x.toString()}`
        return `${this.name} = ${this.x.toString()}\n${this.getTargetValueLabel()}`
    }
    
    getTargetValueLabel() {
        var t = this.targetElement
        var approx = ''
        if(this.approximate) {
            approx = t.execute(this.x.execute())
            approx = approx.toPrecision(this.rounding + Math.round(approx).toString().length)
        }
        return `${t.name}(${this.name}) = ${t.simplify(this.x.toEditableString())}` +
            (this.approximate ? ' ≃ ' + approx : '')
    }
    
    getLabel() {
        switch(this.labelContent) {
            case 'name':
                return this.name
                break;
            case 'name + value':
                switch(this.targetValuePosition) {
                    case 'Next to target':
                    case 'Hidden':
                        return `${this.name} = ${this.x.toString()}`
                        break;
                    case 'With label':
                        return this.getReadableString()
                        break;
                }
            case 'null':
                return ''
        }
    }
    
    draw(canvas, ctx) {
        var xpos = canvas.x2px(this.x.execute())
        switch(this.displayStyle) {
            case '— — — — — — —':
                var dashPxSize = 10
                for(var i = 0; i < canvas.canvasSize.height; i += dashPxSize*2)
                    canvas.drawLine(ctx, xpos, i, xpos, i+dashPxSize)
                break;
            case '⸺⸺⸺⸺⸺⸺':
                canvas.drawXLine(ctx, this.x.execute())
                break;
            case '• • • • • • • • • •':
                var pointDistancePx = 10
                var pointSize = 2
                ctx.beginPath();
                for(var i = 0; i < canvas.canvasSize.height; i += pointDistancePx)
                    ctx.ellipse(xpos-pointSize/2, i-pointSize/2, pointSize, pointSize)
                ctx.fill();
                break;
        }
        
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text, 7)
        
        switch(this.labelPosition) {
            case 'left':
                canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, textSize.height+5)
                break;
            case 'right':
                canvas.drawVisibleText(ctx, text, xpos+5, textSize.height+5)
                break;
        }
        
        if(this.targetValuePosition == 'Next to target' && this.targetElement != null) {
            var text = this.getTargetValueLabel()
            var textSize = canvas.measureText(ctx, text, 7)
            var ypox = canvas.y2px(this.targetElement.execute(this.x.execute()))
            switch(this.labelPosition) {
                case 'left':
                    canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, ypox+textSize.height)
                    break;
                case 'right':
                    canvas.drawVisibleText(ctx, text, xpos+5, ypox.textSize.height)
                    break;
            }
        }
        
    }
    
    update() {
        if(typeof this.targetElement == 'string') {
            var elementTypes = Object.keys(currentObjects).filter(objType => types[objType].prototype instanceof ExecutableObject)
            this.targetElement = getObjectByName(this.targetElement, elementTypes)
        }
    }
}

const types = {
    'Point': Point,
    'Function': Function,
    'Gain Bode': GainBode,
    'Somme gains Bode': SommeGainsBode,
    'Phase Bode': PhaseBode,
    'X Cursor': CursorX
}

var currentObjects = {}

function getObjectByName(objName, objType = null) {
    var objectTypes = Object.keys(currentObjects)
    if(typeof objType == 'string') {
        if(currentObjects[objType] == undefined) return null
        objectTypes = [objType]
    }
    if(Array.isArray(objType)) objectTypes = objType
    var retObj = null
    objectTypes.forEach(function(objType){
        if(currentObjects[objType] == undefined) return null
        currentObjects[objType].forEach(function(obj){
            if(obj.name == objName) retObj = obj
        })
    })
    return retObj
}



function getObjectsName(objType) {
    if(currentObjects[objType] == undefined) return []
    return currentObjects[objType].map(obj => obj.name)
}

function createNewRegisteredObject(objType) {
    if(Object.keys(types).indexOf(objType) == -1) return null // Object type does not exist.
    var newobj = new types[objType]()
    if(Object.keys(currentObjects).indexOf(objType) == -1) {
        currentObjects[objType] = []
    }
    currentObjects[objType].push(newobj)
    return newobj
}
