#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

rm -rf build
bash scripts/build.sh

# Run python tests
cp -r runtime-pyside6/tests build/runtime-pyside6
cp -r ci CHANGELOG.md build/runtime-pyside6
cd build/runtime-pyside6 || exit 1
PYTHONPATH="$PYTHONPATH:." pytest --cov=LogarithmPlotter --cov-report term-missing .
cd ../../

# Run js tests
cd common
npm test

