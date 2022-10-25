/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2022  Ad5001
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

.pragma library

.import "reference.js" as Reference
.import "../math/latex.js" as Latex

const DERIVATION_PRECISION = 0.01
const ZERO_EPISLON = 5e-11 // Number under which a variable is considered 0 when dealing with floating point rounding errors.

const BINARY_OPERATION_PRIORITY = Reference.BINARY_OPERATION_PRIORITY

enum ASEType {
    UNKNOWN,
    VARIABLE,
    ARRAY,
    PROPERTY,
    NUMBER,
    STRING,
    FUNCTION,
    CONSTANT,
    UNARY_OPERATION,
    BINARY_OPERATION,
    TERTIARY_OPERATION,
    FLAT_PLUS_OPERATIONS
}

/**
 * Base class for abstract syntax elements.
 */
class AbstractSyntaxElement {
    type = ASEType.UNKNOWN
    
    /**
     * Returns the computed number of value of the element
     * depending on the given variables.
     * 
     * @param {Dictionary} variables - variable name/value dictionary representing the variables.
     * @throws {EvalError} When the expression is invalid or that variables are missing.
     * @returns {number}
     */
    execute(variables) {
        return null
    }
    /**
     * Simplifies to a maximum the current expression.
     * 
     * @param {array} variables
     * @returns {AbstractSyntaxElement}
     */
    simplify() {
        throw new Error(`Function 'simplify' of ${this.type} not implemented.`)
    }
    /**
     * Substitutes the given variable by another AbstractSyntaxElement.
     * 
     * @param {string} variable
     * @param {AbstractSyntaxElement} substitution
     * @returns {AbstractSyntaxElement}
     */
    substitute(variable, substitution) {
        throw new Error(`Function 'substitute' of ${this.type} not implemented.`)
    }
    /**
     * Returns the derivation of this element depending on a variable.
     * WARNING: Might -or might not- clone the element.
     * 
     * @param {string} variable
     * @returns {AbstractSyntaxElement}
     */
    derivation(variable) {
        throw new Error(`Function 'derivation' of ${this.type} not implemented.`)
    }
    /**
     * Returns the integral of this element depending on a variable.
     * WARNING: Might -or might not- clone the element.
     * 
     * @param {string} variable
     * @returns {AbstractSyntaxElement}
     */
    integral(variable) {
        throw new Error(`Function 'integral' of ${this.type} not implemented.`)
    }
    /**
     * Returns the string that can be reparsed by the parser and be edited by the user.
     * 
     * @returns {string}
     */
    toEditableString() {
        throw new Error(`Function 'toEditableString' of ${this.type} not implemented.`)
    }
    /**
     * Returns the LaTeX string of this item.
     * 
     * @returns {string}
     */
    toLatex() {
        throw new Error(`Function 'toLatex' of ${this.type} not implemented.`)
    }
    /**
     * Checks whether the current item is constant or depends on variables.
     * 
     * @returns {bool}
     */
    isConstant() {
        throw new Error(`Function 'isConstant' of ${this.type} not implemented.`)
    }
}

class NumberElement extends AbstractSyntaxElement {
    type = ASEType.NUMBER
    
    constructor(number) {
        this.value = parseFloat(number)
    }
    
    execute(variables) {
        return this.value
    }
    
    simplify() {
        return this
    }
    
    subtitute(variable, substitution) {
        return this
    }
    
    derivation(variable) {
        return new NumberElement(0)
    }
    
    integral(variable) {
        let v = new Variable(variable)
        return this.value == 1 ? v : new BinaryOperation(this, '*', v)
    }
    
    toEditableString() {
        return this.value.toString()
    }
    
    toLatex() {
        return this.value == Infinity ? "\\infty" : this.value.toString()
    }
    
    isConstant() {
        return true
    }
}

class StringElement extends AbstractSyntaxElement {
    type = ASEType.STRING
    
    constructor(str) {
        this.str = str
    }
    
    execute(variables) {
        return this.str
    }
    
    simplify() {
        return this
    }
    
    subtitute(variable, substitution) {
        return this
    }
    
    derivation(variable) {
        return this
    }
    
