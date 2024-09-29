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

/*!
    \qmltype ComboBoxSetting
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Combo box with an icon and label to make a proper setting.
            
    \sa EditorDialog, Settings, Icon
*/
Item {
    id: control
    height: 30
    
    /*!
        \qmlsignal ComboBoxSetting::activated(int newIndex)
        
        Alias of ComboBox.activated.
        The corresponding handler is \c onActivated.
        \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#activated-signal
    */
    signal activated(int newIndex)
    /*!
        \qmlsignal ComboBoxSetting::accepted()
        
        Alias of ComboBox.accepted.
        The corresponding handler is \c onAccepted.
        \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#accepted-signal
    */
    signal accepted()
    
    /*!
       \qmlproperty string ComboBoxSetting::label
       Label of the setting.
    */
    property string label: ''
    /*!
       \qmlproperty string ComboBoxSetting::icon
       Icon path of the setting.
    */
    property string icon: ""
    
    /*!
       \qmlproperty var ComboBoxSetting::model
       Model of the combo box.
       \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#model-prop
    */
    property alias model: combox.model
    /*!
       \qmlproperty bool ComboBoxSetting::editable
       Whether the combo box accepts user-inputed values.
       \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#editable-prop
    */
    property alias editable: combox.editable
    /*!
       \qmlproperty string ComboBoxSetting::editText
       Text in the text field of an editable combo box.
       \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#editText-prop
    */
    property alias editText: combox.editText
    /*!
       \qmlproperty string ComboBoxSetting::currentIndex
       Index of the current item in the combo box.
       The default value is -1 when count is 0, and 0 otherwise
       \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#currentIndex-prop
    */
    property alias currentIndex: combox.currentIndex
    /*!
       \qmlproperty string ComboBoxSetting::currentIndex
       Input text validator for an editable combo box
       \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#validator-prop
    */
    property alias validator: combox.validator
    
    /*!
        \qmlmethod int ComboBoxSetting::find(string elementName)
        Returns the index of the specified \a elementName, or -1 if no match is found.
        \sa https://doc.qt.io/qt-5/qml-qtquick-controls2-combobox.html#find-method
    */
    function find(elementName) {
        return combox.find(elementName)
    }
    
    Icon {
        id: iconLabel
        anchors.top: parent.top
        anchors.topMargin: icon == "" ? 0 : 3
        source: control.visible ? "../icons/" + control.icon : ""
        width: height
        height: icon == "" && visible ? 0 : 24
        color: sysPalette.windowText
    }
    
    Label {
        id: labelItem
        anchors.left: iconLabel.right
        anchors.leftMargin: icon == "" ? 0 : 5
        height: 30
        width: Math.max(85, implicitWidth)
        anchors.top: parent.top
        verticalAlignment: TextInput.AlignVCenter
        text: qsTranslate("control", "%1: ").arg(control.label)
    }
    
    ComboBox {
        id: combox
        height: 30
        anchors.left: labelItem.right
        anchors.leftMargin: 5
        width: control.width - labelItem.width - iconLabel.width - 10
        onActivated: function(newIndex) {
            control.activated(newIndex)
        }
        onAccepted: control.accepted()
    }
}
