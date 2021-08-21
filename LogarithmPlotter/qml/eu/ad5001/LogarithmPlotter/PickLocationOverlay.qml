/**
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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
import QtQuick.Controls 2.12
import "js/objects.js" as Objects
import "js/mathlib.js" as MathLib
import "js/historylib.js" as HistoryLib

Item {
    id: pickerRoot
    visible: false
    
    property var canvas
    property string objType: 'Point'
    property string objName: 'A'
    property bool pickY: true
    property bool pickX: true
    property string propertyX: 'x'
    property string propertyY: 'y'
    property alias precision: precisionSlider.value
    
    Rectangle {
        color: sysPalette.window
        opacity: 0.35
        anchors.fill: parent
    }
    
    MouseArea {
        id: picker
        anchors.fill: parent
        hoverEnabled: parent.visible
        cursorShape: Qt.CrossCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        onClicked: {
            if(mouse.button == Qt.LeftButton) { // Validate
                if(parent.pickX) {
                    let newValue = picked.mouseX.toString()
                    newValue = {
                        'Expression': () => new MathLib.Expression(newValue),
                        'number': () => parseFloat(newValue)
                    }[Objects.types[objType].properties()[propertyX]]()
                    let obj = Objects.getObjectByName(objName, objType)
                    history.addToHistory(new HistoryLib.EditedProperty(
                        objName, objType, propertyX, obj[propertyX], newValue
                    ))
                    obj[propertyX] = newValue
                    obj.update()
                    objectLists.update()
                }
                if(parent.pickY) {
                    let newValue = picked.mouseY.toString()
                    newValue = {
                        'Expression': () => new MathLib.Expression(newValue),
                        'number': () => parseFloat(newValue)
                    }[Objects.types[objType].properties()[propertyY]]()
                    let obj = Objects.getObjectByName(objName, objType)
                    history.addToHistory(new HistoryLib.EditedProperty(
                        objName, objType, propertyY, obj[propertyY], newValue
                    ))
                    obj[propertyY] = newValue
                    obj.update()
                    objectLists.update()
                }
            }
            pickerRoot.visible = false;
        }
    }
    
    Row {
        height: precisionSlider.height
        Text {
            text: "  Pointer precision: "
            color: 'black'
            anchors.verticalCenter: parent.verticalCenter
        }
        
        Slider {
            id: precisionSlider
            from: 0
            value: 2
            to: 10
            stepSize: 1
            ToolTip {
                parent: precisionSlider.handle
                visible: precisionSlider.pressed
                text: precisionSlider.value.toFixed(0)
            }
        }
        
        CheckBox {
            id: snapToGridCheckbox
            text: "Snap to grid"
            checked: false
        }
    }
    
    Rectangle {
        id: xCursor
        width: 1
        height: parent.height
        color: 'black'
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.leftMargin: canvas.x2px(picked.mouseX)
        visible: parent.pickX
    }
    
    Rectangle {
        id: yCursor
        width: parent.width
        height: 1
        color: 'black'
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.topMargin: canvas.y2px(picked.mouseY)
        visible: parent.pickY
    }
    
    Text {
        id: picked
        x: picker.mouseX - width - 5
        y: picker.mouseY - height - 5
        property double axisX: canvas.xaxisstep1
        property double mouseX: {
            let xpos = canvas.px2x(picker.mouseX)
            if(snapToGridCheckbox.checked) {
                if(canvas.logscalex) {
                    // Calculate the logged power
                    let pow = Math.pow(10, Math.floor(Math.log10(xpos)))
                    return pow*Math.round(xpos/pow)
                } else {
                    return canvas.xaxisstep1*Math.round(xpos/canvas.xaxisstep1)
                }
            } else {
                return xpos.toFixed(parent.precision)
            }
        }
        property double mouseY: {
            let ypos = canvas.px2y(picker.mouseY)
            if(snapToGridCheckbox.checked) {
                return canvas.yaxisstep1*Math.round(ypos/canvas.yaxisstep1)
            } else {
                return ypos.toFixed(parent.precision)
            }
        }
        color: 'black'
        text: {
            if(parent.pickX && parent.pickY)
                return `(${mouseX}, ${mouseY})`
            if(parent.pickX)
                return `X = ${mouseX}`
            if(parent.pickY)
                return `Y = ${mouseY}`
        }
    }
    
    
}
