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

import {BoolSetting, ExpressionSetting, NumberSetting, StringSetting} from "./common.mjs"


const XZOOM = new NumberSetting(
    qsTranslate("Settings", "X Zoom"),
    "default_graph.xzoom",
    "xzoom",
    0.1
)

const YZOOM = new NumberSetting(
    qsTranslate("Settings", "Y Zoom"),
    "default_graph.xzoom",
    "yzoom",
    0.1
)

const XMIN = new NumberSetting(
    qsTranslate("Settings", "Min X"),
    "default_graph.xmin",
    "xmin",
    () => Helper.getSettingBool("default_graph.logscalex") ? 1e-100 : -Infinity
)

const YMAX = new NumberSetting(
    qsTranslate("Settings", "Max Y"),
    "default_graph.ymax",
    "ymax"
)

const XAXISSTEP = new ExpressionSetting(
    qsTranslate("Settings", "X Axis Step"),
    "default_graph.xaxisstep",
    "xaxisstep",
)

const YAXISSTEP = new ExpressionSetting(
    qsTranslate("Settings", "Y Axis Step"),
    "default_graph.yaxisstep",
    "yaxisstep",
)

const LINE_WIDTH = new NumberSetting(
    qsTranslate("Settings", "Line width"),
    "default_graph.linewidth",
    "linewidth",
    1
)

const TEXT_SIZE = new NumberSetting(
    qsTranslate("Settings", "Text size (px)"),
    "default_graph.textsize",
    "textsize"
)

const X_LABEL = new StringSetting(
    qsTranslate("Settings", 'X Label'),
    "default_graph.xlabel",
    "xlabel",
    ["", "x", "ω (rad/s)"]
)

const Y_LABEL = new StringSetting(
    qsTranslate("Settings", 'Y Label'),
    "default_graph.ylabel",
    "xlabel",
    ["", "y", "G (dB)", "φ (°)", "φ (deg)", "φ (rad)"]
)

const LOG_SCALE_X = new BoolSetting(
    qsTranslate("Settings", 'X Log scale'),
    "default_graph.logscalex",
    "logscalex"
)

const SHOW_X_GRAD = new BoolSetting(
    qsTranslate("Settings", 'Show X graduation'),
    "default_graph.showxgrad",
    "showxgrad"
)

const SHOW_Y_GRAD = new BoolSetting(
    qsTranslate("Settings", 'Show Y graduation'),
    "default_graph.showygrad",
    "showygrad"
)

export default [
    XZOOM,
    YZOOM,
    XMIN,
    YMAX,
    XAXISSTEP,
    YAXISSTEP,
    LINE_WIDTH,
    TEXT_SIZE,
    X_LABEL,
    Y_LABEL,
    LOG_SCALE_X,
    SHOW_X_GRAD,
    SHOW_Y_GRAD
]
