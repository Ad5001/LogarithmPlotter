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
       \qmlproperty double ViewPositionChangeOverlay::baseZoomMultiplier
       How much should the zoom be mutliplied/scrolled by for one scroll step (120° on the mouse wheel).
    */
    property double baseZoomMultiplier: 0.1
    
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
        onWheel: function(wheel) {
            // Scrolling
            let scrollSteps = Math.round(wheel.angleDelta.y / 120)
            let zoomMultiplier = Math.pow(1+baseZoomMultiplier, Math.abs(scrollSteps))
            // Avoid floating-point rounding errors by removing the zoom *after*
            let xZoomDelta = (settingsInstance.xzoom*zoomMultiplier - settingsInstance.xzoom)
            let yZoomDelta = (settingsInstance.yzoom*zoomMultiplier - settingsInstance.yzoom)
            if(scrollSteps < 0) { // Negative scroll
                xZoomDelta *= -1
                yZoomDelta *= -1
            }
            let newXZoom = (settingsInstance.xzoom+xZoomDelta).toFixed(0)
            let newYZoom = (settingsInstance.yzoom+yZoomDelta).toFixed(0)
            if(newXZoom == settingsInstance.xzoom) // No change, allow more precision.
                newXZoom = (settingsInstance.xzoom+xZoomDelta).toFixed(4)
            if(newYZoom == settingsInstance.yzoom) // No change, allow more precision.
                newYZoom = (settingsInstance.yzoom+yZoomDelta).toFixed(4)
            settingsInstance.xzoom = newXZoom
            settingsInstance.yzoom = newYZoom
            settingsInstance.changed()
        }
    }
}

