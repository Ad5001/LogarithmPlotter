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
from typing import Callable

from PySide6.QtCore import QRunnable, Signal, Property, QObject, Slot, QThreadPool
from PySide6.QtQml import QJSValue

from LogarithmPlotter.util.js import PyJSValue


def check_callable(function: Callable|QJSValue) -> Callable|None:
    """
    Checks if the given function can be called (either a python callable
    or a QJSValue function), and returns the object that can be called directly.
    Returns None if not a function.
    """
    if isinstance(function, QJSValue) and function.isCallable():
        return PyJSValue(function)
    elif callable(function):
        return function
    return None

class InvalidReturnValue(Exception): pass


class PyPromiseRunner(QRunnable):
    """
    QRunnable for running Promises in different threads.
    """
    def __init__(self, runner, promise, args):
        QRunnable.__init__(self)
        self.runner = runner
        self.promise = promise
        self.args = args

    def run(self):
        try:
            data = self.runner(*self.args)
            if type(data) in [int, str, float, bool]:
                data = QJSValue(data)
            elif data is None:
                data = QJSValue.SpecialValue.UndefinedValue
            elif isinstance(data, QJSValue):
                data = data
            elif isinstance(data, PyJSValue):
                data = data.qjs_value
            else:
                raise InvalidReturnValue("Must return either a primitive, a JS Value, or None.")
            self.promise.fulfilled.emit(data)
        except Exception as e:
            try:
                self.promise.rejected.emit(repr(e))
            except RuntimeError as e2:
                # Happens when the PyPromise has already been garbage collected.
                # In other words, nothing to report to nowhere.
                pass


class PyPromise(QObject):
    """
    Asynchronous Promise-like object meant to interface between Python and Javascript easily.
    Runs to_run in another thread, and calls fulfilled (populated by then) with its return value.
    """
    fulfilled = Signal((QJSValue,), (QObject,))
    rejected = Signal(str)

    def __init__(self, to_run: Callable|QJSValue, args=[], start_automatically=True):
        QObject.__init__(self)
        self._fulfills = []
        self._rejects = []
        self._state = "pending"
        self._started = False
        self.fulfilled.connect(self._fulfill)
        self.rejected.connect(self._reject)
        to_run = check_callable(to_run)
        if to_run is None:
            raise ValueError("New PyPromise created with invalid function")
        self._runner = PyPromiseRunner(to_run, self, args)
        if start_automatically:
            self.start()
    
    @Slot()
    def start(self, *args, **kwargs):
        """
        Starts the thread that will run the promise.
        """
        if not self._started: # Avoid getting started twice.
            QThreadPool.globalInstance().start(self._runner)
            self._started = True
        
    @Property(str)
    def state(self):
        return self._state

    @Slot(QJSValue, result=QObject)
    @Slot(QJSValue, QJSValue, result=QObject)
    def then(self, on_fulfill: QJSValue | Callable, on_reject: QJSValue | Callable = None):
        """
        Adds listeners for both fulfilment and catching errors of the Promise.
        """
        on_fulfill = check_callable(on_fulfill)
        on_reject = check_callable(on_reject)
        if on_fulfill is not None:
            self._fulfills.append(on_fulfill)
        if on_reject is not None:
            self._rejects.append(on_reject)
        return self
    
    def calls_upon_fulfillment(self, function: Callable | QJSValue) -> bool:
        """
        Returns True if the given function will be callback upon the promise fulfillment.
        False otherwise.
        """
        return self._calls_in(function, self._fulfills)
    
    def calls_upon_rejection(self, function: Callable | QJSValue) -> bool:
        """
        Returns True if the given function will be callback upon the promise rejection.
        False otherwise.
        """
        return self._calls_in(function, self._rejects)
        
    def _calls_in(self, function: Callable | QJSValue, within: list) -> bool:
        """
        Returns True if the given function resides in the given within list, False otherwise.
        Internal method of calls_upon_fulfill
        """
        function = check_callable(function)
        ret = False
        if isinstance(function, PyJSValue):
            found = next((f for f in within if f.qjs_value == function.qjs_value), None)
            ret = found is not None
        elif callable(function):
            found = next((f for f in within if f == function), None)
            ret = found is not None
        return ret

    @Slot(QJSValue)
    @Slot(QObject)
    def _fulfill(self, data):
        self._state = "fulfilled"
        no_return = [None, QJSValue.SpecialValue.UndefinedValue]
        for on_fulfill in self._fulfills:
            try:
                result = on_fulfill(data)
                result = result.qjs_value if isinstance(result, PyJSValue) else result
                data = result if result not in no_return else data  # Forward data.
            except Exception as e:
                self._reject(repr(e))
                break

    @Slot(QJSValue)
    @Slot(str)
    def _reject(self, error):
        self._state = "rejected"
        no_return = [None, QJSValue.SpecialValue.UndefinedValue]
        for on_reject in self._rejects:
            result = on_reject(error)
            error = result if result not in no_return else error  # Forward data.
