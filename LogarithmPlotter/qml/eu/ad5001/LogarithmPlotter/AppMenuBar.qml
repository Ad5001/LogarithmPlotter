/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import QtQuick
import Qt.labs.platform as Native
//import QtQuick.Controls 2.15
import eu.ad5001.MixedMenu 1.1
import "js/objects.js" as Objects
import "js/historylib.js" as HistoryLib
import "js/math/latex.js" as LatexJS


/*!
    \qmltype AppMenuBar
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief MenuBar for LogarithmPlotter.
    
    Makes use of eu.ad5001.LogarithmPlotter.
    
    \sa LogarithmPlotter
*/
MenuBar {
    property var settingsMenu: settingsSubMenu
    
    Menu {
        title: qsTr("&File")
        Action {
            text: qsTr("&Load...")
            shortcut: StandardKey.Open
            onTriggered: settings.load()
            icon.name: 'document-open'
            
        }
        Action {
            text: qsTr("&Save")
            shortcut: StandardKey.Save
            onTriggered: settings.save()
            icon.name: 'document-save'
        }
        Action {
            text: qsTr("Save &As...")
            shortcut: StandardKey.SaveAs
            onTriggered: settings.saveAs()
            icon.name: 'document-save-as'
            
        }
        MenuSeparator { }
        Action {
            text: qsTr("&Quit")
            shortcut: StandardKey.Quit
            onTriggered: {
                if(settings.saved)
                    Qt.quit()
                else
                    saveUnsavedChangesDialog.visible = true;
            }
            
            icon.name: 'application-exit'
        }
    }
    
    Menu {
        title: qsTr("&Edit")
        Action { 
            text: qsTr("&Undo")
            shortcut: StandardKey.Undo
            onTriggered: history.undo()
            icon.name: 'edit-undo'
            icon.color: enabled ? sysPalette.windowText : sysPaletteIn.windowText
            enabled: history.undoCount > 0
        }
        Action { 
            text: qsTr("&Redo")
            shortcut: StandardKey.Redo
            onTriggered: history.redo()
            icon.name: 'edit-redo'
            icon.color: enabled ? sysPalette.windowText : sysPaletteIn.windowText
            enabled: history.redoCount > 0
        }
        MenuSeparator { }
        Action { 
            text: qsTr("&Copy plot")
            shortcut: StandardKey.Copy
            onTriggered: root.copyDiagramToClipboard()
            icon.name: 'edit-copy'
        }
    }
    
    Menu {
        title: qsTr("&Create")
        // Services repeater
        Repeater {
            model: Object.keys(Objects.types)
            
            MenuItem {
                text: Objects.types[modelData].displayType()
                visible: Objects.types[modelData].createable()
                height: visible ? implicitHeight : 0
                icon.name: modelData
                icon.source: './icons/objects/' + modelData + '.svg'
                icon.color: sysPalette.buttonText
                onTriggered: {
                    var newObj = Objects.createNewRegisteredObject(modelData)
                    history.addToHistory(new HistoryLib.CreateNewObject(newObj.name, modelData, newObj.export()))
                    objectLists.update()
                }
            }
        }
    }
    
    Menu {
        id: settingsSubMenu
        title: qsTr("&Settings")
        Action {
            id: checkForUpdatesMenuSetting
            text: qsTr("Check for updates on startup")
            checkable: true
            checked: Helper.getSettingBool("check_for_updates")
            onTriggered: Helper.setSettingBool("check_for_updates", checked)
            icon.name: 'update'
            icon.color: sysPalette.buttonText
        }
        
        Action {
            id: resetRedoStackMenuSetting
            text: qsTr("Reset redo stack automaticly")
            checkable: true
            checked: Helper.getSettingBool("reset_redo_stack")
            onTriggered: Helper.setSettingBool("reset_redo_stack", checked)
            icon.name: 'timeline'
            icon.color: sysPalette.buttonText
        }
        
        Action {
            id: enableLatexJSSetting
            text: qsTr("Enable LaTeX rendering")
            checkable: true
            checked: Helper.getSettingBool("enable_latex")
            onTriggered: {
                Helper.setSettingBool("enable_latex", checked)
                LatexJS.enabled = checked
                drawCanvas.requestPaint()
            }
            icon.name: 'Expression'
            icon.color: sysPalette.buttonText
        }
        
        Menu {
            title: qsTr("Expression editor")
        
            Action {
                id: autocloseFormulaSetting
                text: qsTr("Automatically close parenthesises and brackets")
                checkable: true
                checked: Helper.getSettingBool("expression_editor.autoclose")
                onTriggered: {
                    Helper.setSettingBool("expression_editor.autoclose", checked)
                }
                icon.name: 'Text'
                icon.color: sysPalette.buttonText
            }
        
            Action {
                id: colorizeFormulaSetting
                text: qsTr("Enable syntax highlighting")
                checkable: true
                checked: Helper.getSettingBool("expression_editor.colorize")
                onTriggered: {
                    Helper.setSettingBool("expression_editor.colorize", checked)
                }
                icon.name: 'appearance'
                icon.color: sysPalette.buttonText
            }
        
            Action {
                id: autocompleteFormulaSetting
                text: qsTr("Enable autocompletion")
                checkable: true
                checked: Helper.getSettingBool("autocompletion.enabled")
                onTriggered: {
                    Helper.setSettingBool("autocompletion.enabled", checked)
                }
                icon.name: 'label'
                icon.color: sysPalette.buttonText
            }
        
            Menu {
                id: colorSchemeSetting
                title: qsTr("Color Scheme")
                property var schemes: ["Breeze Light", "Breeze Dark", "Solarized", "Github Light", "Github Dark", "Nord", "Monokai"]
            
                Repeater {
                    model: colorSchemeSetting.schemes
                    
                    MenuItem {
                        text: modelData
                        checkable: true
                        checked: Helper.getSettingInt("expression_editor.color_scheme") == index
                        onTriggered: {
                            parent.children[Helper.getSettingInt("expression_editor.color_scheme")].checked = false
                            checked = true
                            Helper.setSettingInt("expression_editor.color_scheme", index)
                        }
                    }
                }
            }
        }
    }
    
    Menu {
        title: qsTr("&Help")
        Action {
            text: qsTr("&Source code")
            icon.name: 'software-sources'
            onTriggered: Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter")
        }
        Action {
            text: qsTr("&Report a bug")
            icon.name: 'tools-report-bug'
            onTriggered: Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter/issues")
        }
        Action {
            text: qsTr("&User manual")
            icon.name: 'documentation'
            onTriggered: Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_Sidebar")
        }
        Action {
            text: qsTr("&Changelog")
            icon.name: 'state-information'
            onTriggered: changelog.open()
        }
        Action {
            text: qsTr("&Help translating!")
            icon.name: 'translator'
            onTriggered: Qt.openUrlExternally("https://hosted.weblate.org/engage/logarithmplotter/")
        }
        MenuSeparator { }
        Action {
            text: qsTr("&Thanks")
            icon.name: 'about'
            onTriggered: thanksTo.open()
        }
        Action {
            text: qsTr("&About")
            shortcut: StandardKey.HelpContents
            icon.name: 'about'
            onTriggered: about.open()
        }
    }
    
    Native.MessageDialog {
        id: saveUnsavedChangesDialog
        title: qsTr("Save unsaved changes?")
        text: qsTr("This plot contains unsaved changes. By doing this, all unsaved data will be lost. Continue?")
        buttons: Native.MessageDialog.Save | Native.MessageDialog.Discard | Native.MessageDialog.Cancel
        
        onSaveClicked: settings.save()
        onDiscardClicked: Qt.quit()
    }
    
    function openSaveUnsavedChangesDialog() {
        saveUnsavedChangesDialog.open()
    }
}
