/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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

import "reference.js" as Reference

const OPERATION_PRIORITY = {
    "+": 10, "-": 10,
    "*": 20, "/": 20
}

enum ASEType {
    UNKNOWN,
    VARIABLE,
    NUMBER,
    STRING,
    FUNCTION,
    CONSTANT,
    OPERATION
}

class AbstractSyntaxElement {
    type = ASEType.UNKNOWN;
    
    execute(variables) {
        return null;
    }
    simplify() {
        return this;
    }
    derivative(variable) {
        return this;
    }
    integrate(variable) {
        return this;
    }
    toEditableString() {
        return "";
    }
    toLatex() {
        return "";
    }
    isConstant() {
        return true;
    }
}

class Variable extends AbstractSyntaxElement {
    type = ASEType.VARIABLE;
    
    constructor(variableName) {
        this.varName = variableName;
    }
    
    execute(variables) {
        if(variables.includes(this.varName)) {
            return variables[this.varName];
        } else {
            throw new EvalError("Unknown variable " + this.varName + ".");
        }
    }
    
    derivative(variable) {
        if(variable == this.varName)
            return new NumberElement(1);
        return this;
    }
    
    integrate(variable) {
        if(variable == this.varName)
            // <var>^2/2
            return new Operation(new Operation(this, '^', new NumberElement(2)), '/', new NumberElement(2));
        return this;
    }
    
    toEditableString() {
        return this.varName;
    }
    
    toLatex() {
        return this.varName;
    }
    
    isConstant() {
        return false;
    }
}

class ArrayVariable extends Variable {
    constructor(arrayName, astIndex) {
        super(arrayName + "[" + astIndex.toEditableString() + "]")
        this.arrayName = arrayName;
        this.astIndex = astIndex;
    }
    
    execute(variables) {
        if(variables.includes(this.arrayName)) {
            let index = this.astIndex.execute(variables)
            if(index % 1 != 0 || index < 0) { // Float index.
                throw new EvalError("Non-integer array index " + index + " used as array index for " + this.varName + ".");
            } else if(variables[this.arrayName].length <= index) {
                throw new EvalError("Out-of-range index " + index + " used as array index for " + this.varName + ".");
            } else {
                return variables[this.arrayName][index];
            }
        } else {
            throw new EvalError("Unknown variable " + this.varName + ".");
        }
    
        toLatex() {
            return this.varName;
        }
    }
    
    simplify() {
        return new ArrayVariable(this.arrayName, this.astIndex.simplify());
    }
    
    toLatex() {
        return this.arrayName + '\\left[' + this.astIndex.toLatex() + '\\right]';
    }
    
    isConstant() {
        return false;
    }
}


class Constant extends Variable {
    type = ASEType.CONSTANT;
    
    constructor(constant) {
        super(constant)
    }
    
    execute(variables) {
        if(Reference.CONSTANTS_LIST.includes(this.varName)) {
            return Reference.CONSTANTS[this.varName];
        } else {
            throw new EvalError("Unknown constant " + this.varName + ".");
        }
    }
    
    derivative(variable) {
        if(variable == this.varName)
            return new NumberElement(0);
        return this;
    }
    
    integrate(variable) {
        return new Operation(new Variable(variable), '^', this);
    }
    
    toEditableString() {
        return this.varName;
    }
    
    toLatex() {
        return this.varName;
    }
    
    isConstant() {
        return true;
    }
}

class NumberElement extends AbstractSyntaxElement {
    type = ASEType.NUMBER;
    
    constructor(number) {
        this.value = parseFloat(number);
    }
    
    derivative(variable) {
        return new NumberElement(0);
    }
    
    integrate(variable) {
        return new Variable(variable);
    }
    
    toEditableString() {
        return this.value.toString();
    }
    
    toLatex() {
        return this.value.toString();
    }
    
    isConstant() {
        return true;
    }
}

class StringElement extends AbstractSyntaxElement {
    type = ASEType.STRING;
    
    constructor(str) {
        this.str = str;
    }
    
    execute(variables) {
        return this.str
    }
    
    derivative(variable) {
        return this;
    }
    
    integrate(variable) {
        return this;
    }
    
    toEditableString() {
        return '"' + this.str + '"';
    }
    
    toLatex() {
        return this.str;
    }
    
    isConstant() {
        return true;
    }
}

class FunctionElement extends AbstractSyntaxElement {
    type = ASEType.STRING;
    
    constructor(functionName, astArguments) {
        this.function = functionName;
        this.args = astArguments;
    }
    
