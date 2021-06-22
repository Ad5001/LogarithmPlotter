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

APPROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Adding desktop file..."
mkdir -p ~/.local/share/applications
sed "s+ROOTFOLDER+$APPROOT/+g" "$APPROOT/linux/logarithmplotter.desktop" > ~/.local/share/applications/logarithmplotter.desktop
echo "Installing mime-type..."
mkdir -p ~/.local/share/applications
sed "s+ROOTFOLDER+$APPROOT/+g" "$APPROOT/linux/x-logarithm-plotter-old.xml" > ~/.local/share/mime/packages/x-logarithm-plotter.xml
mkdir -p ~/.local/share/icons/hicolor/scalable/mimetypes
cp "$APPROOT/logplotterfile.svg" ~/.local/share/icons/hicolor/scalable/mimetypes/application-x-logarithm-plotter.svg
update-mime-database ~/.local/share/mime/
update-icon-caches ~/.local/share/icons/hicolor
