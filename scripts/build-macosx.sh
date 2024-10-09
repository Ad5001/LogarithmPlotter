#!/usr/bin/env bash
DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.." || exit 1

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

rm $(find . -name "*.pyc")

pyinstaller --add-data "LogarithmPlotter/qml:qml" \
            --add-data "LogarithmPlotter/i18n:i18n" \
            --add-data "LICENSE.md:." \
            --add-data "../assets/native/mac/logarithmplotterfile.icns:." \
            --add-data "README.md:." \
            --exclude-module "FixTk" \
            --exclude-module "tcl" \
            --exclude-module "tk" \
            --exclude-module "_tkinter" \
            --exclude-module "tkinter" \
            --exclude-module "Tkinter" \
            --noconsole \
            --noconfirm \
            --icon=../../assets/native/mac/logarithmplotter.icns \
            --osx-bundle-identifier eu.ad5001.LogarithmPlotter \
            -n LogarithmPlotter \
            LogarithmPlotter/logarithmplotter.py 

cp ../../assets/native/mac/Info.plist dist/LogarithmPlotter.app/Contents/Info.plist

# Remove QtWebEngine, 3D and all other unused libs libs
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/{QtWeb*,*3D*,QtRemote*,QtPdf,QtCharts,QtLocation,QtTest,QtMultimedia,QtSpatialAudio,QtDataVisualization,QtQuickParticles,QtChartsQml,QtScxml,QtDataVisualizationQml,QtTest,QtPositioningQuick,QtQuickTest,QtSql,QtSensorsQuick}
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/QtNetwork.abi3.so

# Removing QtQuick3D
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/{QtQuick3D,Qt3D,QtWebEngine}

# Remove the QtQuick styles that are unused
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/QtQuick/Controls/{Imagine,Material,iOS,Universal,designer}
