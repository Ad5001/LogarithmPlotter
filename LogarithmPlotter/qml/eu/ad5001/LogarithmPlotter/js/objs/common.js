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

.import "../utils.js" as Utils
.import "../objects.js" as Objects
.import "../math/latex.js" as Latex

// This file contains the default data to be imported from all other objects

/**
 * Creates a new name for an object, based on the \c allowedLetters.
 * If variables with each of the allowedLetters is created, a subscript
 * number is added to the name.
 * @return {string} New unused name for a new object.
 */
function getNewName(allowedLetters) {
    // Allows to get a new name, based on the allowed letters, 
    // as well as adding a sub number when needs be.
    var newid = 0
    var ret
    do {
        var letter = allowedLetters[newid % allowedLetters.length]
        var num = Math.floor((newid - (newid % allowedLetters.length)) / allowedLetters.length)
        ret = letter + (num > 0 ? Utils.textsub(num-1) : '')
        newid += 1
    } while(Objects.getObjectByName(ret) != null)
    return ret
}

/**
 * Class to extend for every type of object that
 * can be drawn on the canvas.
 */
class DrawableObject {
    /**
     * Base name of the object. Needs to be constant over time.
     * @return {string} Type of the object.
     */
    static type(){return 'Unknown'}
    
    /**
     * Translated name of the object to be shown to the user.
     * @return {string}
     */
    static displayType(){return 'Unknown'}
    
    /**
     * Translated name of the object in plural form to be shown to the user.
     * @return {string}
     */
    static displayTypeMultiple(){return 'Unknowns'}
    
    /**
     * True if this object can be created by the user, false if it can only
     * be instantiated by other objects
     * @return {bool}
     */
    static createable() {return true}
    
    /**
     * List of properties used in the Object Editor.
     * 
     * Properties are set with key as property name and
     * value as it's type name (e.g 'Expression', 'string'...),
     * an Enum for enumerations, an ObjectType for DrawableObjects
     * with a specific type, a List instance for lists, a 
     * Dictionary instance for dictionaries...
     * 
     * If the property is to be translated, the key should be passed
     * through the QT_TRANSLATE_NOOP macro in that form:
     * [QT_TRANSLATE_NOOP('prop','key')]
     * Enums that are translated should be indexed in parameters.js and 
     * then be linked directly here.
     * 
     * @return {Dictionary}
     */
    static properties() {return {}}
    
    /**
     * True if this object can be executed, so that an y value might be computed
     * for an x value. Only ExecutableObjects have that property set to true.
     * @return {bool}
     */
    static executable() {return false}
    
    /**
     * Base constructor for the object.
     * @param {string} name - Name of the object
     * @param {bool} visible - true if the object is visible, false otherwise.
     * @param {color} color - Color of the object (can be string or QColor)
     * @param {Enum} labelContent - One of 'null', 'name' or 'name + value' describing the content of the label.
     * @constructor()
     */
    constructor(name, visible = true, color = null, labelContent = 'name + value') {
        if(color == null) color = Utils.getRandomColor()
        this.type = 'Unknown'
        this.name = name
        this.visible = visible
        this.color = color
        this.labelContent = labelContent // "null", "name", "name + value"
        this.requiredBy = []
    }
    
    /**
     * Serilizes the object in an array that can be JSON serialized.
     * These parameters will be re-entered in the constructor when restored.
     * @return {array}
     */
    export() {
        // Should return what will be inputed as arguments when a file is loaded (serializable form)
        return [this.name, this.visible, this.color.toString(), this.labelContent]
    }
    
    /**
     * String representing the object that will be displayed to the user.
     * It allows for 2 lines and translated text, but it shouldn't be too long.
     * @return {string}
     */
    getReadableString() {
        return `${this.name} = Unknown`
    }
    
    /**
     * Latex markuped version of the readable string.
     * Every non latin character should be passed as latex symbols and formulas 
     * should be in latex form.
     * See ../latex.js for helper methods.
     * @return {string}
     */
    getLatexString() {
        return this.getReadableString()
    }
    
    /**
     * Readable string content of the label depending on the value of the \c latexContent.
     * @return {string}
     */
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
    
    /**
     * Latex markup string content of the label depending on the value of the \c latexContent.
     * Every non latin character should be passed as latex symbols and formulas 
     * should be in latex form.
     * See ../latex.js for helper methods.
     * @return {string}
     */
    getLatexLabel() {
        switch(this.labelContent) {
            case 'name':
                return Latex.variable(this.name)
            case 'name + value':
                return this.getLatexString()
            case 'null':
                return ''
                
        }
    }
    
    /**
     * Callback method when one of the properties of the object is updated.
     */
    update() {
        for(var req of this.requiredBy) {
            req.update()
        }
    }
    
    /**
     * Callback method when the object is about to get deleted.
     */
    delete() {
        for(var toRemove of this.requiredBy) {
            toRemove.delete()
            Objects.currentObjects[toRemove.type] = Objects.currentObjects[toRemove.type].filter(obj => obj.name != toRemove.name)
        }
    }
    
