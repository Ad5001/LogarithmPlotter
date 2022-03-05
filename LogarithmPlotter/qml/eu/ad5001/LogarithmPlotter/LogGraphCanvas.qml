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

import QtQuick 2.12 
import "js/objects.js" as Objects
import "js/utils.js" as Utils
import "js/mathlib.js" as MathLib

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
       \qmlproperty var LogGraphCanvas::yaxisstepExpr
       Expression for the y axis step (used to create labels).
    */
    property var yaxisstepExpr: (new MathLib.Expression(`x*(${yaxisstep})`))
    /*!
       \qmlproperty double LogGraphCanvas::yaxisstep1
       Value of the for the y axis step.
    */
    property double yaxisstep1: yaxisstepExpr.execute(1)
    /*!
       \qmlproperty int LogGraphCanvas::drawMaxY
       Minimum value of y that should be drawn onto the canvas.
    */
    property int drawMaxY: Math.ceil(Math.max(Math.abs(ymax), Math.abs(px2y(canvasSize.height)))/yaxisstep1)
    /*!
       \qmlproperty var LogGraphCanvas::xaxisstepExpr
       Expression for the x axis step (used to create labels).
    */
    property var xaxisstepExpr: (new MathLib.Expression(`x*(${xaxisstep})`))
    /*!
       \qmlproperty double LogGraphCanvas::xaxisstep1
       Value of the for the x axis step.
    */
    property double xaxisstep1: xaxisstepExpr.execute(1)
    /*!
       \qmlproperty int LogGraphCanvas::drawMaxX
       Maximum value of x that should be drawn onto the canvas.
    */
    property int drawMaxX: Math.ceil(Math.max(Math.abs(xmin), Math.abs(px2x(canvasSize.width)))/xaxisstep1)
    
    property var imageLoaders: {}
    property var ctx
    
    Component.onCompleted: imageLoaders = {}
    
    onPaint: function(rect) {
        //console.log('Redrawing')
        if(rect.width == canvas.width) { // Redraw full canvas
            ctx = getContext("2d");
            reset(ctx)
            drawGrille(ctx)
            drawAxises(ctx)
            drawLabels(ctx)
            ctx.lineWidth = linewidth
            for(var objType in Objects.currentObjects) {
                for(var obj of Objects.currentObjects[objType]){
                    ctx.strokeStyle = obj.color
                    ctx.fillStyle = obj.color
                    if(obj.visible) obj.draw(canvas, ctx)
                }
            }
            ctx.lineWidth = 1
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
        \qmlmethod void LogGraphCanvas::reset(var ctx)
        Resets the canvas to a blank one with default setting using 2D \c ctx.
    */
    function reset(ctx){
        // Reset
        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#000000"
        ctx.font = `${canvas.textsize-2}px sans-serif`
        ctx.fillRect(0,0,width,height)
    }
    
    // Drawing the log based graph
    
    /*!
        \qmlmethod void LogGraphCanvas::drawGrille(var ctx)
        Draws the grid using 2D \c ctx.
    */
    function drawGrille(ctx) {
        ctx.strokeStyle = "#C0C0C0"
        if(logscalex) {
            for(var xpow = -maxgradx; xpow <= maxgradx; xpow++) {
                for(var xmulti = 1; xmulti < 10; xmulti++) {
                    drawXLine(ctx, Math.pow(10, xpow)*xmulti)
                }
            }
        } else {
            for(var x = 0; x < drawMaxX; x+=1) {
                drawXLine(ctx, x*xaxisstep1)
                drawXLine(ctx, -x*xaxisstep1)
            }
        }
        for(var y = 0; y < drawMaxY; y+=1) {
            drawYLine(ctx, y*yaxisstep1)
            drawYLine(ctx, -y*yaxisstep1)
        }
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawAxises(var ctx)
        Draws the graph axises using 2D \c ctx.
    */
    function drawAxises(ctx) {
        ctx.strokeStyle = "#000000"
        var axisypos = logscalex ? 1 : 0
        drawXLine(ctx, axisypos)
        drawYLine(ctx, 0)
        var axisypx = x2px(axisypos) // X coordinate of Y axis
        var axisxpx = y2px(0) // Y coordinate of X axis
        // Drawing arrows
        drawLine(ctx, axisypx, 0, axisypx-10, 10)
        drawLine(ctx, axisypx, 0, axisypx+10, 10)
        drawLine(ctx, canvasSize.width, axisxpx, canvasSize.width-10, axisxpx-10)
        drawLine(ctx, canvasSize.width, axisxpx, canvasSize.width-10, axisxpx+10)
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawLabels(var ctx)
        Draws all labels (graduation & axises labels) using 2D \c ctx.
    */
    function drawLabels(ctx) {
        var axisypx = x2px(logscalex ? 1 : 0) // X coordinate of Y axis
        var axisxpx = y2px(0) // Y coordinate of X axis
        // Labels
        ctx.fillStyle = "#000000"
        ctx.font = `${canvas.textsize+2}px sans-serif`
        ctx.fillText(ylabel, axisypx+10, 24)
        var textSize = ctx.measureText(xlabel).width
        ctx.fillText(xlabel, canvasSize.width-14-textSize, axisxpx-5)
        // Axis graduation labels
        ctx.font = `${canvas.textsize-2}px sans-serif`
        
        var txtMinus = ctx.measureText('-').width
        if(showxgrad) {
            if(logscalex) {
                for(var xpow = -maxgradx; xpow <= maxgradx; xpow+=1) {
                    var textSize = ctx.measureText("10"+Utils.textsup(xpow)).width
                    if(xpow != 0)
                        drawVisibleText(ctx, "10"+Utils.textsup(xpow), x2px(Math.pow(10,xpow))-textSize/2, axisxpx+16+(6*(y==0)))
                }
            } else {
                for(var x = 1; x < drawMaxX; x += 1) {
                    var drawX = x*xaxisstep1
                    var txtX = xaxisstepExpr.simplify(x)
                    var textSize = measureText(ctx, txtX, 6).height
                    drawVisibleText(ctx, txtX, x2px(drawX)-4, axisxpx+textsize/2+textSize)
                    drawVisibleText(ctx, '-'+txtX, x2px(-drawX)-4, axisxpx+textsize/2+textSize)
                }
            }
        }
        if(showygrad) {
            for(var y = 0; y < drawMaxY; y += 1) {
                var drawY = y*yaxisstep1
                var txtY = yaxisstepExpr.simplify(y)
                var textSize = ctx.measureText(txtY).width
                drawVisibleText(ctx, txtY, axisypx-6-textSize, y2px(drawY)+4+(10*(y==0)))
                if(y != 0)
                    drawVisibleText(ctx, '-'+txtY, axisypx-6-textSize-txtMinus, y2px(-drawY)+4)
            }
        }
        ctx.fillStyle = "#FFFFFF"
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawXLine(var ctx, double x)
        Draws an horizontal line at \c x plot coordinate using 2D \c ctx.
    */
    function drawXLine(ctx, x) {
        if(visible(x, ymax)) {
            drawLine(ctx, x2px(x), 0, x2px(x), canvasSize.height)
        }
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawXLine(var ctx, double x)
        Draws an vertical line at \c y plot coordinate using 2D \c ctx.
    */
    function drawYLine(ctx, y) {
        if(visible(xmin, y)) {
            drawLine(ctx, 0, y2px(y), canvasSize.width, y2px(y))
        }
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawVisibleText(var ctx, string text, double x, double y)
        Writes multline \c text onto the canvas using 2D \c ctx.
        \note The \c x and \c y properties here are relative to the canvas, not the plot.
    */
    function drawVisibleText(ctx, text, x, y) {
        if(x > 0 && x < canvasSize.width && y > 0 && y < canvasSize.height) {
            text.toString().split("\n").forEach(function(txt, i){
                ctx.fillText(txt, x, y+(canvas.textsize*i))
            })
        }
    }
    
    /*!
        \qmlmethod void LogGraphCanvas::drawVisibleImage(var ctx, var image, double x, double y)
        Draws an \c image onto the canvas using 2D \c ctx.
        \note The \c x, \c y \c width and \c height properties here are relative to the canvas, not the plot.
    */
    function drawVisibleImage(ctx, image, x, y, width, height) {
        console.log("Drawing image", isImageLoaded(image), isImageError(image))
        markDirty(Qt.rect(x, y, width, height));
        ctx.drawImage(image, x, y, width, height)
        /*if(true || (x > 0 && x < canvasSize.width && y > 0 && y < canvasSize.height)) {
        }*/
    }
    
    /*!
        \qmlmethod var LogGraphCanvas::measureText(var ctx, string text)
        Measures the wicth and height of a multiline \c text that would be drawn onto the canvas using 2D \c ctx.
        Return format: dictionary {"width": width, "height": height}
    */
    function measureText(ctx, text) {
        var theight = 0
        var twidth = 0
        text.split("\n").forEach(function(txt, i){
            theight += canvas.textsize
            if(ctx.measureText(txt).width > twidth) twidth = ctx.measureText(txt).width
        })
        return {'width': twidth, 'height': theight}
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

    /*!
        \qmlmethod bool LogGraphCanvas::visible(double x, double y)
        Checks whether a plot point (\c x, \c y) is visible or not on the canvas.
    */
    function visible(x, y) {
        return (x2px(x) >= 0 && x2px(x) <= canvasSize.width) && (y2px(y) >= 0 && y2px(y) <= canvasSize.height)
    }

    /*!
        \qmlmethod bool LogGraphCanvas::drawLine(var ctx, double x1, double y1, double x2, double y2)
        Draws a line from plot point (\c x1, \c y1) to plot point (\c x2, \¢ y2) using 2D \c ctx.
    */
    function drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /*!
        \qmlmethod bool LogGraphCanvas::drawDashedLine2(var ctx, double x1, double y1, double x2, double y2)
        Draws a dashed line from plot point (\c x1, \c y1) to plot point (\c x2, \¢ y2) using 2D \c ctx.
    */
    function drawDashedLine2(ctx, x1, y1, x2, y2, dashPxSize = 5) {
        ctx.setLineDash([dashPxSize, dashPxSize]);
        drawLine(ctx, x1, y1, x2, y2)
        ctx.setLineDash([]);
    }

    /*!
        \qmlmethod bool LogGraphCanvas::drawDashedLine(var ctx, double x1, double y1, double x2, double y2)
        Draws a dashed line from plot point (\c x1, \c y1) to plot point (\c x2, \¢ y2) using 2D \c ctx.
        (Legacy slower method)
    */
    function drawDashedLine(ctx, x1, y1, x2, y2, dashPxSize = 10) {
        var distance = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
        var progPerc = dashPxSize/distance
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for(var i = 0; i < 1; i += progPerc) {
            ctx.lineTo(x1-(x1-x2)*i, y1-(y1-y2)*i)
            ctx.moveTo(x1-(x1-x2)*(i+progPerc/2), y1-(y1-y2)*(i+progPerc/2))
        }
        ctx.stroke();
    }

    /*!
        \qmlmethod var LogGraphCanvas::renderLatexImage(string ltxText, color)
        Renders latex markup \c ltxText to an image and loads it. Returns a dictionary with three values: source, width and height.
    */
    function renderLatexImage(ltxText, color, callback) {
        let [ltxSrc, ltxWidth, ltxHeight] = Latex.render(ltxText, textsize, color).split(",")
        let imgData = {
            "source": ltxSrc,
            "width": parseFloat(ltxWidth),
            "height": parseFloat(ltxHeight)
        };
        if(!isImageLoaded(ltxSrc) && !isImageLoading(ltxSrc)){
            // Wait until the image is loaded to callback.
            loadImage(ltxSrc)
            imageLoaders[ltxSrc] = [callback, imgData]
        } else {
            // Callback directly
            callback(canvas, ctx, imgData)
        }
    }
}
