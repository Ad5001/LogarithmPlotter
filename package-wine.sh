#!/bin/bash
# Moving files
cp win/* README.md LICENSE.md dist/logarithmplotter/
# Creating installer
cd dist/logarithmplotter/
ls
makensis installer.nsi
