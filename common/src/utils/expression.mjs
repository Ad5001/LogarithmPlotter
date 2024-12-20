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

import { textsub, textsup } from "./subsup.mjs"

/**
 * Simplifies (mathematically) a mathematical expression.
 * @deprecated
 * @param {string} str - Expression to parse
 * @returns {string}
 */
export function simplifyExpression(str) {
    let replacements = [
        // Operations not done by parser.
        // [// Decomposition way 2
        //     /(^|[+-] |\()([-.\d\w]+) ([*/]) \((([-.\d\w] [*/] )?[-\d\w.]+) ([+\-]) (([-.\d\w] [*/] )?[\d\w.+]+)\)($| [+-]|\))/g,
        //     "$1$2 $3 $4 $6 $2 $3 $7$9"
        // ],
        // [ // Decomposition way 2
        //     /(^|[+-] |\()\((([-.\d\w] [*/] )?[-\d\w.]+) ([+\-]) (([-.\d\w] [*/] )?[\d\w.+]+)\) ([*/]) ([-.\d\w]+)($| [+-]|\))/g,
        //     "$1$2 $7 $8 $4 $5 $7 $8$9"
        // ],
        [ // Factorisation of π elements.
            /(([-\d\w.]+ [*/] )*)(pi|π)(( [/*] [-\d\w.]+)*) ([+-]) (([-\d\w.]+ [*/] )*)(pi|π)(( [/*] [-\d\w.]+)*)?/g,
            function(match, m1, n1, pi1, m2, ope2, n2, opeM, m3, n3, pi2, m4, ope4, n4) {
                //          g1, g2, g3 , g4, g5,   g6, g7,   g8, g9, g10, g11,g12 , g13
                // We don't care about mx & pix, ope2 & ope4 are either / or * for n2 & n4.
                // n1 & n3 are multiplied, opeM is the main operation (- or +).
                // Putting all n in form of number
                //n2 = n2 == undefined ? 1 : parseFloat(n)
                n1 = m1 === undefined ? 1 : eval(m1 + "1")
                n2 = m2 === undefined ? 1 : eval("1" + m2)
                n3 = m3 === undefined ? 1 : eval(m3 + "1")
                n4 = m4 === undefined ? 1 : eval("1" + m4)
                    //let [n1, n2, n3, n4] = [n1, n2, n3, n4].map(n => n == undefined ? 1 : parseFloat(n))
                    // Falling back to * in case it does not exist (the corresponding n would be 1)
                    [ope2, ope4] = [ope2, ope4].map(ope => ope === "/" ? "/" : "*")
                let coeff1 = n1 * n2
                let coeff2 = n3 * n4
                let coefficient = coeff1 + coeff2 - (opeM === "-" ? 2 * coeff2 : 0)

                return `${coefficient} * π`
            }
        ],
        [ // Removing parenthesis when content is only added from both sides.
            /(^|[+-] |\()\(([^)(]+)\)($| [+-]|\))/g,
            function(match, b4, middle, after) {
                return `${b4}${middle}${after}`
            }
        ],
        [ // Removing parenthesis when content is only multiplied.
            /(^|[*\/] |\()\(([^)(+-]+)\)($| [*\/+-]|\))/g,
            function(match, b4, middle, after) {
                return `${b4}${middle}${after}`
            }
        ],
        [ // Removing parenthesis when content is only multiplied.
            /(^|[*\/+-] |\()\(([^)(+-]+)\)($| [*\/]|\))/g,
            function(match, b4, middle, after) {
                return `${b4}${middle}${after}`
            }
        ],
        [// Simplification additions/subtractions.
            /(^|[^*\/] |\()([-.\d]+) [+-] (\([^)(]+\)|[^)(]+) [+-] ([-.\d]+)($| [^*\/]|\))/g,
            function(match, b4, n1, op1, middle, op2, n2, after) {
                let total
                if(op2 === "+") {
                    total = parseFloat(n1) + parseFloat(n2)
                } else {
                    total = parseFloat(n1) - parseFloat(n2)
                }
                return `${b4}${total} ${op1} ${middle}${after}`
            }
        ],
        [// Simplification multiplications/divisions.
            /([-.\d]+) [*\/] (\([^)(]+\)|[^)(+-]+) [*\/] ([-.\d]+)/g,
            function(match, n1, op1, middle, op2, n2) {
                if(parseInt(n1) === n1 && parseInt(n2) === n2 && op2 === "/" &&
                    (parseInt(n1) / parseInt(n2)) % 1 !== 0) {
                    // Non int result for int division.
                    return `(${n1} / ${n2}) ${op1} ${middle}`
                } else {
                    if(op2 === "*") {
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
                let str = middle
                // Replace all groups
                while(/\([^)(]+\)/g.test(str))
                    str = str.replace(/\([^)(]+\)/g, "")
                // There shouldn't be any more parenthesis
                // If there is, that means the 2 parenthesis are needed.
                if(!str.includes(")") && !str.includes("(")) {
                    return middle
                } else {
                    return `(${middle})`
                }

            }
        ]
        // Simple simplifications
        // [/(\s|^|\()0(\.0+)? \* (\([^)(]+\))/g, '$10'],
        // [/(\s|^|\()0(\.0+)? \* ([^)(+-]+)/g, '$10'],
        // [/(\([^)(]\)) \* 0(\.0+)?(\s|$|\))/g, '0$3'],
        // [/([^)(+-]) \* 0(\.0+)?(\s|$|\))/g, '0$3'],
        // [/(\s|^|\()1(\.0+)? [\*\/] /g, '$1'],
        // [/(\s|^|\()0(\.0+)? (\+|\-) /g, '$1'],
        // [/ [\*\/] 1(\.0+)?(\s|$|\))/g, '$3'],
        // [/ (\+|\-) 0(\.0+)?(\s|$|\))/g, '$3'],
        // [/(^| |\() /g, '$1'],
        // [/ ($|\))/g, '$1'],
    ]

    // Replacements
    let found
    do {
        found = false
        for(let replacement of replacements)
            while(replacement[0].test(str)) {
                found = true
                str = str.replace(replacement[0], replacement[1])
            }
    } while(found)
    return str
}


/**
 * Transforms a mathematical expression to make it readable by humans.
 * NOTE: Will break parsing of expression.
 * @deprecated
 * @param {string} str - Expression to parse.
 * @returns {string}
 */
export function makeExpressionReadable(str) {
    let replacements = [
        // letiables
        [/pi/g, "π"],
        [/Infinity/g, "∞"],
        [/inf/g, "∞"],
        // Other
        [/ \* /g, "×"],
        [/ \^ /g, "^"],
        [/\^\(([\d\w+-]+)\)/g, function(match, p1) {
            return textsup(p1)
        }],
        [/\^([\d\w+-]+)/g, function(match, p1) {
            return textsup(p1)
        }],
        [/_\(([\d\w+-]+)\)/g, function(match, p1) {
            return textsub(p1)
        }],
        [/_([\d\w+-]+)/g, function(match, p1) {
            return textsub(p1)
        }],
        [/\[([^\[\]]+)\]/g, function(match, p1) {
            return textsub(p1)
        }],
        [/(\d|\))×/g, "$1"],
        [/integral\((.+),\s?(.+),\s?["'](.+)["'],\s?["'](.+)["']\)/g, function(match, a, b, p1, body, p2, p3, by, p4) {
            if(a.length < b.length) {
                return `∫${textsub(a)}${textsup(b)} ${body} d${by}`
            } else {
                return `∫${textsup(b)}${textsub(a)} ${body} d${by}`
            }
        }],
        [/derivative\(?["'](.+)["'], ?["'](.+)["'], ?(.+)\)?/g, function(match, p1, body, p2, p3, by, p4, x) {
            return `d(${body.replace(new RegExp(by, "g"), "x")})/dx`
        }]
    ]

    // str = simplifyExpression(str)
    // Replacements
    for(let replacement of replacements)
        while(replacement[0].test(str))
            str = str.replace(replacement[0], replacement[1])
    return str
}

/** @type {[RegExp, string][]} */
const replacements = [
    // Greek letters
    [/(\W|^)al(pha)?(\W|$)/g, "$1α$3"],
    [/(\W|^)be(ta)?(\W|$)/g, "$1β$3"],
    [/(\W|^)ga(mma)?(\W|$)/g, "$1γ$3"],
    [/(\W|^)de(lta)?(\W|$)/g, "$1δ$3"],
    [/(\W|^)ep(silon)?(\W|$)/g, "$1ε$3"],
    [/(\W|^)ze(ta)?(\W|$)/g, "$1ζ$3"],
    [/(\W|^)et(a)?(\W|$)/g, "$1η$3"],
    [/(\W|^)th(eta)?(\W|$)/g, "$1θ$3"],
    [/(\W|^)io(ta)?(\W|$)/g, "$1ι$3"],
    [/(\W|^)ka(ppa)?(\W|$)/g, "$1κ$3"],
    [/(\W|^)la(mbda)?(\W|$)/g, "$1λ$3"],
    [/(\W|^)mu(\W|$)/g, "$1μ$2"],
    [/(\W|^)nu(\W|$)/g, "$1ν$2"],
    [/(\W|^)xi(\W|$)/g, "$1ξ$2"],
    [/(\W|^)rh(o)?(\W|$)/g, "$1ρ$3"],
    [/(\W|^)si(gma)?(\W|$)/g, "$1σ$3"],
    [/(\W|^)ta(u)?(\W|$)/g, "$1τ$3"],
    [/(\W|^)up(silon)?(\W|$)/g, "$1υ$3"],
    [/(\W|^)ph(i)?(\W|$)/g, "$1φ$3"],
    [/(\W|^)ch(i)?(\W|$)/g, "$1χ$3"],
    [/(\W|^)ps(i)?(\W|$)/g, "$1ψ$3"],
    [/(\W|^)om(ega)?(\W|$)/g, "$1ω$3"],
    // Capital greek letters
    [/(\W|^)gga(mma)?(\W|$)/g, "$1Γ$3"],
    [/(\W|^)gde(lta)?(\W|$)/g, "$1Δ$3"],
    [/(\W|^)gth(eta)?(\W|$)/g, "$1Θ$3"],
    [/(\W|^)gla(mbda)?(\W|$)/g, "$1Λ$3"],
    [/(\W|^)gxi(\W|$)/g, "$1Ξ$2"],
    [/(\W|^)gpi(\W|$)/g, "$1Π$2"],
    [/(\W|^)gsi(gma)?(\W|$)/g, "$1Σ$3"],
    [/(\W|^)gph(i)?(\W|$)/g, "$1Φ$3"],
    [/(\W|^)gps(i)?(\W|$)/g, "$1Ψ$3"],
    [/(\W|^)gom(ega)?(\W|$)/g, "$1Ω$3"],
    // Array elements
    [/\[([^\]\[]+)\]/g, function(match, p1) {
        return textsub(p1)
    }]
]

/**
 * Parses a variable name to make it readable by humans.
 *
 * @param {string} str - Variable name to parse
 * @param {boolean} removeUnallowed - Remove domain symbols disallowed in name.
 * @returns {string} - The parsed name
 */
export function parseName(str, removeUnallowed = true) {
    for(const replacement of replacements)
        str = str.replace(replacement[0], replacement[1])
    if(removeUnallowed)
        str = str.replace(/[xnπℝℕ\\∪∩\]\[ ()^/÷*×+=\d¹²³⁴⁵⁶⁷⁸⁹⁰-]/g, "")

    return str
}
