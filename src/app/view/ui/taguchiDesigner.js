import Handsontable from "handsontable";

export default class TaguchiDesigner{
    constructor(viewmanager){

        this.__viewManagerDelegate = viewmanager;

        this.__numberOfParameters = 0;
        this.__numberOfLevels = 0;
        this.__orthogonalArray = null;
        this.__parameterHeaders = [];

        //Setup the Dialog
        this.__dialog = document.getElementById("doe_dialog");
        this.__doeFileInput = document.getElementById("doe_input");

        if(! this.__dialog.showModal){
            dialogPolyfill.registerDialog(this.__dialog);
        }

        let ref = this;
        this.__dialog.querySelector('.close').addEventListener('click', function () {
            ref.__dialog.close();
        });

        //Setup the tableview

        this.__tablecontainer = document.getElementById("taguchi-table");

        if(this.__tablecontainer == null || this.__tablecontainer ==undefined){
            throw new Error("Cannot find table element");
        }


        this.__handsonTableObject = null;

        let reader = new FileReader();
        reader.onload = function (e) {
            //console.log(reader.result);
            ref.loadCSVData(reader.result);
        };

        if(this.__doeFileInput){
            this.__doeFileInput.addEventListener('change', function(){
                let file = this.files[0];
                reader.readAsText(file);
            }, false);
        }

    }

    openDialog(componentName){
        let component = this.__viewManagerDelegate.currentDevice.getComponentByName(componentName);
        this.__selectedComponent = component;

        this.__dialog.showModal();
    }

    loadCSVData(text) {

        this.parseCSV(text);

        this.__initializeTable()


        //TODO: Initialize the table based on the data in the CSV
    }

    parseCSV(text) {
        // console.log(text);

        let lines = text.split("\n");

        console.log(lines);

        let headers = lines[0].split(",");
        this.__parameterHeaders = headers;
        this.__numberOfParameters = headers.length;
        console.log(headers);
        let max = 0;
        //Find the highest value for the parameter values
        for(let i in lines){
            let line = lines[i];
            let items = line.split(",");
            for(let ii in items){
                let val = parseInt(items[ii]);
                if(val > max){
                    max = val;
                }
            }
        }

        this.__numberOfLevels = max;
        console.log("Max number of values = ", max);

        //Number of parameters
        console.log("# parameters", headers.length);

        this.__orthogonalArray = lines.splice(1,lines.length-1);

    }

    __initializeTable() {
        let heritables = this.__selectedComponent.getParams().heritable;
        let paramoptions = [];
        for(let key in heritables){
            paramoptions.push(key);
        }
        let blank_column_format = {type:'numeric'};

        let data = [];
        let rowdata;

        //fill out blank data
        for(let y=0; y<this.__numberOfParameters; y++){
            rowdata = [];
            rowdata.push(paramoptions[y]);
            for(let x=0; x<this.__numberOfLevels; x++){
                rowdata.push(0);
            }
            data.push(rowdata);
        }

        let selectionboxcell =
            {
                editor: 'select',
                selectOptions: paramoptions
            };

        let column_data = [];
        column_data.push(selectionboxcell);

        let col_header = ['Parameter'];

        for(let i=0; i<this.__numberOfLevels; i++){
            let blank = {};
            column_data.push(blank_column_format);
            col_header.push(i+1);
        }



        this.__handsonTableObject = new Handsontable(this.__tablecontainer, {
            data:data,
            // dataSchema: {id: null, name: {first: null, last: null}, address: null},
            // startRows: 10,
            colHeaders: col_header,
            rowHeaders: this.__parameterHeaders,
            columns: column_data,
            minSpareCols: 0,
            colWidths: 150
        });
    }

}