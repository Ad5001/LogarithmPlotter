#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

rm -rf build
bash scripts/build.sh

# Run python tests
cp -r runtime-pyside6/tests build/runtime-pyside6
PYTHONPATH="$PYTHONPATH:." pytest --cov=LogarithmPlotter --cov-report term-missing .
npm test

