#!/bin/bash
# 
# AccountFree - Browse and use online services, free of account.
# Copyright (C) 2021  Ad5001 <mail@ad5001.eu>
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
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# This script installs the desktop file & mime type for development environment, linking it directly to run.py.

APPROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Adding desktop file..."
sed "s+ROOTFOLDER+$APPROOT/+g" "$APPROOT/linux/logplotter.desktop" > "$APPROOT/linux/logarithmplotter-local.desktop"
xdg-desktop-menu install "$APPROOT/linux/logarithmplotter-local.desktop"
echo "Installing mime-type..."
xdg-mime install "$APPROOT/linux/x-logarithm-plot.xml"
echo "Installing icons..."
mkdir -p ~/.local/share/icons/hicolor/scalable/mimetypes
cp "$APPROOT/linux/application-x-logarithm-plot.svg" ~/.local/share/icons/hicolor/scalable/mimetypes/application-x-logarithm-plot.svg
mkdir -p ~/.local/share/icons/hicolor/scalable/apps
cp "$APPROOT/logplotter.svg" ~/.local/share/icons/hicolor/scalable/apps/logarithmplotter.svg
# xdg-icon-resource does not work with SVG yet. See https://bugs.launchpad.net/ubuntu/+source/xdg-utils/+bug/790449.
#xdg-icon-resource install --context mimetypes --novendor "$APPROOT/linux/application-x-logarithm-plot.svg" "application-x-logarithm-plot"
#xdg-icon-resource install --context apps --novendor "$APPROOT/logplotter.svg" "logarithmplotter"
update-mime-database ~/.local/share/mime/
update-icon-caches ~/.local/share/icons/hicolor
