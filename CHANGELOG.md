# Changelog

## v0.5.0 (11 Jan 2024)

**New**

  * New, reworked application icon.
  * Graph is now mouse interactive:
  * You can now drag to move and scroll to zoom!
  * Builtin functions now provide usage when used in the autocomplete of the expression editor.

**Changes**

  * When creating an object that can be positioned, new default behavior is to pick first instead of opening object settings.
  * Icons with text now use the SVG's text element, allowing them to integrate better with the system's default font.
  * Special characters popup is now context aware (e.g. no sub/supscript symbols in expressions).
  * New symbols in special characters popup.
  * Integrals and derivatives can now be provided with an executable object (e.g. Functions) instead of strings as function.
  * New description on Linux.

**Fixed bugs**

  * Fixing ∞ 'variable' in domains and expressions.
  * Several other bugs related to constants in expresions were fixed as well.
  * Builtin functions now send an error message when not provided with the proper arguments.

**Internal changes**

  * Updated to PySide6 v6.6.1.
  * Reworked continuous functions' rendering to make it faster.
  * Removed old bits from an unfinished new parser that weren't used.
  
## v0.4.0 (27 May 2023)

**Changes**

  * Fully ported to PySide6 (Qt6).
  * Greet screen settings are now scrollable.
  * Changelog is now freezed to current version.

**New**

  * Customizable color schemes for expressions.
  * New, rewamped and improved picked location overlay settings:
  * It's now possible to disable picking x or y when setting a location.
  * Properties which are related to positioning (X, Y, Label's X position) can now be set using the picker.
  * Visual redesign that enhances readability of settings.
  * There is now a button to hide picker settings.

**Fixed bugs**

  * Cursors in expression are now easier to see.
  * Symbols in LaTeX rendered Texts cause the LaTeX renderer to crash.
  * Underscores in distribution names are automatically removed if the name is modified.
  * Autocomplete categories now properly respect theme colors.
  * Functions in expressions (like indexOf, map...) now properly send errors when the arguments are of the wrong type or count.
  * Executable Objects called (like functions, bode magnitures, phases...) now send an error if provided with no arguments.
  * Function calls with no argument no longer make LogarithmPlotter crash under certain circumstances.
  * Thank you dialog's lists are no longer draggable.

**Internal changes**

  * A lot of inner changes led by porting to Qt6, fixing a lot of bugs at the same time.
  * Disabled auto detect of visual theme if the `QT_QUICK_CONTROLS_STYLE` environment variable is set.
  * (macOS, Windows, Flatpak) Drastically reducing installer sizes (more than halved).
  * (Launchpad/Ubuntu) Using custom built packages of PySide6, meaning smaller installation and distro dependency.
  
## v0.3.0 (28 Oct 2022)

**New**

  * New completely revamped expression editor:
  * Automatic closing of parentheses and brackets (can be disabled in settings).
  * Syntax highlighting (can be disabled in the settings).
  * Autocompletion is now available (for functions, variables and constants, object names and properties) (can be disabled in the settings).
  * Object properties can now be used in expressions (e.g. if you have a point named A, you can use A.x to access its x value).
  * Executable objects can be now be used in expressions (e.g. if you have a function named 'f', it's accessible using `f(<value>)`).
  * LaTeX-rendered formulas are now used in the Objects and History tabs when LaTeX rendering is enabled.
  * Errors in formulas are now reported in message boxes.

**Changes**

  * The Object Editor dialog has been completely reworked internally, resulting in notable performance improvements.
  * Vast improvements to the objects system: names can no longer be shared amongst different objects.
  * Disabled access to custom variable and function definition in expressions (can cause issues and vulnerabilities)
  * When using the set position cursor, the position change is now saved a single history action.
  * Distribution are now prefixed with an 'F_' to prevent confusion with X Cursors.

**Added translations**

  * Autocompletion categories (English, French, German, Hungarian).
  * Expression editor settings (English, French, German, Hungarian).
  * Expression syntax errors (English, French, German, Hungarian).
  * On top of the above:
  * Hungarian: v0.2.0 added text (thanks @ovari!)
  * Spanish: Menu bars (thanks @Sergio Varela)
  * You can contribute to translation on [Weblate](https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/#repository).

**Fixed bugs**

  * Fixing Texts not being properly recognized as texts when saving.
  * Text's 'Disable LaTeX' property is now properly saved.
  * X Cursors LaTeX rendering made the app crash.
  * Attempting to insert special character no longer automatically saves the expression you're editing.
  * Proper HDPI support for icons and buttons (note: HDPI is not available for the rendered canvas yet).
  * Support for non-latin characters in variables (e.g. greek letters, subtext, suptext)
  * Silent error when misentering variable names in the expression editor causing internal issues.
  * Fixing some utils function simplifying parentheses when they shouldn't have.
  * (flatpak and KDE SDK) Fixing the sometimes invisible buttons on the objects tab on startup.
  * (macos) Application string version does not match LogarithmPlotter's version.
  * (debian) (Normally) Fixing deb building.

**Internal changes**

  * Object dependencies are now registered on both the dependant object, and the object it's depending on.
  * Objects now have a proper per-name registry.
  * Object Editor Dialog has been reworked to use loaders insteads.
  * Reworked the file loading system to be able to load dependencies properly.


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

