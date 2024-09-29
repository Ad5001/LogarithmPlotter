#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit 1

# Moving files
cp assets/native/win/* README.md LICENSE.md build/dist/logarithmplotter/
# Creating installer
cd build/dist/logarithmplotter/
makensis installer.nsi
