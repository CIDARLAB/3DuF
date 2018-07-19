import paper from 'paper';

export default class ImportComponent {
    constructor(){
        this.__showDialogButton = document.getElementById("show_import_dialog");
        this.__importComponentButton = document.getElementById("import_component_button")
        this.__dialog = document.getElementById("import_dialog");
        this.dxfData = null;
        // this.paperscope = new paper.PaperScope("component_preview_canvas");


        // this.__canvas = document.getElementById("component_preview_canvas");

        let ref = this;

        //Enable dialog show
        this.__showDialogButton.addEventListener('click', function (event) {
            ref.__dialog.showModal();
        });

        //Enable close button
        this.__dialog.querySelector('.close').addEventListener('click', function() {
            ref.__dialog.close();
        });

        this.__importComponentButton.addEventListener('click', function (event) {
            ref.importComponent();
            ref.__dialog.close();
        })


    }

    importComponent() {
        console.log("Import button clicked");
    }

}