    integral(variable) {
        return this
    }
    
    toEditableString() {
        return '"' + this.str + '"'
    }
    
    toLatex() {
        return this.str
    }
    
    isConstant() {
        return true
    }
}

class Variable extends AbstractSyntaxElement {
    type = ASEType.VARIABLE
    
    constructor(variableName) {
        this.variableName = variableName
    }
    
    simplify() {
        return this
    }
    
    subtitute(variable, substitution) {
        return variable == this.variableName ? substitution : this
    }
    
    execute(variables) {
        if(this.variableName in variables)
            return variables[this.variableName]
        else
            throw new EvalError(`Unknown variable ${this.variableName}.`)
    }
    
    derivation(variable) {
        return new NumberElement(variable == this.variableName ? 1 : 0)
    }
    
    integral(variable) {
        let op = new BinaryOperation(this, '*', new Variable(variable))
        if(variable == this.variableName)
            // <var>^2/2
            op = new BinaryOperation(new BinaryOperation(this, '^', new NumberElement(2)), '/', new NumberElement(2))
        return op
    }
    
    toEditableString() {
        return this.variableName
    }
    
    toLatex() {
        return Latex.variable(this.variableName)
    }
    
    isConstant() {
        return false
    }
}

class Constant extends Variable {
    type = ASEType.CONSTANT
    
    constructor(constant) {
        super(constant)
    }
    
    execute(variables) {
        if(Reference.CONSTANTS_LIST.includes(this.variableName))
            return Reference.CONSTANTS[this.variableName]
        else
            throw new EvalError(`Unknown constant ${this.variableName}.`)
    }
    
    isConstant() {
        return true
    }
}

class ArrayElement extends AbstractSyntaxElement {
    type = ASEType.ARRAY
    
    constructor(astArrayElement, astIndex) {
        this.arrayFormula = astArrayElement.toEditableString()
        this.astArrayElement = astArrayElement
        this.astIndex = astIndex
    }
    
    execute(variables) {
        let elem = this.astArrayElement.execute(variables)
        let index = this.astIndex.execute(variables)
        if(Array.isArray(elem)) {
            if(index % 1 != 0 || index < 0) { // Float index.
                throw new EvalError(`Non-integer array index ${index} used for ${this.arrayFormula}.`)
            } else if(elem.length <= index) {
                throw new EvalError(`Out-of-range array index ${index} used for ${this.arrayFormula} (has ${elem.length} elements).`)
            } else {
                return elem[index]
            }
        } else
            throw new EvalError(`${this.arrayFormula} is not an array.`)
    }
    
    simplify() {
        return new ArrayElement(
            this.astArrayElement.simplify(),
            this.astIndex.simplify()
        )
    }
    
    substitute(variable, substitution) {
        return new ArrayElement(
            this.astArrayElement.substitute(variable, substitution),
            this.astIndex.substitute(variable, substitution)
        )
    }
    
    derivation(variable) {
        return new NumberElement(0)
        // TODO: Implement derivation depending on value.
    }
    
    integral(variable) {
        return new BinaryOperation(this,'*',new Variable(variable))
        // TODO: Implement integral depending on value.
    }
    
    toEditableString() {
        return `${this.arrayFormula}[${this.astIndex.toEditableString()}]`
    }
    
    toLatex() {
        return `${this.astArrayElement.toLatex()}\\left[${this.astIndex.toLatex()}\\right]`
    }
    
    isConstant() {
        return this.astArrayElement.isConstant() && this.astIndex.isConstant()
    }
}

class PropertyElement extends AbstractSyntaxElement {
    type = ASEType.PROPERTY
    
    constructor(astObjectElement, propertyName) {
        this.astObjectFormula = astObjectElement.toEditableString()
        this.astObjectElement = astObjectElement
        this.propertyName = propertyName
    }
    
    execute(variables) {
        let elem = this.astObjectElement.execute(variables)
        if(typeof elem == 'object') {
            if(this.propertyName in elem)
                return elem[propertyName]
            else
                throw new EvalError(`Property ${propertyName} of ${this.astObjectFormula} does not exist.`)
        } else
            throw new EvalError(`${this.astObjectFormula} is not an object.`)
    }
    
