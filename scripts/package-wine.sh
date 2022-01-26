#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

# Moving files
cp win/* README.md LICENSE.md dist/logarithmplotter/
# Creating installer
cd dist/logarithmplotter/
makensis installer.nsi
