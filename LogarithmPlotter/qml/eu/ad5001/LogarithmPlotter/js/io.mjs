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

import {Module} from "./modules.mjs"

class IOAPI extends Module {

    constructor() {
        super('IO', [
            Modules.Objects,
            Modules.History
        ])
        /**
         * Path of the currently opened file. Empty if no file is opened.
         * @type {string}
         */
        this.saveFileName = ""
    }

    /**
     * Initializes module with QML elements.
     * @param {LogarithmPlotter} rootElement
     * @param {Settings} settings
     * @param {{show: function(string)}} alert
     */
    initialize(rootElement, settings, alert) {
        this.rootElement = rootElement
        this.settings = settings
        this.alert = alert
    }

    /**
     * Saves the diagram to a certain \c filename.
     * @param {string} filename
     */
    saveDiagram(filename) {
        // Add extension if necessary
        if(['lpf'].indexOf(filename.split('.')[filename.split('.').length-1]) === -1)
            filename += '.lpf'
        this.saveFilename = filename
        let objs = {}
        for(let objType in Modules.Objects.currentObjects){
            objs[objType] = []
            for(let obj of Modules.Objects.currentObjects[objType]) {
                objs[objType].push(obj.export())
            }
        }
        let settings = {
            "xzoom":        this.settings.xzoom,
            "yzoom":        this.settings.yzoom,
            "xmin":         this.settings.xmin,
            "ymax":         this.settings.ymax,
            "xaxisstep":    this.settings.xaxisstep,
            "yaxisstep":    this.settings.yaxisstep,
            "xaxislabel":   this.settings.xlabel,
            "yaxislabel":   this.settings.ylabel,
            "logscalex":    this.settings.logscalex,
            "linewidth":    this.settings.linewidth,
            "showxgrad":    this.settings.showxgrad,
            "showygrad":    this.settings.showygrad,
            "textsize":     this.settings.textsize,
            "history":      Modules.History.serialize(),
            "width":        this.rootElement.width,
            "height":       this.rootElement.height,
            "objects":      objs,
            "type":         "logplotv1"
        }
        Helper.write(filename, JSON.stringify(settings))
        this.alert.show(qsTranslate('io', "Saved plot to '%1'.").arg(filename.split("/").pop()))
        Modules.History.history.saved = true
    }

    /**
     * Loads the diagram from a certain \c filename.
     * @param {string} filename
     */
    loadDiagram(filename) {
        let basename = filename.split("/").pop()
        this.alert.show(qsTranslate('io', "Loading file '%1'.").arg(basename))
        let data = JSON.parse(Helper.load(filename))
        let error = "";
        if(Object.keys(data).includes("type") && data["type"] === "logplotv1") {
            Modules.History.clear()
            // Importing settings
            this.settings.saveFilename = filename
            this.settings.xzoom = data["xzoom"]
            this.settings.yzoom = data["yzoom"]
            this.settings.xmin = data["xmin"]
            this.settings.ymax = data["ymax"]
            this.settings.xaxisstep = data["xaxisstep"]
            this.settings.yaxisstep = data["yaxisstep"]
            this.settings.xlabel = data["xaxislabel"]
            this.settings.ylabel = data["yaxislabel"]
            this.settings.logscalex = data["logscalex"]
            if("showxgrad" in data)
                this.settings.showxgrad = data["showxgrad"]
            if("showygrad" in data)
                this.settings.textsize = data["showygrad"]
            if("linewidth" in data)
                this.settings.linewidth = data["linewidth"]
            if("textsize" in data)
                this.settings.textsize = data["textsize"]
            this.rootElement.height = data["height"]
            this.rootElement.width = data["width"]

            // Importing objects
            Modules.Objects.currentObjects = {}
            for(let key of Object.keys(Modules.Objects.currentObjectsByName)) {
                delete Modules.Objects.currentObjectsByName[key];
                // Required to keep the same reference for the copy of the object used in expression variable detection.
                // Another way would be to change the reference as well, but I feel like the code would be less clean.
            }
            for(let objType in data['objects']) {
                if(Object.keys(Modules.Objects.types).indexOf(objType) > -1) {
                    Modules.Objects.currentObjects[objType] = []
                    for(let objData of data['objects'][objType]) {
                        /** @type {DrawableObject} */
                        let obj = Modules.Objects.types[objType].import(...objData)
                        Modules.Objects.currentObjects[objType].push(obj)
                        Modules.Objects.currentObjectsByName[obj.name] = obj
                    }
                } else {
                    error += qsTranslate('io', "Unknown object type: %1.").arg(objType) + "\n";
                }
            }

            // Updating object dependencies.
            for(let objName in Modules.Objects.currentObjectsByName)
                Modules.Objects.currentObjectsByName[objName].update()

            // Importing history
            if("history" in data)
                Modules.History.unserialize(...data["history"])

            // Refreshing sidebar
            this.rootElement.updateObjectsLists()
        } else {
            error = qsTranslate('io', "Invalid file provided.")
        }
        if(error !== "") {
            console.log(error)
            this.alert.show(qsTranslate('io', "Could not save file: ") + error)
            // TODO: Error handling
            return
        }
        Modules.Canvas.redraw()
        this.alert.show(qsTranslate('io', "Loaded file '%1'.").arg(basename))
        Modules.History.history.saved = true
    }

}

/** @type {IOAPI} */
Modules.IO = Modules.IO || new IOAPI()
