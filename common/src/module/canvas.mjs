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

import { Module } from "./common.mjs"
import { CanvasInterface, DialogInterface } from "./interface.mjs"
import { textsup } from "../utils.mjs"
import { Expression } from "../math/index.mjs"
import Latex from "./latex.mjs"
import Objects from "./objects.mjs"
import History from "./history.mjs"
import Settings from "./settings.mjs"

class CanvasAPI extends Module {
    /** @type {CanvasInterface} */
    #canvas = null
    /** @type {CanvasRenderingContext2D} */
    #ctx = null
    /** @type {{show(string, string, string)}} */
    #drawingErrorDialog = null
    
    
    constructor() {
        super("Canvas", {
            canvas: CanvasInterface,
            drawingErrorDialog: DialogInterface
        })
        
        /**
         *
         * @type {Object.<string, {expression: Expression, value: number, maxDraw: number}>}
         */
        this.axesSteps = {
            x: {
                expression: null,
                value: -1,
                maxDraw: -1
            },
            y: {
                expression: null,
                value: -1,
                maxDraw: -1
            }
        }
    }

    /**
     * Initialize the module.
     * @param {CanvasInterface} canvas
     * @param {{show(string, string, string)}} drawingErrorDialog
     */
    initialize({ canvas, drawingErrorDialog }) {
        super.initialize({ canvas, drawingErrorDialog })
        this.#canvas = canvas
        this.#drawingErrorDialog = drawingErrorDialog
    }

    get width() {
        if(!this.initialized) throw new Error("Attempting width before initialize!")
        return this.#canvas.width
    }

    get height() {
        if(!this.initialized) throw new Error("Attempting height before initialize!")
        return this.#canvas.height
    }

    /**
     * Minimum x of the diagram, provided from settings.
     * @returns {number}
     */
    get xmin() {
        if(!this.initialized) throw new Error("Attempting xmin before initialize!")
        return Settings.xmin
    }

    /**
     * Zoom on the x-axis of the diagram, provided from settings.
     * @returns {number}
     */
    get xzoom() {
        if(!this.initialized) throw new Error("Attempting xzoom before initialize!")
        return Settings.xzoom
    }

    /**
     * Maximum y of the diagram, provided from settings.
     * @returns {number}
     */
    get ymax() {
        if(!this.initialized) throw new Error("Attempting ymax before initialize!")
        return Settings.ymax
    }

    /**
     * Zoom on the y-axis of the diagram, provided from settings.
     * @returns {number}
     */
    get yzoom() {
        if(!this.initialized) throw new Error("Attempting yzoom before initialize!")
        return Settings.yzoom
    }

    /**
     * Label used on the x-axis, provided from settings.
     * @returns {string}
     */
    get xlabel() {
        if(!this.initialized) throw new Error("Attempting xlabel before initialize!")
        return Settings.xlabel
    }

    /**
     * Label used on the y-axis, provided from settings.
     * @returns {string}
     */
    get ylabel() {
        if(!this.initialized) throw new Error("Attempting ylabel before initialize!")
        return Settings.ylabel
    }

    /**
     * Width of lines that will be drawn into the canvas, provided from settings.
     * @returns {number}
     */
    get linewidth() {
        if(!this.initialized) throw new Error("Attempting linewidth before initialize!")
        return Settings.linewidth
    }

    /**
     * Font size of the text that will be drawn into the canvas, provided from settings.
     * @returns {number}
     */
    get textsize() {
        if(!this.initialized) throw new Error("Attempting textsize before initialize!")
        return Settings.textsize
    }

    /**
     * True if the canvas should be in logarithmic mode, false otherwise.
     * @returns {boolean}
     */
    get logscalex() {
        if(!this.initialized) throw new Error("Attempting logscalex before initialize!")
        return Settings.logscalex
    }

    /**
     * True if the x graduation should be shown, false otherwise.
     *  @returns {boolean}
     */
    get showxgrad() {
        if(!this.initialized) throw new Error("Attempting showxgrad before initialize!")
        return Settings.showxgrad
    }

    /**
     * True if the y graduation should be shown, false otherwise.
     * @returns {boolean}
     */
    get showygrad() {
        if(!this.initialized) throw new Error("Attempting showygrad before initialize!")
        return Settings.showygrad
    }

