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
    property double yaxisstep: 3
    property string xlabel: ""
    property string ylabel: ""
    
    onPaint: {
        //console.log('Redrawing')
        var ctx = getContext("2d");
        reset(ctx)
        drawGrille(ctx)
        drawAxises(ctx)
        Object.keys(Objects.currentObjects).forEach(function(objType){
            Objects.currentObjects[objType].forEach(function(obj){
                if(obj.visible) obj.draw(canvas, ctx)
            })
        })
        drawLabels(ctx)
        
    }
    
    function reset(ctx){
        // Reset
        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#000000"
        ctx.font = "12px sans-serif"
        ctx.fillRect(0,0,width,height)
    }
    
    // Drawing the log based graph
    function drawGrille(ctx) {
        ctx.strokeStyle = "#AAAAAA"
        for(var xpow = -10; xpow <= 10; xpow++) {
            for(var xmulti = 1; xmulti < 10; xmulti++) {
                drawXLine(ctx, Math.pow(10, xpow)*xmulti)
            }
        }
        for(var y = -Math.round(100/yaxisstep)*yaxisstep; y < canvas.ymax; y+=yaxisstep) {
            drawYLine(ctx, y)
        }
    }
    
    function drawAxises(ctx) {
        ctx.strokeStyle = "#000000"
        drawXLine(ctx, 1)
        drawYLine(ctx, 0)
        var axisypx = x2px(1) // X coordinate of Y axis
        var axisxpx = y2px(0) // Y coordinate of X axis
        // Drawing arrows
        drawLine(ctx, axisypx, 0, axisypx-10, 10)
        drawLine(ctx, axisypx, 0, axisypx+10, 10)
        drawLine(ctx, canvas.canvasSize.width, axisxpx, canvas.canvasSize.width-10, axisxpx-10)
        drawLine(ctx, canvas.canvasSize.width, axisxpx, canvas.canvasSize.width-10, axisxpx+10)
    }
    
    function drawLabels(ctx) {
        var axisypx = x2px(1) // X coordinate of Y axis
        var axisxpx = y2px(0) // Y coordinate of X axis
        // Labels
        ctx.fillStyle = "#000000"
        ctx.font = "16px sans-serif"
        ctx.fillText(canvas.ylabel, axisypx+5, 24)
        var textSize = ctx.measureText(canvas.xlabel).width
        ctx.fillText(canvas.xlabel, canvas.canvasSize.width-14-textSize, axisxpx-5)
        // Axis graduation labels
        ctx.font = "14px sans-serif"
        
        for(var xpow = -10; xpow <= 10; xpow+=1) {
            var textSize = ctx.measureText("10"+Utils.textsup(xpow)).width
            if(xpow != 0)
                drawVisibleText(ctx, "10"+Utils.textsup(xpow), x2px(Math.pow(10,xpow))-textSize/2, axisxpx+12+(6*(y==0)))
        }
        for(var y = -Math.round(100/yaxisstep)*yaxisstep; y < canvas.ymax; y+=yaxisstep) {
            var textSize = ctx.measureText(y).width
            drawVisibleText(ctx, y, axisypx-3-textSize, y2px(y)+6+(6*(y==0)))
        }
        ctx.fillStyle = "#FFFFFF"
    }
    
    function drawXLine(ctx, x) {
        if(visible(x, canvas.ymax)) {
            drawLine(ctx, x2px(x), 0, x2px(x), canvas.canvasSize.height)
        }
    }
    
    function drawYLine(ctx, y) {
        if(visible(canvas.xmin, y)) {
            drawLine(ctx, 0, y2px(y), canvas.canvasSize.width, y2px(y))
        }
    }
    
    function drawVisibleText(ctx, text, x, y, lineHeight = 14) {
        if(x > 0 && x < canvas.canvasSize.width && y > 0 && y < canvas.canvasSize.height) {
            text.toString().split("\n").forEach(function(txt, i){
                ctx.fillText(txt, x, y+(lineHeight*i))
            })
        }
    }
    
    // Method to calculate multiline string dimensions
    function measureText(ctx, text, lineHeight=14) {
        var theight = 0
        var twidth = 0
        text.split("\n").forEach(function(txt, i){
            theight += lineHeight
            if(ctx.measureText(txt).width > twidth) twidth = ctx.measureText(txt).width
        })
        return {'width': twidth, 'height': theight}
    }
    
    // Converts x coordinate to it's relative position on the canvas.
    function x2px(x) {
        var logxmin = Math.log(canvas.xmin)
        return (Math.log(x)-logxmin)*canvas.xzoom
    }
    // Converts y coordinate to it's relative position on the canvas.
    // Y is NOT ln based.
    function y2px(y) {
        return (canvas.ymax-y)*canvas.yzoom
    }
    // Reverse functions
    function px2x(px) {
        return Math.exp(px/canvas.xzoom+Math.log(canvas.xmin))
    }
    function px2y(px) {
        return -(px/canvas.yzoom-canvas.ymax)
    }
    // Checks whether a point is visible or not.
    function visible(x, y) {
        return (x2px(x) >= 0 && x2px(x) <= canvas.canvasSize.width) && (y2px(y) >= 0 && y2px(y) <= canvas.canvasSize.height)
    }
    // Draws a line from a (x1, y1) to (x2, y2)
    function drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    
}
