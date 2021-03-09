#!/bin/bash
APPROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p ~/.local/share/applications
sed "s+/home/ad5001/Apps/LogarithmPlotter/+$APPROOT+g" "$APPROOT/linux/logplotter.desktop" > ~/.local/share/applications/logplotter.desktop
sed "s+/home/ad5001/Apps/LogarithmPlotter/+$APPROOT+g" "$APPROOT/linux/x-logarithm-plotter.xml" > ~/.local/share/mime/x-logarithm-plotter.xml
mkdir -p ~/.local/share/icons/hicolor/scalable/mimetypes
cp "$APPROOT/linux/logplotterfile.svg" ~/.local/share/icons/hicolor/scalable/mimetypes/application-x-logarithm-plotter.svg
update-mime-database ~/.local/share/mime/
update-icon-caches ~/.local/share/icons/hicolor
