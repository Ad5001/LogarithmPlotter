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
import "js/mathlib.mjs" as MathLib
import "js/historylib.mjs" as HistoryLib

/*!
    \qmltype PickLocationOverlay
    \inqmlmodule eu.ad5001.LogarithmPlotter
    \brief Overlay used to pick a new location for an object.

    Provides an overlay over the canvas that can be shown when the user clicks the "Set position" button
    on a specific object. It allows the user to pick a new location on the canvas to place the object at.
    This overlay allows to set the precision of the pick as well as whether the pick should be on the plot grid.
    
    \sa LogarithmPlotter, LogGraphCanvas
*/
Item {
    id: pickerRoot
    visible: false
    clip: true
    
    /*!
        \qmlsignal PickLocationOverlay::picked(var obj)
        
        Emitted when a location has been picked
        The corresponding handler is \c onPicked.
    */
    signal picked(var obj)
    
    /*!
       \qmlproperty var PickLocationOverlay::canvas
       logGraphCanvas instance.
    */
    property var canvas
    /*!
       \qmlproperty string PickLocationOverlay::objType
       Type of object whose position the user is picking.
    */
    property string objType: 'Point'
    /*!
       \qmlproperty string PickLocationOverlay::objType
       Name of the object whose position the user is picking.
    */
    property string objName: 'A'
    /*!
       \qmlproperty bool PickLocationOverlay::pickX
       true if the property in propertyX is pickable.
    */
    property bool pickX: true
    /*!
       \qmlproperty bool PickLocationOverlay::pickY
       true if the property in propertyY is pickable.
    */
    property bool pickY: true
    /*!
       \qmlproperty string PickLocationOverlay::propertyX
       Name of the object's property whose x value is being changed.
    */
    property string propertyX: 'x'
    /*!
       \qmlproperty string PickLocationOverlay::propertyY
       Name of the object's property whose y value is being changed.
    */
    property string propertyY: 'y'
    /*!
       \qmlproperty int PickLocationOverlay::precision
       Precision of the picked value (post-dot precision).
    */
    property alias precision: precisionSlider.value
    /*!
       \qmlproperty bool PickLocationOverlay::userPickX
       true if the user can and wants to be picking a position on the x axis.
    */
    readonly property bool userPickX: pickX && pickXCheckbox.checked
    /*!
       \qmlproperty bool PickLocationOverlay::userPickY
       true if the user can and wants to be picking a position on the y axis.
    */
    readonly property bool userPickY: pickY && pickYCheckbox.checked
    
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
        onClicked: function(mouse) {
            if(mouse.button == Qt.LeftButton) { // Validate
                let newValueX = !parent.userPickX ? null : parseValue(picked.mouseX.toString(), objType, propertyX)
                let newValueY = !parent.userPickY ? null : parseValue(picked.mouseY.toString(), objType, propertyY)
                let obj = Modules.Objects.currentObjectsByName[objName]
                // Set values
                if(parent.userPickX && parent.userPickY) {
                    history.addToHistory(new HistoryLib.EditedPosition(
                        objName, objType, obj[propertyX], newValueX, obj[propertyY], newValueY
                    ))
                    obj[propertyX] = newValueX
                    obj[propertyY] = newValueY
                    obj.update()
                    objectLists.update()
                    pickerRoot.picked(obj)
                } else if(parent.userPickX) {
                    history.addToHistory(new HistoryLib.EditedProperty(
                        objName, objType, propertyX, obj[propertyX], newValueX
                    ))
                    obj[propertyX] = newValueX
                    obj.update()
                    objectLists.update()
                    pickerRoot.picked(obj)
                } else if(parent.userPickY) {
                    history.addToHistory(new HistoryLib.EditedProperty(
                        objName, objType, propertyY, obj[propertyY], newValueY
                    ))
                    obj[propertyY] = newValueY
                    obj.update()
                    objectLists.update()
                    pickerRoot.picked(obj)
                }
            }
            pickerRoot.visible = false;
        }
    }
    
    
    
    Rectangle {
        id: pickerSettings
        radius: 15
        color: sysPalette.window
        width: pickerSettingsColumn.width + 30;
        height: pickerSettingsColumn.height + 20
        property bool folded: false;
        x: -15 - ((width-55) * folded);
        y: 10
        z: 2
        
        Row {
            id: pickerSettingsColumn
            anchors {
                left: parent.left
                top: parent.top
                leftMargin: 20
                topMargin: 10
            }
            spacing: 15
            property int cellHeight: 15
            
            Column {
                spacing: 5
                // width: 100
                
                Text {
                    text: qsTr("Pointer precision:")
                    color: sysPalette.windowText
                    verticalAlignment: Text.AlignVCenter
                    height: pickerSettingsColumn.cellHeight
                }
                
                Text {
                    text: qsTr("Snap to grid:")
                    color: sysPalette.windowText
                    verticalAlignment: Text.AlignVCenter
                    height: pickerSettingsColumn.cellHeight
                }
                
                CheckBox {
                    id: pickXCheckbox
                    height: pickerSettingsColumn.cellHeight
                    text: qsTr("Pick X")
                    checked: pickX
                    visible: pickX
                }
            }
            
            Column {
                spacing: 5
                
                Slider {
                    id: precisionSlider
                    from: 0
                    value: 2
                    to: 10
                    stepSize: 1
                    height: pickerSettingsColumn.cellHeight
                    
                    ToolTip {
                        parent: precisionSlider.handle
                        visible: precisionSlider.pressed
                        text: precisionSlider.value.toFixed(0)
                    }
                }
                
                CheckBox {
                    id: snapToGridCheckbox
                    height: pickerSettingsColumn.cellHeight
                    // text: qsTr("Snap to grid")
                    checked: false
                }
                
                CheckBox {
                    id: pickYCheckbox
                    height: pickerSettingsColumn.cellHeight
                    text: qsTr("Pick Y")
                    checked: pickY
                    visible: pickY
                }
            }
            
            Button {
                width: 24
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                flat: true
                
                onClicked: pickerSettings.folded = !pickerSettings.folded
                
                ToolTip.visible: hovered
                ToolTip.delay: 200
                ToolTip.text: pickerSettings.folded ? qsTr("Open picker settings") : qsTr("Hide picker settings")
                
                Setting.Icon {
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.horizontalCenter: parent.horizontalCenter
                    width: 18
                    height: 18
                    color: sysPalette.windowText
                    source: `../icons/common/settings.svg`
                }
            }
        }
    }
    
    Rectangle {
        id: xCursor
        width: 1
        height: parent.height
        color: 'black'
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.leftMargin: Modules.Canvas.x2px(picked.mouseX)
        visible: parent.userPickX
    }
    
    Rectangle {
        id: yCursor
        width: parent.width
        height: 1
        color: 'black'
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.topMargin: Modules.Canvas.y2px(picked.mouseY)
        visible: parent.userPickY
    }
    
    Text {
        id: picked
        x: picker.mouseX - width - 5
        y: picker.mouseY - height - 5
        color: 'black'
        property double mouseX: {
            const axisX = Modules.Canvas.axesSteps.x.value
            const xpos = Modules.Canvas.px2x(picker.mouseX)
            if(snapToGridCheckbox.checked) {
                if(canvas.logscalex) {
                    // Calculate the logged power
                    let pow = Math.pow(10, Math.floor(Math.log10(xpos)))
                    return pow*Math.round(xpos/pow)
                } else {
                    return axisX*Math.round(xpos/axisX)
                }
            } else {
                return xpos.toFixed(parent.precision)
            }
        }
        property double mouseY: {
            const axisY = Modules.Canvas.axesSteps.y.value
            const ypos = Modules.Canvas.px2y(picker.mouseY)
            if(snapToGridCheckbox.checked) {
                return axisY*Math.round(ypos/axisY)
            } else {
                return ypos.toFixed(parent.precision)
            }
        }
        text: {
            if(parent.userPickX && parent.userPickY)
                return `(${mouseX}, ${mouseY})`
            else if(parent.userPickX)
                return `X = ${mouseX}`
            else if(parent.userPickY)
                return `Y = ${mouseY}`
            else
                return qsTr('(no pick selected)')
        }
    }
    
    
    /*!
        \qmlmethod void History::parseValue(string value, string objType, string propertyName)
        Parses a given \c value as an expression or a number depending on the type of \c propertyName of all \c objType.
    */
    function parseValue(value, objType, propertyName) {
        if(Modules.Objects.types[objType].properties()[propertyName] == 'number')
            return parseFloat(value)
        else
            return new MathLib.Expression(value)
    }
}
