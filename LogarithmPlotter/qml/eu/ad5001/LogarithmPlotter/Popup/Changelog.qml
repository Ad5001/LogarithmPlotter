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
import QtQuick.Controls 2.12

Popup {
    id: changelogPopup
    x: (parent.width-width)/2
    y: Math.max(20, (parent.height-height)/2)
    width: changelog.width+40
    height: Math.min(parent.height-40, 500)
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    property bool changelogNeedsFetching: true
    
    onAboutToShow: if(changelogNeedsFetching) Helper.fetchChangelog()
    
    Connections {
        target: Helper
        function onChangelogFetched(chl) {
            changelogNeedsFetching = false;
            changelog.text = chl
        }
    }

    ScrollView {
        anchors.top: parent.top
        anchors.topMargin: 10
        anchors.left: parent.left
        anchors.leftMargin: 10
        anchors.bottom: doneBtn.top
        anchors.bottomMargin: 10
        clip: true

        Label {
            id: changelog
            color: sysPalette.windowText
            textFormat: TextEdit.MarkdownText

            text: qsTr("Fetching changelog...")
            onLinkActivated: Helper.openUrl(link)

        }
    }
    
    Button {
        id: doneBtn
        text: qsTr("Done")
        font.pixelSize: 18
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 10
        anchors.horizontalCenter: parent.horizontalCenter
        onClicked: changelogPopup.close()
    }
}
