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


import * as Expr from "./expression.mjs"
import * as Seq from "./sequence.mjs"
import * as Dom from "./domain.mjs"


export const Expression = Expr.Expression
export const executeExpression = Expr.executeExpression
export const Sequence = Seq.Sequence

// Domains
export const Domain = Dom.Domain
export const EmptySet = Dom.EmptySet
export const Range = Dom.Range
export const SpecialDomain = Dom.SpecialDomain
export const DomainSet = Dom.DomainSet
export const UnionDomain = Dom.UnionDomain
export const IntersectionDomain = Dom.IntersectionDomain
export const MinusDomain = Dom.MinusDomain

export const parseDomain = Dom.parseDomain
export const parseDomainSimple = Dom.parseDomainSimple
