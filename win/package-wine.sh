#!/bin/bash
# Moving files
cp * ../README.md ../LICENSE.md ../dist/logarithmplotter/
# Creating installer
cd ../dist/logarithmplotter/
makensis installer.nsi