    simplify() {
        return new PropertyElement(this.astObjectElement.simplify(), this.propertyName)
    }
    
    substitute(variable, substitution) {
        return new PropertyElement(
            this.astObjectElement.substitute(variable, substitution), this.propertyName
        )
    }
    
    derivation(variable) {
        return new NumberElement(0)
        // TODO: Implement derivation depending on value.
    }
    
    integral(variable) {
        return new BinaryOperation(this,'*',new Variable(variable))
        // TODO: Implement integral depending on value.
    }
    
    toEditableString() {
        return `${this.astObjectFormula}.${this.propertyName}`
    }
    
    toLatex() {
        return `${this.astObjectFormula.toLatex()}.${this.propertyName}`
    }
    
    isConstant() {
        return this.astObjectFormula.isConstant()
    }
}

/**
 * Base class for all functions EXCEPT integral and derivation (see subclasses)
 * TODO: Implement function name as elements to have property functions.
 **/
class FunctionElement extends AbstractSyntaxElement {
    type = ASEType.FUNCTION
    
    constructor(functionName, astArguments) {
        this.function = functionName
        this.args = astArguments
    }
    
    execute(variables) {
        if(Reference.FUNCTIONS_LIST.includes(this.function)) {
            let args = this.args.map(arg => arg.execute(variables))
            return Reference.FUNCTIONS[this.function](...args)
        } else
            throw new EvalError(`Unknown function ${this.function}.`)
    }
    
    simplify() {
        let args = this.args.map(arg => arg.simplify(variables))
        let newFunc = new FunctionElement(this.function, args)
        let result = newFunc
        if(newFunc.isConstant() && (result = newFunc.execute({})) % 1 < ZERO_EPISLON)
            // Prevent simplification of non constants (e.g. non constant cos, sin...)
            newFunc = new NumberElement(result)
        return newFunc
    }
    
    substitute(variable, substitution) {
        return new FunctionElement(this.functionName, this.args.map(arg => arg.substitute(variable, substitution)))
    }
    
    derivation(variable) {
        //TODO: Use DERIVATIVES elements in reference.
        return new DerivationElement([this, new Variable(variable)])
    }
    
    integral(variable) {
        //TODO: Use INTEGRALS elements in reference.
        return new IntegralElement([this, new Variable(variable)])
    }
    
    toEditableString() {
        return `${this.function}(${this.args.map(arg => arg.toEditableString()).join(', ')})`
    }
    
    toLatex() {
        switch(this.function) {
            case "sqrt":
                return '\\sqrt{' + this.args.map(arg => arg.toLatex()).join(', ') + '}'
            case "abs":
                return '\\left|' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right|'
            case "floor":
                return '\\left\\lfloor' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right\\rfloor'
            case "ceil":
                return '\\left\\lceil' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right\\rceil'
            default:
                return '\\mathrm{' + this.function + '}\\left(' + this.args.map(arg => arg.toLatex()).join(', ') + '\\right)'
        }
    }
    
    isConstant() {
        return this.args.every(x => x.isConstant())
    }
}

/**
 * Signatures supported for derivation:
 * - derivation(f,var)
 **/
class DerivationElement extends FunctionElement {
    
    constructor(astArguments) {
        super("derivation", astArguments)
        this.args = astArguments
        // Check syntax
        if(this.args.length != 2)
            throw new Error(`Function 'derivation' can only have 2 arguments. ${this.args.length} provided.`)
        if(!(this.args[1] instanceof Variable))
            throw new Error(`Argument 1 of function 'derivation' must be a variable.`)
    }
    
    execute(variables) {
        // Calculate derivation.
        // TODO: Do derivation simplification.
        let d = this.args[1].variableName // derivation variable name.
        if(d in variables) {
            let plus = this.args[0].execute(Object.assign(
                {[d]: variables[d]+DERIVATION_PRECISION/2}, variables
            ))
            let min = this.args[0].execute(Object.assign(
                {[d]: variables[d]-DERIVATION_PRECISION/2}, variables
            ))
            return (plus-min)/DERIVATION_PRECISION
        } else
            throw new EvalError(`Undefined variable ${d}.`)
            
    }
    
