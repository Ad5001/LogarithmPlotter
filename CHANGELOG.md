# Changelog

## v0.2.0 (22 Apr 2022)

**New**

  * (EXPERIMENTAL) LogarithmPlotter now has an optional LaTeX integration.
  * It requires a LaTeX installation, including `latexmk` and `dvipng` available in the PATH.
  * NOTE: LaTeX support is disabled by default and is only for working for the rendering on the graph.
  * NOTE: The objects and history tab still use the legacy text based expression rendering.
  * Thanks and contributions dialog, showing included libraries and translations, their license and author(s).
  * LaTeX rendering can be disabled for texts, even if LaTeX is enabled.
  
**Changes**
  
  * History re/undos only redraw the graph every 4 change at most in order to speed up the process when re/undoing a lot of changes.
  * Gradients are no longer hidden when filtered out in the history tab.
  
**Added translations**

  * LaTeX options and error messages
  * Thanks and contribution dialog
  * New option for text.
  * Fixed translation of "repartition" which should be "distribution" in certain remaining strings.

**Fixed bugs**

  * (macos) #1 - Opening files don't work on compiled versions of LogarithmPlotter on MacOS
  * (snapcraft) Fixed bug preventing from launching LogarithmPlotter. This fix has been backported to v0.1.8.
  * (snapcraft) Files are now properly opened.
  * (snapcraft) Added changelog support.

**Internal changes**

  * Moved python modules to "util" directory for more clarity.
  * Moved flatpak metainfo to eu.ad5001.LogarithmPlotter repository.
  * Componented the Mathlib library in order to have a more readable source.
  * Added documentation for most internal JavaScript modules.
  * Merge label drawing methods due to it's complexity.
  * (flatpak) Updated SDK version to v5.15-21.08.

## v0.1.8 (19 Feb 2022)

**New**

  * There is now a [user manual](https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_Sidebar) for LogarithmPlotter! Contributions apprecriated.

**Changes**

  * A link to [LogarithmPlotter's official website](https://apps.ad5001.eu/logarithmplotter/) has been added in the about dialog.
  * A link to the [user manual](https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_Sidebar) has been added both on the greeting screen and the `Help` menu.

**Added translations**

  * User manual.
  * Official website.
  
**Fixed bugs**
  
  * The label position of X Cursors now display the label even when unexpected values are entered.
  * X Cursors target object in history are now properly rendered when no object were selected
  * Fixed slight clipping at the bottom of the border.
  * TextInput no longer allow to input forbidden characters for numbers.
  * ALT+ shortcuts on the menu bar now work. NOTE: May break some mobile configuration. [Qt bug report](https://bugreports.qt.io/browse/QTBUG-100539)
  * (flatpak) Buttons on side menu to create object now have proper width on startup.

**Internal changes**

  * There is now a script to generate offline versions of the manual based on their online version.
  * Sidebar button width is now fixed.
  * Artifacts have been added to appstream metadata.

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
  * New history action for coloring. Note: color changing history entries created in previous versions of LogarithmPlotter will not be updated.
  * Tooltips for object creation buttons have been added.
  * Tooltips have been set to have a delay of 200ms to match most software's handling of them.
  * Object creation buttons now have a unified style accross all platforms.

**Added translations**

  * History action of renaming objects.
  * History action of changing the color of objects.
  * Filtering for history browser.

**Fixed bugs**

  * Visibility history actions (shown and hidden) are now properly savedmaking loading them not automaticly changed to "Show".
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
  * LogarithmPlotter is now translated!
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

  * Sandboxed packages (snapcraft and flatpak) won't show error messages related to update checks.
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

