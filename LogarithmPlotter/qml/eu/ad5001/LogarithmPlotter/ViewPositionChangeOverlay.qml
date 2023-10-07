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
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import "js/objects.js" as Objects
import "js/mathlib.js" as MathLib
import "js/historylib.js" as HistoryLib

/*!
    \qmltype ViewPositionChangeOverlay
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Overlay used allow the user to drag the canvas' position and change the zoom level.

    Provides an overlay over the canvas that detects mouse movements and changes the canvas view position
    accordingly by providing new signals.
    
    \sa LogarithmPlotter, LogGraphCanvas, Settings
*/
Item {
    id: viewChangeRoot
    visible: true
    clip: true
    
    /*!
        \qmlsignal ViewPositionChangeOverlay::positionChanged(int deltaX, int deltaY)
        
        Emmited when the user dragged the canvas and the view should be refreshed.
        The corresponding handler is \c onPositionChanged.
    */
    signal positionChanged(int deltaX, int deltaY)
    
    /*!
        \qmlsignal ViewPositionChangeOverlay::beginPositionChange()
        
        Emmited when the user starts dragging the canvas.
        The corresponding handler is \c onBeginPositionChange.
    */
    signal beginPositionChange()
    
    /*!
        \qmlsignal ViewPositionChangeOverlay::endPositionChange(int deltaX, int deltaY)
        
        Emmited when the user stops dragging the canvas.
        The corresponding handler is \c onEndPositionChange.
    */
    signal endPositionChange(int deltaX, int deltaY)
    
    /*!
       \qmlproperty var ViewPositionChangeOverlay::canvas
       LogGraphCanvas instance.
    */
    property var canvas
    /*!
       \qmlproperty var ViewPositionChangeOverlay::settingsInstance
       Settings instance.
    */
    property var settingsInstance
    /*!
       \qmlproperty int ViewPositionChangeOverlay::prevX
       The x coordinate (on the mousearea) at the last change of the canvas position.
    */
    property int prevX
    /*!
       \qmlproperty int ViewPositionChangeOverlay::prevY
       The y coordinate (on the mousearea) at the last change of the canvas position.
    */
    property int prevY
    /*!
       \qmlproperty int ViewPositionChangeOverlay::precision
       Precision of the (on canvas) position be set.
    */
    property int precision
    
    MouseArea {
        id: dragArea
        anchors.fill: parent
        cursorShape: pressed ? Qt.ClosedHandCursor : Qt.OpenHandCursor
        property int positionChangeTimer: 0
        
        function updatePosition(deltaX, deltaY) {
            settingsInstance.xmin = (canvas.px2x(canvas.x2px(settingsInstance.xmin)-deltaX))
            settingsInstance.ymax += deltaY/canvas.yzoom
            settingsInstance.ymax = settingsInstance.ymax.toFixed(4)
            settingsInstance.changed()
            console.log("New pos", settingsInstance.xmin, settingsInstance.ymax)
            parent.positionChanged(deltaX, deltaY)
            
        }
        
        onPressed: function(mouse) {
            prevX = mouse.x
            prevY = mouse.y
            parent.beginPositionChange()
        }
        onPositionChanged: function(mouse) {
            positionChangeTimer++
            if(positionChangeTimer == 3) {
                let deltaX = mouse.x - prevX
                let deltaY = mouse.y - prevY
                updatePosition(deltaX, deltaY)
                prevX = mouse.x
                prevY = mouse.y
                positionChangeTimer = 0
            }
        }
        onReleased: function(mouse) {
            let deltaX = mouse.x - prevX
            let deltaY = mouse.y - prevY
            updatePosition(deltaX, deltaY)
            parent.endPositionChange(deltaX, deltaY)
        }
    }
}

