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
import QtQuick.Controls
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting

/*!
    \qmltype GreetScreen
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Overlay displayed when LogarithmPlotter is launched for the first time or when it was just updated.
    
    It contains several settings as well as an easy access to the changelog
        
    \sa LogarithmPlotter, Settings, AppMenuBar, Changelog
*/
Popup {
    id: greetingPopup
    x: (parent.width-width)/2
    y: Math.max(20, (parent.height-height)/2)
    width: greetingLayout.width+20
    height: Math.min(parent.height-40, 700)
    modal: true
    focus: true
    clip: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    Column {
        id: greetingLayout
        width: 600
        spacing: 10
        clip: true
        topPadding: 35
        
        Row {
            id: welcome
            height: logo.height
            spacing: 10
            anchors.horizontalCenter: parent.horizontalCenter
            
            Image {
                id: logo
                source: "../icons/logarithmplotter.svg"
                sourceSize.width: 48
                sourceSize.height: 48
                width: 48
                height: 48
            } 
            
            Label {
                id: welcomeText
                anchors.verticalCenter: parent.verticalCenter
                wrapMode: Text.WordWrap
                font.pixelSize: 32
                text: qsTr("Welcome to LogarithmPlotter")
            }
        }
            
        Label {
            id: versionText
            anchors.horizontalCenter: parent.horizontalCenter
            wrapMode: Text.WordWrap
            width: implicitWidth
            font.pixelSize: 18
            font.italic: true
            text: qsTr("Version %1").arg(Helper.getVersion())
        }
    }
        
    Grid {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: greetingLayout.bottom
        anchors.topMargin: 50
        columns: 2
        spacing: 10
        
        Repeater {
            model: [{
                name: qsTr("Changelog"),
                icon: 'common/new.svg',
                onClicked: () => changelog.open()
            },{
                name: qsTr("Preferences"),
                icon: 'common/settings.svg',
                onClicked: () => preferences.open()
            },{
                name: qsTr("User manual"),
                icon: 'common/manual.svg',
                onClicked: () => Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_Sidebar")
            },{
                name: qsTr("Close"),
                icon: 'common/close.svg',
                onClicked: () => greetingPopup.close()
            }]
            
            Button {
                id: createBtn
                width: 96
                height: 96
                onClicked: modelData.onClicked()
    
                Setting.Icon {
                    id: icon
                    width: 24
                    height: 24
                    anchors {
                        left: parent.left
                        leftMargin: (parent.width-width)/2
                        top: parent.top
                        topMargin: (label.y-height)/2
                    }
                    color: sysPalette.windowText
                    source: '../icons/' + modelData.icon
                }
    
                Label {
                    id: label
                    anchors {
                        bottom: parent.bottom
                        bottomMargin: 5
                        left: parent.left
                        leftMargin: 4
                        right: parent.right
                        rightMargin: 4
                    }
                    horizontalAlignment: Text.AlignHCenter
                    font.pixelSize: 14
                    text: modelData.name
                    wrapMode: Text.WordWrap
                    clip: true
                }
            }
        }
    }
        
    Component.onCompleted: if(Helper.getSetting("last_install_greet") != Helper.getVersion()+1) {
        greetingPopup.open()
    }
    
    onClosed: Helper.setSetting("last_install_greet", Helper.getVersion())
}
