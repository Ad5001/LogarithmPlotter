
import pytest
from PySide6.QtQml import QJSEngine, QJSValue
from PySide6.QtWidgets import QApplication

from LogarithmPlotter.util.js import PyJSValue, InvalidAttributeValueException

app = QApplication()
engine = QJSEngine()
obj = PyJSValue(engine.globalObject())

class TestPyJS:
    def test_set(self):
        obj.num1 = 2
        obj.num2 = QJSValue(2)
        obj.num3 = PyJSValue(QJSValue(2))
        with pytest.raises(InvalidAttributeValueException):
            obj.num3 = object()

    def test_eq(self):
        obj.num = QJSValue(2)
        assert obj.num == 2
        assert obj.num == QJSValue(2)
        assert obj.num == PyJSValue(QJSValue(2))
        assert obj.num != object()

    def test_function(self):
        function = PyJSValue(engine.evaluate("(function(argument) {return argument*2})"))
        assert function(3) == 6
        assert function(10) == 20
        function2 = PyJSValue(engine.evaluate("(function(argument) {return argument+3})"), obj.qjs_value)
        assert function2(3) == 6
        assert function2(10) == 13
        function3 = PyJSValue(engine.evaluate("2+2"))
        with pytest.raises(InvalidAttributeValueException):
            function3()
