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


export class MockCanvas {
    constructor(mockLoading = false) {
        this.mockLoading = mockLoading
    }

    getContext(context) {
        throw new Error("MockCanvas.getContext not implemented")
    }

    markDirty(rect) {
        this.requestPaint()
    }

    loadImageAsync(image) {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    /**
     * Image loading is instantaneous.
     * @param {string} image
     * @return {boolean}
     */
    isImageLoading(image) {
        return this.mockLoading
    }

    /**
     * Image loading is instantaneous.
     * @param {string} image
     * @return {boolean}
     */
    isImageLoaded(image) {
        return !this.mockLoading
    }

    requestPaint() {
    }
}