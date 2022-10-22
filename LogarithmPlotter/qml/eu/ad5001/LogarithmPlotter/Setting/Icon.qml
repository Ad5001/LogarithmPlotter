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
import QtQuick.Window 2.12
import QtGraphicalEffects 1.0

/*!
    \qmltype Icon
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Colorable image.
            
    \sa ComboBoxSetting, ListSetting, TextSetting
*/
Item {
    /*!
       \qmlproperty string Icon::color
       Overlay color of the icon.
    */
    property color color: "#000000"
    /*!
       \qmlproperty string Icon::source
       Path of the icon image source.
    */
    property alias source: img.source
    /*!
       \qmlproperty string Icon::source
       Path of the icon image source.
    */
    property alias sourceSize: img.sourceSize.width
    
    Image {
        id: img
        height: parent.height
        width: parent.width
        //smooth: true
        visible: false
        sourceSize.width: width*Screen.devicePixelRatio
        sourceSize.height: width*Screen.devicePixelRatio
    }
    ColorOverlay {
        anchors.fill: img
        source: img
        color: parent.color
    }
}