    execute(variables) {
        if(Reference.FUNCTIONS_LIST.includes(this.function)) {
            let args = this.args.map(arg => arg.execute(variables));
            return Reference.FUNCTIONS[this.function](...args);
        } else {
            throw new EvalError("Unknown function " + this.function + ".");
        }
    }
    
    simplify() {
        let args = this.args.map(arg => arg.simplify(variables));
        let newFunc = new FunctionElement(this.function, args);
        let result;
        if(newFunc.isConstant() && (result = newFunc.execute({})) % 1 == 0) { // Simplification (e.g. cos(0), sin(π/2)...)
            return new NumberElement(result);
        } else {
            return newFunc;
        }
    }
    
    derivative(variable) {
        //TODO: Use DERIVATIVES elements in reference.
        return new FunctionElement("derivative", this.toEditableString());
    }
    
    integrate(variable) {
        //TODO: Use INTEGRALS elements in reference.
        return new FunctionElement("integrate", this.toEditableString());
    }
    
    toEditableString() {
        return this.function + '(' + this.args.map(arg => arg.toEditableString()).join(', ') + ')';
    }
    
    toLatex() {
        switch(this.function) {
            case "sqrt":
                return '\\sqrt{' + this.args.map(arg => arg.toLatex()).join(', ') + '}';
            case "abs":
                return '\\left|' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right|';
            case "floor":
                return '\\left\\lfloor' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right\\rfloor';
            case "ceil":
                return '\\left\\lceil' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right\\rceil';
            default:
                return '\\mathrm{' + this.function + '}\\left(' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right)';
        }
    }
    
    isConstant() {
        return this.args.every(x => x.isConstant());
    }
}

class Operation extends AbstractSyntaxElement {
    type = ASEType.OPERATION;
    
    constructor(leftHand, operation, rightHand) {
        this.leftHand = leftHand;
        this.ope = operation;
        this.rightHand = rightHand;
    }
    
    evaluate(variables) {
        switch(this.ope) {
            case '+':
                return this.leftHand.evaluate(variables) + this.rightHand.evaluate(variables);
            case '-':
                return this.leftHand.evaluate(variables) - this.rightHand.evaluate(variables);
            case '*':
                return this.leftHand.evaluate(variables) * this.rightHand.evaluate(variables);
            case '/':
                return this.leftHand.evaluate(variables) / this.rightHand.evaluate(variables);
            case '%':
                return this.leftHand.evaluate(variables) % this.rightHand.evaluate(variables);
            case '^':
                return Math.pow(this.leftHand.evaluate(variables), this.rightHand.evaluate(variables));
            default:
                throw new EvalError("Unknown operator " + ope + ".");
        }
    }
    
    simplify() {
        let leftHand = this.leftHand.simplify();
        let rightHand = this.rightHand.simplify();
        let newOpe = new Operation(leftHand, this.ope, rightHand);
        if(leftHand.type == ASEType.NUMBER && rightHand.type == ASEType.NUMBER && Math.abs(newOpe.value) < 1000000) {
            // Do not simplify to too big numbers
            switch(this.ope) {
                case '+':
                case '-':
                case '*':
                case '^':
                case '%':
                    return new NumberElement(newOpe.value);
                case '/':
                    if(result % 1 == 0)
                        return new NumberElement(newOpe.value);
                    else {
                        let simplified = simplifyFraction(leftHand.number, rightHand.number)
                        return new Operation(new NumberElement(simplified[0]), '/', new NumberElement(simplified[1]))
                    }
                    return this.leftHand.evaluate(variables) / this.rightHand.evaluate(variables);
                    return Math.pow(this.leftHand.evaluate(variables), this.rightHand.evaluate(variables));
                default:
                    throw new EvalError("Unknown operator " + ope + ".");
            }
        } else {
            // Simplifications of +- 0 or *1
            switch(this.ope) {
                case '+':
                case '-':
                    if(leftHand.type == ASEType.NUMBER && leftHand.value == 0)
                        return rightHand;
                    else if(rightHand.type == ASEType.NUMBER && rightHand.value == 0) {
                        if(ope == '-') leftHand.value = -leftHand.value;
                        return leftHand;
                    } else
                        return newOpe
                case '*':
                    if((leftHand.type == ASEType.NUMBER && leftHand.value == 0) || (rightHand.type == ASEType.NUMBER && rightHand.value == 0))
                        return new NumberElement(0);
                    else if(leftHand.type == ASEType.NUMBER && leftHand.value == 0)
                        return rightHand;
                    else if(rightHand.type == ASEType.NUMBER && rightHand.value == 1)
                        return leftHand;
                    else
                        return newOpe
                case '^':
                    if(rightHand.type == ASEType.NUMBER && rightHand.value == 0)
                        return new NumberElement(1);
                    else if(rightHand.type == ASEType.NUMBER && rightHand.value == 1)
                        return new NumberElement(leftHand.value);
                    else
                        return newOpe;
                case '/':
                    if(rightHand.type == ASEType.NUMBER && rightHand.value == 1)
                        return new NumberElement(leftHand.value);
                    else
                        return newOpe;
                case '%':
                    return newOpe;
                default:
                    throw new EvalError("Unknown operator " + ope + ".");
            }
        }
    }
    
