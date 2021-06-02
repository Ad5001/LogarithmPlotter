#!/bin/bash
# Giving pyinstaller another run
cd ..
rm $(find . -name "*.qmlc")
rm $(find . -name "*.pyc")
cp run.py logarithmplotter.py
wine python -m pip install -U pyinstaller
wine pyinstaller --add-data "qml;qml" --noconsole logarithmplotter.py --icon=win/logplotter.ico
rm logarithmplotter.py
