/**
 * Based on ndef.parser, by Raphael Graf <r@undefined.ch>
 * http://www.undefined.ch/mparser/index.html
 *
 * Ported to JavaScript and modified by Matthew Crumley <email@matthewcrumley.com>
 * https://silentmatt.com/javascript-expression-evaluator/
 *
 * Ported to QMLJS with modifications done accordingly done by Ad5001 <mail@ad5001.eu> (https://ad5001.eu)
 *
 * Copyright (c) 2015 Matthew Crumley, 2021-2024 Ad5001
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 * to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 * but don't feel like you have to let me know or ask permission.
 */

export const INUMBER = "INUMBER"
export const IOP1 = "IOP1"
export const IOP2 = "IOP2"
export const IOP3 = "IOP3"
export const IVAR = "IVAR"
export const IVARNAME = "IVARNAME"
export const IFUNCALL = "IFUNCALL"
export const IEXPR = "IEXPR"
export const IEXPREVAL = "IEXPREVAL"
export const IMEMBER = "IMEMBER"
export const IENDSTATEMENT = "IENDSTATEMENT"
export const IARRAY = "IARRAY"


export class Instruction {
    /**
     *
     * @param {string} type
     * @param {any} value
     */
    constructor(type, value) {
        this.type = type
        this.value = (value !== undefined && value !== null) ? value : 0
    }

    toString() {
        switch(this.type) {
            case INUMBER:
            case IOP1:
            case IOP2:
            case IOP3:
            case IVAR:
            case IVARNAME:
            case IENDSTATEMENT:
                return this.value
            case IFUNCALL:
                return "CALL " + this.value
            case IARRAY:
                return "ARRAY " + this.value
            case IMEMBER:
                return "." + this.value
            default:
                return "Invalid Instruction"
        }
    }
}

export function unaryInstruction(value) {
    return new Instruction(IOP1, value)
}

export function binaryInstruction(value) {
    return new Instruction(IOP2, value)
}

export function ternaryInstruction(value) {
    return new Instruction(IOP3, value)
}