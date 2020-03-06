import * as HTMLUtils from "../../utils/htmlUtils";
import * as NumberUtils from "../../utils/numberUtils";

export default class GenerateArrayWindow {
    constructor(generateArrayToolDelegate) {
        //Get the UI references

        this.generateArrayToolDelegate = generateArrayToolDelegate;

        this.__window = document.getElementById("arrayBox");

        //Action Buttons
        this.__generateButton = this.__window.querySelector("#generate-replication");
        this.__cancelButton = this.__window.querySelector("#cancel-replication");

        //Text Inputs
        this.__xSpacingInput = this.__window.querySelector("#textinput_xspacing");
        this.__ySpacingInput = this.__window.querySelector("#textinput_yspacing");
        this.__xDimInput = this.__window.querySelector("#replicate-x");
        this.__yDimInput = this.__window.querySelector("#replicate-y");

        //Input Buttons
        this.__xSpacingUpButton = this.__window.querySelector("#button-xspacing-up");
        this.__xSpacingDownButton = this.__window.querySelector("#button-xspacing-down");
        this.__ySpacingUpButton = this.__window.querySelector("#button-yspacing-up");
        this.__ySpacingDownButton = this.__window.querySelector("#button-yspacing-down");

        this.setupInitialValues();

        let ref = this;

        //Text input changes
        this.__xSpacingInput.addEventListener("input", function(event) {
            ref.processNewArrayData();
        });

        this.__ySpacingInput.addEventListener("input", function(event) {
            ref.processNewArrayData();
        });

        //Position buttons
        //Decrease x
        this.__xSpacingDownButton.addEventListener("click", function(event) {
            let value = ref.__xSpacingInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value -= 0.1;
                ref.__xSpacingInput.value = value;
                ref.processNewArrayData();
            }
        });

        //increase x
        this.__xSpacingUpButton.addEventListener("click", function(event) {
            let value = ref.__xSpacingInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value += 0.1;
                ref.__xSpacingInput.value = value;
                ref.processNewArrayData();
            }
        });

        //increase y
        this.__ySpacingUpButton.addEventListener("click", function(event) {
            let value = ref.__ySpacingInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value += 0.1;
                ref.__ySpacingInput.value = value;
                ref.processNewArrayData();
            }
        });

        //decrease y
        this.__ySpacingDownButton.addEventListener("click", function(event) {
            let value = ref.__ySpacingInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value -= 0.1;
                ref.__ySpacingInput.value = value;
                ref.processNewArrayData();
            }
        });

        //Action button clicks
        this.__generateButton.addEventListener("click", function(event) {
            console.log("Save button was pressed");
            ref.processNewArrayData();
            ref.hideWindow();
            //Tell the generateArrayTool to set the position as the x,y pos
            ref.generateArrayToolDelegate.generateArray(ref.__xdim, ref.__ydim, ref.__xspacing, ref.__yspacing);
            ref.generateArrayToolDelegate.unactivate();
        });

        this.__cancelButton.addEventListener("click", function(event) {
            console.log("Cancel Button was Pressed");
            ref.hideWindow();
            ref.generateArrayToolDelegate.unactivate();
        });
    }

    /**
     * Sets up the initial values of the input fields
     */
    setupInitialValues() {
        this.__xSpacingInput.value = "1.0";
        this.__ySpacingInput.value = "1.0";

        this.__xDimInput.value = 5;
        this.__yDimInput.value = 1;
    }

    showWindow() {
        HTMLUtils.removeClass(this.__window, "hidden-block");
    }

    hideWindow() {
        HTMLUtils.addClass(this.__window, "hidden-block");
    }

    processNewArrayData() {
        let xspacing = Number.parseFloat(this.__xSpacingInput.value);
        let yspacing = Number.parseFloat(this.__ySpacingInput.value);

        //Check if the values are valid positions
        if (!NumberUtils.isFloatOrInt(xspacing) || !NumberUtils.isFloatOrInt(yspacing)) {
            console.error("Invalid spacing values");
            return;
        }
        //Convert values from mm in to microns
        this.__xspacing = xspacing * 1000;
        this.__yspacing = yspacing * 1000;

        this.__xdim = Number.parseInt(this.__xDimInput.value);
        this.__ydim = Number.parseInt(this.__yDimInput.value);
    }
}
