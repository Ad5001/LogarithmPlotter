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



function getNewName(allowedLetters, category) {
    if(Object.keys(currentObjects).indexOf(category) == -1) return allowedLetters[0]
    var newid = currentObjects[category].length
    var letter = allowedLetters[newid % allowedLetters.length]
    var num = Math.round((newid - (newid % allowedLetters.length)) / allowedLetters.length)
    return letter + (num > 0 ? Utils.textsub(num) : '')
}

class DrawableObject {
    static type(){return 'Unknown'}
    static typeMultiple(){return 'Unknown'}
    static createable() {return true}
    static properties() {return {}}
    
    constructor(name, visible = true, color = null, labelContent = 'name + value') {
        if(color == null) color = this.getRandomColor()
        this.type = 'Unknown'
        this.name = name
        this.visible = visible
        this.color = color
        this.labelContent = labelContent // "null", "name", "name + value"
        this.requiredBy = []
    }
    
    getRandomColor() {
        var x = '0123456789ABCDEF'; // Removing  for less flashy colors.
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += x[Math.floor(Math.random() * (16-6*(i%2==0)))];
        }
        return color;
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
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent]
    }
    
    update() {}
    
    draw(canvas, ctx) {}
}

class Point extends DrawableObject  {
    static type(){return 'Point'}
    static typeMultiple(){return 'Points'}
    static properties() {return {
        'x': 'Expression',
        'y': 'Expression',
        'labelPos': ['top', 'bottom', 'left', 'right'],
        'pointStyle': ['dot', 'diagonal cross', 'vertical cross'],
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                x = 1, y = 0, labelPos = 'top', pointStyle = 'dot') {
        if(name == null) name = getNewName('ABCDEFJKLMNOPQRSTUVW', 'Point')
        super(name, visible, color, labelContent)
        this.type = 'Point'
        if(typeof x == 'number' || typeof x == 'string') x = new MathLib.Expression(x.toString())
        this.x = x
        if(typeof y == 'number' || typeof y == 'string') y = new MathLib.Expression(y.toString())
        this.y = y
        this.labelPos = labelPos
        this.pointStyle = pointStyle
    }
    
    getReadableString() {
        return `${this.name} = (${this.x}, ${this.y})`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, this.x.toEditableString(), this.y.toEditableString(), this.labelPos, this.pointStyle]
    }
    
    draw(canvas, ctx) {
        var [canvasX, canvasY] = [canvas.x2px(this.x.evaluate()), canvas.y2px(this.y.evaluate())]
        var pointSize = 8
        switch(this.pointStyle) {
            case 'dot':
                ctx.beginPath();
                ctx.ellipse(canvasX-pointSize/2, canvasY-pointSize/2, pointSize, pointSize)
                ctx.fill();
                break;
            case 'diagonal cross':
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY-pointSize/2, canvasX+pointSize/2, canvasY+pointSize/2)
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY+pointSize/2, canvasX-pointSize/2, canvasY+pointSize/2)
                break;
            case 'vertical cross':
                canvas.drawLine(ctx, canvasX, canvasY-pointSize/2, canvasX, canvasY+pointSize/2)
                canvas.drawLine(ctx, canvasX-pointSize/2, canvasY, canvasX+pointSize/2, canvasY)
                break;
        }
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = ctx.measureText(text).width
        switch(this.labelPos) {
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
    
    update() {
        if(currentObjects['Total gains Bode'] != undefined && currentObjects['Gain Bode'] != undefined) {
            for(var i = 0; i < currentObjects['Gain Bode'].length; i++) {
                console.log(currentObjects['Gain Bode'][i].ω_0.name)
                if(currentObjects['Gain Bode'][i].ω_0.name == this.name) currentObjects['Gain Bode'][i].update()
            }
        }
    }
}

