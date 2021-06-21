#!/bin/bash
# Giving pyinstaller another run
rm $(find . -name "*.qmlc")
rm $(find . -name "*.pyc")
wine python -m pip install -U pyinstaller
wine pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --noconsole LogarithmPlotter/__init__.py --icon=win/logarithmplotter.ico -n logarithmplotter
