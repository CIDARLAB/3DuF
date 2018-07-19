import paper from 'paper';
import DXFParser from 'dxf-parser';
import * as HTMLUtils from "../../utils/htmlUtils";

export default class ImportComponent {
    constructor(){
        this.__showDialogButton = document.getElementById("show_import_dialog");
        this.__importComponentButton = document.getElementById("import_component_button");
        this.__dialog = document.getElementById("import_dialog");
        this.dxfData = null;
        this.__canvas = document.getElementById("component_preview_canvas");

        //Setup the canvas and revert back to default canvas
        paper.setup(this.__canvas);
        paper.projects[0].activate();

        this.__paperProject = paper.projects[paper.projects.length - 1];

        let ref = this;

        //Enable dialog show
        this.__showDialogButton.addEventListener('click', function (event) {
            ref.__dialog.showModal();
            ref.__paperProject.activate();
        });

        //Enable close button
        this.__dialog.querySelector('.close').addEventListener('click', function() {
            ref.__dialog.close();

            //Enable default paperproject
            paper.projects[0].activate();
        });


        this.__importComponentButton.addEventListener('click', function (event) {
            ref.importComponent();
            ref.__dialog.close();

            //Enable default paperproject
            paper.projects[0].activate();

        });
        
        this.__setupDragAndDropLoad("#component_preview_canvas")
    }

    importComponent() {
        console.log("Import button clicked");
    }

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

    /**
     *loads the DXF data from the text
     * @param text
     * @private
     */
    __loadDXFData(text) {
        let parser = new DXFParser();
        this.dxfData = parser.parseSync(text);
        console.log("Yay ! loaded the data", this.dxfData);
    }
}