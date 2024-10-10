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

import { Module } from "./common.mjs"
import Objects from "./objects.mjs"
import History from "./history.mjs"
import Canvas from "./canvas.mjs"
import { DialogInterface, RootInterface, SettingsInterface } from "./interface.mjs"


class IOAPI extends Module {
    /** @type {RootInterface} */
    #rootElement
    /** @type {SettingsInterface} */
    #settings
    /** @type {{show: function(string)}} */
    #alert

    constructor() {
        super("IO", {
            alert: DialogInterface,
            root: RootInterface,
            settings: SettingsInterface
        })
        /**
         * Path of the currently opened file. Empty if no file is opened.
         * @type {string}
         */
        this.saveFileName = ""
    }

    /**
     * Initializes module with QML elements.
     * @param {RootInterface} root
     * @param {SettingsInterface} settings
     * @param {{show: function(string)}} alert
     */
    initialize({ root, settings, alert }) {
        super.initialize({ root, settings, alert })
        this.#rootElement = root
        this.#settings = settings
        this.#alert = alert
    }

    /**
     * Saves the diagram to a certain \c filename.
     * @param {string} filename
     */
    saveDiagram(filename) {
        if(!this.initialized) throw new Error("Attempting saveDiagram before initialize!")
        // Add extension if necessary
        if(["lpf"].indexOf(filename.split(".")[filename.split(".").length - 1]) === -1)
            filename += ".lpf"
        this.saveFilename = filename
        let objs = {}
        for(let objType in Objects.currentObjects) {
            objs[objType] = []
            for(let obj of Objects.currentObjects[objType]) {
                objs[objType].push(obj.export())
            }
        }
        let settings = {
            "xzoom": this.#settings.xzoom,
            "yzoom": this.#settings.yzoom,
            "xmin": this.#settings.xmin,
            "ymax": this.#settings.ymax,
            "xaxisstep": this.#settings.xaxisstep,
            "yaxisstep": this.#settings.yaxisstep,
            "xaxislabel": this.#settings.xlabel,
            "yaxislabel": this.#settings.ylabel,
            "logscalex": this.#settings.logscalex,
            "linewidth": this.#settings.linewidth,
            "showxgrad": this.#settings.showxgrad,
            "showygrad": this.#settings.showygrad,
            "textsize": this.#settings.textsize,
            "history": History.serialize(),
            "width": this.#rootElement.width,
            "height": this.#rootElement.height,
            "objects": objs,
            "type": "logplotv1"
        }
        Helper.write(filename, JSON.stringify(settings))
        this.#alert.show(qsTranslate("io", "Saved plot to '%1'.").arg(filename.split("/").pop()))
        History.history.saved = true
    }

    /**
     * Loads the diagram from a certain \c filename.
     * @param {string} filename
     */
    async loadDiagram(filename) {
        if(!this.initialized) throw new Error("Attempting loadDiagram before initialize!")
        if(!History.initialized) throw new Error("Attempting loadDiagram before history is initialized!")
        let basename = filename.split("/").pop()
        this.#alert.show(qsTranslate("io", "Loading file '%1'.").arg(basename))
        let data = JSON.parse(Helper.load(filename))
        let error = ""
        if(data.hasOwnProperty("type") && data["type"] === "logplotv1") {
            History.clear()
            // Importing settings
            this.#settings.saveFilename = filename
            this.#settings.xzoom = parseFloat(data["xzoom"]) || 100
            this.#settings.yzoom = parseFloat(data["yzoom"]) || 10
            this.#settings.xmin = parseFloat(data["xmin"]) || 5 / 10
            this.#settings.ymax = parseFloat(data["ymax"]) || 24
            this.#settings.xaxisstep = data["xaxisstep"] || "4"
            this.#settings.yaxisstep = data["yaxisstep"] || "4"
            this.#settings.xlabel = data["xaxislabel"] || ""
            this.#settings.ylabel = data["yaxislabel"] || ""
            this.#settings.logscalex = data["logscalex"] === true
            if("showxgrad" in data)
                this.#settings.showxgrad = data["showxgrad"]
            if("showygrad" in data)
                this.#settings.textsize = data["showygrad"]
            if("linewidth" in data)
                this.#settings.linewidth = data["linewidth"]
            if("textsize" in data)
                this.#settings.textsize = data["textsize"]
            this.#rootElement.height = parseFloat(data["height"]) || 500
            this.#rootElement.width = parseFloat(data["width"]) || 1000

            // Importing objects
            Objects.currentObjects = {}
            for(let key of Object.keys(Objects.currentObjectsByName)) {
                delete Objects.currentObjectsByName[key]
                // Required to keep the same reference for the copy of the object used in expression variable detection.
                // Another way would be to change the reference as well, but I feel like the code would be less clean.
            }
            for(let objType in data["objects"]) {
                if(Object.keys(Objects.types).includes(objType)) {
                    Objects.currentObjects[objType] = []
                    for(let objData of data["objects"][objType]) {
                        /** @type {DrawableObject} */
                        let obj = Objects.types[objType].import(...objData)
                        Objects.currentObjects[objType].push(obj)
                        Objects.currentObjectsByName[obj.name] = obj
                    }
                } else {
                    error += qsTranslate("io", "Unknown object type: %1.").arg(objType) + "\n"
                }
            }

            // Updating object dependencies.
            for(let objName in Objects.currentObjectsByName)
                Objects.currentObjectsByName[objName].update()

            // Importing history
            if("history" in data)
                History.unserialize(...data["history"])

            // Refreshing sidebar
            this.#rootElement.updateObjectsLists()
        } else {
            error = qsTranslate("io", "Invalid file provided.")
        }
        if(error !== "") {
            console.log(error)
            this.#alert.show(qsTranslate("io", "Could not load file: ") + error)
            // TODO: Error handling
            return
        }
        Canvas.redraw()
        this.#alert.show(qsTranslate("io", "Loaded file '%1'.").arg(basename))
        History.history.saved = true
    }

}

/** @type {IOAPI} */
Modules.IO = Modules.IO || new IOAPI()

export default Modules.IO
