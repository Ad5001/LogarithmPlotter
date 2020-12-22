import QtQuick 2.7
import QtGraphicalEffects 1.0

Item {
    property color color: "#000000"
    property alias source: img.source
    
    Image {
        id: img
        height: parent.height
        width: parent.width
        smooth: true
        visible: false
    }
    ColorOverlay {
        anchors.fill: img
        source: img
        color: parent.color
    }
}
