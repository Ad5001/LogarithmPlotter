python -m pip install -U pyinstaller
pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --noconsole LogarithmPlotter/__init__.py --icon=win/logarithmplotter.ico -n logarithmplotter
