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
//import QtQuick.Controls 2.12
import eu.ad5001.MixedMenu 1.0
import "js/objects.js" as Objects
import "js/historylib.js" as HistoryLib

MenuBar {
    Menu {
        title: qsTr("&File")
        Action {
            text: qsTr("&Load...")
            shortcut: StandardKey.Open
            onTriggered: settings.load()
            iconName: 'document-open'
            
        }
        Action {
            text: qsTr("&Save")
            shortcut: StandardKey.Save
            onTriggered: settings.save()
            iconName: 'document-save'
        }
        Action {
            text: qsTr("Save &As...")
            shortcut: StandardKey.SaveAs
            onTriggered: settings.saveAs()
            iconName: 'document-save-as'
            
        }
        MenuSeparator { }
        Action {
            text: qsTr("&Quit")
            shortcut: StandardKey.Quit
            onTriggered: Qt.quit()
            iconName: 'application-exit'
        }
    }
    Menu {
        title: qsTr("&Edit")
        Action { 
            text: qsTr("&Undo")
            shortcut: StandardKey.Undo
            onTriggered: history.undo()
            iconName: 'edit-undo'
            iconColor: enabled ? sysPalette.windowText : sysPaletteIn.windowText
            enabled: history.undoCount > 0
        }
        Action { 
            text: qsTr("&Redo")
            shortcut: StandardKey.Redo
            onTriggered: history.redo()
            iconName: 'edit-redo'
            iconColor: enabled ? sysPalette.windowText : sysPaletteIn.windowText
            enabled: history.redoCount > 0
        }
        MenuSeparator { }
        Action { 
            text: qsTr("&Copy diagram")
            shortcut: StandardKey.Copy
            onTriggered: root.copyDiagramToClipboard()
            iconName: 'edit-copy'
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
                iconSource: './icons/'+modelData+'.svg' // Default to dark version
                iconName: modelData
                iconColor: sysPalette.windowText
                onTriggered: {
                    var newObj = Objects.createNewRegisteredObject(modelData)
                    history.addToHistory(new HistoryLib.CreateNewObject(newObj.name, modelData, newObj.export()))
                    objectLists.update()
                }
            }
        }
    }
    Menu {
        title: qsTr("&Help")
        Action {
            text: qsTr("&About")
            iconName: 'about'
            onTriggered: about.open()
        }
    }
}
