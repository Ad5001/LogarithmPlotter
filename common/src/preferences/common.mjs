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

import { Expression } from "../math/index.mjs"

class Setting {
    constructor(type, name, nameInConfig, icon) {
        this.type = type
        this.name = name
        this.nameInConfig = nameInConfig
        this.icon = icon
    }

    /**
     * Returns the value of the setting.
     * @returns {string|boolean|number}
     */
    value() {
        throw new TypeError(`value of ${this.constructor} not implemented.`)
    }

    /**
     * Sets the value of the setting
     * @param {string|boolean|number|Expression} value
     */
    set(value) {
        throw new TypeError(`value of ${this.constructor} not implemented.`)
    }

    toString() {
        return `Setting<${this.type} ${this.name}>`
    }
}

export class BoolSetting extends Setting {
    constructor(name, nameInConfig, icon) {
        super("bool", name, nameInConfig, icon)
    }

    value() {
        return Helper.getSettingBool(this.nameInConfig)
    }

    set(value) {
        Helper.setSettingBool(this.nameInConfig, value)
    }
}

export class NumberSetting extends Setting {
    constructor(name, nameInConfig, icon, min = -Infinity, max = +Infinity) {
        super("number", name, nameInConfig, icon)
        this.min = typeof min == "number" ? () => min : min
        this.max = typeof max == "number" ? () => max : max
    }

    value() {
        return Helper.getSettingInt(this.nameInConfig)
    }

    set(value) {
        Helper.setSettingInt(this.nameInConfig, value)
    }
}

export class EnumIntSetting extends Setting {
    constructor(name, nameInConfig, icon, values = []) {
        super("enum", name, nameInConfig, icon)
        this.values = values
    }

    value() {
        return Helper.getSettingInt(this.nameInConfig)
    }

    set(value) {
        Helper.setSettingInt(this.nameInConfig, value)
    }
}

export class ExpressionSetting extends Setting {
    constructor(name, nameInConfig, icon, variables = []) {
        super("expression", name, nameInConfig, icon)
        this.variables = variables
    }

    value() {
        return Helper.getSetting(this.nameInConfig)
    }

    /**
     *
     * @param {Expression} value
     */
    set(value) {
        let vars = value.variables()
        if(vars.length === this.variables.length && vars.every(x => this.variables.includes(x)))
            Helper.setSetting(this.nameInConfig, value)
        else {
            let undefinedVars = vars.filter(x => !this.variables.includes(x))
            let allowed = ""
            if(this.variables.length > 0)
                allowed = `Allowed variables: ${this.variables.join(", ")}.`
            throw new TypeError(`Cannot use variable(s) ${undefinedVars.join(", or ")} to define ${this.displayName}. ${allowed}`)
        }
    }
}

export class StringSetting extends Setting {
    constructor(name, nameInConfig, icon, defaultValues = []) {
        super("string", name, nameInConfig, icon)
        this.defaultValues = defaultValues
    }

    value() {
        return Helper.getSetting(this.nameInConfig)
    }

    set(value) {
        Helper.setSetting(this.nameInConfig, value)
    }
}