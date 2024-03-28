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

Runtime = Runtime || {}
/** @type {function(string, string): string} */
qsTranslate = qsTranslate || function(category, string) { throw new Error('qsTranslate not implemented.'); }
/** @type {function(string): string} */
qsTr = qsTr || function(string) { throw new Error('qsTr not implemented.'); }
/** @type {function(string, string): string} */
QT_TRANSLATE_NOOP = QT_TRANSLATE_NOOP || function(string, string) { throw new Error('QT_TRANSLATE_NOOP not implemented.'); }
/** @type {function(string|boolean|int): string} */
String.prototype.arg = String.prototype.arg || function(parameter) { throw new Error('arg not implemented.'); }