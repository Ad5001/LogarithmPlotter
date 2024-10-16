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
from tests.plugins.natural.interfaces.base import BaseAssertionInterface, EqualAssertionInterface, AssertionInterface
from tests.plugins.natural.interfaces.utils import repr_


class IntComparisonAssertionInterface(AssertionInterface):
    def __init__(self, value):
        super().__init__(value)
        self._compare_to = None

    def _compare(self) -> Assertion:
        raise RuntimeError(f"No comparison method defined in {type(self).__name__}.")

    def __bool__(self) -> bool:
        return bool(self._compare())

    def __call__(self, compare_to: int) -> Self:
        if self._compare_to is None:
            self._compare_to = int(compare_to)
        else:
            self._compare_to *= int(compare_to)
        return self

    @property
    def time(self) -> Self:
        return self

    @property
    def times(self) -> Self:
        return self

    @property
    def never(self) -> Self:
        return self(0)

    @property
    def once(self) -> Self:
        return self(1)

    @property
    def twice(self) -> Self:
        return self(2)

    @property
    def thrice(self) -> Self:
        return self(3)

    @property
    def zero(self) -> Self:
        return self(0)

    @property
    def one(self) -> Self:
        return self(1)

    @property
    def two(self) -> Self:
        return self(2)

    @property
    def three(self) -> Self:
        return self(3)

    @property
    def four(self) -> Self:
        return self(4)

    @property
    def five(self) -> Self:
        return self(5)

    @property
    def six(self) -> Self:
        return self(6)

    @property
    def seven(self) -> Self:
        return self(7)

    @property
    def eight(self) -> Self:
        return self(8)

    @property
    def nine(self) -> Self:
        return self(9)

    @property
    def ten(self) -> Self:
        return self(10)

    @property
    def twenty(self) -> Self:
        return self(20)

    @property
    def thirty(self) -> Self:
        return self(30)

    @property
    def forty(self) -> Self:
        return self(40)

    @property
    def fifty(self) -> Self:
        return self(50)

    @property
    def sixty(self) -> Self:
        return self(60)

    @property
    def seventy(self) -> Self:
        return self(70)

    @property
    def eighty(self) -> Self:
        return self(70)

    @property
    def ninety(self) -> Self:
        return self(70)

    @property
    def hundred(self) -> Self:
        return self(100)

    @property
    def thousand(self) -> Self:
        return self(1_000)

    @property
    def million(self) -> Self:
        return self(1_000_000)

    @property
    def billion(self) -> Self:
        return self(1_000_000_000)


class LessThanComparisonInterface(IntComparisonAssertionInterface):
    def _compare(self) -> Assertion:
        return Assertion(
            self._value < self._compare_to,
            f"The value ({repr_(self._value)}) is not less than to {repr_(self._compare_to)}."
        )

class MoreThanComparisonInterface(IntComparisonAssertionInterface):
    def _compare(self) -> Assertion:
        return Assertion(
            self._value > self._compare_to,
            f"The value ({repr_(self._value)}) is not more than to {repr_(self._compare_to)}."
        )

class AtLeastComparisonInterface(IntComparisonAssertionInterface):
    def _compare(self) -> Assertion:
        return Assertion(
            self._value >= self._compare_to,
            f"The value ({repr_(self._value)}) is not at least to {repr_(self._compare_to)}."
        )

class AtMostComparisonInterface(IntComparisonAssertionInterface):
    def _compare(self) -> Assertion:
        return Assertion(
            self._value <= self._compare_to,
            f"The value ({repr_(self._value)}) is not at least to {repr_(self._compare_to)}."
        )

class EqualComparisonInterface(IntComparisonAssertionInterface):
    def _compare(self) -> Assertion:
        return Assertion(
            self._value == self._compare_to,
            f"The value ({repr_(self._value)}) is not equal to {repr_(self._compare_to)}."
        )

    def to(self) -> Self:
        return self

    def of(self) -> Self:
        return self


class IntInterface(AssertionInterface):
    def less_than(self) -> LessThanComparisonInterface:
        return LessThanComparisonInterface(self._value)

    @property
    def more_than(self) -> MoreThanComparisonInterface:
        return MoreThanComparisonInterface(self._value)

    @property
    def at_least(self) -> AtLeastComparisonInterface:
        return AtLeastComparisonInterface(self._value)

    @property
    def at_most(self) -> AtMostComparisonInterface:
        return AtMostComparisonInterface(self._value)

    @property
    def equals(self) -> EqualComparisonInterface:
        return EqualComparisonInterface(self._value)

    @property
    def is_equal(self) -> EqualComparisonInterface:
        return EqualComparisonInterface(self._value)

    @property
    def exactly(self) -> EqualComparisonInterface:
        return EqualComparisonInterface(self._value)

