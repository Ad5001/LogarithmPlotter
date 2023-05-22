/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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
import "../js/math/latex.js" as Latex

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
    width: Math.max(welcome.width+70, checkForUpdatesSetting.width, resetRedoStackSetting.width)+20
    height: Math.min(parent.height-40, 700)
    modal: true
    focus: true
    clip: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    ScrollView {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        anchors.bottomMargin: bottomButtons.height + 20
        clip: true
        
        Column {
            width: greetingPopup.width - 25
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
                
            Label {
                id: helpText
                anchors.horizontalCenter: parent.horizontalCenter
                wrapMode: Text.WordWrap
                font.pixelSize: 14
                width: parent.width - 50
                text: qsTr("Take a few seconds to configure LogarithmPlotter.\nThese settings can be changed at any time from the \"Settings\" menu.")
            }
            
            CheckBox {
                id: checkForUpdatesSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("check_for_updates")
                text: qsTr('Check for updates on startup (requires online connectivity)')
                onClicked: {
                    Helper.setSettingBool("check_for_updates", checked)
                    // Set in the menu bar
                    appMenu.settingsMenu.children[0].checked = checked
                }
            }
            
            CheckBox {
                id: resetRedoStackSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("reset_redo_stack")
                text: qsTr('Reset redo stack when a new action is added to history')
                onClicked: {
                    Helper.setSettingBool("reset_redo_stack", checked)
                    appMenu.settingsMenu.children[1].checked = checked
                }
            }
            
            CheckBox {
                id: enableLatexSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("enable_latex")
                text: qsTr('Enable LaTeX rendering')
                onClicked: {
                    Helper.setSettingBool("enable_latex", checked)
                    appMenu.settingsMenu.children[2].checked = checked
                }
            }
            
            CheckBox {
                id: autocloseFormulaSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("expression_editor.autoclose")
                text: qsTr('Automatically close parenthesises and brackets in expressions')
                onClicked: {
                    Helper.setSettingBool("expression_editor.autoclose", checked)
                    appMenu.settingsMenu.children[3].children[0].checked = checked
                }
            }
            
            CheckBox {
                id: colorizeFormulaSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("expression_editor.colorize")
                text: qsTr('Enable syntax highlighting for expressions')
                onClicked: {
                    Helper.setSettingBool("expression_editor.colorize", checked)
                    appMenu.settingsMenu.children[3].children[1].checked = checked
                }
            }
            
            CheckBox {
                id: autocompleteFormulaSetting
                anchors.left: parent.left
                checked: Helper.getSettingBool("autocompletion.enabled")
                text: qsTr('Enable autocompletion interface in expression editor')
                onClicked: {
                    Helper.setSettingBool("autocompletion.enabled", checked)
                    appMenu.settingsMenu.children[3].children[2].checked = checked
                }
            }
            
            Row {
                anchors.left: parent.left
                anchors.leftMargin: 10
                spacing: 10
                
                Label {
                    id: colorSchemeLabel
                    anchors.verticalCenter: parent.verticalCenter
                    wrapMode: Text.WordWrap
                    text: qsTr("Color scheme:")
                }
                
                ComboBox {
                    model: ["Breeze Light", "Breeze Dark", "Solarized", "Github Light", "Github Dark", "Nord", "Monokai"]
                    currentIndex: Helper.getSettingInt("expression_editor.color_scheme")
                    
                    onActivated: function(index) {
                        Helper.setSettingInt("expression_editor.color_scheme", index)
                    }
                }
            }
        }
    }
    
    Rectangle {
        id: bottomSeparator
        opacity: 0.3
        color: sysPalette.windowText
        width: parent.width * 2 / 3
        height: 1
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: bottomButtons.top
        anchors.bottomMargin: 9
    }
    
    Row {
        id: bottomButtons
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 7
        spacing: 10
        anchors.horizontalCenter: parent.horizontalCenter
        
        Button {
            id: userManualBtn
            text: qsTr("User manual")
            font.pixelSize: 18
            onClicked: Qt.openUrlExternally("https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/_Sidebar")
        }
        
        Button {
            id: changelogBtn
            text: qsTr("Changelog")
            font.pixelSize: 18
            onClicked: changelog.open()
        }
        
        Button {
            id: doneBtn
            text: qsTr("Done")
            font.pixelSize: 18
            onClicked: greetingPopup.close()
        }
    }
    
    Component.onCompleted: if(Helper.getSetting("last_install_greet") +1 != Helper.getVersion()) {
        greetingPopup.open()
    }
    
    onClosed: Helper.setSetting("last_install_greet", Helper.getVersion())
}
