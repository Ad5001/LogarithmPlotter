#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit 1

# Moving files
cp assets/native/win/* README.md LICENSE.md build/runtime-pyside6/dist/logarithmplotter/
# Creating installer
cd build/runtime-pyside6/dist/logarithmplotter/ || exit 1
makensis installer.nsi
