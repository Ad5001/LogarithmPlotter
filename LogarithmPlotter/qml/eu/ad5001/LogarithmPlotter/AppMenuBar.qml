/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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
import eu.ad5001.MixedMenu 1.1
import "js/objects.js" as Objects
import "js/historylib.js" as HistoryLib

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
            onTriggered: Qt.quit()
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
                text: modelData
                visible: Objects.types[modelData].createable()
                height: visible ? implicitHeight : 0
                icon.name: modelData
                icon.color: sysPalette.windowText
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
    }
    
    Menu {
        title: qsTr("&Help")
        Action {
            text: qsTr("&About")
            shortcut: StandardKey.HelpContents
            icon.name: 'about'
            onTriggered: about.open()
        }
    }
}
