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
import QtQuick.Window
import QtQuick.Controls.impl

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
    property alias sourceSize: img.sourceS
    
    ColorImage {
        id: img
        height: parent.height
        width: parent.width
        // visible: false
        property int sourceS: width*Screen.devicePixelRatio
        sourceSize.width: sourceS
        sourceSize.height: sourceS
        color: parent.color
    }
}
