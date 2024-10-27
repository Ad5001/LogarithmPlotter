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
    \qmltype Loading
    \inqmlmodule eu.ad5001.LogarithmPlotter.Overlay
    \brief Overlay notifiying the user when a file is loading.

    Provides an overlay over the canvas that is shown when the user loads a new file, both to lock the ViewPositionChange
    overlay and inform the user of what is loading and how much remains.
    
    \sa Common, ViewPositionChange
*/
Item {
    id: loadingRoot
    opacity: 0
    visible: opacity !== 0
    clip: true
    
    property int currentlyLoading: 0
    property int maxCurrentLoadingSteps: 0
    
    Behavior on opacity { PropertyAnimation {} }
    
    Rectangle {
        anchors.fill: parent
        color: sysPalette.window
        opacity: 0.85
    }
        
    Column {
        spacing: 5
        anchors {
            verticalCenter: parent.verticalCenter
            left: parent.left
            right: parent.right
        }
        
        Text {
            id: loadingTitle
            anchors.horizontalCenter: parent.horizontalCenter
            font.pixelSize: 20
            color: sysPalette.windowText
        }
        
        ProgressBar {
            id: progress
            anchors.horizontalCenter: parent.horizontalCenter
            width: 300
            from: 0
            value: loadingRoot.maxCurrentLoadingSteps - loadingRoot.currentlyLoading
            to: loadingRoot.maxCurrentLoadingSteps
        }
        
        Text {
            id: lastFinishedStep
            anchors.horizontalCenter: parent.horizontalCenter
            color: sysPalette.windowText
        }
    }
    
    MouseArea {
        id: picker
        anchors.fill: parent
        hoverEnabled: parent.visible
        cursorShape: Qt.ArrowCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
    }
    
    
    
    /*!
        \qmlmethod void Loading::addedLoadingStep()
        Registers one new loading step that will eventually call \c finishedLoadingStep.
    */
    function addedLoadingStep() {
        if(loadingRoot.maxCurrentLoadingSteps === 1) {
            // Only when several ones need to be loaded.
            const fileName = Modules.Settings.saveFilename.split('/').pop().split('\\').pop()
            loadingTitle.text = qsTr("Loading...")
            loadingRoot.opacity = 1
        }
        loadingRoot.currentlyLoading++
        loadingRoot.maxCurrentLoadingSteps++
    }
    
    /*!
        \qmlmethod void Loading::finishedLoadingStep()
        Marks a loading step as finished and displays the message to the user.
    */
    function finishedLoadingStep(message) {
        loadingRoot.currentlyLoading--
        const current = loadingRoot.maxCurrentLoadingSteps - loadingRoot.currentlyLoading
        lastFinishedStep.text = `${message} (${current}/${loadingRoot.maxCurrentLoadingSteps})`
        if(loadingRoot.currentlyLoading === 0) {
            loadingRoot.maxCurrentLoadingSteps = 0
            loadingRoot.opacity = 0
        }
    }
    
    
    Component.onCompleted: function() {
        Modules.Latex.on("async-render-started", (e) => {
            addedLoadingStep()
        })
        Modules.Latex.on("async-render-finished", (e) => {
            const markup = e.markup.length > 20 ? e.markup.substring(0, 15)+"..." : e.markup
            finishedLoadingStep(qsTr("Finished rendering of %1").arg(markup))
        })
    }
}
