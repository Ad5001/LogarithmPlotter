XCOPY win/*.* dist/logarithmplotter/ /C /S /D /Y /I
XCOPY README.md dist/logarithmplotter/ /C /D /Y
XCOPY LICENSE.md dist/logarithmplotter/ /C /D /Y
rem Creating installer
cd dist/logarithmplotter/
"C:\Program Files (x86)\NSIS\makensis" installer.nsi