    simplify() {
        return this.args[0].simplify().derivation(this.args[1].variableName).simplify()
    }
    
    substitute(variable, substitution) {
        if(variable == this.args[1].variableName) {
            // Simplifu, 
            return this.simplify().substitute(variable, substitution)
        } else
            return new DerivationElement([this.args[0].substitute(variable, substitution), this.args[1]])
    }
    
    integral(variable) {
        // Check if we're integrating and derivating by the same variable
        return variable == this.args[1].variableName ? this.args[1] : super(variable)
    }
    
    toLatex() {
        return `\\frac{d(${this.args[0].toLatex()})}{d${this.args[1].toLatex()}}`
    }
    
    isConstant() {
        return this.args[0].isConstant()
    }
}

/**
 * Signatures supported for integrals:
 * - integral(f,var)
 * - integral(a,b,f,var)
 **/
class IntegralElement extends FunctionElement {
    
    constructor(astArguments) {
        super("integral", astArguments)
        this.args = astArguments
        // Check syntax
        if(![2,4].includes(this.args.length))
            throw new Error(`Function 'integral' can only have 2 or 4 arguments. ${this.args.length} provided.`)
        if(!(this.args[this.args.length-1] instanceof Variable))
            // Last argument must always be a variable
            throw new Error(`Argument ${this.args.length} of function 'integral' must be a variable.`)
        // Setting shortcuts so that we don't have to if every time.
        if(this.args.length == 2) {
            this.a = new NumberElement(0)
            this.b = new Variable('x')
            this.f = args[0]
            this.d = args[1]
        } else {
            [this.a, this.b, this.f, this.d] = args
        }
    }
    
    execute(variables) {
        // Calculate integral.
        // Using Simpsons rule
        // https://en.wikipedia.org/wiki/Simpson%27s_rule
        let a = this.a.execute(variables)
        let b
        try { 
            b = this.b.execute(variables)
        } catch(e) {
            if(this.args.length == 2)
                throw new EvalError(`Cannot integrate ${this.args[0].toEditableString()}: no limits were defined and x is not a variable.`)
            else
                throw e
        }
        let f = this.f.execute
        let d = this.d.variableName
            
        // (b-a)/6*(f(a)+4*f((a+b)/2)+f(b))
        let f_a = f(Object.assign({[d]: a}, variables))
        let f_b = f(Object.assign({[d]: b}, variables))
        let f_m = f(Object.assign({[d]: (a+b)/2}, variables))
        return (b-a)/6*(f_a+4*f_m+f_b)
    }
    
    simplify() {
        // TODO: When full derivation and integrals are implemented, use dedicated functions for simplification.
        let func = this.f.simplify(variables)
        let newElem
        if(func.isConstant() && this.args.length == 4)
            // Simplify integral.
            newElem = new BinaryOperation(
                new BinaryOperation(this.b, '-', this.a).simplify(),
                '*',
                func
            ).simplify()
        else {
            let integrated = this.func.integral(this.d.variableName)
            newElem = new BinaryOperation(
                integrated.substitute(this.d.variableName, this.b),
                '-',
                integrated.substitute(this.d.variableName, this.a)
            ).simplify()
            //newElem = new IntegralElement(this.args.length == 4 ?
            //    [this.a.simplify(), this.b.simplify(), func, this.d] :
            //    [func, this.d]
            //)
        }
        return newElem
    }
    
    substitute(variable, substitution) {
        if(variable == this.args[1].variableName) {
            // Simplify
            return this.simplify().substitute(variable, substitution)
        } else
            return new IntegralElement(this.args.length == 4 ?
                [this.a.substitute(variable, substitution), this.b.simplify(variable, substitution), 
                                       this.f.substitute(variable, substitution), this.d] :
                [this.f.substitute(variable, substitution), this.d])
    }
    
    derivation(variable) {
        // Check if we're integrating and derivating by the same variable
        return variable == this.args[1].variableName ? this.args[1] : super(variable)
    }
    
