python -m pip install -U pyinstaller
pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter
