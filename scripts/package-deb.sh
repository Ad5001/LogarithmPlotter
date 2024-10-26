#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit 1

rebuild=true

while [ $# -gt 0 ]; do
    case "$1" in
        --no-rebuild)
            rebuild=false
            ;;
        *)
            box "Error: Invalid argument."
            exit 1
    esac
    shift
done

if [ "$rebuild" == "true" ]; then
    rm -rf build
    bash scripts/build.sh
fi

cd build/runtime-pyside6 || exit 1

mkdir assets
cp -r ../../assets/{native,*.svg} assets/
cp ../../README.md .

# Build for noble
python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file assets/native/linux/debian/copyright \
    --suite noble --depends3 "$(cat assets/native/linux/debian/depends.wheels)" --section science \
    --debian-version +wheels-1 bdist_deb

mv deb_dist deb_dist.noble

# Build for oracular (different dependencies)
python3 setup.py --remove-git-version --command-packages=stdeb.command sdist_dsc \
    --package logarithmplotter --copyright-file assets/native/linux/debian/copyright \
    --suite oracular --depends3 "$(cat assets/native/linux/debian/depends.packaged)" --section science \
    --debian-version +packaged-1 bdist_deb

mv deb_dist deb_dist.oracular
