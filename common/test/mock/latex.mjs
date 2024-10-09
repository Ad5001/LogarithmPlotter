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

import { TMP, existsSync, writeFileSync } from "./fs.mjs"

const PIXEL = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg=="

export class MockLatex {
    constructor() {
    }

    /**
     * Creates a simple string hash.
     * @param {string} string
     * @return {number}
     * @private
     */
    __hash(string) {
        let hash = 0
        let i, chr
        if(string.length === 0) return hash
        for(i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i)
            hash = ((hash << 5) - hash) + chr
            hash |= 0 // Convert to 32bit integer
        }
        return hash
    }

    /**
     *
     * @param {string} markup
     * @param {number} fontSize
     * @param {string} color
     * @return {string}
     * @private
     */
    __getFileName(markup, fontSize, color) {
        const name = this.__hash(`${markup}_${fontSize}_${color}`)
        return `${TMP}/${name}.png`
    }

    /**
     * @param {string} markup - LaTeX markup to render
     * @param {number} fontSize - Font size (in pt) to render
     * @param {string} color - Color of the text to render
     * @returns {string} - Comma separated data of the image (source, width, height)
     */
    render(markup, fontSize, color) {
        const file = this.__getFileName(markup, fontSize, color)
        writeFileSync(file, PIXEL, "base64")
        return `${file},1,1`
    }

    /**
     * @param {string} markup - LaTeX markup to render
     * @param {number} fontSize - Font size (in pt) to render
     * @param {string} color - Color of the text to render
     * @returns {string} - Comma separated data of the image (source, width, height)
     */
    findPrerendered(markup, fontSize, color) {
        const file = this.__getFileName(markup, fontSize, color)
        if(existsSync(file))
            return `${file},1,1`
        return ""
    }

    /**
     * Checks if the Latex installation is valid
     * @returns {boolean}
     */
    checkLatexInstallation() {
        return true // We're not *actually* doing any latex.
    }
}