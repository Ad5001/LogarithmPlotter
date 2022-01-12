/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
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

Rectangle {
    id: alert
    color: "black"
    radius: 5
    x: fadingAnimation.running ? fadingX : parent.width - width - 10
    visible: false;
    width: textItem.width + 10
    height: textItem.height + 10
    
    property int fadingX: parent.width - width - 10
    property int fadeTime: 200
    property alias text: textItem.text
    
    Text {
        id: textItem
        anchors.verticalCenter: parent.verticalCenter
        anchors.horizontalCenter: parent.horizontalCenter
        color: "white"
        font.pixelSize: 18
    }
    
    
    ParallelAnimation {
        id: fadingAnimation
        running: false
        NumberAnimation { target: alert; property: "fadingX"; to: alert.parent.width; duration: alert.fadeTime }
        NumberAnimation { target: alert; property: "opacity"; to: 0; duration: alert.fadeTime }
    }
    
    Timer {
        id: fadeTimer
        interval: 1000 + text.length * 45
        onTriggered: {
            hideTimer.start()
            fadingAnimation.start()
        }
    }
    
    Timer {
        id: hideTimer
        interval: alert.fadeTime
        onTriggered: {
            alert.visible = false;
        }
    }
    
    function show(alertText) {
        visible = true
        fadeTimer.restart()
        text = alertText
        opacity = 0.75
        fadingX = parent.width - width - 10
    }
}