    /**
     * Max power of the logarithmic scaled on the x axis in logarithmic mode.
     * @returns {number}
     */
    get maxgradx() {
        if(!this.initialized) throw new Error("Attempting maxgradx before initialize!")
        return Math.min(
            309, // 10e309 = Infinity (beyond this land be dragons)
            Math.max(
                Math.ceil(Math.abs(Math.log10(this.xmin))),
                Math.ceil(Math.abs(Math.log10(this.px2x(this.width))))
            )
        )
    }

    //
    // Methods to draw the canvas
    //

    requestPaint() {
        if(!this.initialized) throw new Error("Attempting requestPaint before initialize!")
        this.#canvas.requestPaint()
    }

    /**
     * Redraws the entire canvas
     */
    redraw() {
        if(!this.initialized) throw new Error("Attempting redraw before initialize!")
        this.#ctx = this.#canvas.getContext("2d")
        this._computeAxes()
        this._reset()
        this._drawGrid()
        this._drawAxes()
        this._drawLabels()
        this.#ctx.lineWidth = this.linewidth
        for(let objType in Objects.currentObjects) {
            for(let obj of Objects.currentObjects[objType]) {
                this.#ctx.strokeStyle = obj.color
                this.#ctx.fillStyle = obj.color
                if(obj.visible)
                    try {
                        obj.draw(this)
                    } catch(e) {
                        // Drawing throws an error. Generally, it's due to a new modification (or the opening of a file)
                        console.error(e)
                        console.log(e.stack)
                        this.#drawingErrorDialog.show(objType, obj.name, e.message)
                        History.undo()
                    }
            }
        }
        this.#ctx.lineWidth = 1
    }

    /**
     * Calculates information for drawing gradations for axes.
     * @private
     */
    _computeAxes() {
        let exprY = new Expression(`x*(${Settings.yaxisstep})`)
        let y1 = exprY.execute(1)
        let exprX = new Expression(`x*(${Settings.xaxisstep})`)
        let x1 = exprX.execute(1)
        this.axesSteps = {
            x: {
                expression: exprX,
                value: x1,
                maxDraw: Math.ceil(Math.max(Math.abs(this.xmin), Math.abs(this.px2x(this.width))) / x1)
            },
            y: {
                expression: exprY,
                value: y1,
                maxDraw: Math.ceil(Math.max(Math.abs(this.ymax), Math.abs(this.px2y(this.height))) / y1)
            }
        }
    }

    /**
     * Resets the canvas to a blank one with default setting.
     * @private
     */
    _reset() {
        // Reset
        this.#ctx.fillStyle = "#FFFFFF"
        this.#ctx.strokeStyle = "#000000"
        this.#ctx.font = `${this.textsize}px sans-serif`
        this.#ctx.fillRect(0, 0, this.width, this.height)
    }

    /**
     * Draws the grid.
     * @private
     */
    _drawGrid() {
        this.#ctx.strokeStyle = "#C0C0C0"
        if(this.logscalex) {
            for(let xpow = -this.maxgradx; xpow <= this.maxgradx; xpow++) {
                for(let xmulti = 1; xmulti < 10; xmulti++) {
                    this.drawXLine(Math.pow(10, xpow) * xmulti)
                }
            }
        } else {
            for(let x = 0; x < this.axesSteps.x.maxDraw; x += 1) {
                this.drawXLine(x * this.axesSteps.x.value)
                this.drawXLine(-x * this.axesSteps.x.value)
            }
        }
        for(let y = 0; y < this.axesSteps.y.maxDraw; y += 1) {
            this.drawYLine(y * this.axesSteps.y.value)
            this.drawYLine(-y * this.axesSteps.y.value)
        }
    }

    /**
     * Draws the graph axes.
     * @private
     */
    _drawAxes() {
        this.#ctx.strokeStyle = "#000000"
        let axisypos = this.logscalex ? 1 : 0
        this.drawXLine(axisypos)
        this.drawYLine(0)
        let axisypx = this.x2px(axisypos) // X coordinate of Y axis
        let axisxpx = this.y2px(0) // Y coordinate of X axis
        // Drawing arrows
        this.drawLine(axisypx, 0, axisypx - 10, 10)
        this.drawLine(axisypx, 0, axisypx + 10, 10)
        this.drawLine(this.width, axisxpx, this.width - 10, axisxpx - 10)
        this.drawLine(this.width, axisxpx, this.width - 10, axisxpx + 10)
    }

