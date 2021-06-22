#!/usr/bin/env bash
# Untested yet
rm $(find . -name "*.qmlc")
rm $(find . -name "*.pyc")
python3 -m pip install -U pyinstaller
iconutil -c icns "mac/logarithmplotter.iconset"
pyinstaller --add-data "LogarithmPlotter/qml:qml" \
            --add-data "LICENSE.md:." \
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
            --osx-bundle-identifier eu.ad5001.logarithmplotter \
            -n LogarithmPlotter \
            LogarithmPlotter/__init__.py 
