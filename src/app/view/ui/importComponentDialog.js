import paper from 'paper';
import DXFParser from 'dxf-parser';
import * as HTMLUtils from "../../utils/htmlUtils";
import DXFObject from "../../core/dxfObject";
import * as DXFRenderer from "../render2D/dxfSolidObjectRenderer2D";

export default class ImportComponentDialog {
    constructor(customComponentManager){
        this.__customComponentManagerDelegate = customComponentManager;
        this.__showDialogButton = document.getElementById("show_import_dialog");
        this.__importComponentButton = document.getElementById("import_component_button");
        this.__dialog = document.getElementById("import_dialog");
        this.dxfData = null;
        this.__currentRenderSVG = null;
        this.__canvas = document.getElementById("component_preview_canvas");
        this.__nameTextInput = document.getElementById("new_component_name");

        //Setup the canvas and revert back to default canvas
        paper.setup(this.__canvas);
        //TODO: Fix this referencing situation
        paper.projects[0].activate();

        this.__paperProject = paper.projects[paper.projects.length - 1];

        let ref = this;

        //Enable dialog show
        this.__showDialogButton.addEventListener('click', function (event) {
            ref.__dialog.showModal();
            paper.projects[1].activate();
            // let test = new paper.Rectangle(new paper.Point(0,0), 500, 500);
            // test.fillColor = '#000000';
            // paper.project.activeLayer.addChild(test);
            // console.log(paper.project);
        });

        //Enable close button
        this.__dialog.querySelector('.close').addEventListener('click', function() {
            ref.__dialog.close();

            //Clear the canvas
            paper.project.activeLayer.removeChildren();

            //Enable default paperproject
            paper.projects[0].activate();
        });


        this.__importComponentButton.addEventListener('click', function (event) {
            ref.importComponent();
            ref.__dialog.close();

            //Clear the canvas
            paper.project.activeLayer.removeChildren();

            //Enable default paperproject
            paper.projects[0].activate();

        });
        
        this.__setupDragAndDropLoad("#component_preview_canvas");
    }

    /**
     * Calls the custom component manager to import import the dxf into the current user library
     */
    importComponent() {
        console.log("Import button clicked");
        let name = this.__nameTextInput.value;
        this.__customComponentManagerDelegate.importComponentFromDXF(name, this.dxfData, this.__currentRenderSVG);
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

    /**
     *loads the DXF data from the text
     * @param text
     * @private
     */
    __loadDXFData(text) {
        let parser = new DXFParser();
        let dxfdata = parser.parseSync(text);
        let dxfobjects = [];
        for(let i in dxfdata.entities){
            let entity = dxfdata.entities[i];
            dxfobjects.push(new DXFObject(entity));
        }

        this.dxfData = dxfobjects;
        let render = DXFRenderer.renderDXFObjects(this.dxfData);
        this.__currentRenderSVG = render.exportSVG();
        let bounds = render.bounds;
        let zoom = this.__computeOptimalZoom(bounds.width, bounds.height);
        paper.view.zoom = zoom;
        paper.view.center = bounds.center;
    }

    __computeOptimalZoom(xspan, yspan) {
        let borderMargin = 10; // pixels
        let componentWidth = xspan;
        let componentHeight = yspan;
        let canvasWidth = this.__canvas.clientWidth;
        let canvasHeight = this.__canvas.clientHeight;
        let maxWidth;
        let maxHeight;
        if (canvasWidth - borderMargin <= 0) maxWidth = canvasWidth;
        else maxWidth = canvasWidth - borderMargin;
        if (canvasHeight - borderMargin <= 0) maxHeight = canvasHeight;
        else maxHeight = canvasHeight - borderMargin;
        let widthRatio = componentWidth / maxWidth;
        let heightRatio = componentHeight / maxHeight;
        if (widthRatio > heightRatio) {
            return 1 / widthRatio;
        }
        else {
            return 1 / heightRatio;
        }
    }

}