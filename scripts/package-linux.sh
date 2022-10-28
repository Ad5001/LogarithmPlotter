#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

# Building translations
cd "LogarithmPlotter/i18n/"
bash release.sh
cd ../../

# Deb
sudo python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file linux/debian/copyright --suite jammy --depends3 "$(cat linux/debian/depends)" --section science \
    bdist_deb

# Flatpak building
FLATPAK_BUILDER=$(which flatpak-builder)
if [ -z $FLATPAK_BUILDER ]; then
    echo "flatpak-builder not installed. Will not proceed to build flatpak."
else
    cd linux
    git clone https://github.com/Ad5001/eu.ad5001.LogarithmPlotter
    cd eu.ad5001.LogarithmPlotter
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