    toLatex() {
        let limits = this.args.length == 2 ? '' :
                `\\limits_{${this.b.toLatex()}}^{${this.b.toLatex()}}`
        return `\\int${limits}{${this.f.toLatex()}}{d${this.d.toLatex()}}`
    }
    
    isConstant() {
        return this.a.isConstant() && this.b.isConstant() && this.f.isConstant()
    }
}


class UnaryOperation extends AbstractSyntaxElement {}

class BinaryOperation extends AbstractSyntaxElement {
    type = ASEType.BINARY_OPERATION
    
    constructor(leftHand, operation, rightHand) {
        this.leftHand = leftHand
        this.ope = operation
        this.rightHand = rightHand
    }
    
    evaluate(variables) {
        switch(this.ope) {
            case '+':
                return this.leftHand.evaluate(variables) + this.rightHand.evaluate(variables)
            case '-':
                return this.leftHand.evaluate(variables) - this.rightHand.evaluate(variables)
            case '*':
                return this.leftHand.evaluate(variables) * this.rightHand.evaluate(variables)
            case '/':
                return this.leftHand.evaluate(variables) / this.rightHand.evaluate(variables)
            case '%':
                return this.leftHand.evaluate(variables) % this.rightHand.evaluate(variables)
            case '^':
                return Math.pow(this.leftHand.evaluate(variables), this.rightHand.evaluate(variables))
            default:
                throw new EvalError("Unknown operator " + ope + ".")
        }
    }
    
    simplify() {
        let leftHand = this.leftHand.simplify()
        let rightHand = this.rightHand.simplify()
        let newOpe = new BinaryOperation(leftHand, this.ope, rightHand)
        let result
        let tmpResult
        if(newOpe.isConstant() && (tmpResult = Math.abs(newOpe.execute({})) < 1000000)) {
            // Do not simplify to too big numbers
            switch(this.ope) {
                case '+':
                case '-':
                case '*':
                case '^':
                case '%':
                    result = new NumberElement(tmpResult)
                    break
                case '/':
                    if(tmpResult % 1 == 0)
                        result = new NumberElement(tmpResult)
                    else {
                        let simplified = simplifyFraction(leftHand.number, rightHand.number)
                        result = new BinaryOperation(new NumberElement(simplified[0]), '/', new NumberElement(simplified[1]))
                    }
                    break
                default:
                    throw new EvalError("Unknown operator " + ope + ".")
            }
        } else {
            // Simplifications of +- 0 or *1
            switch(this.ope) {
                case '+':
                case '-':
                    if(leftHand instanceof NumberElement && leftHand.value == 0)
                        return rightHand
                    else if(rightHand instanceof NumberElement && rightHand.value == 0) {
                        if(ope == '-') leftHand.value = -leftHand.value
                        result = leftHand
                    } else
                        result = newOpe
                    break
                case '*':
                    if((leftHand instanceof NumberElement && leftHand.value == 0) || (rightHand instanceof NumberElement && rightHand.value == 0))
                        result = new NumberElement(0)
                    else if(leftHand instanceof NumberElement && leftHand.value == 1)
                        result = rightHand
                    else if(rightHand instanceof NumberElement && rightHand.value == 1)
                        result = leftHand
                    else
                        result = newOpe
                    break
                case '^':
                    if(rightHand instanceof NumberElement && rightHand.value == 0)
                        result = new NumberElement(1)
                    else if(rightHand instanceof NumberElement && rightHand.value == 1)
                        result = new NumberElement(leftHand.value)
                    else
                        result = newOpe
                    break
                case '/':
                    if(rightHand instanceof NumberElement && rightHand.value == 1)
                        result = new NumberElement(leftHand.value)
                    else
                        result = newOpe
                    break
                case '%':
                    result = newOpe
                    break
                default:
                    throw new EvalError("Unknown operator " + ope + ".")
            }
        }
        // TODO: Check for all nearby operations simplifications
        return result
    }
    
    substitute(variable, substitution) {
        return new BinaryOperation(
            this.leftHand.substitute(variable, substitution),
            this.ope,
            this.rightHand.substitute(variable, substitution)
        )
    }
    
