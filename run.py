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
from os import system, getcwd, path
from sys import path as sys_path
    
def build():
    """
    Updates all binary translations
    """
    system("./scripts/build.sh")

def run():
    from LogarithmPlotter import logarithmplotter 
    logarithmplotter.run()

if __name__ == "__main__":
    build()
    logplotter_path = path.realpath(path.join(getcwd(), "build", "runtime-pyside6"))
    print("Appending " + logplotter_path + " to path...")
    sys_path.append(logplotter_path)
    run()
 
