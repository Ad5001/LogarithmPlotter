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

// Type polyfills for IDEs.
// Never directly imported.
// Might need to be reimplemented in other implemententations.

Modules = Modules || {}
/** @type {function(string, string): string} */
qsTranslate = qsTranslate || function(category, string) { throw new Error('qsTranslate not implemented.'); }
/** @type {function(string): string} */
qsTr = qsTr || function(string) { throw new Error('qsTr not implemented.'); }
/** @type {function(string, string): string} */
QT_TRANSLATE_NOOP = QT_TRANSLATE_NOOP || function(category, string) { throw new Error('QT_TRANSLATE_NOOP not implemented.'); }
/** @type {function(string): string} */
QT_TR_NOOP = QT_TR_NOOP || function(string) { throw new Error('QT_TR_NOOP not implemented.'); }
/** @type {function(string|boolean|int): string} */
String.prototype.arg = String.prototype.arg || function(parameter) { throw new Error('arg not implemented.'); }

const Qt = {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @returns {{x, width, y, height}}
     */
    rect: function(x, y, width, height) {
        return {x: x, y: y, width: width, height: height};
    }
}

/** Typehints for Helper. */
const Helper = {
    /** @type {function(string): boolean} */
    getSettingBool: (setting) => true,
    /** @type {function(string): int} */
    getSettingInt: (setting) => 0,
    /** @type {function(string): string} */
    getSetting: (setting) => '',
    /** @type {function(string, boolean)} */
    setSettingBool: (setting, value) => {},
    /** @type {function(string, int)} */
    setSettingInt: (setting, value) => 0,
    /** @type {function(string, string)} */
    setSetting: (setting, value) => '',
    /** @type {function(string, string)} */
    write: (filename, data) => {},
    /** @type {function(string): string} */
    load: (filename) => '',
}

const Latex = {
    /** @type {function(string, number, string): string} */
    render: (latex_markup, font_size, color) => '',
    /** @type {function(string, number, string): string} */
    findPrerendered: (latex_markup, font_size, color) => '',
    /** @type {function(): boolean} */
    checkLatexInstallation: () => true,
}
