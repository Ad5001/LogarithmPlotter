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
class Setting {
    constructor(name, nameInConfig, icon) {
        this.name = name
        this.displayName = qsTr(name)
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
     * @param {string|boolean|number} value
     */
    set(value) {
        throw new TypeError(`value of ${this.constructor} not implemented.`)
    }
}

export class BoolSetting extends Setting {
    value() {
        return Helper.getSettingBool(this.nameInConfig)
    }

    set(value) {
        Helper.setSettingBool(this.nameInConfig, value)
    }
}

export class IntSetting extends Setting {
    value() {
        return Helper.getSettingInt(this.nameInConfig)
    }

    set(value) {
        Helper.setSettingInt(this.nameInConfig, value)
    }
}

export class EnumIntSetting extends IntSetting {
    values() {
        throw new TypeError(`enumerations of ${this.constructor} not implemented.`)
    }
}