class Function extends DrawableObject {
    static type(){return 'Function'}
    static typeMultiple(){return 'Functions'}
    static properties() {return {
        'expression': 'Expression',
        'inDomain': 'Domain',
        'outDomain': 'Domain',
        'labelPos': ['above', 'below'],
        'displayMode': ['application', 'function'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                expression = 'x', inDomain = 'RPE', outDomain = 'R', displayMode = 'application', labelPos = 'above', labelX = 1) {
        if(name == null) name = getNewName('fghjqlmnopqrstuvwabcde', 'Function')
        super(name, visible, color, labelContent)
        if(typeof expression == 'number' || typeof expression == 'string') expression = new MathLib.Expression(expression.toString())
        this.expression = expression
        if(typeof inDomain == 'string') inDomain = MathLib.parseDomain(inDomain)
        this.inDomain = inDomain
        if(typeof outDomain == 'string') outDomain = MathLib.parseDomain(outDomain)
        this.outDomain = outDomain
        this.displayMode = displayMode
        this.labelPos = labelPos
        this.labelX = labelX
    }
    
    getReadableString() {
        if(this.displayMode == 'application') {
            return `${this.name}: ${this.inDomain} ⸺˃ ${this.outDomain}\n   ${' '.repeat(this.name.length)}x ⸺˃ ${this.expression.toString()}`
        } else {
            return `${this.name}(x) = ${this.expression.toString()}`
        }
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.expression.toEditableString(), this.inDomain.toString(), this.outDomain.toString(), 
        this.displayMode, this.labelPos, this.labelX]
    }
    
    draw(canvas, ctx) {
        Function.drawFunction(canvas, ctx, this.expression, this.inDomain, this.outDomain)
        // Label
        var text = this.getLabel()
        ctx.font = "14px sans-serif"
        var textSize = canvas.measureText(ctx, text)
        var posX = canvas.x2px(this.labelX)
        var posY = canvas.y2px(this.expression.evaluate(this.labelX))
        switch(this.labelPos) {
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
        var previousY = expr.evaluate(previousX)
        for(var px = pxprecision; px < canvas.canvasSize.width; px += pxprecision) {
            var currentX = canvas.px2x(px)
            var currentY = expr.evaluate(currentX)
            if(inDomain.includes(currentX) && inDomain.includes(previousX) &&
                outDomain.includes(currentY) && outDomain.includes(previousY) &&
                Math.abs(previousY-currentY)<100) { // 100 per 2px is a lot (probably inf to inf issue)
                    canvas.drawLine(ctx, canvas.x2px(previousX), canvas.y2px(previousY), canvas.x2px(currentX), canvas.y2px(currentY))
                }
            previousX = currentX
            previousY = currentY
        }
    }
}

class GainBode extends DrawableObject {
    static type(){return 'Gain Bode'}
    static typeMultiple(){return 'Gains Bode'}
    static properties() {return {
        'ω_0': 'Point',
        'pass': ['high', 'low'],
        'gain': 'Expression',
        'labelPos': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value', 
                ω_0 = '', pass = 'high', gain = '20', labelPos = 'above', labelX = 1) {
        if(name == null) name = getNewName('G', 'Gain Bode')
        if(name == 'G') name = 'G₀' // G is reserved for sum of BODE magnitues (Total Gains Bode).
        super(name, visible, color, labelContent)
        if(typeof ω_0 == "string") {
            // Point name or create one
            ω_0 = getObjectByName('Point', ω_0)
            if(ω_0 == null) {
                // Create new point
                ω_0 = createNewRegisteredObject('Point')
                ω_0.name = getNewName('ω', 'Gain Bode')
            }
        }
        console.log(this, ω_0)
        this.ω_0 = ω_0
        this.pass = pass
        if(typeof gain == 'number' || typeof gain == 'string') gain = new MathLib.Expression(gain.toString())
        this.gain = gain
        this.labelPos = labelPos
        this.labelX = labelX
    }
    
    getReadableString() {
        return `${this.name}: ${this.pass}-pass; ω₀ = ${this.ω_0.x}\n   ${' '.repeat(this.name.length)}${this.gain.toString(true)} dB/dec`
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, 
        this.ω_0.name, this.pass.toString(), this.gain.toEditableString(), this.labelPos, this.labelX]
    }
    
    evaluate(x=1) {
        if((this.pass == 'high' && x < this.ω_0.x) || (this.pass == 'low' && x > this.ω_0.x)) {
            var dbfn = new MathLib.Expression(`${this.gain.evaluate()}*(ln(x)-ln(${this.ω_0.x}))/ln(10)+${this.ω_0.y}`)
            return dbfn.evaluate(x)
        } else {
            return this.ω_0.y.evaluate()
        }
    }
    
    draw(canvas, ctx) {
        var base = [canvas.x2px(this.ω_0.x), canvas.y2px(this.ω_0.y)]
        var dbfn = new MathLib.Expression(`${this.gain.evaluate()}*(ln(x)-ln(${this.ω_0.x}))/ln(10)+${this.ω_0.y}`)
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
        var posY = canvas.y2px(this.evaluate(this.labelX))
        switch(this.labelPos) {
            case 'above':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height)
                break;
            case 'below':
                canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+textSize.height)
                break;
        }
    }
    
