/**
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2023  Ad5001
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

/*!
    \qmltype BaseDialog
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Base dialog window in replacement of Dialog Popup from Qt 5.
    
    \sa LogarithmPlotter
*/

Window {
    color: sysPalette.window
    visible: false;
    flags: Qt.Dialog | Qt.Popup | Qt.MSWindowsFixedSizeDialogHint
    modality: Qt.WindowModal
    minimumWidth: width
    maximumWidth: width
    height: minimumHeight
    // maximumHeight:  contentItem.implicitHeight + 2*margin
    property int margin: 10
    
    Button {
        id: closeButton
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.bottomMargin: margin
        anchors.rightMargin: margin
        text: qsTr('Close')
        onClicked: close()
    }
    
    function open() {
        show()
    }
}
