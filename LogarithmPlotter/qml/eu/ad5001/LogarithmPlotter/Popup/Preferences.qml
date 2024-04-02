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
import QtQuick.Layouts
import eu.ad5001.LogarithmPlotter.Setting 1.0 as Setting
import "../js/setting/common.mjs" as S

/*!
    \qmltype Preferences
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Popup to change global application preferences.
        
    \sa LogarithmPlotter, GreetScreen
*/
Popup {
    id: preferencesPopup
    x: (parent.width-width)/2
    y: Math.max(20, (parent.height-height)/2)
    width: settingPopupRow.width + 30
    height: settingPopupRow.height + 20
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    
    // Components for the preferences
    Component {
        id: boolSettingComponent
        
        CheckBox {
            height: 20
            text: setting.displayName
            checked: setting.value()
            onClicked: setting.set(this.checked)
        }
    }
    
    Component {
        id: enumIntSettingComponent
        
        // Setting when selecting data from an enum, or an object of a certain type.
        Setting.ComboBoxSetting {
            height: 30
            label: setting.displayName
            icon: `settings/${setting.icon}.svg`
            currentIndex: setting.value()
            model: setting.values()
            onActivated: function(newIndex) { setting.set(newIndex) }
        }
    }
    
    Row {
        id: settingPopupRow
        height: 300
        width: categories.width + categorySeparator.width + settingView.width + 70
        spacing: 15
        
        anchors {
            top: parent.top
            bottom: parent.bottom
            left: parent.left
            right: parent.right
            topMargin: 10
            bottomMargin: 10
            rightMargin: 15
            leftMargin: 15
        }
        
        ColumnLayout {
            id: categories
            width: 150
            height: parent.height
            spacing: 0
            clip: true
            
            Repeater {
                model: Object.keys(Modules.Settings.categories)
                
                Button {
                    // width: 150
                    Layout.fillWidth: true
                    text: qsTranslate('settingCategory', modelData)
                    
                    onClicked: {
                        settingList.model = Modules.Settings.categories[modelData]
                        settingCategoryName.text = text
                    }
                }
            }
            
            Item {
                Layout.fillHeight: true
                Layout.fillWidth: true
                
                Button {
                    id: closeButton
                    anchors {
                        left: parent.left
                        right: parent.right
                        bottom: parent.bottom
                    }
                    text: qsTr('Close')
                    onClicked: preferencesPopup.close()
                }
            }
        }
        
        Rectangle {
            id: categorySeparator
            anchors {
                top: parent.top
                topMargin: 5
            }
            opacity: 0.3
            color: sysPalette.windowText
            height: parent.height - 10
            width: 1
        }
        
        ScrollView {
            id: settingView
            clip: true
            width: 500
            height: parent.height
            
            Column {
                spacing: 10
                clip: true
                width: settingView.width
            
                Text {
                    id: settingCategoryName
                    font.pixelSize: 32
                    color: sysPalette.windowText
                    text: qsTranslate('settingCategory', 'general')
                    
                    Rectangle {
                        id: bottomSeparator
                        anchors.top: parent.bottom
                        opacity: 0.3
                        color: sysPalette.windowText
                        width: settingView.width
                        height: 1
                    }
                }
                
                Repeater {
                    id: settingList
                    model: Modules.Settings.categories.general
                    
                    delegate: Component {
                        Loader {
                            width: settingView.width
                            property var setting: modelData
                            sourceComponent: {
                                if(setting instanceof S.BoolSetting)
                                    return boolSettingComponent
                                else if(setting instanceof S.EnumIntSetting)
                                    return enumIntSettingComponent
                                else
                                    console.log('Unknown setting type!', modelData.constructor)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Component.onCompleted: open()
}
