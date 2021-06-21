cp win/* README.md LICENSE.md dist/logarithmplotter/
rem Creating installer
cd dist/logarithmplotter/
"C:\Program Files (x86)\NSIS\makensis" installer.nsi
