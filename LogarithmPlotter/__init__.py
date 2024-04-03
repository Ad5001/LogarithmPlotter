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
from shutil import which

__VERSION__ = "0.6.0"
is_release = False


# Check if development version, if so get the date of the latest git patch
# and append it to the version string.
if not is_release and which('git') is not None:
    from os.path import realpath, join, dirname, exists
    from subprocess import check_output
    from datetime import datetime
    # Command to check date of latest git commit
    cmd = ['git', 'log', '--format=%ci', '-n 1']
    cwd = realpath(join(dirname(__file__), '..'))  # Root AccountFree directory.
    if exists(join(cwd, '.git')):
        date_str = check_output(cmd, cwd=cwd).decode('utf-8').split(' ')[0]
        try:
            date = datetime.fromisoformat(date_str)
            __VERSION__ += '.dev0+git' + date.strftime('%Y%m%d')
        except ValueError:
            # Date cannot be parsed, not git root?
            pass

if __name__ == "__main__":
    from .logarithmplotter import run
    run()
