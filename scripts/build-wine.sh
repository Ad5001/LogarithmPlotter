#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit

rebuild=true

while [ $# -gt 0 ]; do
    case "$1" in
        --no-rebuild)
            rebuild=false
            ;;
        *)
            box "Error: Invalid argument."
            exit 1
    esac
    shift
done

if [ "$rebuild" == "true" ]; then
    rm -rf build
    bash scripts/build.sh
fi

cd build/runtime-pyside6 || exit 1

rm -rf $(find . -name "*.pyc")

wine pyinstaller --add-data "LogarithmPlotter/logarithmplotter.svg;." \
                 --add-data "LogarithmPlotter/qml;qml" \
                 --add-data "LogarithmPlotter/i18n;i18n" \
                 --noconsole \
                 LogarithmPlotter/logarithmplotter.py \
                 --icon=../../assets/native/win/logarithmplotter.ico \
                 -n logarithmplotter

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
rm -r dist/logarithmplotter/_internal/PySide6/qml/{Qt3D,QtQuick3D}
rm dist/logarithmplotter/_internal/PySide6/Qt6{Pdf.dll,*3D*,Location.dll}