    derivative(variable) {
        switch(this.ope) {
            case '-':
            case '+':
                return new Operation(this.leftHand.derivative(variable), this.ope, this.rightHand.derivative(variable));
            case '*':
                return new Operation(
                    new Operation(this.leftHand.derivative(variable), '*', this.rightHand),
                    '+',
                    new Operation(this.leftHand, '*', this.rightHand.derivative(variable))
                );
            case '/':
                return new Operation(
                    new Operation(this.leftHand.derivative(variable), '*', this.rightHand),
                    '+',
                    new Operation(this.leftHand, '*', this.rightHand.derivative(variable))
                );
            case '^':
            case '%':
                return new FunctionElement("integrate", this.toEditableString());
            default:
                throw new EvalError("Unknown operator " + ope + ".");
        }
    }
    
    integrate(variable) {
        switch(this.ope) {
            case '-':
            case '+':
                return new Operation(this.leftHand.integrate(variable), this.ope, this.rightHand.integrate(variable));
            case '*':
                return new Operation(
                    new Operation(this.leftHand.derivative(variable), '*', this.rightHand),
                    '+',
                    new Operation(this.leftHand, '*', this.rightHand.derivative(variable))
                );
            case '/':
                return new Operation(
                    new Operation(this.leftHand.derivative(variable), '*', this.rightHand),
                    '+',
                    new Operation(this.leftHand, '*', this.rightHand.derivative(variable))
                );
            case '^':
            case '%':
                return new FunctionElement("integrate", this.toEditableString());
            default:
                throw new EvalError("Unknown operator " + ope + ".");
        }
    }
    
    toEditableString() {
        let leftString = this.leftHand.toEditableString();
        let rightString = this.rightHand.toEditableString();
        if(this.leftHand.type == ASEType.OPERATION && OPERATION_PRIORITY[this.ope] > OPERATION_PRIORITY[this.leftHand.ope])
            leftString = "(" + leftString + ")"
        if(this.rightHand.type == ASEType.OPERATION && OPERATION_PRIORITY[this.ope] > OPERATION_PRIORITY[this.rightHand.ope])
            rightString = "(" + rightString + ")"
        return leftString + " " + this.ope + " " + rightString;
    }
    
    
    toLatex() {
        switch(this.ope) {
            case '-':
            case '+':
                return this.leftHand.toLatex() + this.ope + this.rightHand.toLatex();
            case '*':
                return this.leftHand.toLatex() + " \\times " + this.rightHand.toLatex();
            case '%':
                return this.leftHand.toLatex() + " \\mathrm{mod} " + this.rightHand.toLatex();
            case '/':
                return "\\frac{" + this.leftHand.toLatex() + "}{" + this.rightHand.toLatex() + "}"
            case '^':
                return this.leftHand.toLatex() + "^{" + this.rightHand.toLatex() + "}";
            default:
                throw new EvalError("Unknown operator " + ope + ".");
        }
        return this.leftHand.toLatex() + ope + this.rightHand.toLatex();
    }
    
    isConstant() {
        return this.leftHand.isConstant() && this.rightHand.isConstant();
    }
}

function simplifyFraction(num,den) {
    // More than gcd because it allows decimals fractions.
    let mult = 1;
    if(num%1 != 0)
        mult = Math.max(mult,Math.pow(10,num.toString().split('.')[1].length))
    else if(den%1 != 0)
        mult = Math.max(mult,Math.pow(10,den.toString().split('.')[1].length))
    let a = Math.abs(num*mult);
    let b = Math.abs(den*mult);
    let gcd = 0
    if (b > a) {let temp = a; a = b; b = temp;}
    while (gcd == 0) {
        if (b == 0) gcd = a;
        a %= b;
        if (a == 0) gcd = b;
        b %= a;
    }
    return [num*mult/gcd, den*mult/gcd]
}


