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

.pragma library

.import "../objects.js" as Objects
.import "create.js" as Create


class DeleteObject extends Create.CreateNewObject {
    // Action used at the deletion of an object. Basicly the same thing as creating a new object, except Redo & Undo are reversed.
    type(){return 'DeleteObject'}
    
    icon(){return 'delete'}
    
    color(darkVer=false){return darkVer ? 'darkred' : 'salmon'}
    
    undo() {
        super.redo()
    }
    
    redo() {
        super.undo()
    }
    
    getReadableString() {
        return qsTr("%1 %2 deleted.").arg(Objects.types[this.targetType].displayType()).arg(this.targetName)
    }
    
    getHTMLString() {
        return qsTr("%1 %2 deleted.")
                .arg(Objects.types[this.targetType].displayType())
                .arg('<b style="font-size: 15px;">' + this.targetName + "</b>")
    }
}
