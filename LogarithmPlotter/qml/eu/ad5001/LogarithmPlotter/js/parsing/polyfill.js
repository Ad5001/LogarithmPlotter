/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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

// Contains polyfill math functions used for reference.

.pragma library

function factorial(x) {
    if (x < 0) // Integrating by less than 0
        if(isFinite(n))
            return Infinity
        else
            throw new EvalError("Cannot calculate the factorial of -∞.")
    
    return gamma(x+1)
}

let GAMMA_G = 4.7421875
let GAMMA_P = [
    0.99999999999999709182,
    57.156235665862923517, -59.597960355475491248,
    14.136097974741747174, -0.49191381609762019978,
    0.33994649984811888699e-4,
    0.46523628927048575665e-4, -0.98374475304879564677e-4,
    0.15808870322491248884e-3, -0.21026444172410488319e-3,
    0.21743961811521264320e-3, -0.16431810653676389022e-3,
    0.84418223983852743293e-4, -0.26190838401581408670e-4,
    0.36899182659531622704e-5
]

function gamma(n) {
    if(n <= 0) // Integrating by less than 0
        if(isFinite(n))
            return Infinity
        else
            throw new EvalError("Cannot calculate Γ(-∞).")

    if(n >= 171.35)
        return Infinity // Would return more than 2^1024 - 1 (aka Number.INT_MAX)
    
    if(n === Math.round(n) && isFinite(n)) {
        // Calculating (n-1)!
        let res = n - 1
        
        for(let i = n - 2; i > 1; i++)
            res *= i

        if(res === 0)
            res = 1 // 0! is per definition 1

        return res
    }

    // Section below adapted function adapted from math.js
    if(n < 0.5)
        return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n))

    if(n > 85.0) { // Extended Stirling Approx
        let twoN = n * n
        let threeN = twoN * n
        let fourN = threeN * n
        let fiveN = fourN * n
        return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
        (1 + (1 / (12 * n)) + (1 / (288 * twoN)) - (139 / (51840 * threeN)) -
        (571 / (2488320 * fourN)) + (163879 / (209018880 * fiveN)) +
        (5246819 / (75246796800 * fiveN * n)))
    }

    --n
    let x = GAMMA_P[0]
    for (let i = 1; i < GAMMA_P.length; ++i) {
        x += GAMMA_P[i] / (n + i)
    }

    let t = n + GAMMA_G + 0.5
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x
}

function arrayMap(f, arr) {
    if (typeof f != 'function')
        throw new EvalError(qsTranslate('error', 'First argument to map is not a function.'))
    if (!Array.isArray(arr))
        throw new EvalError(qsTranslate('error', 'Second argument to map is not an array.'))
    return arr.map(f)
}

function arrayFold(f, init, arr) {
    if (typeof f != 'function')
        throw new EvalError(qsTranslate('error', 'First argument to fold is not a function.'))
    if (!Array.isArray(arr))
        throw new EvalError(qsTranslate('error', 'Second argument to fold is not an array.'))
    return arr.reduce(f, init)
}

function arrayFilter(f, arr) {
    if (typeof f != 'function')
        throw new EvalError(qsTranslate('error', 'First argument to filter is not a function.'))
    if (!Array.isArray(arr))
        throw new EvalError(qsTranslate('error', 'Second argument to filter is not an array.'))
    return arr.filter(f)
}

function arrayFilter(f, arr) {
    if (typeof f != 'function')
        throw new EvalError(qsTranslate('error', 'First argument to filter is not a function.'))
    if (!Array.isArray(arr))
        throw new EvalError(qsTranslate('error', 'Second argument to filter is not an array.'))
    return arr.filter(f)
}

function arrayJoin(sep, arr) {
    if (!Array.isArray(arr))
        throw new Error(qsTranslate('error', 'Second argument to join is not an array.'))
    return arr.join(sep)
}

function indexOf(target, s) {
    if (!(Array.isArray(s) || typeof s === 'string'))
        throw new Error(qsTranslate('error', 'Second argument to indexOf is not a string or array.'))
    return s.indexOf(target)
}
