const Registry = require('../../core/registry');
const DxfParser = require('dxf-parser');

import EdgeFeature from '../../core/edgeFeature';

export default class BorderSettingsDialog {
    get _dxfObject() {
        return this.__dxfObject;
    }
    constructor(){

        this.__dxfObject = null;

        //TODO: Register all event handlers, etc.
        this.__editBorderDialogButton = document.getElementById("edit_border_button");

        this.__dialog = document.getElementById("border_settings_dialog");
        this.__generateRectBorderButton = document.getElementById("generate_border_button");

        this.__dxffileinput = document.getElementById("dxf_input");

        this.__importBorderButton = document.getElementById("import_border_button");

        let ref = this;

        this.__dialog.querySelector('.close').addEventListener('click', function() {
            ref.__dialog.close();
        });


        let registryref = Registry;
        if(this.__editBorderDialogButton){
            this.__editBorderDialogButton.addEventListener('click', function (event) {
                ref.__dialog.showModal();
            });
        }

        if(this.__generateRectBorderButton){
            this.__generateRectBorderButton.addEventListener('click', function (event) {
                console.log("Generate border clicked");
                registryref.viewManager.generateBorder();
            });
        }

        let reader = new FileReader();
        reader.onload = function (e) {
            //console.log(reader.result);
            ref.loadDXFText(reader.result);
        };

        if(this.__dxffileinput){
            this.__dxffileinput.addEventListener('change', function(){
                let file = this.files[0];
                console.log(file.name);
                console.log(file.size);
                reader.readAsText(file);
            }, false);
        }

        if(this.__importBorderButton){
            this.__importBorderButton.addEventListener('click', function (event) {
                console.log('import button clicked');
                registryref.viewManager.importBorder(ref.getDXFObject());
            });
        }

    }

    loadDXFText(dxftext){
        let parser = new DxfParser();
        try {
            this.__dxfObject = parser.parseSync(dxftext);
            console.log('parsed dxf object', this.__dxfObject);
        }catch (e) {
            console.error(e.stack);
        }

    }

    getDXFObject(){
        return this.__dxfObject;
    }


}