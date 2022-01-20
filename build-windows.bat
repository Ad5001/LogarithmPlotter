rem Need pyinstaller >= 4.3, or there is an issue regarding the PATH of the building.
python -m pip install -U pyinstaller>=4.3

rem Buiilding translations
cd "LogarithmPlotter\i18n"
bash release.sh
cd ..\..

pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --add-data "LogarithmPlotter/i18n;i18n" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter
