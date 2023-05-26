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
import QtQuick.Dialogs
import QtQuick.Controls

/*!
    \qmltype ThanksTo
    \inqmlmodule eu.ad5001.LogarithmPlotter.Popup
    \brief Thanks to popup of LogarithmPlotter.
    
    \sa LogarithmPlotter
*/
BaseDialog {
    id: about
    title: qsTr("Thanks and Contributions - LogarithmPlotter")
    width: 450
    minimumHeight: 710
    
    Column {
        anchors {
            top: parent.top;
            left: parent.left;
            bottom: parent.bottom;
            right: parent.right;
            topMargin: margin;
            leftMargin: margin;
            bottomMargin: margin;
            rightMargin: margin;
        }
        
        spacing: 10
        
        ListView {
            id: librariesListView
            anchors.left: parent.left
            width: parent.width
            //height: parent.height
            implicitHeight: contentItem.childrenRect.height
            interactive: false
            
            model: ListModel {
                Component.onCompleted: {
                    append({
                        libName: 'expr-eval',
                        license: 'MIT',
                        licenseLink: 'https://raw.githubusercontent.com/silentmatt/expr-eval/master/LICENSE.txt',
                        linkName: qsTr('Source code'),
                        link: 'https://github.com/silentmatt/expr-eval',
                        authors: [{
                            authorLine: qsTr('Original library by Raphael Graf'),
                            email: 'r@undefined.ch',
                            website: 'https://web.archive.org/web/20111023001618/http://www.undefined.ch/mparser/index.html',
                            websiteName: qsTr('Source')
                        }, {
                            authorLine: qsTr('Ported to Javascript by Matthew Crumley'),
                            email: 'email@matthewcrumley.com',
                            website: 'https://silentmatt.com/',
                            websiteName: qsTr('Website')
                        }, {
                            authorLine: qsTr('Ported to QMLJS by Ad5001'),
                            email: 'mail@ad5001.eu',
                            website: 'https://ad5001.eu/',
                            websiteName: qsTr('Website')
                        }]
                    })
                }
            }
            
            header: Label {
                id: librariesUsedHeader
                wrapMode: Text.WordWrap
                font.pixelSize: 25
                text: qsTr("Libraries included")
                height: implicitHeight + 10
            }
            
            delegate: Column {
                id: libClmn
                width: librariesListView.width
                spacing: 10
                
                Item {
                    height: libraryHeader.height
                    width: parent.width
                    
                    Label {
                        id: libraryHeader
                        anchors.left: parent.left
                        wrapMode: Text.WordWrap
                        font.pixelSize: 18
                        text: libName
                    }
                    
                    Row {
                        anchors.right: parent.right
                        height: parent.height
                        spacing: 10
                        
                        Button {
                            height: parent.height
                            text: license
                            icon.name: 'license'
                            onClicked: Qt.openUrlExternally(licenseLink)
                        }
                        
                        Button {
                            height: parent.height
                            text: linkName
                            icon.name: 'web-browser'
                            onClicked: Qt.openUrlExternally(link)
                        }
                    }
                }
                
                ListView {
                    id: libAuthors
                    anchors.left: parent.left
                    anchors.leftMargin: 10
                    model: authors
                    width: parent.width - 10
                    implicitHeight: contentItem.childrenRect.height
                    interactive: false
                    
                    delegate: Item {
                        id: libAuthor
                        width: librariesListView.width - 10
                        height: 50
                        
                        Label {
                            id: libAuthorName
                            anchors.left: parent.left
                            anchors.right: buttons.left
                            anchors.verticalCenter: parent.verticalCenter
                            wrapMode: Text.WordWrap
                            font.pixelSize: 14
                            text: authorLine
                        }
                        
                        Row {
                            id: buttons
                            anchors.right: parent.right
                            height: parent.height
                            spacing: 10
                    
                            Button {
                                anchors.verticalCenter: parent.verticalCenter
                                text: websiteName
                                icon.name: 'web-browser'
                                height: parent.height - 10
                                onClicked: Qt.openUrlExternally(website)
                            }
                    
                            Button {
                                anchors.verticalCenter: parent.verticalCenter
                                text: qsTr('Email')
                                icon.name: 'email'
                                height: parent.height - 10
                                onClicked: Qt.openUrlExternally('mailto:' + email)
                            }
                        }
                    }
                }
                
                Rectangle {
                    id: libSeparator
                    opacity: 0.3
                    color: sysPalette.windowText
                    width: parent.width
                    height: 1
                }
            }
        }
        
        ListView {
            id: translationsListView
            anchors.left: parent.left
            width: parent.width
            implicitHeight: contentItem.childrenRect.height
            interactive: false
            spacing: 3

            
            model: ListModel {
                Component.onCompleted: {
                    append({
                        tranName: '🇬🇧 ' + qsTr('English'),
                        link: 'https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/en/',
                        authors: [{
                            authorLine: 'Ad5001',
                            email: 'mail@ad5001.eu',
                            website: 'https://ad5001.eu',
                            websiteName: qsTr('Website')
                        }]
                    })
                    append({
                        tranName: '🇫🇷 ' + qsTr('French'),
                        link: 'https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/fr/',
                        authors: [{
                            authorLine: 'Ad5001',
                            website: 'https://ad5001.eu',
                            websiteName: qsTr('Website')
                        }]
                    })
                    append({
                        tranName: '🇩🇪 ' + qsTr('German'),
                        link: 'https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/de/',
                        authors: [{
                            authorLine: 'Ad5001',
                            website: 'https://ad5001.eu',
                            websiteName: qsTr('Website')
                        }]
                    })
                    append({
                        tranName: '🇭🇺 ' + qsTr('Hungarian'),
                        link: 'https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/hu/',
                        authors: [{
                            authorLine: 'Óvári',
                            website: 'https://github.com/ovari',
                            websiteName: qsTr('Github')
                        }]
                    })
                    append({
                        tranName: '🇳🇴 ' + qsTr('Norwegian'),
                        link: 'https://hosted.weblate.org/projects/logarithmplotter/logarithmplotter/no/',
                        authors: [{
                            authorLine: 'Allan Nordhøy',
                            website: 'https://github.com/comradekingu',
                            websiteName: qsTr('Github')
                        }]
                    })
                }
            }
            
            header: Label {
                id: translationsHeader
                wrapMode: Text.WordWrap
                font.pixelSize: 25
                text: qsTr("Translations included")
                height: implicitHeight + 10
            }
            
            delegate: Column {
                id: tranClmn
                width: translationsListView.width
                
                Item {
                    width: parent.width
                    height: translationHeader.height + 10
                    
                    Label {
                        id: translationHeader
                        anchors.left: parent.left
                        anchors.verticalCenter: parent.verticalCenter
                        wrapMode: Text.WordWrap
                        font.pixelSize: 18
                        text: tranName
                    }
                    
                    Row {
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        height: 30
                        spacing: 10
                        
                        Button {
                            height: parent.height
                            text: qsTr('Improve')
                            icon.name: 'web-browser'
                            onClicked: Qt.openUrlExternally(link)
                        }
                    }
                }
                
                ListView {
                    id: tranAuthors
                    anchors.left: parent.left
                    anchors.leftMargin: 10
                    model: authors
                    width: parent.width - 10
                    implicitHeight: contentItem.childrenRect.height
                    interactive: false
                    
                    delegate: Item {
                        id: tranAuthor
                        width: tranAuthors.width
                        height: 40
                        
                        Label {
                            id: tranAuthorName
                            anchors.left: parent.left
                            anchors.right: buttons.left
                            anchors.verticalCenter: parent.verticalCenter
                            wrapMode: Text.WordWrap
                            font.pixelSize: 14
                            text: authorLine
                        }
                        
                        Row {
                            id: buttons
                            anchors.right: parent.right
                            anchors.verticalCenter: parent.verticalCenter
                            height: 30
                            spacing: 10
                    
                            Button {
                                text: websiteName
                                icon.name: 'web-browser'
                                height: parent.height
                                onClicked: Qt.openUrlExternally(website)
                            }
                        }
                    }
                }
            }
        }
    }
}
