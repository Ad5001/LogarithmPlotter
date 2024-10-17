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
from .assertion import Assertion
from .base import BaseAssertionInterface
from .int import NumberInterface
from .utils import repr_


class FixedIteratorInterface(BaseAssertionInterface):
    @property
    def length(self) -> NumberInterface:
        return NumberInterface(len(self._value), self)

    def elements(self, *elements) -> Assertion:
        tests = [repr_(elem) for elem in elements if elem not in self._value]
        return Assertion(
            len(tests) == 0,
            f"This value ({repr_(self._value)}) does not have elements {', '.join(tests)}.",
            self._not
        )

    def element(self, element) -> Assertion:
        return Assertion(
            element in self._value,
            f"This value ({repr_(self._value)}) does not have element {repr_(element)}.",
            self._not
        )

    def contains(self, *elements) -> Assertion:
        """
        Check if the element(s) are contained in the iterator.
        """
        if len(elements) == 1:
            return self.element(elements[0])
        else:
            return self.elements(*elements)

    def contain(self, *elements):
        """
        Check if the element(s) are contained in the iterator.
        """
        return self.contains(*elements)


class BoolInterface(BaseAssertionInterface):
    @property
    def true(self):
        return Assertion(
            self._value == True,
            f"The value ({repr_(self._value)}) is not True.",
            self._not
        )

    @property
    def false(self):
        return Assertion(
            self._value == False,
            f"The value ({repr_(self._value)}) is not False.",
            self._not
        )


class StringInterface(FixedIteratorInterface):
    pass


class ListInterface(FixedIteratorInterface):
    pass
