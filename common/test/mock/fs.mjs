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

import { readFileSync as readNode } from "node:fs"
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url))

export const HOME = "/home/user"
export const TMP = "/tmp"


const filesystem = {
    [`${HOME}/test1.lpf`]: readNode(__dirname + "/../../../ci/test1.lpf")
}


export function existsSync(file) {
    return filesystem[file] !== undefined
}

export function writeFileSync(file, data, encoding) {
    filesystem[file] = Buffer.from(data, encoding)
}

export function readFileSync(file, encoding) {
    return filesystem[file].toString(encoding)
}