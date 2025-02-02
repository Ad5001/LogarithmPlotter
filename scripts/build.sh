#!/usr/bin/env bash
# 
# LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
# Copyright (C) 2021-2024  Ad5001
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

# This script builds a dist version of LogarithmPlotter

DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.." || exit 1

BUILD_DIR="build/runtime-pyside6"
BUILD_QML_DIR="$BUILD_DIR/LogarithmPlotter/qml/eu/ad5001/LogarithmPlotter"


box() {
    len=${#1}
    echo "┌─$(printf '─%.0s' $(seq 1 "$len"))─┐"
    echo "│ $1 │"
    echo "└─$(printf '─%.0s' $(seq 1 "$len"))─┘"
}

rm -rf build
mkdir -p "$BUILD_DIR"

# Copy python
box "Copying pyside6 python runtime..."
cp -r runtime-pyside6/{setup.py,LogarithmPlotter} "$BUILD_DIR"

box "Building ecmascript modules..."
mkdir -p "$BUILD_QML_DIR/js"
cd common && \
    (npm run build || exit) && \
    cd ..

box "Building translations..."
cd assets/i18n/ && (bash release.sh || exit) && cd ../../
mkdir -p "$BUILD_DIR/LogarithmPlotter/i18n" && cp assets/i18n/*.qm "$BUILD_DIR/LogarithmPlotter/i18n/"

box "Building icons..."
cp -r assets/icons "$BUILD_QML_DIR"
cp assets/logarithmplotter.svg "$BUILD_DIR/LogarithmPlotter/"
