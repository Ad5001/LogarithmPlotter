#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.." || exit 1

box() {
    len=${#1}
    echo "┌─$(printf '─%.0s' $(seq 1 "$len"))─┐"
    echo "│ $1 │"
    echo "└─$(printf '─%.0s' $(seq 1 "$len"))─┘"
}

rebuild=true

cd runtime-pyside6/tests/plugins || exit 1
box "Testing pytest natural plugins..."
PYTHONPATH="$PYTHONPATH:." pytest --cov=natural --cov-report term-missing . || exit 1
cd ../../../

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
rm -rf build/runtime-pyside6/tests
cp -r runtime-pyside6/tests build/runtime-pyside6
cp -r ci CHANGELOG.md build/runtime-pyside6
cd build/runtime-pyside6 || exit 1
box "Testing runtime-pyside6..."
PYTHONPATH="$PYTHONPATH:." pytest --cov=LogarithmPlotter --cov-report term-missing . || exit 1
cd ../../

# Run js tests
cd common || exit 1
box "Testing common..."
npm test || exit 1

