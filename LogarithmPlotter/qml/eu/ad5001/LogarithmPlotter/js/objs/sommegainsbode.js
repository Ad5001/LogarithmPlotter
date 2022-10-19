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
.import "function.js" as F
.import "../objects.js" as Objects
.import "../mathlib.js" as MathLib
.import "../parameters.js" as P
.import "../math/latex.js" as Latex


class SommeGainsBode extends Common.ExecutableObject {
    static type(){return 'Somme gains Bode'}
    static displayType(){return qsTr('Bode Magnitudes Sum')}
    static displayTypeMultiple(){return qsTr('Bode Magnitudes Sum')}
    static createable() {return false}
    static properties() {return {
        [QT_TRANSLATE_NOOP('prop','labelPosition')]: P.Enum.Position,
        [QT_TRANSLATE_NOOP('prop','labelX')]:        'number',
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
        return `${this.name} = ${Objects.getObjectsName('Gain Bode').join(' + ')}`
    }
    
    getLatexString() {
        return `${Latex.variable(this.name)} = ${Objects.getObjectsName('Gain Bode').map(Latex.variable).join(' + ')}`
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
        if(Objects.currentObjects['Gain Bode'] != undefined) {
            console.log('Recalculating cache gain')
            // Minimum to draw (can be expended if needed, just not infinite or it'll cause issues.
            var drawMin = 0.001
            
            var baseY = 0
            var om0xGains = {1000000000: 0} // To draw the last part
            var om0xPass = {1000000000: 'high'} // To draw the last part
            Objects.currentObjects['Gain Bode'].forEach(function(gainObj) { // Sorting by their om_0 position.
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
            for(var pallier = 0; pallier < om0xList.length; pallier++) {
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
                F.Function.drawFunction(canvas, ctx, dbfn, inDrawDom, MathLib.Domain.R)
                if(inDrawDom.includes(this.labelX)) {
                    // Label
                    this.drawLabel(canvas, ctx, this.labelPosition, canvas.x2px(this.labelX), canvas.y2px(this.execute(this.labelX)))
                }
            }
        }
    }
}
