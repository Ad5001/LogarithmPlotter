#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit 1

rm -rf build
bash scripts/build.sh
cd build/runtime-pyside6 || exit 1

mkdir assets
cp -r ../../assets/{native,*.svg} assets/
cp ../../README.md .

python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file assets/native/linux/debian/copyright \
    --suite noble --depends3 "$(cat assets/native/linux/debian/depends)" --section science \
    bdist_deb
