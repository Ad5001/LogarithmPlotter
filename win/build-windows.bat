cd ..
cp run.py logarithmplotter.py
python -m pip install -U pyinstaller
pyinstaller --add-data "qml;qml" --noconsole logarithmplotter.py --icon=win/logplotter.ico
rm logarithmplotter.py
