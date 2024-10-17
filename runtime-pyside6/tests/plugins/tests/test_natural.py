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
import pytest

from ..natural import that, Assertion, Spy


def test_string():
    assert that("QWERTY").is_.an.instance_of(str)
    assert that("QWERTY").is_.not_.an.instance_of(int)
    assert that("QWERTY").is_.equal.to("QWERTY")
    assert that("QWERTY").is_.NOT.equal.to("QWERTYUIOP")
    assert that("QWERTY").is_.NOT.equal.to(3)
    assert that("QWERTY").has.a.length.of(6)
    assert that("QWERTY").does.NOT.have.a.length.of(7)
    assert that("QWERTY").has.a.length.that.is_.NOT(5)
    assert that("QWERTY").contains("WER")
    assert that("QWERTY").contains("WER", "TY")
    assert that("QWERTY").does.not_.contain("AZERTY")
    with pytest.raises(Assertion):
        assert that("QWERTY").is_.an.instance_of(int)
    with pytest.raises(Assertion):
        assert that("QWERTY").is_.equal.to(False)
    with pytest.raises(Assertion):
        assert that("QWERTY").has.a.length.of(1)
    with pytest.raises(Assertion):
        assert that("QWERTY").contains("AZERTY")
    with pytest.raises(Assertion):
        assert that("QWERTY").does.NOT.contain("QWE")

def test_bool():
    assert that(True).is_.an.instance_of(bool)
    assert that(True).is_.an.instance_of(int)
    assert that(True).is_.NOT.an.instance_of(str)
    assert that(True).equals(True)
    assert that(True).is_.true
    assert that(True).is_.NOT.false
    assert that(False).is_.equal.to(False)
    assert that(False).is_.false
    assert that(False).is_.NOT.true
    with pytest.raises(Assertion):
        assert that(True).is_.false
    with pytest.raises(Assertion):
        assert that(True).is_.NOT.true

def test_int():
    assert that(2).is_.an.instance_of(int)
    assert that(2).is_.NOT.an.instance_of(bool)
    assert that(2).is_.NOT.an.instance_of(str)
    assert that(2).is_.more_than(1)
    assert that(2).is_.NOT.less_than(1)
    assert that(2).is_.less_than(3)
    assert that(2).is_.NOT.more_than(3)
    assert that(2).is_.at_least(1)
    assert that(2).is_.NOT.at_most(1)
    assert that(2).is_.at_most(3)
    assert that(2).is_.NOT.at_least(3)
    assert that(2).is_.at_most(2)
    assert that(2).is_.at_least(2)
    # Equality
    assert that(2).is_(2)
    assert that(2).was(2)
    assert that(2).is_.exactly(2)
    assert that(2).is_.equal.to(2)
    assert that(2).equals(2)
    assert that(2).is_.NOT(3)
    assert that(2).does.NOT.equal(3)

def test_int_shorthands():
    # Direct numbers
    assert that(0).equals.zero
    assert that(1).equals.one
    assert that(2).equals.two
    assert that(3).equals.three
    assert that(4).equals.four
    assert that(5).equals.five
    assert that(6).equals.six
    assert that(7).equals.seven
    assert that(8).equals.eight
    assert that(9).equals.nine
    assert that(10).equals.ten
    assert that(11).equals.eleven
    assert that(12).equals.twelve
    assert that(13).equals.thirteen
    assert that(14).equals.fourteen
    assert that(15).equals.fifteen
    assert that(16).equals.sixteen
    assert that(17).equals.seventeen
    assert that(18).equals.eighteen
    assert that(19).equals.nineteen
    assert that(20).equals.twenty
    assert that(30).equals.thirty
    assert that(40).equals.forty
    assert that(50).equals.fifty
    assert that(60).equals.sixty
    assert that(70).equals.seventy
    assert that(80).equals.eighty
    assert that(90).equals.ninety
    assert that(100).equals.a.hundred
    assert that(1000).equals.a.thousand
    assert that(1_000_000).equals.a.million