    /**
     * Abstract method. Draw the object onto the \c canvas with the 2D context \c ctx.
     * @param {Canvas} canvas
     * @param {Context2D} ctx
     */
    draw(canvas, ctx) {}
    
    
    /**
     * Automaticly draw the label of the object on the \c canvas with the 2D context \c ctx.
     * This method takes into account both the \c posX and \c posY of where the label 
     * should be displayed, including the \c labelPosition relative to it.
     * @param {Canvas} canvas
     * @param {Context2D} ctx
     * @param {string|Enum} labelPosition - Position of the label relative to the marked position
     * @param {number} posX - Component of the marked position on the x-axis 
     * @param {number} posY - Component of the marked position on the y-axis 
     */
    drawLabel(canvas, ctx, labelPosition, posX, posY) {
        if(true) { // TODO: Check for user setting with Latex.
            // With latex
            let offset = 8
            let drawLblCb = function(canvas, ctx, ltxImg) {
                switch(this.labelPosition) {
                    case 'center':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-ltxImg.width/2, posY-ltxImg.height/2, ltxImg.width, ltxImg.height)
                        break;
                    case 'top':
                    case 'above':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-ltxImg.width/2, posY-(ltxImg.height+offset), ltxImg.width, ltxImg.height)
                        break;
                    case 'bottom':
                    case 'below':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-ltxImg.width/2, posY+offset, ltxImg.width, ltxImg.height)
                        break;
                    case 'left':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-(ltxImg.width+offset), posY-ltxImg.height/2, ltxImg.width, ltxImg.height)
                        break;
                    case 'right':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX+offset, posY-ltxImg.height/2, ltxImg.width, ltxImg.height)
                        break;
                    case 'top-left':
                    case 'above-left':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-(ltxImg.width+offset), posY-(ltxImg.height+offset), ltxImg.width, ltxImg.height)
                        break;
                    case 'top-right':
                    case 'above-right':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX+offset, posY-(ltxImg.height+offset), ltxImg.width, ltxImg.height)
                        break;
                    case 'bottom-left':
                    case 'below-left':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX-(ltxImg.width+offset), posY+offset, ltxImg.width, ltxImg.height)
                        break;
                    case 'bottom-right':
                    case 'below-right':
                        canvas.drawVisibleImage(ctx, ltxImg.source, posX+offset, posY+offset, ltxImg.width, ltxImg.height)
                        break;
                }
            }
            let ltxLabel = this.getLatexLabel();
            if(ltxLabel != "")
                canvas.renderLatexImage(ltxLabel, this.color, drawLblCb.bind(this))
            //canvas.drawVisibleImage(ctx, ltxImg.source, posX, posY)
        } else {
            // Without latex
            let text = this.getLabel()
            ctx.font = `${canvas.textsize}px sans-serif`
            let textSize = canvas.measureText(ctx, text)
            let offset = 4
            switch(labelPosition) {
                case 'center':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height/2)
                    break;
                case 'top':
                case 'above':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY-textSize.height-offset)
                    break;
                case 'bottom':
                case 'below':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width/2, posY+offset)
                    break;
                case 'left':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width-offset, posY-textSize.height/2)
                    break;
                case 'right':
                    canvas.drawVisibleText(ctx, text, posX+offset, posY-textSize.height/2)
                    break;
                case 'top-left':
                case 'above-left':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width, posY-textSize.height-offset)
                    break;
                case 'top-right':
                case 'above-right':
                    canvas.drawVisibleText(ctx, text, posX+offset, posY-textSize.height-offset)
                    break;
                case 'bottom-left':
                case 'below-left':
                    canvas.drawVisibleText(ctx, text, posX-textSize.width-offset, posY+offset)
                    break;
                case 'bottom-right':
                case 'below-right':
                    canvas.drawVisibleText(ctx, text, posX+offset, posY+offset)
                    break;
            }
        }
    }
    
    toString() {
        return this.name;
    }
}

/**
 * Class to be extended for every object on which 
 * an y for a x can be computed with the execute function.
 * If a value cannot be found during execute, it will
 * return null. However, theses same x values will
 * return false when passed to canExecute.
 */
class ExecutableObject extends DrawableObject {
    /**
     * Returns the corresponding y value for an x value.
     * If the object isn't defined on the given x, then
     * this function will return null.
     * 
     * @param {number} x
     * @returns {number|null}
     */
    execute(x = 1) {return 0}
    /**
     * Returns false if the object isn't defined on the given x, true otherwise.
     * 
     * @param {number} x
     * @returns {bool}
     */
    canExecute(x = 1) {return true}
    /**
     * Returns the simplified expression string for a given x.
     * 
     * @param {number} x
     * @returns {bool}
     */
    simplify(x = 1) {return '0'}
    
    
    /**
     * True if this object can be executed, so that an y value might be computed
     * for an x value. Only ExecutableObjects have that property set to true.
     * @return {bool}
     */
    static executable() {return true}
}


/**
 * Registers the object \c obj in the object list.
 * @param {DrawableObject} obj - Object to be registered.
 */
function registerObject(obj) {
    // Registers an object to be used in LogarithmPlotter.
    // This function is called from autoload.js
    if(obj.prototype instanceof DrawableObject) {
        Objects.types[obj.type()] = obj
    } else {
        console.error("Could not register object " + (obj.type()) + ", as it isn't a DrawableObject.")
    }
}

