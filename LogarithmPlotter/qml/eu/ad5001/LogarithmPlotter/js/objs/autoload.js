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

.import "common.js" as C
.import "point.js" as P
.import "text.js" as T
.import "function.js" as F
.import "gainbode.js" as GB
.import "phasebode.js" as PB
.import "sommegainsbode.js" as SGB
.import "sommephasesbode.js" as SPB
.import "xcursor.js" as X
.import "sequence.js" as S
.import "repartition.js" as R

C.registerObject(P.Point)
C.registerObject(T.Text)
C.registerObject(F.Function)
C.registerObject(GB.GainBode)
C.registerObject(PB.PhaseBode)
C.registerObject(SGB.SommeGainsBode)
C.registerObject(SPB.SommePhasesBode)
C.registerObject(X.XCursor)
C.registerObject(S.Sequence)
C.registerObject(R.RepartitionFunction)
