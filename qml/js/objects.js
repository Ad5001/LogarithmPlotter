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

class List {
    constructor(type, format = /^.+$/, label = '', forbidAdding = false) {
        // type can be string, int and double.
        this.type = 'List'
        this.valueType = type
        this.format = format
        this.label = label
        this.forbidAdding = forbidAdding
    }
}

class Dictionary {
    constructor(type, keyType = 'string', format = /^.+$/, keyFormat = /^.+$/, preKeyLabel = '', postKeyLabel = ': ', forbidAdding = false) {
        // type & keyType can be string, int and double.
        this.type = 'Dict'
        this.valueType = type
        this.keyType = keyType
        this.format = format
        this.keyFormat = keyFormat
        this.preKeyLabel = preKeyLabel
        this.postKeyLabel = postKeyLabel
        this.forbidAdding = forbidAdding
    }
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
    // 'Point'...), an Array for enumerations,
    // a List instance for lists, a Dictionary instance for
    // dictionary
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
        for(var req of this.requiredBy) {
            req.update()
        }
    }
    
    delete() {
        for(var toRemove of this.requiredBy) {
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
        'labelPosition': ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
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
                ctx.fillRect(canvasX-pointSize/2, canvasY-1, pointSize, 2)
                ctx.fillRect(canvasX-1, canvasY-pointSize/2, 2, pointSize)
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


class Function extends ExecutableObject {
    static type(){return 'Function'}
    static typeMultiple(){return 'Functions'}
    static properties() {return {
        'expression': 'Expression',
        'inDomain': 'Domain',
        'outDomain': 'Domain',
        'comment1': 'Ex: R+* (ℝ⁺*), N* (ℕ*), Z-* (ℤ⁻*), ]0;1[, {3;4;5}',
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
        var textSize = canvas.measureText(ctx, text, 7)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.expression.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width, posY-textSize.height)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width, posY+textSize.height)
                break;
                
        }
    }
    
    static drawFunction(canvas, ctx, expr, inDomain, outDomain) {
        // Reusable in other objects.
        // Drawing small traits every 2px
        var pxprecision = 2
        var previousX = canvas.px2x(0)
        var previousY;
        if(inDomain instanceof MathLib.SpecialDomain && inDomain.moveSupported) {
            previousX = inDomain.previous(previousX)
            if(previousX === null) previousX = inDomain.next(canvas.px2x(0))
            previousY = expr.execute(previousX)
            while(previousX !== null && canvas.x2px(previousX) < canvas.canvasSize.width) {
                var currentX = inDomain.next(previousX)
                var currentY = expr.execute(currentX)
                if(currentX === null) break;
                if((inDomain.includes(currentX) || inDomain.includes(previousX)) &&
                    (outDomain.includes(currentY) || outDomain.includes(previousY))) {
                    canvas.drawDashedLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                    ctx.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
                    ctx.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
                }
                previousX = currentX
                previousY = currentY
            }
            // Drawing the last cross
            ctx.fillRect(canvas.x2px(previousX)-5, canvas.y2px(previousY)-1, 10, 2)
            ctx.fillRect(canvas.x2px(previousX)-1, canvas.y2px(previousY)-5, 2, 10)
        } else {
            previousY = expr.execute(previousX)
            for(var px = pxprecision; px < canvas.canvasSize.width; px += pxprecision) {
                var currentX = canvas.px2x(px)
                var currentY = expr.execute(currentX)
                if((inDomain.includes(currentX) || inDomain.includes(previousX)) &&
                    (outDomain.includes(currentY) || outDomain.includes(previousY)) &&
                    Math.abs(previousY-currentY)<100) {
                        canvas.drawLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                    }
                previousX = currentX
                previousY = currentY
            }
        }
    }
}


