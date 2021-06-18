# LogarithmPlotter

Create graphs with logarithm scales, namely BODE diagrams.

## Install

### Windows
You can generate installers from AccountFree after installing all the dependencies:
- Windows installer: 
    - You need `pyinstaller`. You can install it using `pip install pyinstaller`.    
    - Run the `win/build-windows.bat` script (or `win/build-wine.sh` if you're cross-compiling with wine on Linux) to build an exe for AccountFree.
    - You also [NSIS](https://nsis.sourceforge.io/Main_Page) (Linux users can install the `nsis` package).    
    - Run the `win/package-windows.bat` script (or `win/package.wine.sh`if you're cross-compiling on Linux). You will find a accountfre-esetup.exe installer in the dist/logarithmplotter/ folder.

    
### Linux

Run `bash linux/install_local.sh`

## Legal notice
        LogarithmPlotter - Create graphs with logarithm scales.
        Copyright (C) 2021  Ad5001 <mail@ad5001.eu>

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <https://www.gnu.org/licenses/>.
