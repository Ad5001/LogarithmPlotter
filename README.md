# ![icon](https://git.ad5001.eu/Ad5001/LogarithmPlotter/raw/branch/master/logplotter.svg) LogarithmPlotter
[![Build Status](https://ci.ad5001.eu/api/badges/Ad5001/LogarithmPlotter/status.svg)](https://ci.ad5001.eu/Ad5001/LogarithmPlotter)
[![Translation status](https://hosted.weblate.org/widgets/logarithmplotter/-/logarithmplotter/svg-badge.svg)](https://hosted.weblate.org/engage/logarithmplotter/)
[![On flathub](https://img.shields.io/flathub/v/eu.ad5001.LogarithmPlotter?label=on%20flathub&logo=Flathub&logoColor=white&color=4A86CF)](https://flathub.org/apps/details/eu.ad5001.LogarithmPlotter)
[![On Snapcraft](https://badgen.net/snapcraft/v/logarithmplotter?label=on%20snapstore&color=82BEA0&icon=https://ad5001.eu/icons/skills/snapcraft.svg)](https://snapcraft.io/logarithmplotter)

2D plotter software to make Bode plots, sequences and distribution functions.

## Screenshots
![Magnitude example](https://apps.ad5001.eu/img/full/logarithmplotter.png)
![Phase example](https://apps.ad5001.eu/img/en/logarithmplotter/phase.png)
![Object settings](https://apps.ad5001.eu/img/en/logarithmplotter/object-settings.webp)

You can find more screenshots on the [app website](https://apps.ad5001.eu/logarithmplotter/).

## Run

You can simply run LogarithmPlotter using `python3 run.py`.

In order to test translations, you can use the `--lang=<lang code>` command line option to force the detected locale of LogarithmPlotter.

## Install

### Generate installers:
All scripts noted here can be found in the `scripts` directory.

You can generate installers from LogarithmPlotter after installing all the dependencies:   
For all builds, you need [Python 3](https://python.org) with [PySide6](https://pypi.org/project/PySide6/) installable with `pip install PySide6`.    
- Windows installer: 
    - You need `pyinstaller`. You can install it using `pip install pyinstaller`.    
    - Run the `build-windows.bat` script (or `build-wine.sh` if you're cross-compiling with wine on Linux) to build an exe for LogarithmPlotter.
    - You also need [NSIS](https://nsis.sourceforge.io/Main_Page) (Linux users can install the [nsis](https://pkgs.org/download/nsis) package).    
    - Run the `package-windows.bat` script (or `package-wine.sh`if you're cross-compiling on Linux). You will find a logarithmplotter-setup.exe installer in the dist/accountfree/ folder.
- MacOS Archive creator installer: 
    - You need `pyinstaller`. You can install it using `pip install pyinstaller`.    
    - Run the `build-macosx.sh` script to build an .app for LogarithmPlotter which can be found in the dist directory.
    - Run the `package-macosx.sh` script. You will find a LogarithmPlotter-v0.1-dev-setup.dmg installer in the dist/ folder.
- Linux packages:
    - To build a DEB, you need DPKG and stdeb. You can install the later by using `pip install stdeb`.
    - To build and install the flatpak, you need [flatpak-builder](https://docs.flatpak.org/en/latest/flatpak-builder.html) installed.
    - To build the snap, you need [snapcraft](https://snapcraft.io) installed.
    - Run `package-linux.sh`.

    
### Linux

Run `bash linux/install_local.sh`

## Contribute

There are several ways to contribute to LogarithmPlotter. 
- You can help to translate [the project on Hosted Weblate](https://hosted.weblate.org/engage/logarithmplotter/):
[![Translation status](https://hosted.weblate.org/widgets/logarithmplotter/-/logarithmplotter/multi-auto.svg)](https://hosted.weblate.org/engage/logarithmplotter/)

- You can help the development of LogarithmPlotter. In order to get started, take a look at the [wiki](https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_pages).

## Legal notice
        LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
        Copyright (C) 2021-2024  Ad5001 <mail@ad5001.eu>

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

Language files translations located at LogarithmPlotter/i18n are licensed under GNU GPL3.0+ and are copyrighted by their original authors. See LICENSE.md for more details:
- 🇭🇺 Hungarian translation by [Óvári](https://github.com/ovari)
- 🇳🇴 Norwegian translation by [Allan Nordhøy](https://github.com/comradekingu)
- 🇪🇸 Spanish translation by gallegonovato and [IngrownMink4](https://github.com/IngrownMink4)

### Libraries used

LogarithmPlotter includes [expr-eval](https://github.com/silentmatt/expr-eval) a port of [ndef.parser](https://web.archive.org/web/20111023001618/http://www.undefined.ch/mparser/index.html) by Raphael Graf &lt;r@undefined.ch&gt;, ported to javascript by Matthew Crumley &lt;email@matthewcrumley.com&gt; (http://silentmatt.com/), and then to QMLJS by Ad5001.

The specific file (LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter/js/expr-eval.js) is licensed under the [MIT License](https://raw.githubusercontent.com/silentmatt/expr-eval/master/LICENSE.txt).
