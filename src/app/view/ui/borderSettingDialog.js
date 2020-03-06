import * as HTMLUtils from "../../utils/htmlUtils";

import * as Registry from "../../core/registry";
import DxfParser from "dxf-parser";

export default class BorderSettingsDialog {
    get _dxfObject() {
        return this.__dxfObject;
    }

    /**
     * Default constructor for the dialog, contains all the initialization code
     */
    constructor() {
        this.__dxfObject = null;

        //TODO: Register all event handlers, etc.
        this.__editBorderDialogButton = document.getElementById("edit_border_button");

        this.__dialog = document.getElementById("border_settings_dialog");
        this.__deleteBorderButton = document.getElementById("delete_border_button");

        this.__dxffileinput = document.getElementById("dxf_input");

        this.__importBorderButton = document.getElementById("import_border_button");

        let ref = this;

        this.__dialog.querySelector(".close").addEventListener("click", function() {
            ref.__dialog.close();
        });

        let registryref = Registry;
        if (this.__editBorderDialogButton) {
            this.__editBorderDialogButton.addEventListener("click", function(event) {
                ref.__dialog.showModal();
            });
        }

        if (this.__deleteBorderButton) {
            this.__deleteBorderButton.addEventListener("click", function(event) {
                console.log("Generate border clicked");
                // registryref.viewManager.generateBorder();
                registryref.viewManager.deleteBorder();
                //Auto generate the border
                this.generateBorder();
            });
        }

        let reader = new FileReader();
        reader.onload = function(e) {
            //console.log(reader.result);
            ref.loadDXFText(reader.result);
        };

        if (this.__dxffileinput) {
            this.__dxffileinput.addEventListener(
                "change",
                function() {
                    let file = this.files[0];
                    console.log(file.name);
                    console.log(file.size);
                    reader.readAsText(file);
                },
                false
            );
        }

        if (this.__importBorderButton) {
            this.__importBorderButton.addEventListener("click", function(event) {
                console.log("import button clicked");
                registryref.viewManager.deleteBorder();
                registryref.viewManager.importBorder(ref.getDXFObject());
            });
        }

        this.__setupDragAndDropLoad("#border_import_panel");
    }

    /**
     * Loads text for the DXF file
     * @param dxftext
     */
    loadDXFText(dxftext) {
        let parser = new DxfParser();
        try {
            this.__dxfObject = parser.parseSync(dxftext);
            console.log("parsed dxf object", this.__dxfObject);
        } catch (e) {
            console.error(e.stack);
        }
    }

    /**
     * Returns teh DXF data that has been loaded
     * @return {null|*}
     */
    getDXFObject() {
        return this.__dxfObject;
    }

    /**
     * Initializes the drag and drop on the canvas element
     * @param selector
     * @private
     */
    __setupDragAndDropLoad(selector) {
        let ref = this;
        let dnd = new HTMLUtils.DnDFileController(selector, function(files) {
            let f = files[0];

            let reader = new FileReader();
            reader.onloadend = function(e) {
                ref.__loadDXFData(this.result);
            };
            try {
                reader.readAsText(f);
            } catch (err) {
                console.log("unable to load DXF: " + f);
            }
        });
    }
}
