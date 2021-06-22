#!/bin/bash
VERSION=0.0.1-dev0
title="LogarithmPlotter v${VERSION} Setup"
finalDMGName="LogarithmPlotter-v${VERSION}-setup.dmg"
applicationName=LogarithmPlotter
backgroundPictureName=logarithmplotter-installer-background.png
source=Installer

cd dist
rm -rf Installer
mkdir -p Installer
mkdir -p Installer/.background
cp ../mac/install-bg.png "./Installer/.background/${backgroundPictureName}"
cp -r LogarithmPlotter.app Installer/LogarithmPlotter.app
cp ../LICENSE.md Installer/LICENSE.md
cp ../README.md Installer/README.md

# Calculating folder size
duoutput=$(du -h Installer | tail -n1)
size=$(expr ${duoutput%M*} + 2) # +2 for allowing small space to edit.
echo "Creating DMG file with size ${size}M."

# Adapted from https://stackoverflow.com/a/1513578
hdiutil create -srcfolder "${source}" -volname "${title}" -fs HFS+ \
      -fsargs "-c c=64,a=16,e=16" -format UDRW -size ${size}M pack.temp.dmg

device=$(hdiutil attach -readwrite -noverify -noautoopen "pack.temp.dmg" | \
         egrep '^/dev/' | sed 1q | awk '{print $1}')
         
sleep 3
         
echo '
   tell application "Finder"
     tell disk "'${title}'"
           open
           set current view of container window to icon view
           set toolbar visible of container window to false
           set statusbar visible of container window to false
           set the bounds of container window to {400, 100, 885, 475}
           set theViewOptions to the icon view options of container window
           set arrangement of theViewOptions to not arranged
           set icon size of theViewOptions to 72
           set background picture of theViewOptions to file ".background:'${backgroundPictureName}'"
           make new alias file at container window to POSIX file "/Applications" with properties {name:"Applications"}
           set position of item "'${applicationName}'" of container window to {100, 100}
           set position of item "Applications" of container window to {375, 100}
           set position of item "README.md" of container window to {185, 265}
           set position of item "LICENSE.md" of container window to {290, 265}
           update without registering applications
           delay 5
           close
     end tell
   end tell
' | osascript
chmod -Rf go-w /Volumes/"${title}"
sync
sync
hdiutil detach ${device}
hdiutil convert "pack.temp.dmg" -format UDZO -imagekey zlib-level=9 -o "${finalDMGName}"
rm -f pack.temp.dmg 
rm -rf Installer