def test_add_natural_complex():
    # Test composed
    assert that(34).equals.thirty.four
    assert that(-34).equals.minus.thirty.four
    assert that(100_033_207).equals.one.hundred.million.AND.thirty.three.thousand.AND.two.hundred.AND.seven
    assert that(-1_200_033_207).equals.minus.one.billion.AND.two.hundred.million.AND.thirty.three.thousand.AND.two.hundred.AND.seven
    assert that(7890).equals.seven.thousand.eight.hundred.and_.ninety
    assert that(7890).equals.seventy.eight.hundred.and_.ninety
    assert that(7890).equals(78)(100)(90)
    with pytest.raises(RuntimeError):
        assert that(1_000_000).equals.a.thousand.thousand
    with pytest.raises(RuntimeError):
        assert that(600).equals.one.twenty.thirty
    with pytest.raises(RuntimeError):
        assert that(2).equals
    with pytest.raises(RuntimeError):
        assert that(2).equals.one.minus.two

def test_spy():
    spy = Spy(lambda *args, **kw: 10)
    assert that(spy).is_.an.instance_of(Spy)
    assert that(spy).is_(callable)
    # Check calls
    assert that(spy).was.never.called
    assert that(spy).was.called.zero.times
    assert spy(30, arg="string") == 10
    assert that(spy).was.called
    assert that(spy).was.called.once
    assert that(spy).was.called.one.time
    assert that(spy).was.NOT.called.more_than.once
    assert that(spy).was.called.with_arguments(30)
    assert that(spy).was.called.with_arguments_matching(lambda args, kwargs: len(args) == 1 and len(kwargs) == 1)
    assert that(spy).was.NOT.called.with_arguments(50)
    assert that(spy).was.NOT.called.with_exact_arguments(30)
    assert that(spy).was.NOT.called.with_no_argument()
    assert that(spy).was.called.with_exact_arguments(30, arg="string")
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_arguments(50)
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_exact_arguments(30)
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_no_argument()

def test_spy_seral_calls():
    spy = Spy()
    obj = object()
    spy()
    spy(30, arg="string")
    spy(obj, 30, example=obj, none=None)
    assert that(spy).was.called
    assert that(spy).was.called.more_than.once
    assert that(spy).was.called.more_than.twice
    assert that(spy).was.NOT.called.more_than.thrice
    assert that(spy).was.called.at_most.thrice
    assert that(spy).was.called.at_least.thrice
    assert that(spy).was.called.three.times
    assert that(spy).was.called.less_than(4).times
    # Check arguments
    assert that(spy).was.called.once.with_no_argument()
    assert that(spy).was.called.at_most.once.with_no_argument()
    assert that(spy).was.called.twice.with_arguments(30)
    assert that(spy).was.NOT.called.less_than.twice.with_arguments(30)
    assert that(spy).was.called.once.with_arguments(obj)
    assert that(spy).was.called.once.with_arguments(arg="string")
    assert that(spy).was.called.once.with_arguments(30, obj)
    assert that(spy).was.called.once.with_arguments(none=None)
    assert that(spy).was.NOT.called.with_arguments(None)
    assert that(spy).was.NOT.called.with_arguments(obj, 30, arg="string")
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_arguments(obj, 30, arg="string")
    # Checking with exact arguments
    assert that(spy).was.called.once.with_exact_arguments(30, arg="string")
    assert that(spy).was.called.once.with_exact_arguments(obj, 30, example=obj, none=None)
    assert that(spy).was.NOT.called.with_exact_arguments(obj, 30, arg="string")
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_exact_arguments(obj, 30, arg="string")
    # Check arguments matching
    assert that(spy).has.NOT.been.called.with_arguments_matching(lambda a, kw: len(a) + len(kw) == 3)
    assert that(spy).was.called.once.with_arguments_matching(lambda a, kw: len(a) + len(kw) == 2)
    assert that(spy).was.called.once.with_arguments_matching(lambda a, kw: len(a) + len(kw) == 4)
    with pytest.raises(Assertion):
        assert that(spy).was.called.with_arguments_matching(lambda a, kw: len(a) + len(kw) == 3)


def test_wrongful_expressions():
    spy = Spy()
    with pytest.raises(RuntimeError):
        assert that(3).is_.less_than("str")
    with pytest.raises(RuntimeError):
        assert that(3).does.NOT.NOT.equal(3)
    with pytest.raises(RuntimeError):
        assert that(3).is_.an.instance_of("non type")
    with pytest.raises(RuntimeError):
        assert that(spy).was.called.more_than.at_least.once
    with pytest.raises(RuntimeError):
        assert that(spy).was.called.more_than.at_most.once
    with pytest.raises(RuntimeError):
        assert that(spy).was.called.more_than.less_than.once
    with pytest.raises(RuntimeError):
        assert that(spy).was.called.more_than.more_than.once