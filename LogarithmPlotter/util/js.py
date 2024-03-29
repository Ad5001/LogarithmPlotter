"""
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
"""

from PySide6.QtQml import QJSValue


class PyJSValue:
    """
    Wrapper to provide easy way to interact with JavaScript values in Python directly.
    """
    def __init__(self, js_value: QJSValue, parent: QJSValue = None):
        self.qjs_value = js_value
        self._parent = parent

    def __getattr__(self, item):
        return PyJSValue(self.qjs_value.property(item), self.qjs_value)

    def __setattr__(self, key, value):
        if key in ['qjs_value', '_parent']:
            # Fallback
            object.__setattr__(self, key, value)
        elif isinstance(value, PyJSValue):
            # Set property
            self.qjs_value.setProperty(key, value.qjs_value)
        else:
            print('Setting', key, value)
            self.qjs_value.setProperty(key, value)

    def __call__(self, *args, **kwargs):
        if self.qjs_value.isCallable():
            if self._parent is None:
                return self.qjs_value.call(args)
            else:
                return self.qjs_value.callWithInstance(self._parent, args)
        else:
            raise ValueError('Cannot call non-function JS value.')

