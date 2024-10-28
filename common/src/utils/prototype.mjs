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

// Add string methods
/**
 * Replaces latin characters with their uppercase versions.
 * @return {string}
 */
String.prototype.toLatinUppercase = function() {
    return this.replace(/[a-z]/g, function(match) {
        return match.toUpperCase()
    })
}

/**
 * Removes the first and last character of a string
 * Used to remove enclosing characters like quotes, parentheses, brackets...
 * @note Does NOT check for their existence ahead of time.
 * @return {string}
 */
String.prototype.removeEnclosure = function() {
    return this.substring(1, this.length - 1)
}

/**
 * Rounds to a certain number of decimal places.
 * From https://stackoverflow.com/a/48764436
 *
 * @param {number} decimalPlaces
 * @return {number}
 */
Number.prototype.toDecimalPrecision = function(decimalPlaces = 0) {
    const p = Math.pow(10, decimalPlaces)
    const n = (this * p) * (1 + Number.EPSILON)
    return Math.round(n) / p
}
