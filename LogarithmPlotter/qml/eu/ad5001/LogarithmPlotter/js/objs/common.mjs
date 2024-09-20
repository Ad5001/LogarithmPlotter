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

import { getRandomColor, textsub } from "../utils.mjs"
import Objects from "../objects.mjs"
import Latex from "../math/latex.mjs"
import {Module} from "../modules.mjs"
import {ensureTypeSafety, serializesByPropertyType} from "../parameters.mjs"

// This file contains the default data to be imported from all other objects

/**
 * Class to extend for every type of object that
 * can be drawn on the canvas.
 */
export class DrawableObject {
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
     * @return {boolean}
     */
    static createable() {return true}
    
    /**
     * List of properties used in the Object Editor.
     * 
     * Properties are set with key as property name and
     * value as it's type name (e.g 'numbers', 'string'...),
     * an Enum for enumerations, an ObjectType for DrawableObjects
     * with a specific type, a List instance for lists, a 
     * Dictionary instance for dictionaries, an Expression for expressions...
     * 
     * If the property is to be translated, the key should be passed
     * through the QT_TRANSLATE_NOOP macro in that form:
     * [QT_TRANSLATE_NOOP('prop','key')]
     * Enums that are translated should be indexed in parameters.mjs and 
     * then be linked directly here.
     * 
     * @return {Object.<string,string|Enum|List|ObjectType|Dictionary>}
     */
    static properties() {return {}}
    
    /**
     * True if this object can be executed, so that an y value might be computed
     * for an x value. Only ExecutableObjects have that property set to true.
     * @return {boolean}
     */
    static executable() {return false}

    /**
     * Imports the object from its serialized form.
     * @return {DrawableObject}
     */
    static import(name, visible, color, labelContent, ...args) {
        let importedArgs = [name.toString(), visible === true, color.toString(), labelContent]
        console.log('Importing', this.type(), name, args)
        for(let [name, propType] of Object.entries(this.properties()))
            if(!name.startsWith('comment')) {
                importedArgs.push(ensureTypeSafety(propType, args[importedArgs.length-4]))
            }
        return new this(...importedArgs)
    }
    
    /**
     * Base constructor for the object.
     * @param {string} name - Name of the object
     * @param {boolean} visible - true if the object is visible, false otherwise.
     * @param {color|string} color - Color of the object (can be string or QColor)
     * @param {Enum} labelContent - One of 'null', 'name' or 'name + value' describing the content of the label.
     * @constructor
     */
    constructor(name, visible = true, color = null, labelContent = 'name + value') {
        if(color == null) color = getRandomColor()
        this.type = this.constructor.type()
        this.name = name
        this.visible = visible
        this.color = color
        this.labelContent = labelContent // "null", "name", "name + value"
        this.requiredBy = []
        this.requires = []
    }

