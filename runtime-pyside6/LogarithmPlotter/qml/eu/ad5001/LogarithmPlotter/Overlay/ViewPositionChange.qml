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

/*!
    \qmltype ViewPositionChange.Overlay
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
       How much should the zoom be multiplied/scrolled by for one scroll step (120° on the mouse wheel).
    */
    property double baseZoomMultiplier: 0.1
    
    MouseArea {
        id: dragArea
        anchors.fill: parent
        cursorShape: pressed ? Qt.ClosedHandCursor : Qt.OpenHandCursor
        property int positionChangeTimer: 0
        
        function updatePosition(deltaX, deltaY, isEnd) {
            const unauthorized = [NaN, Infinity, -Infinity]
            const xmin = (Modules.Canvas.px2x(Modules.Canvas.x2px(Modules.Settings.xmin)-deltaX))
            const ymax = Modules.Settings.ymax + deltaY/Modules.Settings.yzoom
            if(!unauthorized.includes(xmin))
                Modules.Settings.set("xmin", xmin, isEnd)
            if(!unauthorized.includes(ymax))
                Modules.Settings.set("ymax", ymax.toDecimalPrecision(6), isEnd)
            Modules.Canvas.requestPaint()
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
                let deltaX = mouse.x - parent.prevX
                let deltaY = mouse.y - parent.prevY
                updatePosition(deltaX, deltaY, false)
                prevX = mouse.x
                prevY = mouse.y
                positionChangeTimer = 0
            }
        }
        
        onReleased: function(mouse) {
            let deltaX = mouse.x - parent.prevX
            let deltaY = mouse.y - parent.prevY
            updatePosition(deltaX, deltaY, true)
            parent.endPositionChange(deltaX, deltaY)
        }
        
        onWheel: function(wheel) {
            // Scrolling
            let scrollSteps = Math.round(wheel.angleDelta.y / 120)
            let zoomMultiplier = Math.pow(1+parent.baseZoomMultiplier, Math.abs(scrollSteps))
            // Avoid floating-point rounding errors by removing the zoom *after*
            let xZoomDelta = (Modules.Settings.xzoom*zoomMultiplier - Modules.Settings.xzoom)
            let yZoomDelta = (Modules.Settings.yzoom*zoomMultiplier - Modules.Settings.yzoom)
            if(scrollSteps < 0) { // Negative scroll
                xZoomDelta *= -1
                yZoomDelta *= -1
            }
            let newXZoom = (Modules.Settings.xzoom+xZoomDelta).toDecimalPrecision(0)
            let newYZoom = (Modules.Settings.yzoom+yZoomDelta).toDecimalPrecision(0)
            // Check if we need to have more precision
            if(newXZoom < 10) 
                newXZoom = (Modules.Settings.xzoom+xZoomDelta).toDecimalPrecision(4)
            if(newYZoom < 10)
                newYZoom = (Modules.Settings.yzoom+yZoomDelta).toDecimalPrecision(4)
            if(newXZoom > 0.5)
                Modules.Settings.set("xzoom", newXZoom)
            if(newYZoom > 0.5)
                Modules.Settings.set("yzoom", newYZoom)
            Modules.Canvas.requestPaint()
        }
    }
}

