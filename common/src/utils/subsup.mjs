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

const CHARACTER_TO_POWER = new Map([
    ["-", "⁻"],
    ["+", "⁺"],
    ["=", "⁼"],
    [" ", " "],
    ["(", "⁽"],
    [")", "⁾"],
    ["0", "⁰"],
    ["1", "¹"],
    ["2", "²"],
    ["3", "³"],
    ["4", "⁴"],
    ["5", "⁵"],
    ["6", "⁶"],
    ["7", "⁷"],
    ["8", "⁸"],
    ["9", "⁹"],
    ["a", "ᵃ"],
    ["b", "ᵇ"],
    ["c", "ᶜ"],
    ["d", "ᵈ"],
    ["e", "ᵉ"],
    ["f", "ᶠ"],
    ["g", "ᵍ"],
    ["h", "ʰ"],
    ["i", "ⁱ"],
    ["j", "ʲ"],
    ["k", "ᵏ"],
    ["l", "ˡ"],
    ["m", "ᵐ"],
    ["n", "ⁿ"],
    ["o", "ᵒ"],
    ["p", "ᵖ"],
    ["r", "ʳ"],
    ["s", "ˢ"],
    ["t", "ᵗ"],
    ["u", "ᵘ"],
    ["v", "ᵛ"],
    ["w", "ʷ"],
    ["x", "ˣ"],
    ["y", "ʸ"],
    ["z", "ᶻ"]
])

const CHARACTER_TO_INDICE = new Map([
    ["-", "₋"],
    ["+", "₊"],
    ["=", "₌"],
    ["(", "₍"],
    [")", "₎"],
    [" ", " "],
    ["0", "₀"],
    ["1", "₁"],
    ["2", "₂"],
    ["3", "₃"],
    ["4", "₄"],
    ["5", "₅"],
    ["6", "₆"],
    ["7", "₇"],
    ["8", "₈"],
    ["9", "₉"],
    ["a", "ₐ"],
    ["e", "ₑ"],
    ["h", "ₕ"],
    ["i", "ᵢ"],
    ["j", "ⱼ"],
    ["k", "ₖ"],
    ["l", "ₗ"],
    ["m", "ₘ"],
    ["n", "ₙ"],
    ["o", "ₒ"],
    ["p", "ₚ"],
    ["r", "ᵣ"],
    ["s", "ₛ"],
    ["t", "ₜ"],
    ["u", "ᵤ"],
    ["v", "ᵥ"],
    ["x", "ₓ"]
])

const EXPONENTS = [
    "⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"
]

const EXPONENTS_REG = new RegExp("([" + EXPONENTS.join("") + "]+)", "g")

/**
 * Put a text in sup position
 * @param {string} text
 * @return {string}
 */
export function textsup(text) {
    let ret = ""
    text = text.toString()
    for(let letter of text)
        ret += CHARACTER_TO_POWER.has(letter) ? CHARACTER_TO_POWER.get(letter) : letter
    return ret
}

/**
 * Put a text in sub position
 * @param {string} text
 * @return {string}
 */
export function textsub(text) {
    let ret = ""
    text = text.toString()
    for(let letter of text)
        ret += CHARACTER_TO_INDICE.has(letter) ? CHARACTER_TO_INDICE.get(letter) : letter
    return ret
}


/**
 * Parses exponents and replaces them with expression values
 * @param {string} expression - The expression to replace in.
 * @return {string} The parsed expression
 */
export function exponentsToExpression(expression) {
    return expression.replace(EXPONENTS_REG, (m, exp) => "^" + exp.split("").map((x) => EXPONENTS.indexOf(x)).join(""))
}

