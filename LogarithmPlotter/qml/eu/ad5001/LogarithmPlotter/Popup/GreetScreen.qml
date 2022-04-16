/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
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
import QtQuick.Controls 2.12
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
    height: Math.min(parent.height-40, 500)
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    Item {
        id: welcome
        height: logo.height
        width: logo.width + 10 + welcomeText.width
        anchors.top: parent.top
        anchors.topMargin: (parent.width-width)/2
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
            anchors.left: logo.right
            anchors.leftMargin: 10
            //width: parent.width
            wrapMode: Text.WordWrap
            font.pixelSize: 32
            text: qsTr("Welcome to LogarithmPlotter")
        }
    }
        
    Label {
        id: versionText
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: welcome.bottom
        anchors.topMargin: 10
        //width: parent.width
        wrapMode: Text.WordWrap
        width: implicitWidth
        font.pixelSize: 18
        font.italic: true
        text: qsTr("Version %1").arg(Helper.getVersion())
    }
        
    Label {
        id: helpText
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: versionText.bottom
        anchors.topMargin: 40
        //width: parent.width
        wrapMode: Text.WordWrap
        font.pixelSize: 14
        width: parent.width - 50
        text: qsTr("Take a few seconds to configure LogarithmPlotter.\nThese settings can be changed at any time from the \"Settings\" menu.")
    }
    
    CheckBox {
        id: checkForUpdatesSetting
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: helpText.bottom
        anchors.topMargin: 10
        checked: Helper.getSettingBool("check_for_updates")
        text: qsTr('Check for updates on startup (requires online connectivity)')
        onClicked: {
            Helper.setSettingBool("check_for_updates", checked)
            //checkForUpdatesMenuSetting.checked = checked
        }
    }
    
    CheckBox {
        id: resetRedoStackSetting
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: checkForUpdatesSetting.bottom
        checked: Helper.getSettingBool("reset_redo_stack")
        text: qsTr('Reset redo stack when a new action is added to history')
        onClicked: {
            Helper.setSettingBool("reset_redo_stack", checked)
            //resetRedoStackMenuSetting.checked = checked
        }
    }
    
    CheckBox {
        id: enableLatexSetting
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: resetRedoStackSetting.bottom
        checked: Helper.getSettingBool("enable_latex")
        text: qsTr('Enable LaTeX rendering')
        onClicked: {
            Helper.setSettingBool("enable_latex", checked)
            Latex.enabled = checked
            drawCanvas.requestPaint()
        }
    }
    
    Row {
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 10
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
    
    Component.onCompleted: if(Helper.getSetting("last_install_greet") != Helper.getVersion()) {
        greetingPopup.open()
    }
    
    onClosed: Helper.setSetting("last_install_greet", Helper.getVersion())
}
