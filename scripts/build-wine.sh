#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

rm -rf dist

rm $(find . -name "*.qmlc")
rm -rf $(find . -name "*.pyc")
wine python -m pip install -U pyinstaller

# Building translations
cd "LogarithmPlotter/i18n/"
bash release.sh
cd ../../

wine pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --add-data "LogarithmPlotter/i18n;i18n" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter

# Copy Qt6ShaderTools, a required library for for Qt5Compat
PYSIDE6PATH="$(wine python -c "import PySide6; from os import path; print(path.dirname(PySide6.__file__));")"
# Converting PySide6 path to absolute path
DRIVEC="${WINEPREFIX:-$HOME/.wine}/drive_c"
PYSIDE6PATH="${PYSIDE6PATH%$'\r'}"
PYSIDE6PATH="${PYSIDE6PATH//\\/\/}"
PYSIDE6PATH="${PYSIDE6PATH//C:/$DRIVEC}"
cp "$PYSIDE6PATH/Qt6ShaderTools.dll" dist/logarithmplotter/_internal/PySide6/

# Remove QtWebEngine
rm dist/logarithmplotter/_internal/PySide6/Qt6WebEngineCore.dll

# Remove the QtQuick styles that are unused
rm -rf dist/logarithmplotter/_internal/PySide6/qml/QtQuick/Controls/{Imagine,Material,designer}

# Remove unused tools
rm dist/logarithmplotter/_internal/PySide6/qml/{Qt3D,QtQuick3D}
rm dist/logarithmplotter/_internal/PySide6/Qt6{Pdf.dll,*3D*,Location.dll}
