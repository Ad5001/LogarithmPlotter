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

import pytest
from re import Pattern
from PySide6.QtQml import QJSEngine, QJSValue

from LogarithmPlotter.util.js import PyJSValue, InvalidAttributeValueException, NotAPrimitiveException
from globals import app

@pytest.fixture()
def data():
    engine = QJSEngine()
    obj = PyJSValue(engine.globalObject())
    yield engine, obj

class TestPyJS:
    def test_set(self, data):
        engine, obj = data
        obj.num1 = 2
        obj.num2 = QJSValue(2)
        obj.num3 = PyJSValue(QJSValue(2))
        with pytest.raises(InvalidAttributeValueException):
            obj.num3 = object()

    def test_eq(self, data):
        engine, obj = data
        obj.num = QJSValue(2)
        assert obj.num == 2
        assert obj.num == QJSValue(2)
        assert obj.num == PyJSValue(QJSValue(2))
        assert obj.num != object()

    def test_function(self, data):
        engine, obj = data
        function = PyJSValue(engine.evaluate("(function(argument) {return argument*2})"))
        assert function(3) == 6
        assert function(10) == 20
        function2 = PyJSValue(engine.evaluate("(function(argument) {return argument+3})"), obj.qjs_value)
        assert function2(3) == 6
        assert function2(10) == 13
        function3 = PyJSValue(engine.evaluate("2+2"))
        with pytest.raises(InvalidAttributeValueException):
            function3()

    def test_type(self, data):
        engine, obj = data
        assert PyJSValue(engine.evaluate("[]")).type() == list
        assert PyJSValue(engine.evaluate("undefined")).type() is None
        assert PyJSValue(engine.evaluate("/[a-z]/g")).type() == Pattern
        assert PyJSValue(QJSValue(2)).type() == float
        assert PyJSValue(QJSValue("3")).type() == str
        assert PyJSValue(QJSValue(True)).type() == bool

    def test_primitive(self, data):
        engine, obj = data
        assert PyJSValue(QJSValue(2)).primitive() == 2
        assert PyJSValue(QJSValue("string")).primitive() == "string"
        assert PyJSValue(QJSValue(True)).primitive() == True
        assert PyJSValue(engine.evaluate("undefined")).primitive() is None
        with pytest.raises(NotAPrimitiveException):
            assert PyJSValue(engine.evaluate("[]")).primitive() == []
