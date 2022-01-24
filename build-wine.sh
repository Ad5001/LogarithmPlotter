#!/bin/bash
# Giving pyinstaller another run
rm $(find . -name "*.qmlc")
rm -rf $(find . -name "*.pyc")
wine python -m pip install -U pyinstaller

# Building translations
cd "LogarithmPlotter/i18n/"
bash release.sh
cd ../../

wine pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --add-data "LogarithmPlotter/i18n;i18n" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter
