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

.pragma library

var themeTextColor;


class Action {
    // Type of the action done.
    type(){return 'Unknown'}
    
    // Icon associated with the item
    
    // TargetName is the name of the object that's targeted by the event.
    constructor(targetName = "", targetType = "Point") {
        this.targetName = targetName
        this.targetType = targetType
    }
    
    undo() {}
    
    redo() {}
    
    export() {
        return [this.targetName, this.targetType]
    }
    
    // String used in the toolkit
    getReadableString() {
        return 'Unknown action'
    }
    
    // Returns an HTML tag containing the icon of a type
    getIconRichText(type) {
        return `<img source="../icons/objects/${type}.svg" style="color: ${themeTextColor};" width=18 height=18></img>`
    }
    
    // String used in the preview
    getHTMLString() {
        return this.getReadableString()
    }
}
