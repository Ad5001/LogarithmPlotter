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

import QtQuick
import QtQuick.Controls

/*!
    \qmltype Changelog
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Overlay used to display the current changelog to the user.
    
    \note The changelog is either fetched from https://api.ad5001.eu/changelog/logarithmplotter/ or taken locally when a file named CHANGELOG.md exists within the main source code.
    
    \sa LogarithmPlotter, GreetScreen
*/
Popup {
    id: changelogPopup
    x: (parent.width-width)/2
    y: Math.max(20, (parent.height-height)/2)
    width: changelog.width+40
    height: Math.min(parent.height-40, 500)
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    /*!
       \qmlproperty string Changelog::changelogNeedsFetching
       true when the changelog has yet to be loaded, set to false the moment it's loaded.
    */
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
            onLinkActivated: Qt.openUrlExternally(link)

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
