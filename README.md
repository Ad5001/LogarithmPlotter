# ![icon](https://git.ad5001.eu/Ad5001/LogarithmicPlotter/raw/branch/master/logplotter.svg) LogarithmPlotter
[![Build Status](https://ci.ad5001.eu/api/badges/Ad5001/AccountFree/status.svg)](https://ci.ad5001.eu/Ad5001/AccountFree)

Create graphs with logarithm scales, namely BODE diagrams.

## Run

You can simply run LogarithmPlotter using `python3 run.py`.

## Install

### Generate installers:
You can generate installers from AccountFree after installing all the dependencies:   
For all builds, you need [Python 3](https://python.org) with [PySide2](https://pypi.org/project/PySide2/) installable with `pip install PySide2`.    
- Windows installer: 
    - You need `pyinstaller`. You can install it using `pip install pyinstaller`.    
    - Run the `build-windows.bat` script (or `build-wine.sh` if you're cross-compiling with wine on Linux) to build an exe for LogarithmPlotter.
    - You also need [NSIS](https://nsis.sourceforge.io/Main_Page) (Linux users can install the [nsis](https://pkgs.org/download/nsis) package).    
    - Run the `package-windows.bat` script (or `package.wine.sh`if you're cross-compiling on Linux). You will find a logarithmplotter-setup.exe installer in the dist/accountfree/ folder.
- MacOS Archive creator installer: 
    - You need `pyinstaller`. You can install it using `pip install pyinstaller`.    
    - Run the `build-macosx.sh` script to build an .app for AccountFree which can be found in the dist directory.
    - Run the `package-macosx.sh` script. You will find a LogarithmPlotter-v0.0.1-dev-setup.dmg installer in the dist/ folder.
- Linux packages:
    - To build a DEB, you need DPKG and stdeb. You can install the later by using `pip install stdeb`.
    - Run `package-linux.sh`.

    
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