    derivation(variable) {
        switch(this.ope) {
            case '-':
            case '+':
                return new BinaryOperation(this.leftHand.derivation(variable), this.ope, this.rightHand.derivation(variable))
            case '*':
                // (f*g)' = f'g + fg'
                return new BinaryOperation(
                    new BinaryOperation(this.leftHand, '*', this.rightHand.derivation(variable)),
                    '+',
                    new BinaryOperation(this.leftHand.derivation(variable), '*', this.rightHand),
                )
            case '/':
                // (f/g)' = (f'g - fg')/g^2
                return new BinaryOperation(
                    new BinaryOperation(
                        new BinaryOperation(this.leftHand, '*', this.rightHand.derivation(variable)),
                        '-',
                        new BinaryOperation(this.leftHand.derivation(variable), '*', this.rightHand),
                    ),
                    '/',
                    new BinaryOperation(this.rightHand, '^', new NumberElement(2))
                )
            case '^':
                // f^g = e^gln(f) => (e^gln(f))' = (gln(f))'e^gln(f)
                // = (gln'(f) + g'ln(f))e^gln(f)
                // = (gf'/f + g'ln(f))e^gln(f)
                // Bit of a pain to implement, not really worth in terms of 'simplification' for synthesis.
                // So I don't use it here.
            case '%':
                return new DerivationElement([this, new Variable(variable)])
            default:
                throw new EvalError(`Unknown operator ${ope}.`)
        }
    }
    
    integral(variable) {
        switch(this.ope) {
            case '-':
            case '+':
                return new BinaryOperation(this.leftHand.integral(variable), this.ope, this.rightHand.integral(variable))
            case '*':
                return new BinaryOperation(
                    new BinaryOperation(this.leftHand.derivation(variable), '*', this.rightHand),
                    '+',
                    new BinaryOperation(this.leftHand, '*', this.rightHand.derivation(variable))
                )
            case '/':
                return new BinaryOperation(
                    new BinaryOperation(this.leftHand.derivation(variable), '*', this.rightHand),
                    '+',
                    new BinaryOperation(this.leftHand, '*', this.rightHand.derivation(variable))
                )
            case '^':
            case '%':
                return new IntegralElement("integral", this.toEditableString())
            default:
                throw new EvalError(`Unknown operator ${ope}.`)
        }
    }
    
    toEditableString() {
        let leftString = this.leftHand.toEditableString()
        let rightString = this.rightHand.toEditableString()
        if(this.leftHand.type == ASEType.BINARY_OPERATION && 
            BINARY_OPERATION_PRIORITY[this.ope] > BINARY_OPERATION_PRIORITY[this.leftHand.ope])
            leftString = "(" + leftString + ")"
        if(this.rightHand.type == ASEType.BINARY_OPERATION && 
            BINARY_OPERATION_PRIORITY[this.ope] > BINARY_OPERATION_PRIORITY[this.rightHand.ope])
            rightString = "(" + rightString + ")"
        return `${leftString} ${this.ope} ${rightString}`
    }
    
    
    toLatex() {
        switch(this.ope) {
            case '-':
            case '+':
                return this.leftHand.toLatex() + this.ope + this.rightHand.toLatex()
            case '*':
                return this.leftHand.toLatex() + " \\times " + this.rightHand.toLatex()
            case '%':
                return this.leftHand.toLatex() + " \\mathrm{mod} " + this.rightHand.toLatex()
            case '/':
                return "\\frac{" + this.leftHand.toLatex() + "}{" + this.rightHand.toLatex() + "}"
            case '^':
                return this.leftHand.toLatex() + "^{" + this.rightHand.toLatex() + "}"
            default:
                throw new EvalError("Unknown operator " + ope + ".")
        }
        return this.leftHand.toLatex() + ope + this.rightHand.toLatex()
    }
    
    isConstant() {
        return this.leftHand.isConstant() && this.rightHand.isConstant()
    }
}

/**
 * This class is used to contain chains of + and - operations for simplification purposes
 */
class FlatPlusOperations extends AbstractSyntaxElement {
    type = ASEType.FLAT_PLUS_OPERATIONS
    
