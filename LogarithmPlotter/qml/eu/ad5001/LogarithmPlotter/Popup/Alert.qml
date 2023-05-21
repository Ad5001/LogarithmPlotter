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
/*!
    \qmltype Alert
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Alert used to show status messages to the user.
    
    This class (only one instance) allows messages to be displayed to the user that will fade in time.
    
    \sa LogarithmPlotter
*/
Rectangle {
    id: alert
    color: "black"
    radius: 5
    x: fadingAnimation.running ? fadingX : parent.width - width - 10
    visible: false;
    width: textItem.width + 10
    height: textItem.height + 10
    
    /*!
       \qmlproperty int Alert::fadingX
       X of the object that is being animated.
    */
    property int fadingX: parent.width - width - 10
    /*!
       \qmlproperty int Alert::fadeTime
       Length in millisecond of the animation.
    */
    property int fadeTime: 200
    /*!
       \qmlproperty string Alert::text
       Text of the alert.
    */
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
    
    /*!
        \qmlmethod void Alert::show(string alertText)
        Show an alert with a certain \c alertText.
    */
    function show(alertText) {
        visible = true
        fadeTimer.restart()
        text = alertText
        opacity = 0.75
        fadingX = parent.width - width - 10
    }
}