    update() {
        if(currentObjects['Total gains Bode'] != undefined) {
            currentObjects['Total gains Bode'][0].recalculateCache()
        }
    }
}

class TotalGainsBode extends DrawableObject {
    static type(){return 'Total gains Bode'}
    static typeMultiple(){return 'Total gains Bode'}
    static properties() {return {
        'labelPos': ['above', 'below'],
        'labelX': 'number'
    }}
    
    constructor(name = null, visible = true, color = null, labelContent = 'name + value',
        labelPos = 'above', labelX = 1) {
        if(name == null) name = 'G'
        super(name, visible, color, labelContent)
        this.labelPos = labelPos
        this.labelX = labelX
        this.recalculateCache()
    }
    
    export() {
        return [this.name, this.visible, this.color.toString(), this.labelContent, labelPos = 'above', labelX = 1]
    }
    
    getReadableString() {
        return `${this.name}: ${getObjectsName('Gain Bode').join(' + ')}`
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
                if(ω0xGains[gainObj.ω_0.x.evaluate()] == undefined) {
                    ω0xGains[gainObj.ω_0.x.evaluate()] = gainObj.gain.evaluate()
                    ω0xPass[gainObj.ω_0.x.evaluate()] = gainObj.pass == 'high'
                } else {
                    ω0xGains[gainObj.ω_0.x.evaluate()+0.0001] = gainObj.gain.evaluate()
                }
                baseY += gainObj.evaluate(drawMin)
            })
            // Sorting the ω_0x
            var ω0xList = Object.keys(ω0xGains)
            ω0xList.sort()
            ω0xList = ω0xList.reverse()
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
            // Calculating parts
            var previousPallier = drawMin
            for(var pallier = 0; pallier < ω0xList.length; pallier++) {
                var dbfn = new MathLib.Expression(`${gainTotal}*(ln(x)-ln(${previousPallier}))/ln(10)+${baseY}`)
                var inDrawDom = MathLib.parseDomain(`]${previousPallier};${ω0xList[pallier]}]`)
                this.cachedParts.push([dbfn, inDrawDom])
                previousPallier = ω0xList[pallier]
                gainTotal += gainsAfterP[pallier] - gainsBeforeP[pallier]
                baseY = dbfn.evaluate(ω0xList[pallier])
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
                    var posY = canvas.y2px(dbfn.evaluate(this.labelX))
                    switch(this.labelPos) {
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

const types = {
    'Point': Point,
    'Function': Function,
    'Gain Bode': GainBode,
    'Total gains Bode': TotalGainsBode
}

var currentObjects = {}

function getObjectByName(objType, objName) {
    if(currentObjects[objType] == undefined) return null
    var retObj = null
    currentObjects[objType].forEach(function(obj){
        if(obj.name == objName) retObj = obj
    })
    return retObj
}

function getObjectsName(objType) {
    if(currentObjects[objType] == undefined) return []
    return currentObjects[objType].map(function(obj) {return obj.name})
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

var points = [new Point()]
var f = new Function();
f.point = points[0]
points[0].name = 'B'
points[0].x = 2
f.point.x = 4
console.log(points[0].name, f.point.name, points[0].x, f.point.x)