    constructor(elements, operators) {
        if(this.operators.some(ope => ope != '+' && ope != '-'))
            throw new Error(`Unallowed operators in flat plus operation: ${this.operators.filter(ope => ope != '+' && ope != '-').join(',')}.`)
        if(this.operators.length != this.elements.length+1)
            throw new Error(`Unmatched elements and error count.`)
        this.elements = elements
        this.operators = operators
    }
    
    
    evaluate(variables) {
        let result = this.elements[0].evaluate(variables);
        for(let i = 0; i < this.operators.length; i++)
            if(this.operators[i] == '+')
                result += this.elements[i+1].evaluate(variables)
            else
                result -= this.elements[i+1].evaluate(variables)
        return result
    }
    
    simplify() {
        let elements = this.elements.map(elem => elem.simplify())
        let units = 0
        let variablesNoms = {} // Polynom elements for each variable.
        let others = {'-': [], '+': []}
        let nome
        for(let i = 0; i < elements.length; i++)
            if(elements[i].isConstant())
                if(i == 0 || this.operators[i-1] == '+')
                    units += elements[i].evaluate({})
                else
                    units -= elements[i].evaluate({})
            else if((nome = isNome(elements[i]))[0]) {
                let [nom, variable, power] = nome
                if(!(variable in variablesNoms))
                    variablesNoms[variable] = {}
                if(variablesNoms[variable][power] == undefined)
                    variablesNoms[variable][power] = 0
                if(i == 0 || this.operators[i-1] == '+')
                    variablesNoms[variable][power]++
                else
                    variablesNoms[varName][power]--
            } else if(elements[i] instanceof BinaryOperation && elements[i].ope == '*' &&
            elements[i].leftHand.isConstant() && (nome = isNome(elements[i].rightHand instanceof Variable))[0]) {
                // Simple constant by variable product
                let number = elements[i].leftHand.evaluate({})
                let [nom, variable, power] = nome
                // Add to counter
                if(!(variable in variablesNoms))
                    variablesNoms[variable] = {}
                if(variablesNoms[variable][power] == undefined)
                    variablesNoms[variable][power] = 0
                if(i == 0 || this.operators[i-1] == '+')
                    variablesNoms[variable][power] += number
                else
                    variablesNoms[variable][power] -= number
            } else if(elements[i] instanceof BinaryOperation && elements[i].ope == '*' && 
            (nome = isNome(elements[i].leftHand))[0] && elements[i].rightHand.isConstant()) {
                // Simple constant by variable product
                let number = elements[i].rightHand.evaluate({})
                let [nom, variable, power] = nome
                // Add to counter
                if(!(variable in variablesNoms))
                    variablesNoms[variable] = {}
                if(variablesNoms[variable][power] == undefined)
                    variablesNoms[variable][power] = 0
                if(i == 0 || this.operators[i-1] == '+')
                    variablesNoms[variable][power] += number
                else
                    variablesNoms[variable][power] -= number
            } else if(elements[i] instanceof BinaryOperation && elements[i].ope == '/' && 
            (nome = isNome(elements[i].leftHand))[0] && elements[i].rightHand.isConstant()) {
                // Simple constant by variable divided by constant
                let number = elements[i].rightHand.evaluate({})
                let [nom, variable, power] = nome
                // Register in counter
                if(!(variable in variablesNoms))
                    variablesNoms[variable] = {}
                if(variablesNoms[variable][power] == undefined)
                    variablesNoms[variable][power] = 0
                // Division so we remove from count
                if(i == 0 || this.operators[i-1] == '+')
                    variablesNoms[variable][power] -= number.evaluate({})
                else
                    variablesNoms[variable][power] += number.evaluate({})
            } else {
                let sign = this.operators[i-1]
                let element = elements[i]
                if(element instanceof UnaryOperation && element.ope == '-') {
                    // Negation, inverse signs
                    sign = sign == '+' ? '-' : '+'
                    element = element.element
                }
                others[sign] = element
            }
        // Creating new flat operation.
        let newElements = [new NumberElement(units)] // Yes, I know units should be in last, but this simplifies the implementation a lot.
        let newOperators = []
        for(let variable in variablesNoms)
            for(let power in Object.keys(variablesNoms[variable]).reverse()) {
                power = parseFloat(power)
                let times = variablesNoms[variable][nom]
                if(power < 0) {
                    power = -power
                    newOperators.push('-')
                } else
                    newOperators.push('+')
                newElements.push(new Variable(variable))
                if(power != 1)
                    newElements.push(new BinaryOperation(newElements.pop(), '^', new NumberElement(power)))
                if(times != 1)
                    newElements.push(new BinaryOperation(new NumberElement(times), '*', newElements.pop()))
            }
        for(let sign in others)
            for(let element of others[sign]) {
                newOperators.push(sign)
                newElements.push(element)
            }
        return new FlatPlusOperations(newElements, newOperators)
    }
    
