#!/usr/bin/env bash
DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."


rm $(find . -name "*.qmlc")
rm $(find . -name "*.pyc")
python3 -m pip install -U pyinstaller

# Building translations
cd "LogarithmPlotter/i18n/"
bash release.sh
cd ../../

pyinstaller --add-data "LogarithmPlotter/qml:qml" \
            --add-data "LogarithmPlotter/i18n:i18n" \
            --add-data "LICENSE.md:." \
            --add-data "mac/logarithmplotterfile.icns:." \
            --add-data "README.md:." \
            --exclude-module "FixTk" \
            --exclude-module "tcl" \
            --exclude-module "tk" \
            --exclude-module "_tkinter" \
            --exclude-module "tkinter" \
            --exclude-module "Tkinter" \
            --noconsole \
            --noconfirm \
            --icon=mac/logarithmplotter.icns \
            --osx-bundle-identifier eu.ad5001.LogarithmPlotter \
            -n LogarithmPlotter \
            LogarithmPlotter/logarithmplotter.py 

cp mac/Info.plist dist/LogarithmPlotter.app/Contents/Info.plist

# Remove QtWebEngine, 3D and all other unused libs libs
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/{QtWeb*,*3D*,QtRemote*,QtPdf,QtCharts,QtLocation,QtTest,QtNetwork,QtMultimedia,QtSpatialAudio,QtDataVisualization,QtQuickParticles,QtChartsQml,QtScxml,QtDataVisualizationQml,QtTest,QtPositioningQuick,QtQuickTest,QtSql,QtSensorsQuick}
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/{QtNetwork.abi3.so}

# Removing QtQuick3D
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/QtQuick3D
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/Qt3D
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/QtWebEngine

# Remove the QtQuick styles that are unused
rm -rf dist/LogarithmPlotter.app/Contents/MacOS/PySide6/Qt/qml/QtQuick/Controls/{Imagine,Material,iOS,Universal,Fusion,designer}
