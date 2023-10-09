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

import QtQuick.Controls
import QtQuick 

/*!
    \qmltype InsertCharacter
    \inqmlmodule eu.ad5001.LogarithmPlotter.Setting
    \brief Popup to insert special character.
            
    \sa TextSetting, ExpressionEditor
*/
Popup {
    id: insertPopup
    
    signal selected(string character)
    
    /*!
       \qmlproperty string InsertCharacter::category
       Type of special character to insert.
       Possible values:
       - expression
       - domain
       - name
       - all
    */
    property string category: 'all'
    
    width: 280
    height: Math.ceil(insertGrid.insertChars.length/insertGrid.columns)*(width/insertGrid.columns)+5
    modal: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutsideParent
    
    Grid {
        id: insertGrid
        width: parent.width
        columns: 7
        
        property var insertCharsExpression: [
            "∞","π","¹","²","³","⁴","⁵",
            "⁶","⁷","⁸","⁹","⁰"
        ]
        
        property var insertCharsDomain: [
            "∅","∪","∩","∖","ℝ","ℕ","ℤ",
            "⁺","⁻",...insertCharsExpression
        ]
        
        property var insertCharsName: [
            "α","β","γ","δ","ε","ζ","η",
            "π","θ","κ","λ","μ","ξ","ρ",
            "ς","σ","τ","φ","χ","ψ","ω",
            "Γ","Δ","Θ","Λ","Ξ","Π","Σ",
            "Φ","Ψ","Ω","ₐ","ₑ","ₒ","ₓ",
            "ₕ","ₖ","ₗ","ₘ","ₙ","ₚ","ₛ",
            "ₜ","₁","₂","₃","₄","₅","₆",
            "₇","₈","₉","₀"
        ]
        
        property var insertCharsAll: [
            ...insertCharsName, ...insertCharsDomain
        ]
        
        property var insertChars: {
            return {
                "expression": insertCharsExpression,
                "domain": insertCharsDomain,
                "name": insertCharsName,
                "all": insertCharsAll
            }[insertPopup.category]
        }
        
        Repeater {
            model: parent.insertChars.length
            
            Button {
                id: insertBtn
                width: insertGrid.width/insertGrid.columns
                height: width
                text: insertGrid.insertChars[modelData]
                flat: text == " "
                font.pixelSize: 18
                
                onClicked: {
                    selected(text)
                }
            }
        }
    }
}
