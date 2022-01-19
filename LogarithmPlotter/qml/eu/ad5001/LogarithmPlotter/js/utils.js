/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2022  Ad5001
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
    "+": "⁺",
    "=": "⁼",
    " ": " ",
    "(": "⁽",
    ")": "⁾",
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
    "z": "ᶻ"
}

var indicepos = {
    "-": "₋",
    "+": "₊",
    "=": "₌",
    "(": "₍",
    ")": "₎",
    " ": " ",
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

function simplifyExpression(str) {
    var replacements = [
        // Operations not done by parser.
        [// Decomposition way 2
            /(^.?|[+-] |\()([-.\d\w]+) ([*/]) \((([-.\d\w] [*/] )?[-\d\w.]+) ([+\-]) (([-.\d\w] [*/] )?[\d\w.+]+)\)(.?$| [+-]|\))/g,
            "$1$2 $3 $4 $6 $2 $3 $7$9"
        ],
        [ // Decomposition way 2
            /(^.?|[+-] |\()\((([-.\d\w] [*/] )?[-\d\w.]+) ([+\-]) (([-.\d\w] [*/] )?[\d\w.+]+)\) ([*/]) ([-.\d\w]+)(.?$| [+-]|\))/g,
            "$1$2 $7 $8 $4 $5 $7 $8$9"
        ],
        [ // Factorisation of π elements.
            /(([-\d\w.]+ [*/] )*)(pi|π)(( [/*] [-\d\w.]+)*) ([+-]) (([-\d\w.]+ [*/] )*)(pi|π)(( [/*] [-\d\w.]+)*)?/g,
            function(match, m1, n1, pi1, m2, ope2, n2, opeM, m3, n3, pi2, m4, ope4, n4) {
                //          g1, g2, g3 , g4, g5,   g6, g7,   g8, g9, g10, g11,g12 , g13
                // We don't care about mx & pix, ope2 & ope4 are either / or * for n2 & n4.
                // n1 & n3 are multiplied, opeM is the main operation (- or +).
                // Putting all n in form of number
                //n2 = n2 == undefined ? 1 : parseFloat(n)
                n1 = m1 == undefined ? 1 : eval(m1 + '1')
                n2 = m2 == undefined ? 1 : eval('1' + m2)
                n3 = m3 == undefined ? 1 : eval(m3 + '1')
                n4 = m4 == undefined ? 1 : eval('1' + m4)
                //var [n1, n2, n3, n4] = [n1, n2, n3, n4].map(n => n == undefined ? 1 : parseFloat(n))
                // Falling back to * in case it does not exist (the corresponding n would be 1)
                var [ope2, ope4] = [ope2, ope4].map(ope => ope == '/' ? '/' : '*')
                var coeff1 = n1*n2
                var coeff2 = n3*n4
                var coefficient = coeff1+coeff2-(opeM == '-' ? 2*coeff2 : 0)
                
                return `${coefficient} * π`
            }
        ],
        [ // Removing parenthesis when content is only added from both sides.
            /(^.?|[+-] |\()\(([^)(]+)\)(.?$| [+-]|\))/g,
            function(match, b4, middle, after) {return `${b4}${middle}${after}`}
        ],
        [ // Removing parenthesis when content is only multiplied.
            /(^.?|[*\/] |\()\(([^)(+-]+)\)(.?$| [*\/+-]|\))/g,
            function(match, b4, middle, after) {return `${b4}${middle}${after}`}
        ],
        [ // Removing parenthesis when content is only multiplied.
            /(^.?|[*\/-+] |\()\(([^)(+-]+)\)(.?$| [*\/]|\))/g,
            function(match, b4, middle, after) {return `${b4}${middle}${after}`}
        ],
        [// Simplification additions/substractions.
            /(^.?|[^*\/] |\()([-.\d]+) (\+|\-) (\([^)(]+\)|[^)(]+) (\+|\-) ([-.\d]+)(.?$| [^*\/]|\))/g,
            function(match, b4, n1, op1, middle, op2, n2, after) {
                var total
                if(op2 == '+') {
                    total = parseFloat(n1) + parseFloat(n2)
                } else {
                    total = parseFloat(n1) - parseFloat(n2)
                }
                return `${b4}${total} ${op1} ${middle}${after}`
            }
        ],
        [// Simplification multiplications/divisions.
            /([-.\d]+) (\*|\/) (\([^)(]+\)|[^)(+-]+) (\*|\/) ([-.\d]+)/g, 
            function(match, n1, op1, middle, op2, n2) {
                if(parseInt(n1) == n1 && parseInt(n2) == n2 && op2 == '/' &&
                (parseInt(n1) / parseInt(n2)) % 1 != 0) {
                    // Non int result for int division.
                    return `(${n1} / ${n2}) ${op1} ${middle}`
                } else {
                    if(op2 == '*') {
                        return `${parseFloat(n1) * parseFloat(n2)} ${op1} ${middle}`
                    } else {
                        return `${parseFloat(n1) / parseFloat(n2)} ${op1} ${middle}`
                    }
                }
            }
        ],
        [// Starting & ending parenthesis if not needed.
            /^\s*\((.*)\)\s*$/g,
            function(match, middle) {
                var str = middle
                // Replace all groups
                while(/\([^)(]+\)/g.test(str))
                    str = str.replace(/\([^)(]+\)/g, '')
                // There shouldn't be any more parenthesis
                // If there is, that means the 2 parenthesis are needed.
                if(!str.includes(')') && !str.includes('(')) {
                    return middle
                } else {
                    return `(${middle})`
                }
                
            }
        ],
        // Simple simplifications
        [/(\s|^|\()0(\.0+)? \* (\([^)(]+\))/g, '$10'],
        [/(\s|^|\()0(\.0+)? \* ([^)(+-]+)/g, '$10'],
        [/(\([^)(]\)) \* 0(\.0+)?(\s|$|\))/g, '0$3'],
        [/([^)(+-]) \* 0(\.0+)?(\s|$|\))/g, '0$3'],
        [/(\s|^|\()1(\.0+)? (\*|\/) /g, '$1'],
        [/(\s|^|\()0(\.0+)? (\+|\-) /g, '$1'],
        [/ (\*|\/) 1(\.0+)?(\s|$|\))/g, '$3'],
        [/ (\+|\-) 0(\.0+)?(\s|$|\))/g, '$3'],
        [/(^| |\() /g, '$1'],
        [/ ($|\))/g, '$1'],
    ]
    
    // Replacements
    var found
    do {
        found = false
        for(var replacement of replacements)
            while(replacement[0].test(str)) {
                found = true
                str = str.replace(replacement[0], replacement[1])
            }
    } while(found)
    return str
}


function makeExpressionReadable(str) {
    var replacements = [
        // variables
        [/pi/g, 'π'],
        [/Infinity/g, '∞'],
        [/inf/g, '∞'],
        // Other
        [/ \* /g, '×'],
        [/ \^ /g, '^'],
        [/\^\(([^\^]+)\)/g, function(match, p1) { return textsup(p1) }],
        [/\^([^ "]+)/g, function(match, p1) { return textsup(p1) }],
        [/_\(([^_]+)\)/g, function(match, p1) { return textsub(p1) }],
        [/_([^ "]+)/g, function(match, p1) { return textsub(p1) }],
        [/\[([^\[\]]+)\]/g, function(match, p1) { return textsub(p1) }],
        [/(\d|\))×/g, '$1'],
        //[/×(\d|\()/g, '$1'],
        [/\(([^)(+.\/-]+)\)/g, "$1"],
        [/integral\((.+),\s?(.+),\s?("|')(.+)("|'),\s?("|')(.+)("|')\)/g, function(match, a, b, p1, body, p2, p3, by, p4) {
            if(a.length < b.length) {
                return `∫${textsub(a)}${textsup(b)} ${body} d${by}`
            } else {
                return `∫${textsup(b)}${textsub(a)} ${body} d${by}`
            }
        }],
        [/derivative\(?("|')(.+)("|'), ?("|')(.+)("|'), ?(.+)\)?/g, function(match, p1, body, p2, p3, by, p4, x) {
            return `d(${body.replace(new RegExp(by, 'g'), 'x')})/dx`
        }]
    ]
    
    str = simplifyExpression(str)
    // Replacements
    for(var replacement of replacements)
        while(replacement[0].test(str))
            str = str.replace(replacement[0], replacement[1])
    return str
}

function parseName(str, removeUnallowed = true) {
    var replacements = [
        // Greek letters
        [/([^a-z]|^)al(pha)?([^a-z]|$)/g, '$1α$3'],
        [/([^a-z]|^)be(ta)?([^a-z]|$)/g, '$1β$3'],
        [/([^a-z]|^)ga(mma)?([^a-z]|$)/g, '$1γ$3'],
        [/([^a-z]|^)de(lta)?([^a-z]|$)/g, '$1δ$3'],
        [/([^a-z]|^)ep(silon)?([^a-z]|$)/g, '$1ε$3'],
        [/([^a-z]|^)ze(ta)?([^a-z]|$)/g, '$1ζ$3'],
        [/([^a-z]|^)et(a)?([^a-z]|$)/g, '$1η$3'],
        [/([^a-z]|^)th(eta)?([^a-z]|$)/g, '$1θ$3'],
        [/([^a-z]|^)io(ta)?([^a-z]|$)/g, '$1ι$3'],
        [/([^a-z]|^)ka(ppa)([^a-z]|$)?/g, '$1κ$3'],
        [/([^a-z]|^)la(mbda)?([^a-z]|$)/g, '$1λ$3'],
        [/([^a-z]|^)mu([^a-z]|$)/g, '$1μ$2'],
        [/([^a-z]|^)nu([^a-z]|$)/g, '$1ν$2'],
        [/([^a-z]|^)xi([^a-z]|$)/g, '$1ξ$2'],
        [/([^a-z]|^)rh(o)?([^a-z]|$)/g, '$1ρ$3'],
        [/([^a-z]|^)si(gma)?([^a-z]|$)/g, '$1σ$3'],
        [/([^a-z]|^)ta(u)?([^a-z]|$)/g, '$1τ$3'],
        [/([^a-z]|^)up(silon)?([^a-z]|$)/g, '$1υ$3'],
        [/([^a-z]|^)ph(i)?([^a-z]|$)/g, '$1φ$3'],
        [/([^a-z]|^)ch(i)?([^a-z]|$)/g, '$1χ$3'],
        [/([^a-z]|^)ps(i)?([^a-z]|$)/g, '$1ψ$3'],
        [/([^a-z]|^)om(ega)?([^a-z]|$)/g, '$1ω$3'],
        // Capital greek letters
        [/([^a-z]|^)gga(mma)?([^a-z]|$)/g, '$1Γ$3'],
        [/([^a-z]|^)gde(lta)?([^a-z]|$)/g, '$1Δ$3'],
        [/([^a-z]|^)gth(eta)?([^a-z]|$)/g, '$1Θ$3'],
        [/([^a-z]|^)gla(mbda)?([^a-z]|$)/g, '$1Λ$3'],
        [/([^a-z]|^)gxi([^a-z]|$)/g, '$1Ξ$2'],
        [/([^a-z]|^)gpi([^a-z]|$)/g, '$1Π$2'],
        [/([^a-z]|^)gsi(gma)([^a-z]|$)?/g, '$1Σ$3'],
        [/([^a-z]|^)gph(i)?([^a-z]|$)/g, '$1Φ$3'],
        [/([^a-z]|^)gps(i)?([^a-z]|$)/g, '$1Ψ$3'],
        [/([^a-z]|^)gom(ega)?([^a-z]|$)/g, '$1Ω$3'],
        // Underscores
        [/_\(([^_]+)\)/g, function(match, p1) { return textsub(p1) }],
        [/_([^" ]+)/g, function(match, p1) { return textsub(p1) }],
        // Array elements
        [/\[([^\]\[]+)\]/g, function(match, p1) { return textsub(p1) }],
        // Removing
        [/[xπℝℕ\\∪∩\]\[ ()^/÷*×+=\d-]/g , ''],
    ]
    if(!removeUnallowed) replacements.pop()
    // Replacements
    for(var replacement of replacements)
        str = str.replace(replacement[0], replacement[1])
    return str
}

String.prototype.toLatinUppercase = function() {
    return this.replace(/[a-z]/g, function(match){return match.toUpperCase()})
}

function camelCase2readable(label) {
    var parsed = parseName(label, false)
    return parsed.charAt(0).toLatinUppercase() + parsed.slice(1).replace(/([A-Z])/g," $1")
}

function getRandomColor() {
    var clrs = '0123456789ABCDEF';
    var color = '#';
    for(var i = 0; i < 6; i++) {
        color += clrs[Math.floor(Math.random() * (16-5*(i%2==0)))];
    }
    return color;
}
