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

.import "math/expression.js" as Expr
.import "math/sequence.js" as Seq

.import "math/domain.js" as Dom

var Expression = Expr.Expression
var executeExpression = Expr.executeExpression
var Sequence = Seq.Sequence

// Domains
var Domain = Dom.Domain
var EmptySet = Dom.EmptySet
var Range = Dom.Range
var SpecialDomain = Dom.SpecialDomain
var DomainSet = Dom.DomainSet
var UnionDomain = Dom.UnionDomain
var IntersectionDomain = Dom.IntersectionDomain
var MinusDomain = Dom.MinusDomain

var parseDomain = Dom.parseDomain
var parseDomainSimple = Dom.parseDomainSimple
