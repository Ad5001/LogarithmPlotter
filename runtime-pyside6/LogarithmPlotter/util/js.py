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
from re import Pattern
from typing import Callable
from PySide6.QtCore import QMetaObject, QObject, QDateTime
from PySide6.QtQml import QJSValue

class InvalidAttributeValueException(Exception): pass
class NotAPrimitiveException(Exception): pass

class URL: pass

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
        elif isinstance(value, QJSValue):
            self.qjs_value.setProperty(key, value)
        elif type(value) in (int, float, str, bool):
            self.qjs_value.setProperty(key, QJSValue(value))
        else:
            raise InvalidAttributeValueException(f"Invalid value {value} of type {type(value)} being set to {key}.")

    def __eq__(self, other):
        if isinstance(other, PyJSValue):
            return self.qjs_value.strictlyEquals(other.qjs_value)
        elif isinstance(other, QJSValue):
            return self.qjs_value.strictlyEquals(other)
        elif type(other) in (int, float, str, bool):
            return self.qjs_value.strictlyEquals(QJSValue(other))
        else:
            return False

    def __call__(self, *args, **kwargs):
        value = None
        if self.qjs_value.isCallable():
            if self._parent is None:
                value = self.qjs_value.call(args)
            else:
                value = self.qjs_value.callWithInstance(self._parent, args)
        else:
            raise InvalidAttributeValueException('Cannot call non-function JS value.')
        if isinstance(value, QJSValue):
            value = PyJSValue(value)
        return value

    def type(self) -> any:
        matcher = [
            (lambda: self.qjs_value.isArray(), list),
            (lambda: self.qjs_value.isBool(), bool),
            (lambda: self.qjs_value.isCallable(), Callable),
            (lambda: self.qjs_value.isDate(), QDateTime),
            (lambda: self.qjs_value.isError(), Exception),
            (lambda: self.qjs_value.isNull(), None),
            (lambda: self.qjs_value.isNumber(), float),
            (lambda: self.qjs_value.isQMetaObject(), QMetaObject),
            (lambda: self.qjs_value.isQObject(), QObject),
            (lambda: self.qjs_value.isRegExp(), Pattern),
            (lambda: self.qjs_value.isUndefined(), None),
            (lambda: self.qjs_value.isUrl(), URL),
            (lambda: self.qjs_value.isString(), str),
            (lambda: self.qjs_value.isObject(), object),
        ]
        for (test, value) in matcher:
            if test():
                return value
        return None

    def primitive(self):
        """
        Returns the pythonic value of the given primitive data.
        Raises a NotAPrimitiveException() if this JS value is not a primitive.
        """
        if self.type() not in [bool, float, str, None]:
            raise NotAPrimitiveException()
        return self.qjs_value.toPrimitive().toVariant()


