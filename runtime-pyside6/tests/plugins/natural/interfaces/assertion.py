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

class Assertion(Exception):
    def __init__(self, assertion: bool, message: str, invert: bool):
        self.assertion = assertion
        self.message = message
        self.invert = invert

    def _invert_message(self):
        for verb in ('is', 'was', 'has', 'have'):
            for negative in ("n't", ' not', ' never', ' no'):
                self.message = self.message.replace(f"{verb}{negative}", verb.upper())

    def __str__(self):
        return self.message

    def __bool__(self):
        if not self.invert and not self.assertion:
            raise self
        if self.invert and self.assertion:
            self._invert_message()
            raise self
        return True # Raises otherwise.