rem Need pyinstaller >= 4.3, or there is an issue regarding the PATH of the building.
python -m pip install -U pyinstaller>=4.3
pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter
