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



# Run python tests
cp -r runtime-pyside6/tests build/runtime-pyside6
cp -r ci CHANGELOG.md build/runtime-pyside6
cd build/runtime-pyside6 || exit 1
PYTHONPATH="$PYTHONPATH:." pytest --cov=LogarithmPlotter --cov-report term-missing .
cd ../../

# Run js tests
cd common || exit 1
npm test

