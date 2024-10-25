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

// Mock qt methods.

/**
 * Polyfill for Qt.rect.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {{x, width, y, height}}
 */
function rect(x, y, width, height) {
    return { x, y, width, height }
}

/**
 * Mock for QT_TRANSLATE_NOOP and qsTranslate
 * @param {string} category
 * @param {string} string
 * @return {string}
 */
function QT_TRANSLATE_NOOP(category, string) {
    return string
}

/**
 * Polyfilling Qt arg function.
 * @param {string} argument
 */
String.prototype.arg = function(argument) {
    for(let i = 0; i < 10; i++)
        if(this.includes("%"+i))
            return this.replaceAll("%" + i, argument)
    throw new Error("Too many arguments used.")
}

function setup() {
    globalThis.Qt = {
        rect
    }

    globalThis.QT_TRANSLATE_NOOP = QT_TRANSLATE_NOOP
    globalThis.qsTranslate = QT_TRANSLATE_NOOP
}

setup()

export default {
    rect,
    QT_TRANSLATE_NOOP,
    qtTranslate: QT_TRANSLATE_NOOP,
}