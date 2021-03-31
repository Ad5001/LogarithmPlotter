/**
 *  Logarithm Graph Creator - Create graphs with logarithm scales.
 *  Copyright (C) 2020  Ad5001
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


Canvas {
    id: canvas
    anchors.top: separator.bottom
    anchors.left: parent.left
    height: parent.height - 90
    width: parent.width
    
    property double xmin: 0
    property double ymax: 0
    property int xzoom: 10
    property int yzoom: 10
    property string xaxisstep: "4"
    property string yaxisstep: "4"
    property string xlabel: ""
    property string ylabel: ""
    property int maxgradx: 8
    property double linewidth: 1
    property double textsize: 14
    property bool logscalex: false
    property bool showxgrad: false
    property bool showygrad: false
    
    property var yaxisstepExpr: (new MathLib.Expression(`x*(${yaxisstep})`))
    property double yaxisstep1: yaxisstepExpr.execute(1)
    property int drawMaxY: Math.ceil(Math.max(Math.abs(ymax), Math.abs(px2y(canvasSize.height)))/yaxisstep1)
    property var xaxisstepExpr: (new MathLib.Expression(`x*(${xaxisstep})`))
    property double xaxisstep1: xaxisstepExpr.execute(1)
    property int drawMaxX: Math.ceil(Math.max(Math.abs(xmin), Math.abs(px2x(canvasSize.width)))/xaxisstep1)
    
    
    onPaint: {
        //console.log('Redrawing')
        var ctx = getContext("2d");
        reset(ctx)
        drawGrille(ctx)
        drawAxises(ctx)
        ctx.lineWidth = linewidth
        for(var objType in Objects.currentObjects) {
            for(var obj of Objects.currentObjects[objType]){
                ctx.strokeStyle = obj.color
                ctx.fillStyle = obj.color
                if(obj.visible) obj.draw(canvas, ctx)
            }
        }
        ctx.lineWidth = 1
        drawLabels(ctx)
        
    }
    
    function reset(ctx){
        // Reset
        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#000000"
        ctx.font = `${canvas.textsize-2}px sans-serif`
        ctx.fillRect(0,0,width,height)
    }
    
    // Drawing the log based graph
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
    
    function drawXLine(ctx, x) {
        if(visible(x, ymax)) {
            drawLine(ctx, x2px(x), 0, x2px(x), canvasSize.height)
        }
    }
    
    function drawYLine(ctx, y) {
        if(visible(xmin, y)) {
            drawLine(ctx, 0, y2px(y), canvasSize.width, y2px(y))
        }
    }
    
    function drawVisibleText(ctx, text, x, y) {
        if(x > 0 && x < canvasSize.width && y > 0 && y < canvasSize.height) {
            text.toString().split("\n").forEach(function(txt, i){
                ctx.fillText(txt, x, y+(canvas.textsize*i))
            })
        }
    }
    
    // Method to calculate multi-line string dimensions
    function measureText(ctx, text) {
        var theight = 0
        var twidth = 0
        text.split("\n").forEach(function(txt, i){
            theight += canvas.textsize
            if(ctx.measureText(txt).width > twidth) twidth = ctx.measureText(txt).width
        })
        return {'width': twidth, 'height': theight}
    }
    
    // Converts x coordinate to it's relative position on the 
    function x2px(x) {
        if(logscalex) {
            var logxmin = Math.log(xmin)
            return (Math.log(x)-logxmin)*xzoom
        } else return (x - xmin)*xzoom
    }
    // Converts y coordinate to it's relative position on the 
    // Y is NOT ln based.
    function y2px(y) {
        return (ymax-y)*yzoom
    }
    // Reverse functions
    function px2x(px) {
        if(logscalex) {
            return Math.exp(px/xzoom+Math.log(xmin))
        } else return (px/xzoom+xmin)
    }
    function px2y(px) {
        return -(px/yzoom-ymax)
    }
    // Checks whether a point is visible or not.
    function visible(x, y) {
        return (x2px(x) >= 0 && x2px(x) <= canvasSize.width) && (y2px(y) >= 0 && y2px(y) <= canvasSize.height)
    }
    // Draws a line from a (x1, y1) to (x2, y2)
    function drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    function drawDashedLine2(ctx, x1, y1, x2, y2, dashPxSize = 5) {
        ctx.setLineDash([dashPxSize, dashPxSize]);
        drawLine(ctx, x1, y1, x2, y2)
        ctx.setLineDash([]);
    }
    
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
}
