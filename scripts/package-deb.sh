#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

rm -rf build
bash scripts/build.sh
cd build || exit 1

# Deb
sudo python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file linux/debian/copyright --suite noble --depends3 "$(cat linux/debian/depends)" --section science \
    bdist_deb
