# Changelog

## v0.1.7 (03 Feb 2022)

**New**

  * The history browser has been completly redesigned, improving UX.
  * The history browser now features a filter bar.
  * All side panel tabs now have a visually identifiable scrollbar.

**Changes**

  * Shorter rich text representations of history entries to improve readability.
  * Usage of gradiants and icons to better identify history entries at a glance.
  * History entries are now showing the whole label on several lines, instead of cutting it at the end.
  * New history action for renaming.
  * New history action for coloring. Note: color changing history items created in previous versions of LogarithmPlotter will not be updated to the new action.
  * Tooltips for object creation buttons have been added.
  * Tooltips have been set to have a delay of 200ms to match most software's handling of them.
  * Object creation buttons now have a unified style accross all platforms.

**Added translations**

  * History action of renaming objects.
  * History action of changing the color of objects.
  * Filtering for history browser.

**Fixed bugs**

  * Visibility history actions (shown and hidden) are now properly saved, solving the issue that when loading file with one, it's not automaticly changed to "Show".
  * Name changes history actions are now properly saved.
  * Non translated object type on the "+ Create new object" item selection combobox for Bode Magnitude and Phase.
  * Proper handling for future LogarithmPlotter files.
  * Shortcuts not being displayed in the menu bar are now properly shown.
  * (flatpak) Black versions of the icons when using a black theme with the KDE SDK.
  * (debian) Fixed launchpad building properly.

**Internal changes**

  * Better organisation on icons.
  * Historylib has been separated in several files.
  * Trying to switch metainfo once more to try and fix another bug.
  * Keywords added to metainfo.

## v0.1.6 (29 Jan 2022)

**New**

  * A new changelog popup is available at startup and in the help menu.

**Added translations**

  * Object properties names.
  * Object properties enum values.
  * Object comments.
  * Most elements using a ":".

**Fixed bugs**

  * X Cursor's targets can now be set to null.
  * History now imports domains and objects properly.
  * Proper handling for future LogarithmPlotter files.
  * (debian) Fixing bug that created a /build directory and didn't put the icons in the right directories.

**Other**

  * Other: Refractoring done on helper.
  * Other: All QML elements are now properly commented.
  * Other: Scripts have been moved to it's own directory.
  * Other: Added changelog to metainfo for flathub.

## v0.1.5 (26 Jan 2022)

**New**

  * LogarithmPlotter has now better handling of very high values in logarithmic scale.

**Added translations**

  * Flatpak metadata, including translated image.

**Fixed bugs**

  * (!) File saving dialog was not working.
  * (!) Debian packages does include any language file.
  * X Cursor pointing does not detect any object.

## v0.1.4 (24 Jan 2022)

**New**

  * LogarithmPlotter detects unsaved changes.
  * LogarithmPlotter is now translated! See https://hosted.weblate.org/engage/logarithmplotter/ to help.
  * New translation: English by Ad5001: 100%
  * New translation: French by Ad5001: 100%
  * New translation: German by Ad5001: 100%
  * New translation: Hungarian by Óvári (@ovari on github): 100%
  * New translation: Norvegian by Allan Nordhøy (@comradekingu on github): 80%

**Fixed bugs**

  * Fixed bug: No notification when closing LogarithmPlotter with unsaved changes.
  * Fixed bug: π unavailable in symbols.

## v0.1.3 (18 Jan 2022)

**Fixed bugs**

  * Confined packages (snapcraft & flatpak) won't show error messages related to update checks.
  * Equations of the form (x + y) / z were not being simplified properly.
 
## v0.1.2 (30 Sep 2021)

**Fixed bugs**

  * Unable to move Bode diagrams elements when having deleted the sum element.
  * Names were not not being changed from previous object when editing a new one.
  * Bode Magnitude was not drawn far enough.
  * Bode Magnitude had undefined ending.
  * Other bugs patched in v0.1.1.
 
## v0.1 (26 Aug 2021)
 
  * Initial release.

