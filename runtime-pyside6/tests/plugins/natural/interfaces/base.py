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
from typing import Self

from tests.plugins.natural.interfaces.assertion import Assertion
from tests.plugins.natural.interfaces.utils import repr_


class AssertionInterface:
    """
    Most basic assertion interface.
    You probably want to use BaseAssertionInterface
    """
    def __init__(self, value):
        self._value = value

    @property
    def was(self) -> Self:
        return self

    @property
    def be(self) -> Self:
        return self

    @property
    def been(self) -> Self:
        return self

    @property
    def have(self) -> Self:
        return self

    @property
    def has(self) -> Self:
        return self

    @property
    def a(self) -> Self:
        return self

    @property
    def an(self) -> Self:
        return self

    def is_a(self, type_) -> Assertion:
        """
        Checks if the current value is equal to the provided value
        """
        value_type_name = type(self._value).__name__
        return Assertion(isinstance(type_, type_), f"The value ({value_type_name} {repr_(self._value)}) is not a {type_.__name__}.")



class EqualAssertionInterface(AssertionInterface):
    """
    Interface created for when its value should be checked for equality
    """
    def __init__(self, value):
        super().__init__(value)

    def __call__(self, value) -> Assertion:
        return Assertion(value == self._value, f"The value ({repr_(self._value)}) is not equal to {repr(value)}.")

    def to(self, value) -> Self:
        return self(value)

    def of(self, value) -> Self:
        return self(value)



class BaseAssertionInterface(AssertionInterface):

    @property
    def equals(self) -> EqualAssertionInterface:
        """
        Checks if the current value is equal to the provided value
        """
        return EqualAssertionInterface(self._value)

    @property
    def is_equal(self) -> EqualAssertionInterface:
        """
        Checks if the current value is equal to the provided value
        """
        return self.equals