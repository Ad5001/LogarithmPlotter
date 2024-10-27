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

import History from "../module/history.mjs"
import Latex from "../module/latex.mjs"

export class Action {
    /**
     * Type of the action.
     *
     * @returns {string}
     */
    type() {
        return "Unknown"
    }

    /**
     * Icon associated with the action.
     *
     * @returns {string}
     */
    icon() {
        return "position"
    }

    // TargetName is the name of the object that's targeted by the event.
    constructor(targetName = "", targetType = "Point") {
        this.targetName = targetName
        this.targetType = targetType
    }

    /**
     * Undoes the action.
     */
    undo() {
    }

    /**
     * Redoes the action.
     */
    redo() {
    }

    /**
     * Export the action to a serializable format.
     * NOTE: These arguments will be reinputed in the constructor in this order.
     *
     * @returns {string[]}
     */
    export() {
        return [this.targetName, this.targetType]
    }

    /**
     * Returns a string with the human-readable description of the action.
     *
     * @returns {string}
     */
    getReadableString() {
        return "Unknown action"
    }

    /**
     * Returns a string containing an HTML tag describing the icon of a type
     *
     * @param {string} type - Name of the icon to put in rich text.
     * @returns {string}
     */
    getIconRichText(type) {
        return `<img src="../icons/objects/${type}.svg" style="color: ${History.themeTextColor};" width=18 height=18></img>`
    }

    /**
     * Renders a LaTeX-formatted string to an image and wraps it in an HTML tag in a string.
     *
     * @param {string} latexString - Source string of the latex.
     * @returns {Promise<string>}
     */
    async renderLatexAsHtml(latexString) {
        if(!Latex.enabled)
            throw new Error("Cannot render an item as LaTeX when LaTeX is disabled.")
        const imgDepth = History.imageDepth
        const renderArguments = [
            latexString,
            imgDepth * (History.fontSize + 2),
            History.themeTextColor
        ]
        let render = Latex.findPrerendered(...renderArguments)
        if(render === null)
            render = await Latex.requestAsyncRender(...renderArguments)
        const { source, width, height } = render
        return `<img src="${source}" width="${width / imgDepth}" height="${height / imgDepth}" style="vertical-align: middle"/>`
    }

    /**
     * Returns a string with the HTML-formatted description of the action.
     *
     * @returns {string|Promise<string>}
     */
    getHTMLString() {
        return this.getReadableString()
    }
}
