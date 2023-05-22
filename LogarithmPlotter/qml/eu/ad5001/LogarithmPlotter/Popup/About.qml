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

/*!
    \qmltype About
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief About popup of LogarithmPlotter.
    
    \sa LogarithmPlotter
*/
BaseDialog {
    id: about
    title: qsTr("About LogarithmPlotter")
    width: 400
    minimumHeight: 600
    
    Item {
        anchors {
            top: parent.top;
            left: parent.left;
            bottom: parent.bottom;
            right: parent.right;
            topMargin: margin;
            leftMargin: margin;
            bottomMargin: margin;
            rightMargin: margin;
        }
        
        Image {
            id: logo
            source: "../icons/logarithmplotter.svg"
            sourceSize.width: 64
            sourceSize.height: 64
            width: 64
            height: 64
            anchors.horizontalCenter: parent.horizontalCenter
            anchors.rightMargin: width/2
            anchors.top: parent.top
            anchors.topMargin: 10
        }
        
        Label {
            id: appName
            anchors.top: logo.bottom
            anchors.left: parent.left
            anchors.topMargin: 10
            horizontalAlignment: Text.AlignHCenter
            width: parent.width
            wrapMode: Text.WordWrap
            font.pixelSize: 25
            text: qsTr("LogarithmPlotter v%1").arg(Helper.getVersion())
        }
        
        Label {
            id: description
            anchors.top: appName.bottom
            anchors.left: parent.left
            anchors.topMargin: 10
            horizontalAlignment: Text.AlignHCenter
            width: parent.width
            wrapMode: Text.WordWrap
            font.pixelSize: 18
            text: qsTr("2D plotter software to make BODE plots, sequences and repartition functions.")
        }
        
        Label {
            id: debugInfos
            anchors.top: description.bottom
            anchors.left: parent.left
            anchors.topMargin: 10
            horizontalAlignment: Text.AlignHCenter
            width: parent.width
            wrapMode: Text.WordWrap
            font.pixelSize: 14
            text: Helper.getDebugInfos() 
        }
        
        Label {
            id: copyrightInfos
            anchors.top: debugInfos.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            anchors.topMargin: 10
            width: Math.min(410, parent.width)
            wrapMode: Text.WordWrap
            textFormat: Text.RichText
            font.pixelSize: 13
            text: "Copyright © 2023  Ad5001 &lt;mail@ad5001.eu&gt;<br>
<br>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.<br>
<br>
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.<br>
<br>
You should have received a copy of the GNU General Public License along with this program.  If not, see <a href='http://www.gnu.org/licenses/'>http://www.gnu.org/licenses/</a>."
            onLinkActivated: Qt.openUrlExternally(link)
        }
        
        Row {
            id: buttonsRow
            anchors.top: copyrightInfos.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            anchors.topMargin: 10
            spacing: 5
            
            Button {
                id: openIssueButton
                text: qsTr('Report a bug')
                icon.name: 'tools-report-bug'
                onClicked: Qt.openUrlExternally('https://git.ad5001.eu/Ad5001/LogarithmPlotter')
            }
            
            Button {
                id: officialWebsiteButton
                text: qsTr('Official website')
                icon.name: 'web-browser'
                onClicked: Qt.openUrlExternally('https://apps.ad5001.eu/logarithmplotter/')
            }
        }
    }
}
