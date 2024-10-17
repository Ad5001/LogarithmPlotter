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
from typing import Self, Callable, Any

from .assertion import Assertion
from .utils import repr_


class AssertionInterface:
    """
    Most basic assertion interface.
    You probably want to use BaseAssertionInterface
    """

    def __init__(self, value, parent: Self = None):
        self._value = value
        self._parent = parent
        if parent is None:
            self.__not = False

    @property
    def _not(self) -> bool:
        """
        Internal state of whether the expression was negated.
        Use "not_" to set it.
        :return:
        """
        return self.__not if self._parent is None else self._parent._not

    @_not.setter
    def _not(self, value: bool):
        if self._not is True:
            raise RuntimeError("Cannot call is_not or was_not twice in the same statement.")
        if self._parent is None:
            self.__not = True
        else:
            self._parent._not = True

    def instance_of(self, type_: type) -> Assertion:
        """
        Checks if the current value is equal to the provided value
        """
        value_type_name = type(self._value).__name__
        if not isinstance(type_, type):
            raise RuntimeError("Provided 'type' provided is not a class.")
        return Assertion(
            isinstance(self._value, type_),
            f"The value ({value_type_name} {repr_(self._value)}) is not a {type_.__name__}.",
            self._not
        )

    def __call__(self, condition: Callable[[Any], bool]) -> Assertion:
        """
        Apply condition to value that returns whether or not the value is valid.
        """
        return Assertion(
            condition(self._value),
            f"The value ({repr_(self._value)}) did not match given conditions.",
            self._not
        )

    """
    NOT Properties.
    """

    @property
    def NOT(self) -> Self:
        self._not = True
        return self

    @property
    def not_(self) -> Self:
        self._not = True
        return self

    @property
    def never(self) -> Self:
        self._not = True
        return self

    """
    Chain self properties to sound natural
    """

    @property
    def that(self) -> Self:
        return self

    @property
    def is_(self) -> Self:
        return self

    @property
    def does(self) -> Self:
        return self

    @property
    def was(self) -> Self:
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


class EqualAssertionInterface(AssertionInterface):
    """
    Interface created for when its value should be checked for equality
    """

    def __init__(self, value, parent: AssertionInterface = None):
        super().__init__(value, parent)

    def __call__(self, value) -> Assertion:
        return Assertion(
            value == self._value,
            f"The value {repr_(self._value)} is different from {repr(value)}.",
            self._not
        )

    @property
    def to(self) -> Self:
        return self


class BaseAssertionInterface(AssertionInterface):

    @property
    def equals(self) -> EqualAssertionInterface:
        """
        Checks if the current value is equal to the provided value
        """
        return EqualAssertionInterface(self._value, self)

    @property
    def equal(self) -> EqualAssertionInterface:
        """
        Checks if the current value is equal to the provided value
        """
        return self.equals