class GainBode extends ExecutableObject {
    static type(){return 'Gain Bode'}
    static typeMultiple(){return 'Gains Bode'}
    static properties() {return {
        'om_0': 'Point',
        'pass': ['high', 'low'],
        'gain': 'Expression',
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                om_0 = '', pass = 'high', gain = '20', labelPosition = 'above', labelX = 1) {
        if(name == null) name = getNewName('G')
        if(name == 'G') name = 'G₀' // G is reserved for sum of BODE magnitudes (Somme gains Bode).
        super(name, visible, color, labelContent)
        this.type = 'Gain Bode'
        if(typeof om_0 == "string") {
            // Point name or create one
            om_0 = getObjectByName(om_0, 'Point')
            if(om_0 == null) {
                // Create new point
                om_0 = createNewRegisteredObject('Point')
                om_0.name = getNewName('ω')
                om_0.labelContent = 'name'
                om_0.color = this.color
                labelPosition = 'below'
            }
            om_0.requiredBy.push(this)
        }
        this.om_0 = om_0
        this.pass = pass
        if(typeof gain == 'number' || typeof gain == 'string') gain = new MathLib.Expression(gain.toString())
        this.gain = gain
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    getReadableString() {
        return `${this.name}: ${this.pass}-pass; ${this.om_0.name} = ${this.om_0.x}\n   ${' '.repeat(this.name.length)}${this.gain.toString(true)} dB/dec`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.om_0.name, this.pass.toString(), this.gain.toEditableString(), this.labelPosition, this.labelX]
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        if((this.pass == 'high' && x < this.om_0.x) || (this.pass == 'low' && x > this.om_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.execute(x)
        } else {
            return this.om_0.y.execute()
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        if((this.pass == 'high' && xval < this.om_0.x) || (this.pass == 'low' && xval > this.om_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
            return dbfn.simplify(x)
        } else {
            return this.om_0.y.toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas, ctx) {
        var base = [canvas.x2px(this.om_0.x), canvas.y2px(this.om_0.y)]
        var dbfn = new MathLib.Expression(`${this.gain.execute()}*(ln(x)-ln(${this.om_0.x}))/ln(10)+${this.om_0.y}`)
        var inDrawDom = new MathLib.EmptySet()

        if(this.pass == 'high') {
            // High pass, linear line from begining, then constant to the end.
            canvas.drawLine(ctx, base[0], base[1], canvas.canvasSize.width, base[1])
            inDrawDom = MathLib.parseDomain(`]-inf;${this.om_0.x}[`)
        } else {
            // Low pass, constant from the beginning, linear line to the end.
            canvas.drawLine(ctx, base[0], base[1], 0, base[1])
            inDrawDom = MathLib.parseDomain(`]${this.om_0.x};+inf[`)
        }
        Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
        
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text, 7)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-3)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+3+textSize.height)
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
        for(var [dbfn, inDrawDom] of this.cachedParts) {
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
        for(var [dbfn, inDrawDom] of this.cachedParts) {
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
            // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
            var drawMin = 0.001
            
            var baseY = 0
            var om0xGains = {100000: 0} // To draw the last part
            var om0xPass = {100000: 'high'} // To draw the last part
            currentObjects['Gain Bode'].forEach(function(gainObj) { // Sorting by their om_0 position.
                var om0x = gainObj.om_0.x.execute()
                if(om0xGains[om0x] == undefined) {
                    om0xGains[om0x] = gainObj.gain.execute()
                    om0xPass[om0x] = gainObj.pass == 'high'
                } else {
                    om0xGains[om0x+0.001] = gainObj.gain.execute()
                    om0xPass[om0x+0.001] = gainObj.pass == 'high'
                }
                baseY += gainObj.execute(drawMin)
            })
            // Sorting the om_0x
            var om0xList = Object.keys(om0xGains).map(x => parseFloat(x)) // THEY WERE CONVERTED TO STRINGS...
            om0xList.sort((a,b) => a - b)
            // Adding the total gains.
            var gainsBeforeP = []
            var gainsAfterP = []
            var gainTotal = 0
            for(var om0x of om0xList){
                if(om0xPass[om0x]) { // High-pass
                    gainsBeforeP.push(om0xGains[om0x])
                    gainsAfterP.push(0)
                    gainTotal += om0xGains[om0x] // Gain at first
                } else {
                    gainsBeforeP.push(0)
                    gainsAfterP.push(om0xGains[om0x])
                }
            }
            // Calculating parts
            var previousPallier = drawMin
            for(var pallier = 0; pallier <= om0xList.length; pallier++) {
                var dbfn = new MathLib.Expression(`${gainTotal}*(ln(x)-ln(${previousPallier}))/ln(10)+${baseY}`)
                var inDrawDom = MathLib.parseDomain(`]${previousPallier};${om0xList[pallier]}]`)
                this.cachedParts.push([dbfn, inDrawDom])
                previousPallier = om0xList[pallier]
                baseY = dbfn.execute(om0xList[pallier])
                gainTotal += gainsAfterP[pallier] - gainsBeforeP[pallier]
            }
        }
    }
    
    draw(canvas, ctx) {
        if(this.cachedParts.length > 0) {
            for(var [dbfn, inDrawDom] of this.cachedParts) {
                Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
                if(inDrawDom.includes(this.labelX)) {
                    // Label
                    var text = this.getLabel()
                    ctx.font = "14px sans-serif"
                    var textSize = canvas.measureText(ctx, text, 7)
                    var posX = canvas.x2px(this.labelX)
                    var posY = canvas.y2px(dbfn.execute(this.labelX))
                    switch(this.labelPosition) {
                        case 'above':
                            canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-5)
                            break;
                        case 'below':
                            canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+5+textSize.height)
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
        'om_0': 'Point',
        'phase': 'Expression',
        'unit': ['°', 'deg', 'rad'],
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                om_0 = '', phase = 90, unit = '°', labelPosition = 'above', labelX = 1) {
        if(name == null) name = getNewName('φ')
        if(name == 'φ') name = 'φ₀' // φ is reserved for sum of BODE phases (Somme phases Bode).
        super(name, visible, color, labelContent)
        this.type = 'Phase Bode'
        if(typeof phase == 'number' || typeof phase == 'string') phase = new MathLib.Expression(phase.toString())
        this.phase = phase
        if(typeof om_0 == "string") {
            // Point name or create one
            om_0 = getObjectByName(om_0, 'Point')
            if(om_0 == null) {
                // Create new point
                om_0 = createNewRegisteredObject('Point')
                om_0.name = getNewName('ω')
                om_0.color = this.color
                om_0.labelContent = 'name'
                om_0.labelPosition = this.phase.execute() >= 0 ? 'bottom' : 'top'
                labelPosition = 'below'
            }
            om_0.requiredBy.push(this)
        }
        this.om_0 = om_0
        this.unit = unit
        this.labelPosition = labelPosition
        this.labelX = labelX
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.om_0.name, this.phase.toEditableString(), this.unit, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name}: ${this.phase.toString(true)}${this.unit} at ${this.om_0.name} = ${this.om_0.x}\n`
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        if(x < this.om_0.x) {
            return this.om_0.y.execute()
        } else {
            return this.om_0.y.execute() + this.phase.execute()
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        if(xval < this.om_0.x) {
            return this.om_0.y.toString()
        } else {
            var newExp = this.om_0.y.toEditableString() + ' + ' + this.phase.toEditableString()
            return (new MathLib.Expression(newExp)).toString()
        }
    }
    
    canExecute(x = 1) {
        return true
    }
    
    draw(canvas, ctx) {
        var baseX = canvas.x2px(this.om_0.x.execute())
        var omy = this.om_0.y.execute()
        var augmt = this.phase.execute()
        var baseY = canvas.y2px(omy)
        var augmtY = canvas.y2px(omy+augmt)
        // Before change line.
        canvas.drawLine(ctx, 0, baseY, Math.min(baseX, canvas.canvasSize.height), baseY)
        // Transition line.
        canvas.drawLine(ctx, baseX, baseY, baseX, augmtY)
        // After change line
        canvas.drawLine(ctx, Math.max(0, baseX), augmtY, canvas.canvasSize.width, augmtY)
        
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text, 7)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-5)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+5+textSize.height)
                break;
        }
    }
    
    update() {
        if(currentObjects['Somme phases Bode'] != undefined) {
            currentObjects['Somme phases Bode'][0].recalculateCache()
        } else {
            createNewRegisteredObject('Somme phases Bode')
        }
    }
}


class SommePhasesBode extends ExecutableObject {
    static type(){return 'Somme phases Bode'}
    static typeMultiple(){return 'Somme phases Bode'}
    static createable() {return false}
    static properties() {return {
        'labelPosition': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPosition = 'above', labelX = 1) {
        if(name == null) name = 'φ'
        super(name, visible, color, labelContent)
        this.labelPosition = labelPosition
        this.labelX = labelX
        this.recalculateCache()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.labelPosition, this.labelX]
    }
    
    getReadableString() {
        return `${this.name} = ${getObjectsName('Phase Bode').join(' + ')}`
    }
    
    execute(x=1) {
        if(typeof x == 'string') x = MathLib.executeExpression(x)
        for(var i = 0; i < this.om0xList.length-1; i++) {
            if(x >= this.om0xList[i] && x < this.om0xList[i+1]) return this.phasesList[i]
        }
    }
    
    simplify(x = 1) {
        var xval = x
        if(typeof x == 'string') xval = MathLib.executeExpression(x)
        for(var i = 0; i < this.om0xList.length-1; i++) {
            if(xval >= this.om0xList[i] && xval < this.om0xList[i+1]) {
                return (new MathLib.Expression(this.phasesExprList[i])).simplify()
            }
        }
        return '0'
    }
    
    canExecute(x = 1) {
        return true
    }
    
    recalculateCache() {
        // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
        var drawMin = 0.001
        var drawMax = 100000
        this.om0xList = [drawMin, drawMax]
        this.phasesList = [0]
        this.phasesExprList = ['0']
        var phasesDict = {}
        var phasesExprDict = {}
        phasesDict[drawMax] = 0
        
        if(currentObjects['Phase Bode'] != undefined) {
            console.log('Recalculating cache phase')
            for(var obj of currentObjects['Phase Bode']) {
                this.om0xList.push(obj.om_0.x.execute())
                if(phasesDict[obj.om_0.x.execute()] == undefined) {
                    phasesDict[obj.om_0.x.execute()] = obj.phase.execute()
                    phasesExprDict[obj.om_0.x.execute()] = obj.phase.toEditableString()
                } else {
                    phasesDict[obj.om_0.x.execute()] += obj.phase.execute()
                    phasesExprDict[obj.om_0.x.execute()] += '+' + obj.phase.toEditableString()
                }
                this.phasesList[0] += obj.om_0.y.execute()
                this.phasesExprList[0] += '+' + obj.om_0.y.toEditableString()
            }
            this.om0xList.sort((a,b) => a - b)
            var totalAdded = this.phasesList[0]
            for(var i = 1; i < this.om0xList.length; i++) {
                this.phasesList[i] = this.phasesList[i-1] + phasesDict[this.om0xList[i]]
                this.phasesExprList[i] = this.phasesExprList[i-1] + '+' + phasesDict[this.om0xList[i]]
            }
        }
    }
    
    draw(canvas, ctx) {
        for(var i = 0; i < this.om0xList.length-1; i++) {
            var om0xBegin = canvas.x2px(this.om0xList[i])
            var om0xEnd = canvas.x2px(this.om0xList[i+1])
            var baseY = canvas.y2px(this.phasesList[i])
            var nextY = canvas.y2px(this.phasesList[i+1])
            canvas.drawLine(ctx, om0xBegin, baseY, om0xEnd, baseY)
            canvas.drawLine(ctx, om0xEnd, baseY, om0xEnd, nextY)
        }
        
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text, 7)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.execute(this.labelX))
        switch(this.labelPosition) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-5)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+5+textSize.height)
                break;
        }
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
        this.targetElement = targetElement
        this.labelPosition = labelPosition
        this.displayStyle = displayStyle
        this.targetValuePosition = targetValuePosition
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.x.toEditableString(), this.targetElement, this.labelPosition, 
        this.approximate, this.rounding, this.displayStyle, this.targetValuePosition]
    }
    
    getReadableString() {
        if(this.getTargetElement() == null) return `${this.name} = ${this.x.toString()}`
        return `${this.name} = ${this.x.toString()}\n${this.getTargetValueLabel()}`
    }
    
    getTargetValueLabel() {
        var t = this.getTargetElement()
        var approx = ''
        if(this.approximate) {
            approx = t.execute(this.x.execute())
            approx = approx.toPrecision(this.rounding + Math.round(approx).toString().length)
        }
        return `${t.name}(${this.name}) = ${t.simplify(this.x.toEditableString())}` +
            (this.approximate ? ' ≃ ' + approx : '')
    }
    
    getTargetElement() {
        var elementTypes = Object.keys(currentObjects).filter(objType => types[objType].prototype instanceof ExecutableObject)
        return getObjectByName(this.targetElement, elementTypes)
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
        
        if(this.targetValuePosition == 'Next to target' && this.getTargetElement() != null) {
            var text = this.getTargetValueLabel()
            var textSize = canvas.measureText(ctx, text, 7)
            var ypox = canvas.y2px(this.getTargetElement().execute(this.x.execute()))
            switch(this.labelPosition) {
                case 'left':
                    canvas.drawVisibleText(ctx, text, xpos-textSize.width-5, ypox+textSize.height)
                    break;
                case 'right':
                    canvas.drawVisibleText(ctx, text, xpos+5, ypox+textSize.height)
                    break;
            }
        }
    }
}

class Sequence extends ExecutableObject {
    static type(){return 'Sequence'}
    static typeMultiple(){return 'Sequences'}
    static properties() {return {
        'defaultExpression': new Dictionary('string', 'int', /^.+$/, /^(\d+)$/, '{name}[n+', '] = ', true),
        'comment1': 'NOTE: Use {name}[n] to refer to uₙ, u[n+1] for uₙ₊₁...',
        'markedValues': new Dictionary('string', 'int', /^.+$/, /^(\d+)$/, '{name}[', '] = '),
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                defaultExp = {1: "u[n]"}, markedValues = {0: 0}) {
        if(name == null) name = getNewName('uvwPSUVWabcde')
        super(name, visible, color, labelContent)
        this.defaultExpression = defaultExp
        this.markedValues = markedValues
    }
}

const types = {
    'Point': Point,
    'Function': Function,
    'Gain Bode': GainBode,
    'Somme gains Bode': SommeGainsBode,
    'Phase Bode': PhaseBode,
    'Somme phases Bode': SommePhasesBode,
    'X Cursor': CursorX,
    'Sequence': Sequence
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

function createNewRegisteredObject(objType, args=[]) {
    if(Object.keys(types).indexOf(objType) == -1) return null // Object type does not exist.
    var newobj = new types[objType](...args)
    if(Object.keys(currentObjects).indexOf(objType) == -1) {
        currentObjects[objType] = []
    }
    currentObjects[objType].push(newobj)
    return newobj
}
