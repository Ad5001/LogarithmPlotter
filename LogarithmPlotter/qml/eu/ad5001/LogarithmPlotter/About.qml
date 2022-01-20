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
import QtQuick.Dialogs 1.3 as D
import QtQuick.Controls 2.12


D.Dialog {
    id: about
    title: qsTr("About LogarithmPlotter")
    width: 400
    height: 600
    
    Image {
        id: logo
        source: "icons/logarithmplotter.svg"
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
        text: "Copyright © 2022  Ad5001 &lt;mail@ad5001.eu&gt;<br>
<br>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.<br>
<br>
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.<br>
<br>
You should have received a copy of the GNU General Public License along with this program.  If not, see <a href='http://www.gnu.org/licenses/'>http://www.gnu.org/licenses/</a>."
        onLinkActivated: Helper.openUrl(link)
    }
    
    Button {
        id: openIssueButton
        anchors.top: copyrightInfos.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: 10
        text: qsTr('Report a bug')
        icon.name: 'bug'
        onClicked: Helper.openUrl('https://git.ad5001.eu/Ad5001/LogarithmPlotter')
    }
}
