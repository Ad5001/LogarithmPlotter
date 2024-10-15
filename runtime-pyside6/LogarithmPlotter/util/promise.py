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
            if isinstance(data, QObject):
                data = data
            elif type(data) in [int, str, float, bool, bytes]:
                data = QJSValue(data)
            elif data is None:
                data = QJSValue.SpecialValue.UndefinedValue
            elif isinstance(data, QJSValue):
                data = data
            elif isinstance(data, PyJSValue):
                data = data.qjs_value
            else:
                raise InvalidReturnValue("Must return either a primitive, a valid QObject, JS Value, or None.")
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
    rejected = Signal(Exception)

    def __init__(self, to_run: Callable, args=[]):
        QObject.__init__(self)
        self._fulfills = []
        self._rejects = []
        self._state = "pending"
        self.fulfilled.connect(self._fulfill)
        self.rejected.connect(self._reject)
        self._runner = PyPromiseRunner(to_run, self, args)
        QThreadPool.globalInstance().start(self._runner)

    @Property(str)
    def state(self):
        return self._state

    @Slot(QJSValue, result=QObject)
    @Slot(QJSValue, QJSValue, result=QObject)
    def then(self, on_fulfill: QJSValue | Callable, on_reject: QJSValue | Callable = None):
        """
        Adds listeners for both fulfilment and catching errors of the Promise.
        """
        if isinstance(on_fulfill, QJSValue):
            self._fulfills.append(PyJSValue(on_fulfill))
        elif isinstance(on_fulfill, Callable):
            self._fulfills.append(on_fulfill)
        if isinstance(on_reject, QJSValue):
            self._rejects.append(PyJSValue(on_reject))
        elif isinstance(on_reject, Callable):
            self._rejects.append(on_reject)
        return self

    @Slot(QJSValue)
    @Slot(QObject)
    def _fulfill(self, data):
        self._state = "fulfilled"
        no_return = [None, QJSValue.SpecialValue.UndefinedValue]
        for on_fulfill in self._fulfills:
            try:
                result = on_fulfill(data)
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
