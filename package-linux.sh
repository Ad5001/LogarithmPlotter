#!/bin/bash

# Building translations
cd "LogarithmPlotter/i18n/"
bash release.sh
cd ../../

# Deb
python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file linux/debian/copyright --suite impish --depends3 "$(cat linux/debian/depends)" --section science \
    --debian-version "ppa1" bdist_deb

# Flatpak building
FLATPAK_BUILDER=$(which flatpak-builder)
if [ -z $FLATPAK_BUILDER ]; then
    echo "flatpak-builder not installed. Will not proceed to build flatpak."
else
    cd linux/flatpak
    flatpak-builder AppDir eu.ad5001.LogarithmPlotter.json --user --force-clean --install
    cd ../../
fi

# Snapcraft building
SNAPCRAFT=$(which snapcraft)
if [ -z $SNAPCRAFT ]; then
    echo "snapcraft not installed. Will not proceed to build snap"
else
    snapcraft
fi
