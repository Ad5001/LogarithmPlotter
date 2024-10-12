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

/**
 * Mock for root element with width and height property.
 * setWidth, setHeight, getWidth, and getHeight methods can be spied on to check
 * when the accessor is called.
 */
export class MockRootElement {
    #width = 0
    #height = 0

    constructor() {}

    setWidth(width) {
        this.#width = width;
    }

    getWidth() {
        return this.#width
    }

    setHeight(height) {
        this.#height = height;
    }

    getHeight() {
        return this.#height
    }

    get width() {
        return this.getWidth()
    }

    set width(value) {
        this.setWidth(value)
    }

    get height() {
        return this.getHeight()
    }

    set height(value) {
        this.setHeight(value)
    }
}