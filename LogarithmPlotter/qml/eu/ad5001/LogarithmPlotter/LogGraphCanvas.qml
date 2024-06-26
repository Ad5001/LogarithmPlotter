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
import "js/utils.mjs" as Utils
import "js/mathlib.mjs" as MathLib

/*!
    \qmltype LogGraphCanvas
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Canvas used to display the diagram.

    Provides a customized canvas with several helper methods to be used by objects.
    
    \sa LogarithmPlotter, PickLocationOverlay
*/
Canvas {
    id: canvas
    anchors.top: separator.bottom
    anchors.left: parent.left
    height: parent.height - 90
    width: parent.width
    
    /*!
       \qmlproperty double LogGraphCanvas::xmin
       Minimum x of the diagram, provided from settings.
       \sa Settings
    */
    property double xmin: 0
    /*!
       \qmlproperty double LogGraphCanvas::ymax
       Maximum y of the diagram, provided from settings.
       \sa Settings
    */
    property double ymax: 0
    /*!
       \qmlproperty double LogGraphCanvas::xzoom
       Zoom on the x axis of the diagram, provided from settings.
       \sa Settings
    */
    property double xzoom: 10
    /*!
       \qmlproperty double LogGraphCanvas::yzoom
       Zoom on the y axis of the diagram, provided from settings.
       \sa Settings
    */
    property double yzoom: 10
    /*!
       \qmlproperty string LogGraphCanvas::xaxisstep
       Step of the x axis graduation, provided from settings.
       \note: Only available in non-logarithmic mode.
       \sa Settings
    */
    property string xaxisstep: "4"
    /*!
       \qmlproperty string LogGraphCanvas::yaxisstep
       Step of the y axis graduation, provided from settings.
       \sa Settings
    */
    property string yaxisstep: "4"
    /*!
       \qmlproperty string LogGraphCanvas::xlabel
       Label used on the x axis, provided from settings.
       \sa Settings
    */
    property string xlabel: ""
    /*!
       \qmlproperty string LogGraphCanvas::ylabel
       Label used on the y axis, provided from settings.
       \sa Settings
    */
    property string ylabel: ""
    /*!
       \qmlproperty double LogGraphCanvas::linewidth
       Width of lines that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double linewidth: 1
    /*!
       \qmlproperty double LogGraphCanvas::textsize
       Font size of the text that will be drawn into the canvas, provided from settings.
       \sa Settings
    */
    property double textsize: 14
    /*!
       \qmlproperty bool LogGraphCanvas::logscalex
       true if the canvas should be in logarithmic mode, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool logscalex: false
    /*!
       \qmlproperty bool LogGraphCanvas::showxgrad
       true if the x graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showxgrad: false
    /*!
       \qmlproperty bool LogGraphCanvas::showygrad
       true if the y graduation should be shown, false otherwise.
       Provided from settings.
       \sa Settings
    */
    property bool showygrad: false
    
    /*!
       \qmlproperty int LogGraphCanvas::maxgradx
       Max power of the logarithmic scaled on the x axis in logarithmic mode.
    */
    property int maxgradx: 20
    
    /*!
       \qmlproperty var LogGraphCanvas::imageLoaders
       Dictionary of format {image: [callback.image data]} containing data for defered image loading.
    */
    property var imageLoaders: {}
    /*!
       \qmlproperty var LogGraphCanvas::ctx
       Cache for the 2D context so that it may be used asynchronously.
    */
    property var ctx
    
    Component.onCompleted: {
        imageLoaders = {}
        Modules.Canvas.initialize(canvas, drawingErrorDialog)
    }
    
    Native.MessageDialog {
        id: drawingErrorDialog
        title: qsTranslate("expression", "LogarithmPlotter - Drawing error")
        text: ""
        function showDialog(objType, objName, error) {
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
                imageLoaders[key][0](canvas, ctx, imageLoaders[key][1])
                delete imageLoaders[key]
            }
        })
    }
    
        /*!
        \qmlmethod double LogGraphCanvas::x2px(double x)
        Converts an \c x coordinate to it's relative position on the canvas.
        It supports both logarithmic and non logarithmic scale depending on the currently selected mode.
    */
    function x2px(x) {
        if(logscalex) {
            var logxmin = Math.log(xmin)
            return (Math.log(x)-logxmin)*xzoom
        } else return (x - xmin)*xzoom
    }
    
    /*!
        \qmlmethod double LogGraphCanvas::y2px(double y)
        Converts an \c y coordinate to it's relative position on the canvas.
        The y axis not supporting logarithmic scale, it only support linear convertion.
    */
    function y2px(y) {
        return (ymax-y)*yzoom
    }

    /*!
        \qmlmethod double LogGraphCanvas::px2x(double px)
        Converts an x \c px position on the canvas to it's corresponding coordinate on the plot.
        It supports both logarithmic and non logarithmic scale depending on the currently selected mode.
    */
    function px2x(px) {
        if(logscalex) {
            return Math.exp(px/xzoom+Math.log(xmin))
        } else return (px/xzoom+xmin)
    }

    /*!
        \qmlmethod double LogGraphCanvas::px2x(double px)
        Converts an x \c px position on the canvas to it's corresponding coordinate on the plot.
        It supports both logarithmic and non logarithmic scale depending on the currently selected mode.
    */
    function px2y(px) {
        return -(px/yzoom-ymax)
    }
}
