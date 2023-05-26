rem Make sure pyinstaller is installed
python -m pip install -U pyinstaller

rem Building translations
cd "LogarithmPlotter\i18n"
cmd release.sh
cd ..\..

pyinstaller --add-data "logplotter.svg;." --add-data "LogarithmPlotter/qml;qml" --add-data "LogarithmPlotter/i18n;i18n" --noconsole LogarithmPlotter/logarithmplotter.py --icon=win/logarithmplotter.ico -n logarithmplotter

rem Remove QtWebEngine
del dist\logarithmplotter\PySide6\Qt6WebEngineCore.dll
rem Remove the QtQuick styles that are unused
rmdir dist\logarithmplotter\PySide6\qml\QtQuick\Controls\Imagine /s /q
rmdir dist\logarithmplotter\PySide6\qml\QtQuick\Controls\Material /s /q
rmdir dist\logarithmplotter\PySide6\qml\QtQuick\Controls\designer /s /q
rem Remove unused translations
