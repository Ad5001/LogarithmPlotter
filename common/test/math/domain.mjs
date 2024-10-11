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

import { describe, it } from "mocha"
import { expect } from "chai"

// import { Domain, parseDomainSimple } from "../../src/math/domain.mjs"
//
// describe("math.domain", function() {
//     describe("#parseDomainSimple", function() {
//         it("returns predefined domains", function() {
//             const predefinedToCheck = [
//                 // Real domains
//                 { domain: Domain.R, shortcuts: ["R", "ℝ"] },
//                 // Zero exclusive real domains
//                 { domain: Domain.RE, shortcuts: ["RE", "R*", "ℝ*"] },
//                 // Real positive domains
//                 { domain: Domain.RP, shortcuts: ["RP", "R+", "ℝ⁺", "ℝ+"] },
//                 // Zero-exclusive real positive domains
//                 { domain: Domain.RPE, shortcuts: ["RPE", "REP", "R+*", "R*+", "ℝ*⁺", "ℝ⁺*", "ℝ*+", "ℝ+*"] },
//                 // Real negative domain
//                 { domain: Domain.RM, shortcuts: ["RM", "R-", "ℝ⁻", "ℝ-"] },
//                 // Zero-exclusive real negative domains
//                 { domain: Domain.RME, shortcuts: ["RME", "REM", "R-*", "R*-", "ℝ⁻*", "ℝ*⁻", "ℝ-*", "ℝ*-"] },
//                 // Natural integers domain
//                 { domain: Domain.N, shortcuts: ["ℕ", "N", "ZP", "Z+", "ℤ⁺", "ℤ+"] },
//                 // Zero-exclusive natural integers domain
//                 { domain: Domain.NE, shortcuts: ["NE", "NP", "N*", "N+", "ℕ*", "ℕ⁺", "ℕ+", "ZPE", "ZEP", "Z+*", "Z*+", "ℤ⁺*", "ℤ*⁺", "ℤ+*", "ℤ*+"] },
//                 // Logarithmic natural domains
//                 { domain: Domain.NLog, shortcuts: ["NLOG", "ℕˡᵒᵍ", "ℕLOG"] },
//                 // All integers domains
//                 { domain: Domain.Z, shortcuts: ["Z", "ℤ"] },
//                 // Zero-exclusive all integers domain
//                 { domain: Domain.ZE, shortcuts: ["ZE", "Z*", "ℤ*"] },
//                 // Negative integers domain
//                 { domain: Domain.ZM, shortcuts: ["ZM", "Z-", "ℤ⁻", "ℤ-"] },
//                 // Zero-exclusive negative integers domain
//                 { domain: Domain.ZME, shortcuts: ["ZME", "ZEM", "Z-*", "Z*-", "ℤ⁻*", "ℤ*⁻", "ℤ-*", "ℤ*-"] },
//             ]
//
//             // Real domains
//             for(const { domain, shortcuts } of predefinedToCheck)
//                 for(const shortcut of shortcuts)
//                     expect(parseDomainSimple(shortcut)).to.be.equal(domain)
//         })
//
//         it("")
//     })
// })
