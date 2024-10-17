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

import pytest
from PySide6.QtQml import QJSValue

from .plugins.natural import that, Spy
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

    def test_invalid_function(self):
        with pytest.raises(ValueError):
            promise = PyPromise("not a function")

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
        fulfilled = Spy()
        rejected = Spy()
        promise = PyPromise(create_async_func(3))
        then_res = promise.then(fulfilled, rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).does.equal(promise)
        # Check on our spy.
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
                pass
        assert that(fulfilled).was.called.once
        assert that(fulfilled).was.NOT.called.with_arguments(3)
        assert that(fulfilled).was.called.with_arguments_matching(check_promise_result(3))
        assert that(rejected).was.never.called

    def test_rejected(self, qtbot):
        fulfilled = Spy()
        rejected = Spy()
        promise = PyPromise(async_throw)
        then_res = promise.then(fulfilled, rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).does.equal(promise)
        # Check on our spies.
        with qtbot.waitSignal(promise.rejected, timeout=10000):
            pass
        assert that(rejected).was.called.once
        assert that(rejected).was.called.with_arguments("Exception('aaaa')")
        assert that(fulfilled).has.never.been.called

    def test_chain_fulfill(self, qtbot):
        convert = Spy(lambda v: v.toVariant())
        plus = Spy(lambda v: v + 1)
        rejected = Spy()
        promise = PyPromise(create_async_func(5))
        then_res = promise.then(convert, rejected).then(plus, rejected).then(plus, rejected).then(plus, rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).does.equal(promise)
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
            pass
        assert that(convert).was.called.once.with_arguments_matching(check_promise_result(5))
        assert that(rejected).was.never.called
        assert that(plus).was.called.three.times
        assert that(plus).was.called.once.with_exact_arguments(5)
        assert that(plus).was.called.once.with_exact_arguments(6)
        assert that(plus).was.called.once.with_exact_arguments(7)

    def test_chain_reject(self, qtbot):
        fulfilled = Spy()
        convert = Spy(lambda v: len(v))
        minus = Spy(lambda v: v - 1)
        promise = PyPromise(async_throw)
        then_res = promise.then(fulfilled, convert).then(fulfilled, minus).then(fulfilled, minus).then(fulfilled, minus)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).does.equal(promise)
        with qtbot.waitSignal(promise.rejected, timeout=10000):
            pass
        assert that(fulfilled).was.never.called
        assert that(convert).was.called.once.with_arguments_matching(check_promise_result("Exception('aaaa')"))
        assert that(minus).was.called.three.times
        assert that(minus).was.called.once.with_exact_arguments(17)
        assert that(minus).was.called.once.with_exact_arguments(16)
        assert that(minus).was.called.once.with_exact_arguments(15)

    def test_check_calls_upon(self):
        promise = PyPromise(async_throw)
        fulfilled = Spy()
        rejected = Spy()
        promise.then(fulfilled, rejected)
        assert promise.calls_upon_fulfillment(fulfilled)
        assert promise.calls_upon_rejection(rejected)
        assert not promise.calls_upon_fulfillment(rejected)
        assert not promise.calls_upon_rejection(fulfilled)

    def test_reject_in_fulfill(self, qtbot):
        def fulfilled_throw(x):
            raise Exception('noooo')
        promise = PyPromise(create_async_func("3"))
        fulfilled_throw = Spy(fulfilled_throw)
        fulfilled = Spy()
        rejected = Spy()
        then_res = promise.then(fulfilled, rejected).then(fulfilled_throw, rejected).then(fulfilled, rejected).then(fulfilled, rejected)
        # Check if the return value is the same promise (so we can chain then)
        assert that(then_res).does.equal(promise)
        with qtbot.waitSignal(promise.fulfilled, timeout=10000):
            pass
        assert that(fulfilled_throw).has.been.called.once
        assert that(rejected).has.been.called.three.times
        assert that(rejected).has.been.called.three.times.with_arguments("Exception('noooo')")