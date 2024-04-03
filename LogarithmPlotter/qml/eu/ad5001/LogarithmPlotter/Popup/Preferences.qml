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
import "../js/preferences/common.mjs" as S
import "../js/utils.mjs" as Utils

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
            model: setting.values
            onActivated: function(newIndex) { setting.set(newIndex) }
        }
    }
    
    Component {
        id: stringSettingComponent
        
        Setting.ComboBoxSetting {
            height: 30
            label: setting.displayName
            icon: `settings/${setting.icon}.svg`
            editable: true
            currentIndex: find(setting.value())
            model: setting.defaultValues
            onAccepted: function() {
                editText = Utils.parseName(editText, false)
                if(find(editText) === -1) model.append(editText)
                setting.set(editText)
            }
            onActivated: function(selectedId) {
                setting.set(model[selectedId])
            }
            Component.onCompleted: editText = setting.value()
        }
    }
    
    Component {
        id: numberSettingComponent
        
        Setting.TextSetting {
            height: 30
            isDouble: true
            label: setting.displayName
            min: setting.min()
            icon: `settings/${setting.icon}.svg`
            value: setting.value()
            onChanged: function(newValue) {
                if(newValue < setting.max())
                    setting.set(newValue)
                else {
                    value = setting.max()
                    setting.set(setting.max())
                }
            }
        }
    }
    
    Component {
        id: expressionSettingComponent
        
        Setting.ExpressionEditor {
            height: 30
            label: setting.displayName
            icon: `settings/${setting.icon}.svg`
            defValue: Utils.simplifyExpression(setting.value())
            variables: setting.variables
            allowGraphObjects: false
            property string propertyName: setting.displayName
            onChanged: function(newExpr) {
                try {
                    setting.set(newExpr)
                } catch(e) {
                    errorDialog.showDialog(propertyName, newExpr, e.message)
                }
            }
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
                model: Object.keys(Modules.Preferences.categories)
                
                Button {
                    // width: 150
                    Layout.fillWidth: true
                    text: qsTranslate('settingCategory', modelData)
                    
                    onClicked: {
                        settingView.model = Modules.Preferences.categories[modelData]
                        settingView.name = text
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
        
        ListView {
            id: settingView
            clip: true
            width: 500
            spacing: 10
            model: Modules.Preferences.categories.general
            anchors {
                top: parent.top
                bottom: parent.bottom
            }
            ScrollBar.vertical: ScrollBar { }
            property string name: qsTranslate('settingCategory', 'general')

            
            header: Text {
                id: settingCategoryName
                font.pixelSize: 32
                height: 48
                color: sysPalette.windowText
                text: settingView.name
                
                Rectangle {
                    id: bottomSeparator
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: 8
                    opacity: 0.3
                    color: sysPalette.windowText
                    width: settingView.width
                    height: 1
                }
            }
            
            delegate: Component {
                Loader {
                    width: settingView.width * 2 / 3
                    property var setting: modelData
                    sourceComponent: {
                        if(setting instanceof S.BoolSetting)
                            return boolSettingComponent
                        else if(setting instanceof S.EnumIntSetting)
                            return enumIntSettingComponent
                        else if(setting instanceof S.NumberSetting)
                            return numberSettingComponent
                        else if(setting instanceof S.ExpressionSetting)
                            return expressionSettingComponent
                        else if(setting instanceof S.StringSetting)
                            return stringSettingComponent
                        else
                            console.log('Unknown setting type!', modelData.constructor)
                    }
                }
            }
        }
    }
    
    // Component.onCompleted: open()
}
