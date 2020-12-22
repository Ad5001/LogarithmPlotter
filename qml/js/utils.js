/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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

var powerpos = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "=": "⁼",
    "a": "ᵃ",
    "b": "ᵇ",
    "c": "ᶜ",
    "d": "ᵈ",
    "e": "ᵉ",
    "f": "ᶠ",
    "g": "ᵍ",
    "h": "ʰ",
    "i": "ⁱ",
    "j": "ʲ",
    "k": "ᵏ",
    "l": "ˡ",
    "m": "ᵐ",
    "n": "ⁿ",
    "o": "ᵒ",
    "p": "ᵖ",
    "r": "ʳ",
    "s": "ˢ",
    "t": "ᵗ",
    "u": "ᵘ",
    "v": "ᵛ",
    "w": "ʷ",
    "x": "ˣ",
    "y": "ʸ",
    "z": "ᶻ",
}

var indicepos = {
    "-": "₋",
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
    "+": "₊",
    "=": "₌",
    "a": "ₐ",
    "e": "ₑ",
    "h": "ₕ",
    "i": "ᵢ",
    "j": "ⱼ",
    "k": "ₖ",
    "l": "ₗ",
    "m": "ₘ",
    "n": "ₙ",
    "o": "ₒ",
    "p": "ₚ",
    "r": "ᵣ",
    "s": "ₛ",
    "t": "ₜ",
    "u": "ᵤ",
    "v": "ᵥ",
    "x": "ₓ",
}
// Put a text in sup position
function textsup(text) {
    var ret = ""
    text = text.toString()
    for (var i = 0; i < text.length; i++) {
        if(Object.keys(powerpos).indexOf(text[i]) >= 0) {
            ret += powerpos[text[i]]
        } else {
            ret += text[i]
        }
    }
    return ret
}

// Put a text in sub position
function textsub(text) {
    var ret = ""
    text = text.toString()
    for (var i = 0; i < text.length; i++) {
        if(Object.keys(indicepos).indexOf(text[i]) >= 0) {
            ret += indicepos[text[i]]
        } else {
            ret += text[i]
        }
    }
    return ret
}

function makeExpressionReadable(str) {
    var replacements = [
        [/pi/g, 'π'],
        [/Infinity/g, '∞'],
        [/inf/g, '∞'],
        [/ \* /g, '×'],
        [/ \^ /g, '^'],
        [/\^\(([^\^]+)\)/g, function(match, p1) { return textsup(p1) }],
        [/\^([^ ]+)/g, function(match, p1) { return textsup(p1) }],
        [/(\d|\))×/g, '$1'],
        [/×(\d|\()/g, '$1'],
        [/\(([^)(+.-]+)\)/g, "$1"],
        [/\(([^)(+.-]+)\)/g, "$1"],
        [/\(([^)(+.-]+)\)/g, "$1"],
        [/\(([^)(+.-]+)\)/g, "$1"],
        [/\(([^)(+.-]+)\)/g, "$1"],
        // Doing it 4 times to be recursive until better implementation
    ]
    // Replacements
    replacements.forEach(function(replacement){
        str = str.replace(replacement[0], replacement[1])
    })
    return str
}

function parseName(str, removeUnallowed = true) {
    var replacements = [
        // Greek letters
        [/(\s|^)al(pha)?[^a-z]/g, 'α'],
        [/(\s|^)be(ta)?[^a-z]/g, 'β'],
        [/(\s|^)ga(mma)?[^a-z]/g, 'γ'],
        [/(\s|^)de(lta)?[^a-z]/g, 'δ'],
        [/(\s|^)ep(silon)?[^a-z]/g, 'ε'],
        [/(\s|^)ze(ta)?[^a-z]/g, 'ζ'],
        [/(\s|^)et(a)?[^a-z]/g, 'η'],
        [/(\s|^)th(eta)?[^a-z]/g, 'θ'],
        [/(\s|^)io(ta)?[^a-z]/g, 'ι'],
        [/(\s|^)ka(ppa)[^a-z]?/g, 'κ'],
        [/(\s|^)la(mbda)?[^a-z]/g, 'λ'],
        [/(\s|^)mu[^a-z]/g, 'μ'],
        [/(\s|^)nu[^a-z]/g, 'ν'],
        [/(\s|^)xi[^a-z]/g, 'ξ'],
        [/(\s|^)rh(o)?[^a-z]/g, 'ρ'],
        [/(\s|^)si(gma)?[^a-z]/g, 'σ'],
        [/(\s|^)ta(u)?[^a-z]/g, 'τ'],
        [/(\s|^)up(silon)?[^a-z]/g, 'υ'],
        [/(\s|^)ph(i)?[^a-z]/g, 'φ'],
        [/(\s|^)ch(i)?[^a-z]/g, 'χ'],
        [/(\s|^)ps(i)?[^a-z]/g, 'ψ'],
        [/(\s|^)om(ega)?[^a-z]/g, 'ω'],
        // Capital greek letters
        [/(\s|^)gga(mma)?[^a-z]/g, 'Γ'],
        [/(\s|^)gde(lta)?[^a-z]/g, 'Δ'],
        [/(\s|^)gth(eta)?[^a-z]/g, 'Θ'],
        [/(\s|^)gla(mbda)?[^a-z]/g, 'Λ'],
        [/(\s|^)gxi[^a-z]/g, 'Ξ'],
        [/(\s|^)gpi[^a-z]/g, 'Π'],
        [/(\s|^)gsi(gma)[^a-z]?/g, 'Σ'],
        [/(\s|^)gph(i)?[^a-z]/g, 'Φ'],
        [/(\s|^)gps(i)?[^a-z]/g, 'Ψ'],
        [/(\s|^)gom(ega)?[^a-z]/g, 'Ω'],
        // Underscores
        [/_\(([^\^]+)\)/g, function(match, p1) { return textsub(p1) }],
        [/_([^ ]+)/g, function(match, p1) { return textsub(p1) }],
        // Removing
        [/[xπℝℕ\\∪∩\]\[ ()^/÷*×+=\d-]/g , function(match){console.log('removing', match); return ''}],
    ]
    if(!removeUnallowed) replacements.pop()
    // Replacements
    replacements.forEach(function(replacement){
        str = str.replace(replacement[0], replacement[1])
    })
    return str
}

String.prototype.toLatinUppercase = function() {
    return this.replace(/[a-z]/g, function(match){return match.toUpperCase()})
}

function camelCase2readable(label) {
    var parsed = parseName(label, false)
    return parsed.charAt(0).toLatinUppercase() + parsed.slice(1).replace(/([A-Z])/g," $1")
}
