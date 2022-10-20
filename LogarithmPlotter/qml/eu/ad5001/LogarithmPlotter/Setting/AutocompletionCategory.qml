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
import QtQuick.Controls 2.12

/*!
    \qmltype AutocompletionCategory
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief ListView representing a category of autocompletion.
            
    \sa ExpressionEditor
*/
ListView {
    id: listFiltered
    /*!
       \qmlproperty int AutocompletionCategory::itemStartIndex
       Start index of the first element in this list compared to the global autocompletion index.
    */
    property int itemStartIndex: 0
    /*!
       \qmlproperty int AutocompletionCategory::itemSelected
       The global autocompletion index.
    */
    property int itemSelected: 0
    
    /*!
       \qmlproperty string AutocompletionCategory::category
       Name of the category.
    */
    property string category: ""
    
    /*!
       \qmlproperty var AutocompletionCategory::categoryItems
       List of items in this category. To be filtered by the autocomplete to filters.
    */
    property var categoryItems: []
    
    /*!
       \qmlproperty var AutocompletionCategory::autocompleteGenerator
       Javascript function taking the name of the item to create an autocompletion item (dictionary with
       a 'text', 'annotation' 'autocomplete', and 'cursorFinalOffset' keys.
    */
    property var autocompleteGenerator: (item) => {return {'text': item, 'autocomplete': item, 'annotation': '', 'cursorFinalOffset': 0}}
    
    /*!
       \qmlproperty string AutocompletionCategory::baseText
       Text to autocomplete.
    */
    property string baseText: ""
    
    /*!
       \qmlproperty bool AutocompletionCategory::visbilityCondition
       Condition to be met for the category to be visible.
    */
    property bool visbilityCondition: true
    
    width: parent.width
    visible: model.length > 0
    implicitHeight: contentItem.childrenRect.height
    model: visbilityCondition ? categoryItems.filter((item) => item.includes(baseText)).map(autocompleteGenerator) : []
    
    header: Column {
        width: listFiltered.width
        spacing: 2
        topPadding: 5
        bottomPadding: 5
        
        Text {
            leftPadding: 5
            text: listFiltered.category
        }
        
        Rectangle {
            height: 1
            color: 'black'
            width: parent.width
        }
    }

    delegate: Rectangle {
        property bool selected: index + listFiltered.itemStartIndex == listFiltered.itemSelected
        
        width: listFiltered.width
        height: Math.max(autocompleteText.height, annotationText.height)
        color: selected ? sysPalette.highlight : 'transparent'
        
        Text {
            id: autocompleteText
            topPadding: 2
            bottomPadding: 2
            leftPadding: 15
            text: listFiltered.model[index].text
            color: parent.selected ? sysPalette.highlightedText : sysPalette.windowText
        }
        
        Text {
            id: annotationText
            anchors.right: parent.right
            topPadding: 2
            bottomPadding: 2
            rightPadding: 15
            text: listFiltered.model[index].annotation
            color: parent.selected ? sysPaletteIn.highlightedText : sysPaletteIn.windowText
        }
    }
}
