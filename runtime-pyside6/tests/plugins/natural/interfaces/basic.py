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
from tests.plugins.natural.interfaces.assertion import Assertion
from tests.plugins.natural.interfaces.base import BaseAssertionInterface
from tests.plugins.natural.interfaces.int import IntInterface
from tests.plugins.natural.interfaces.utils import repr_


class FixedIteratorInterface(BaseAssertionInterface):
    @property
    def length(self) -> IntInterface:
        return IntInterface(len(self._value))

    def elements(self, *elements) -> Assertion:
        tests = [elem for elem in elements if elem in self._value]
        return Assertion(
            len(tests) == 0,
            f"This value ({repr_(self._value)}) does not have elements ({repr_(tests)})"
        )

    def element(self, element) -> Assertion:
        return Assertion(
            element in self._value,
            f"This value ({repr_(self._value)}) does not have element ({repr_(element)})"
        )

    def contains(self, *elements) -> Assertion:
        return self.elements(*elements)

class BoolInterface(BaseAssertionInterface):
    @property
    def is_true(self):
        return Assertion(
            self._value == True,
            f"The value ({repr_(self._value)}) is not True."
        )

    @property
    def is_false(self):
        return Assertion(
            self._value == False,
            f"The value ({repr_(self._value)}) is not False."
        )

class StringInterface(LengthInterface):
    pass