# ![icon](https://apps.ad5001.eu/icons/apps/svg/logarithmplotter.svg) LogarithmPlotter

[![Build Status](https://ci.ad5001.eu/api/badges/Ad5001/LogarithmPlotter/status.svg)](https://ci.ad5001.eu/Ad5001/LogarithmPlotter)
[![Translation status](https://hosted.weblate.org/widgets/logarithmplotter/-/logarithmplotter/svg-badge.svg)](https://hosted.weblate.org/engage/logarithmplotter/)
[![On flathub](https://img.shields.io/flathub/v/eu.ad5001.LogarithmPlotter?label=on%20flathub&logo=Flathub&logoColor=white&color=4A86CF)](https://flathub.org/apps/details/eu.ad5001.LogarithmPlotter)
[![On Snapcraft](https://badgen.net/snapcraft/v/logarithmplotter?label=on%20snapstore&color=82BEA0&icon=https://ad5001.eu/icons/skills/snapcraft.svg)](https://snapcraft.io/logarithmplotter)

2D plotter software to make Bode plots, sequences and distribution functions.

## Screenshots

![Magnitude example](https://apps.ad5001.eu/img/full/logarithmplotter.png)
![Phase example](https://apps.ad5001.eu/img/en/logarithmplotter/phase.png)
![Object settings](https://apps.ad5001.eu/img/en/logarithmplotter/object-settings.webp)

You can find more screenshots on the [app's website](https://apps.ad5001.eu/logarithmplotter/).

## Build & Run

First, you'll need to install all the required dependencies:

- [Python 3](https://python.org) with [poetry](https://python-poetry.org/), setup a virtual environment, go to the `runtime-pyside6` directory, and call
  `poetry install`.
- [npm](https://npmjs.com) (or [yarn](https://yarnpkg.com/)), go to the `common` directory, and run `npm install` (or `yarn install`).

You can simply run LogarithmPlotter using `python3 run.py`. It automatically compiles the language files (requires
`pyside6-lrelease` to be installed and in path), and the JavaScript modules.

If you do not wish do recompile the files again on every run, you can use the build script (`scripts/build.sh`) and run
`python3 build/runtime-pyside6/LogarithmPlotter/logarithmplotter.py`.

In order to test translations, you can use the `--lang=<lang code>` commandline option to force the locale.

## Install

### Generate installers:

All scripts noted here can be found in the `scripts` directory.

You can generate installers for LogarithmPlotter after installing all the dependencies.

- Windows installer (crosscompiling from Linux):
    - Run  `build-wine.sh` (requires wine) to build an exe for LogarithmPlotter in build/runtime-pyside6/dist.
    - You also need [NSIS](https://nsis.sourceforge.io/Main_Page) (the [nsis](https://pkgs.org/download/nsis) package is available on linux).
    - Run the `package-wine.sh` script. You will find a logarithmplotter-setup.exe installer in the build/runtime-pyside6/dist/logarithmplotter/ folder.
- MacOS Archive creator installer:
    - Run the `build-macosx.sh` script to build an .app for LogarithmPlotter which can be found in the build/runtime-pyside6/dist directory.
    - Run the `package-macosx.sh` script. You will find a LogarithmPlotter-v&lt;version&gt;-setup.dmg installer in the
      build/runtime-pyside6/build/pysdist/ folder.
- Linux packages:
    - Run `package-deb.sh`. It will create an DSC and a DEB in build/runtime-pyside6/deb_dist/
    - Run `scripts/build.sh` followed by `snapcraft`. It .snap file in the root directory.
    - See [the flatpak repo](https://github.com/Ad5001/eu.ad5001.LogarithmPlotter) for instrutions on how to build the flatpak.

## Contribute

There are several ways you can contribute to LogarithmPlotter.

- You can help to translate [the project on Hosted Weblate](https://hosted.weblate.org/engage/logarithmplotter/):
  [![Translation status](https://hosted.weblate.org/widgets/logarithmplotter/-/logarithmplotter/multi-auto.svg)](https://hosted.weblate.org/engage/logarithmplotter/)

- You can help the development of LogarithmPlotter. In order to get started, take a look at
  the [wiki](https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_pages).

## Tests

To run LogarithmPlotter's tests, follow these steps:

- Python
    - Install python3 and [poetry](https://python-poetry.org/)
    - Create and activate virtual env (recommended)
    - Go into `runtime-pyside6` and run `poetry install --with test`
- ECMAScript
    - Install node with npm
    - Go into `common` and run `npm install -D`

Finally, to actually run the tests:
    - Run `scripts/run-tests.sh`

## Legal notice

        LogarithmPlotter - 2D plotter software to make Bode plots, sequences and repartition functions.
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

Language files translations located at LogarithmPlotter/i18n are licensed under GNU GPL3.0+ and are copyrighted by their
original authors. See LICENSE.md for more details:

- 🇭🇺 Hungarian translation by [Óvári](https://github.com/ovari)
- 🇳🇴 Norwegian translation by [Allan Nordhøy](https://github.com/comradekingu)
- 🇪🇸 Spanish translation by gallegonovato and [IngrownMink4](https://github.com/IngrownMink4)

### Libraries used

LogarithmPlotter includes [expr-eval](https://github.com/silentmatt/expr-eval) a port
of [ndef.parser](https://web.archive.org/web/20111023001618/http://www.undefined.ch/mparser/index.html) by Raphael Graf
&lt;r@undefined.ch&gt;, ported to javascript by Matthew Crumley
&lt;email@matthewcrumley.com&gt; (http://silentmatt.com/), and then to QMLJS by Ad5001.

All files in (LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter/js/lib/expr-eval/) except integration.mjs are licensed
under the [MIT License](https://raw.githubusercontent.com/silentmatt/expr-eval/master/LICENSE.txt).