    /**
     * Serializes the object in an array that can be JSON serialized.
     * These parameters will be re-entered in the constructor when restored.
     * @return {array}
     */
    export() {
        let exportList = [this.name, this.visible, this.color.toString(), this.labelContent]
        for(let [name, propType] of Object.entries(this.constructor.properties()))
            if(!name.startsWith('comment'))
                exportList.push(serializesByPropertyType(propType, this[name]))
        return exportList
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
     * See ../latex.mjs for helper methods.
     * @return {string}
     */
    getLatexString() {
        return this.getReadableString()
    }
    
    /**
     * Readable string content of the label depending on the value of the  latexContent.
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
     * Latex markup string content of the label depending on the value of the  latexContent.
     * Every non latin character should be passed as latex symbols and formulas 
     * should be in latex form.
     * See ../latex.mjs for helper methods.
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
     * Returns the recursive list of objects this one depends on.
     * @return {array}
     */
    getDependenciesList() {
        let dependencies = this.requires.map(obj => obj)
        for(let obj of this.requires)
            dependencies = dependencies.concat(obj.getDependenciesList())
        return dependencies
    }
    
    /**
     * Callback method when one of the properties of the object is updated.
     */
    update() {
        // Refreshing dependencies.
        for(let obj of this.requires)
            obj.requiredBy = obj.requiredBy.filter(dep => dep !== this)
        // Checking objects this one depends on
        this.requires = []
        let currentObjectsByName = Objects.currentObjectsByName
        let properties = this.constructor.properties()
        for(let property in properties)
            if(typeof properties[property] == 'object' && 'type' in properties[property])
                if(properties[property].type === 'Expression' && this[property] != null) {
                    // Expressions with dependencies
                    for(let objName of this[property].requiredObjects()) {
                        if(objName in currentObjectsByName && !this.requires.includes(currentObjectsByName[objName])) {
                            this.requires.push(currentObjectsByName[objName])
                            currentObjectsByName[objName].requiredBy.push(this)
                        }
                    }
                    if(this[property].cached && this[property].requiredObjects().length > 0)
                        // Recalculate
                        this[property].recache()
                        
                } else if(properties[property].type === 'ObjectType' && this[property] != null) {
                    // Object dependency
                    this.requires.push(this[property])
                    this[property].requiredBy.push(this)
                }
        // Updating objects dependent on this one
        for(let req of this.requiredBy)
            req.update()
    }
    
    /**
     * Callback method when the object is about to get deleted.
     */
    delete() {
        for(let toRemove of this.requiredBy) { // Normally, there should be none here, but better leave nothing just in case.
            Objects.deleteObject(toRemove.name)
        }
        for(let toRemoveFrom of this.requires) {
            toRemoveFrom.requiredBy = toRemoveFrom.requiredBy.filter(o => o !== this)
        }
    }
    
    /**
     * Abstract method. Draw the object onto the  canvas with the.
     * @param {CanvasAPI} canvas
     */
    draw(canvas) {}
    
    /**
     * Applicates a  drawFunction with two position arguments depending on 
     * both the  posX and  posY of where the label should be displayed, 
     * and the  labelPosition which declares the label should be displayed
     * relatively to that position.
     * 
     * @param {string|Enum} labelPosition - Position of the label relative to the marked position
     * @param {number} offset - Margin between the position and the object to be drawn
     * @param {Object.<string, int>} size - Size of the label item, containing two properties, "width" and "height"
     * @param {number} posX - Component of the marked position on the x-axis 
     * @param {number} posY - Component of the marked position on the y-axis 
     * @param {function} drawFunction - Function with two arguments (x, y) that will be called to draw the label 
     */
    drawPositionDivergence(labelPosition, offset, size, posX, posY, drawFunction) {
        switch(labelPosition) {
            case 'center':
                drawFunction(posX-size.width/2, posY-size.height/2)
                break;
            case 'top':
            case 'above':
                drawFunction(posX-size.width/2, posY-size.height-offset)
                break;
            case 'bottom':
            case 'below':
                drawFunction(posX-size.width/2, posY+offset)
                break;
            case 'left':
                drawFunction(posX-size.width-offset, posY-size.height/2)
                break;
            case 'right':
                drawFunction(posX+offset, posY-size.height/2)
                break;
            case 'top-left':
            case 'above-left':
                drawFunction(posX-size.width, posY-size.height-offset)
                break;
            case 'top-right':
            case 'above-right':
                drawFunction(posX+offset, posY-size.height-offset)
                break;
            case 'bottom-left':
            case 'below-left':
                drawFunction(posX-size.width-offset, posY+offset)
                break;
            case 'bottom-right':
            case 'below-right':
                drawFunction(posX+offset, posY+offset)
                break;
        }
    }
    
    /**
     * Automatically draw text (by default the label of the object on the  canvas
     * depending on user settings.
     * This method takes into account both the  posX and  posY of where the label
     * should be displayed, including the  labelPosition relative to it.
     * The text is get both through the  getLatexFunction and  getTextFunction
     * depending on whether to use latex.
     * Then, it's displayed using the  drawFunctionLatex (x,y,imageData) and
     *  drawFunctionText (x,y,text) depending on whether to use latex.
     * 
     * @param {CanvasAPI} canvas
     * @param {string|Enum} labelPosition - Position of the label relative to the marked position
     * @param {number} posX - Component of the marked position on the x-axis 
     * @param {number} posY - Component of the marked position on the y-axis 
     * @param {boolean} forceText - Force the rendering of the label as text
     * @param {function|null} getLatexFunction - Function (no argument) to get the latex markup to be displayed
     * @param {function|null} getTextFunction - Function (no argument) to get the text to be displayed
     * @param {function|null} drawFunctionLatex - Function (x,y,imageData) to display the latex image
     * @param {function|null} drawFunctionText - Function (x,y,text,textSize) to display the text
     */
    drawLabel(canvas, labelPosition, posX, posY,forceText = false,
              getLatexFunction = null, getTextFunction = null, drawFunctionLatex = null, drawFunctionText = null) {
        // Default functions
        if(getLatexFunction == null)
            getLatexFunction = this.getLatexLabel.bind(this)
        if(getTextFunction == null)
            getTextFunction = this.getLabel.bind(this)
        if(drawFunctionLatex == null)
            drawFunctionLatex = (x,y,ltxImg) => canvas.drawVisibleImage(ltxImg.source, x, y, ltxImg.width, ltxImg.height)
        if(drawFunctionText == null)
            drawFunctionText = (x,y,text,textSize) => canvas.drawVisibleText(text, x, y+textSize.height) // Positioned from left bottom
        // Drawing the label
        let offset
        if(!forceText && Latex.enabled) {
            // With latex
            let drawLblCb = ((ltxImg) => {
                this.drawPositionDivergence(labelPosition, 8+canvas.linewidth/2, ltxImg, posX, posY, (x,y) => drawFunctionLatex(x,y,ltxImg))
            }).bind(this)
            let ltxLabel = getLatexFunction();
            if(ltxLabel !== "")
                canvas.renderLatexImage(ltxLabel, this.color, drawLblCb.bind(this))
        } else {
            // Without latex
            let text = getTextFunction()
            canvas.font = `${canvas.textsize}px sans-serif`
            let textSize = canvas.measureText(text)
            this.drawPositionDivergence(labelPosition, 8+canvas.linewidth/2, textSize, posX, posY, (x,y) => drawFunctionText(x,y,text,textSize))
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
export class ExecutableObject extends DrawableObject {
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
     * @returns {boolean}
     */
    canExecute(x = 1) {return true}
    /**
     * Returns the simplified expression string for a given x.
     * 
     * @param {number} x
     * @returns {string|Expression}
     */
    simplify(x = 1) {return '0'}
    
    /**
     * True if this object can be executed, so that an y value might be computed
     * for an x value. Only ExecutableObjects have that property set to true.
     * @return {boolean}
     */
    static executable() {return true}
}




