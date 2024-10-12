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
import Qt.labs.platform as Native

/*!
    \qmltype LogGraphCanvas
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Canvas used to display the diagram.

    Provides a customized canvas with several helper methods to be used by objects.
    
    \sa LogarithmPlotter, PickLocationOverlay
*/
Canvas {
    id: canvas
    anchors.top: parent.top
    anchors.left: parent.left
    height: parent.height - 90
    width: parent.width
    /*!
       \qmlproperty var LogGraphCanvas::imageLoaders
       Dictionary of format {image: callback} containing data for deferred image loading.
    */
    property var imageLoaders: {}
    
    Component.onCompleted: {
        imageLoaders = {}
        Modules.Canvas.initialize({ canvas, drawingErrorDialog })
    }
    
    Native.MessageDialog {
        id: drawingErrorDialog
        title: qsTranslate("expression", "LogarithmPlotter - Drawing error")
        text: ""
        function show(objType, objName, error) {
            text = qsTranslate("error", "Error while attempting to draw %1 %2:\n%3\n\nUndoing last change.").arg(objType).arg(objName).arg(error)
            open()
        }
    }
    
    onPaint: function(rect) {
        //console.log('Redrawing')
        if(rect.width == canvas.width) { // Redraw full canvas
            Modules.Canvas.redraw()
        }
    }
    
    onImageLoaded: {
        Object.keys(imageLoaders).forEach((key) => {
            if(isImageLoaded(key)) {
                // Calling callback
                imageLoaders[key]()
                delete imageLoaders[key]
            }
        })
    }

    /*!
        \qmlmethod void LogGraphCanvas::loadImageAsync(string imageSource)
        Loads an image data onto the canvas asynchronously.
        Returns a Promise that is resolved when the image is loaded.
    */
    function loadImageAsync(imageSource) {
        return new Promise((resolve) => {
            this.loadImage(imageSource)
            this.imageLoaders[imageSource] = resolve
        })
    }
}