    derivation(variable) {
        return new FlatPlusOperations(this.elements.map(elem => elem.derivation(variable)), this.operators)
    }
    
    integral(variable) {
        return new FlatPlusOperations(this.elements.map(elem => elem.integral(variable)), this.operators)
    }
    
    toEditableString() {
        let ret = this.elements[0].toEditableString()
        for(let i = 0; i < this.operators.length; i++) {
            ret += ' ' + this.operators[i] + ' '
            if(this.elements[i+1] instanceof BinaryOperation && Reference.BINARY_OPERATION_PRIORITY[this.elements[i+1].ope] < Reference.BINARY_OPERATION_PRIORITY['+'])
                ret += `(${this.elements[i+1].toEditableString()})`
            else
                ret += this.elements[i+1].toEditableString()
        }
        return ret
    }
    
    toLatex() {
        let ret = this.elements[0].toLatex()
        for(let i = 0; i < this.operators.length; i++) {
            ret += ' ' + this.operators[i] + ' '
            if(this.elements[i+1] instanceof BinaryOperation && Reference.BINARY_OPERATION_PRIORITY[this.elements[i+1].ope] < Reference.BINARY_OPERATION_PRIORITY['+'])
                ret += `\\left(${this.elements[i+1].toLatex()}\\right)`
            else
                ret += this.elements[i+1].toLatex()
        }
        return ret
    }
    
    isConstant() {
        return this.elements.every(elem => elem.isConstant())
    }
}

function simplifyFraction(num,den) {
    // More than gcd because it allows decimals fractions.
    let mult = 1
    if(num%1 != 0)
        mult = Math.max(mult,Math.pow(10,num.toString().split('.')[1].length))
    else if(den%1 != 0)
        mult = Math.max(mult,Math.pow(10,den.toString().split('.')[1].length))
    let a = Math.abs(num*mult)
    let b = Math.abs(den*mult)
    let gcd = 0
    if (b > a) {let temp = a; a = b; b = temp;}
    while (gcd == 0) {
        if (b == 0) gcd = a
        a %= b
        if (a == 0) gcd = b
        b %= a
    }
    return [num*mult/gcd, den*mult/gcd]
}

function isNome(element) {
    // Checks if the elements is a part of a polynomial, which variable, and to which degree
    if(element instanceof Variable)
        return [true, element.variableName, 1]
    else if(element instanceof BinaryOperation && element.ope == '^' && element.leftHand instanceof Variable && element.rightHand.isConstant())
        return [true, element.leftHand.variableName, element.rightHand.evaluate({})]
    else
        return [false, '', 0]
}
    

class Negation extends AbstractSyntaxElement {
    type = ASEType.NEGATION
    
    constructor(variableName) {
        this.variableName = variableName
    }
    
    execute(variables) {
        if(this.variableName in variables) {
            return variables[this.variableName]
        } else {
            throw new EvalError("Unknown variable " + this.variableName + ".")
        }
    }
    
    derivation(variable) {
        if(variable == this.variableName)
            return new NumberElement(1)
        return this
    }
    
    integral(variable) {
        if(variable == this.variableName)
            // <var>^2/2
            return new BinaryOperation(new BinaryOperation(this, '^', new NumberElement(2)), '/', new NumberElement(2))
        return this
    }
    
    toEditableString() {
        return this.variableName
    }
    
    toLatex() {
        return this.variableName
    }
    
    isConstant() {
        return false
    }
}


class TertiaryOperation extends AbstractSyntaxElement {}