    /**
     * Resets the canvas to a blank one with default setting.
     * @private
     */
    _drawLabels() {
        let axisypx = this.x2px(this.logscalex ? 1 : 0) // X coordinate of Y axis
        let axisxpx = this.y2px(0) // Y coordinate of X axis
        // Labels
        this.#ctx.fillStyle = "#000000"
        this.#ctx.font = `${this.textsize}px sans-serif`
        this.#ctx.fillText(this.ylabel, axisypx + 10, 24)
        let textWidth = this.#ctx.measureText(this.xlabel).width
        this.#ctx.fillText(this.xlabel, this.width - 14 - textWidth, axisxpx - 5)
        // Axis graduation labels
        this.#ctx.font = `${this.textsize - 4}px sans-serif`

        let txtMinus = this.#ctx.measureText("-").width
        if(this.showxgrad) {
            if(this.logscalex) {
                for(let xpow = -this.maxgradx; xpow <= this.maxgradx; xpow += 1) {
                    textWidth = this.#ctx.measureText("10" + textsup(xpow)).width
                    if(xpow !== 0)
                        this.drawVisibleText("10" + textsup(xpow), this.x2px(Math.pow(10, xpow)) - textWidth / 2, axisxpx + 16 + (6 * (xpow === 1)))
                }
            } else {
                for(let x = 1; x < this.axesSteps.x.maxDraw; x += 1) {
                    let drawX = x * this.axesSteps.x.value
                    let txtX = this.axesSteps.x.expression.simplify(x).toString().replace(/^\((.+)\)$/, "$1")
                    let textHeight = this.measureText(txtX).height
                    this.drawVisibleText(txtX, this.x2px(drawX) - 4, axisxpx + this.textsize / 2 + textHeight)
                    this.drawVisibleText("-" + txtX, this.x2px(-drawX) - 4, axisxpx + this.textsize / 2 + textHeight)
                }
            }
        }
        if(this.showygrad) {
            for(let y = 0; y < this.axesSteps.y.maxDraw; y += 1) {
                let drawY = y * this.axesSteps.y.value
                let txtY = this.axesSteps.y.expression.simplify(y).toString().replace(/^\((.+)\)$/, "$1")
                textWidth = this.#ctx.measureText(txtY).width
                this.drawVisibleText(txtY, axisypx - 6 - textWidth, this.y2px(drawY) + 4 + (10 * (y === 0)))
                if(y !== 0)
                    this.drawVisibleText("-" + txtY, axisypx - 6 - textWidth - txtMinus, this.y2px(-drawY) + 4)
            }
        }
        this.#ctx.fillStyle = "#FFFFFF"
    }

    //
    // Public functions
    //

    /**
     * Draws an horizontal line at x plot coordinate.
     * @param {number} x
     */
    drawXLine(x) {
        if(this.isVisible(x, this.ymax)) {
            this.drawLine(this.x2px(x), 0, this.x2px(x), this.height)
        }
    }

    /**
     * Draws an vertical line at y plot coordinate
     * @param {number} y
     * @private
     */
    drawYLine(y) {
        if(this.isVisible(this.xmin, y)) {
            this.drawLine(0, this.y2px(y), this.width, this.y2px(y))
        }
    }

    /**
     * Writes multiline text onto the canvas.
     * NOTE: The x and y properties here are relative to the canvas, not the plot.
     * @param {string} text
     * @param {number} x
     * @param {number} y
     */
    drawVisibleText(text, x, y) {
        if(x > 0 && x < this.width && y > 0 && y < this.height) {
            text.toString().split("\n").forEach((txt, i) => {
                this.#ctx.fillText(txt, x, y + (this.textsize * i))
            })
        }
    }

