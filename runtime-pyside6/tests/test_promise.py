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
from time import sleep

from PySide6.QtQml import QJSValue

from tests.plugins.natural import that, Spy
from LogarithmPlotter.util.js import PyJSValue
from LogarithmPlotter.util.promise import PyPromise


def check_promise_result(value):
    def got_result(args, kwargs, val=value):
        valid = len(args) == 1 and len(kwargs) == 0
        if valid:
            got_value = args[0].toVariant() if isinstance(args[0], QJSValue) else args[0]
            valid = got_value == val
        return valid
    return got_result

def create_async_func(value):
    def async_function(val=value):
        sleep(1)
        return val

    return async_function


def qjs_eq(origin):
    def compare(result):
        res = result.toVariant() == origin
        print("Unknown res!", res, repr(result.toVariant()), repr(origin))
        return res
    return compare


def async_throw():
    sleep(1)
    raise Exception("aaaa")


class TestPyPromise:

    def test_fulfill_values(self, qtbot):
        qjsv = QJSValue(3)
        values = [
            [True, qjs_eq(True)],
            [3, qjs_eq(3)],
            [2.2, qjs_eq(2.2)],
            ["String", qjs_eq("String")],
            [qjsv, qjs_eq(3)],
            [None, qjs_eq(None)],
            [PyJSValue(QJSValue("aaa")), qjs_eq("aaa")]
        ]
        for [value, test] in values:
            promise = PyPromise(create_async_func(value))
            with qtbot.assertNotEmitted(promise.rejected, wait=1000):
                print("Testing", value)
                with qtbot.waitSignal(promise.fulfilled, check_params_cb=test, timeout=2000):
                    assert promise.state == "pending"
            assert promise.state == "fulfilled"

    def test_reject(self, qtbot):
        promise = PyPromise(async_throw)
        with qtbot.assertNotEmitted(promise.fulfilled, wait=1000):
            with qtbot.waitSignal(promise.rejected, timeout=10000,
                                  check_params_cb=lambda t: t == "Exception('aaaa')"):
                assert promise.state == "pending"
        assert promise.state == "rejected"

    def test_fulfill(self, qtbot):
        spy_fulfilled = Spy()
        spy_rejected = Spy()
        promise = PyPromise(create_async_func(3))
        then_res = promise.then(spy_fulfilled, spy_rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert then_res == promise
        # Check on our spy.
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
                pass
        assert that(spy_fulfilled).was.called.once
        assert that(spy_fulfilled).was.not_called.with_arguments(3)
        assert that(spy_fulfilled).was.called.with_arguments_matching(check_promise_result(3))
        assert spy_rejected.was.not_called

    def test_rejected(self, qtbot):
        spy_fulfilled = Spy()
        spy_rejected = Spy()
        promise = PyPromise(async_throw)
        then_res = promise.then(spy_fulfilled, spy_rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).is_equal.to(promise)
        # Check on our spies.
        with qtbot.waitSignal(promise.rejected, timeout=10000):
            pass
        assert that(spy_rejected).was.called.once
        assert that(spy_rejected).was.called.with_arguments("Exception('aaaa')")
        assert that(spy_fulfilled).was.not_called
