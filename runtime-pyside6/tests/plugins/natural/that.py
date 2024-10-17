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
from typing import overload, Generic, TypeVar

from . import Spy
from .interfaces.base import AssertionInterface, BaseAssertionInterface
from .interfaces.basic import StringInterface, BoolInterface, ListInterface
from .interfaces.int import NumberInterface
from .interfaces.spy import SpyAssertionInterface

Interface = TypeVar("Interface", bound=AssertionInterface)

MATCHES = [
    (str, StringInterface),
    (bool, BoolInterface),
    (int, NumberInterface),
    (float, NumberInterface),
    (list, ListInterface),
    (Spy, SpyAssertionInterface)
]


@overload
def that(value: str) -> StringInterface: ...


@overload
def that(value: bool) -> BoolInterface: ...


@overload
def that(value: int) -> NumberInterface: ...


@overload
def that(value: float) -> NumberInterface: ...

@overload
def that(value: Spy) -> SpyAssertionInterface: ...


@overload
def that[Interface](value: Interface) -> Interface: ...


def that(value: any) -> AssertionInterface:
    if not isinstance(value, AssertionInterface):
        interface = next((i for t, i in MATCHES if isinstance(value, t)), None)
        if interface is not None:
            value = interface(value)
        else:
            value = BaseAssertionInterface(value)
    return value
