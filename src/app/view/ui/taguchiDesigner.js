import dialogPolyfill from "dialog-polyfill";
import Handsontable from "handsontable";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default class TaguchiDesigner {
    constructor(viewmanager) {
        this.__viewManagerDelegate = viewmanager;

        this.__numberOfParameters = 0;
        this.__numberOfLevels = 0;
        this.__orthogonalArray = null;
        this.__parameterHeaders = [];

        // Setup the Dialog
        this.__dialog = document.getElementById("doe_dialog");
        this.__doeFileInput = document.getElementById("doe_input");

        if (!this.__dialog.showModal) {
            dialogPolyfill.registerDialog(this.__dialog);
        }

        const ref = this;
        this.__dialog.querySelector(".close").addEventListener("click", function() {
            ref.__dialog.close();
        });

        // Setup the tableview

        this.__tablecontainer = document.getElementById("taguchi-table");

        if (this.__tablecontainer === null || this.__tablecontainer === undefined) {
            throw new Error("Cannot find table element");
        }

        this.__generateDesignsButton = document.getElementById("download-doe-button");

        this.__generateDesignsButton.addEventListener("click", function(el, ev) {
            ref.generateAndDownloadTaguchiDesigns();
        });

        this.__handsonTableObject = null;

        const reader = new FileReader();
        reader.onload = function(e) {
            // console.log(reader.result);
            ref.loadCSVData(reader.result);
        };

        if (this.__doeFileInput) {
            this.__doeFileInput.addEventListener(
                "change",
                function() {
                    const file = this.files[0];
                    reader.readAsText(file);
                },
                false
            );
        }
    }

    openDialog(componentName) {
        const component = this.__viewManagerDelegate.currentDevice.getComponentByName(componentName);
        this.__selectedComponent = component;

        this.__dialog.showModal();
    }

    loadCSVData(text) {
        // Initialize the table based on the data in the CSV
        this.parseCSV(text);

        // Initialize the params table UI so that the user can input the DOE parameters
        this.__initializeTable();
    }

    parseCSV(text) {
        let lines = text.split("\n");
        const headers = lines[0].split(",");
        this.__parameterHeaders = headers;
        this.__numberOfParameters = headers.length;
        // console.log(headers);
        let max = 0;
        // Find the highest value for the parameter values
        for (const i in lines) {
            const line = lines[i];
            const items = line.split(",");
            for (const ii in items) {
                const val = parseInt(items[ii]);
                if (val > max) {
                    max = val;
                }
            }
        }

        this.__numberOfLevels = max;
        // console.log("Max number of values = ", max);

        // Number of parameters
        // console.log("# parameters", headers.length);

        this.__orthogonalArray = [];
        lines = lines.splice(1, lines.length - 1);
        for (const i in lines) {
            const line = lines[i];
            this.__orthogonalArray.push(line.split(","));
        }
    }

    __initializeTable() {
        const heritables = this.__selectedComponent.getParams().heritable;
        const paramoptions = [];

        for (const key in heritables) {
            paramoptions.push(key);
        }
        const blank_column_format = { type: "numeric" };

        const data = [];
        let rowdata;

        // fill out blank data
        for (let y = 0; y < this.__numberOfParameters; y++) {
            rowdata = [];
            rowdata.push(paramoptions[y]);
            for (let x = 0; x < this.__numberOfLevels; x++) {
                rowdata.push(0);
            }
            data.push(rowdata);
        }

        const selectionboxcell = {
            editor: "select",
            selectOptions: paramoptions
        };

        const column_data = [];
        column_data.push(selectionboxcell);

        const col_header = ["Parameter"];

        for (let i = 0; i < this.__numberOfLevels; i++) {
            column_data.push(blank_column_format);
            col_header.push(i + 1);
        }

        this.__handsonTableObject = new Handsontable(this.__tablecontainer, {
            data: data,
            colHeaders: col_header,
            rowHeaders: this.__parameterHeaders,
            columns: column_data,
            minSpareCols: 0,
            colWidths: 150
        });
    }

    generateAndDownloadTaguchiDesigns() {
        const paramdata = this.__handsonTableObject;
        const jsons = [];
        // Go through each design
        for (const i in this.__orthogonalArray) {
            const iteration = this.__generateOrthogonalDesign(this.__orthogonalArray[i], paramdata);

            jsons.push(iteration);
        }

        // Create a Zip
        const zipper = new JSZip();
        for (let i = 0; i < jsons.length; i++) {
            zipper.file(this.__viewManagerDelegate.currentDevice.getName() + "_" + i + ".json", jsons[i]);
        }

        const content = zipper.generate({
            type: "blob"
        });
        saveAs(content, "Taguchi_DOE.zip");
    }

    __generateOrthogonalDesign(orthogonalArrayElement, paramdata) {
        // Read the orthogonal array for each experiment
        const paramMap = {};
        // console.log("ORthogonal array", orthogonalArrayElement);

        for (let i = 0; i < orthogonalArrayElement.length; i++) {
            const columnindex = parseInt(orthogonalArrayElement[i]);
            // console.log(i, columnindex);
            paramMap[paramdata.getDataAtCell(i, 0)] = paramdata.getDataAtCell(i, columnindex);
        }

        // TODO: Update the component and then download the design
        // console.log(paramMap);
        for (const key in paramMap) {
            this.__selectedComponent.updateParameter(key, paramMap[key]);
        }

        // Serialize each design
        const json = JSON.stringify(this.__viewManagerDelegate.currentDevice.toInterchangeV1());

        return json;
    }
}
