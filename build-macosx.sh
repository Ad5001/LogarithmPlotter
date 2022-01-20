#!/usr/bin/env bash
rm $(find . -name "*.qmlc")
rm $(find . -name "*.pyc")
python3 -m pip install -U pyinstaller

# Buiilding translations
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
