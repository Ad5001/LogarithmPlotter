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
from os import getcwd
from os.path import join
from tempfile import TemporaryDirectory
from LogarithmPlotter.util import config

pwd = getcwd()


@pytest.fixture()
def temporary():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, "graph.png")
    yield tmpfile
    directory.cleanup()
