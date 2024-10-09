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

import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { babel } from "@rollup/plugin-babel"
import cleanup from "rollup-plugin-cleanup"

const src = "./src/index.mjs"
const dest = "../build/runtime-pyside6/LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter/js/index.mjs"

export default {
    input: src,
    output: {
        file: dest,
        compact: false,
        sourcemap: true,
        format: "es"
    },
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        cleanup({ comments: 'some' }),
        babel({
            babelHelpers: "bundled"
        }),
    ]
}