    /**
     * Draws an image onto the canvas.
     * NOTE: The x, y width and height properties here are relative to the canvas, not the plot.
     * @param {CanvasImageSource} image
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    drawVisibleImage(image, x, y, width, height) {
        this.#canvas.markDirty(Qt.rect(x, y, width, height))
        this.#ctx.drawImage(image, x, y, width, height)
    }

    /**
     * Measures the width and height of a multiline text that would be drawn onto the canvas.
     * @param {string} text
     * @returns {{width: number, height: number}}
     */
    measureText(text) {
        let theight = 0
        let twidth = 0
        let defaultHeight = this.textsize * 1.2 // Approximate but good enough!
        for(let txt of text.split("\n")) {
            theight += defaultHeight
            if(this.#ctx.measureText(txt).width > twidth) twidth = this.#ctx.measureText(txt).width
        }
        return { "width": twidth, "height": theight }
    }

    /**
     * Converts an x coordinate to its relative position on the canvas.
     * It supports both logarithmic and non-logarithmic scale depending on the currently selected mode.
     * @param {number} x
     * @returns {number}
     */
    x2px(x) {
        if(this.logscalex) {
            const logxmin = Math.log(this.xmin)
            return (Math.log(x) - logxmin) * this.xzoom
        } else
            return (x - this.xmin) * this.xzoom
    }

    /**
     * Converts an y coordinate to it's relative position on the canvas.
     * The y-axis not supporting logarithmic scale, it only supports linear conversion.
     * @param {number} y
     * @returns {number}
     */
    y2px(y) {
        return (this.ymax - y) * this.yzoom
    }

    /**
     * Converts an x px position on the canvas to it's corresponding coordinate on the plot.
     * It supports both logarithmic and non-logarithmic scale depending on the currently selected mode.
     * @param {number} px
     * @returns {number}
     */
    px2x(px) {
        if(this.logscalex) {
            return Math.exp(px / this.xzoom + Math.log(this.xmin))
        } else
            return (px / this.xzoom + this.xmin)
    }

    /**
     * Converts an x px position on the canvas to it's corresponding coordinate on the plot.
     * It supports both logarithmic and non logarithmic scale depending on the currently selected mode.
     * @param {number} px
     * @returns {number}
     */
    px2y(px) {
        return -(px / this.yzoom - this.ymax)
    }

    /**
     * Checks whether a plot point (x, y) is visible or not on the canvas.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isVisible(x, y) {
        return (this.x2px(x) >= 0 && this.x2px(x) <= this.width) && (this.y2px(y) >= 0 && this.y2px(y) <= this.height)
    }

    /**
     * Draws a line from plot point (x1, y1) to plot point (x2, y2).
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    drawLine(x1, y1, x2, y2) {
        this.#ctx.beginPath()
        this.#ctx.moveTo(x1, y1)
        this.#ctx.lineTo(x2, y2)
        this.#ctx.stroke()
    }

    /**
     * Draws a dashed line from plot point (x1, y1) to plot point (x2, y2).
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} dashPxSize
     */
    drawDashedLine(x1, y1, x2, y2, dashPxSize = 6) {
        this.#ctx.setLineDash([dashPxSize / 2, dashPxSize])
        this.drawLine(x1, y1, x2, y2)
        this.#ctx.setLineDash([])
    }

    /**
     * Renders latex markup ltxText to an image and loads it. Returns a dictionary with three values: source, width and height.
     * @param {string} ltxText
     * @param {string} color
     * @param {function(LatexRenderResult|{width: number, height: number, source: string})} callback
     */
    renderLatexImage(ltxText, color, callback) {
        const onRendered = (imgData) => {
            if(!this.#canvas.isImageLoaded(imgData.source) && !this.#canvas.isImageLoading(imgData.source)) {
                // Wait until the image is loaded to callback.
                this.#canvas.loadImageAsync(imgData.source).then(() => {
                    callback(imgData)
                })
            } else {
                // Callback directly
                callback(imgData)
            }
        }
        const prerendered = Latex.findPrerendered(ltxText, this.textsize, color)
        if(prerendered !== null)
            onRendered(prerendered)
        else
            Latex.requestAsyncRender(ltxText, this.textsize, color).then(onRendered)
    }

    //
    // Context methods
    //

    get font() {
        return this.#ctx.font
    }

    set font(value) {
        return this.#ctx.font = value
    }

    /**
     * Draws an act on the canvas centered on a point.
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {boolean} counterclockwise
     */
    arc(x, y, radius, startAngle, endAngle, counterclockwise = false) {
        this.#ctx.beginPath()
        this.#ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)
        this.#ctx.stroke()
    }

    /**
     * Draws a filled circle centered on a point.
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    disc(x, y, radius) {
        this.#ctx.beginPath()
        this.#ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.#ctx.fill()
    }

    /**
     * Draws a filled rectangle onto the canvas.
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    fillRect(x, y, w, h) {
        this.#ctx.fillRect(x, y, w, h)
    }
}

/** @type {CanvasAPI} */
Modules.Canvas = Modules.Canvas || new CanvasAPI()
export default Modules.Canvas
