/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
 *  Copyright (C) 2022  Ad5001
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

import QtQuick 2.12
import QtQuick.Dialogs 1.3
//import QtQuick.Controls 2.15
import eu.ad5001.MixedMenu 1.1
import "js/objects.js" as Objects
import "js/historylib.js" as HistoryLib

/*!
    \qmltype AppMenuBar
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief MenuBar for LogarithmPlotter.
    
    Makes use of eu.ad5001.LogarithmPlotter.
    
    \sa LogarithmPlotter
*/
MenuBar {
    
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
        title: qsTr("&Settings")
        Action {
            id: checkForUpdatesMenuSetting
            text: qsTr("Check for updates on startup")
            checkable: true
            checked: Helper.getSettingBool("check_for_updates")
            onTriggered: Helper.setSettingBool("check_for_updates", checked)
            icon.name: 'update'
        }
        
        Action {
            id: resetRedoStackMenuSetting
            text: qsTr("Reset redo stack automaticly")
            checkable: true
            checked: Helper.getSettingBool("reset_redo_stack")
            onTriggered: Helper.setSettingBool("reset_redo_stack", checked)
            icon.name: 'timeline'
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
            onTriggered: Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/User-Manual")
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
            text: qsTr("&About")
            shortcut: StandardKey.HelpContents
            icon.name: 'about'
            onTriggered: about.open()
        }
    }
    
    MessageDialog {
        id: saveUnsavedChangesDialog
        title: qsTr("Save unsaved changes?")
        icon: StandardIcon.Question
        text: qsTr("This plot contains unsaved changes. By doing this, all unsaved data will be lost. Continue?")
        standardButtons: StandardButton.Yes | StandardButton.No
        onYes: Qt.quit()
    }
    
    function showSaveUnsavedChangesDialog() {
        saveUnsavedChangesDialog.visible = true
    }
}
