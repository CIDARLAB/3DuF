import * as HTMLUtils from "../../utils/htmlUtils";
import * as NumberUtils from "../../utils/numberUtils";

export default class MoveToolBar {
    constructor(moveToolDelegate) {
        //Get the UI references

        this.moveToolDelegate = moveToolDelegate;

        this.__window = document.getElementById("moveBox");

        //Action Buttons
        this.__saveButton = this.__window.querySelector("#save-position");
        this.__cancelButton = this.__window.querySelector("#cancel-edit-position");

        //Text Inputs
        this.__xPosInput = this.__window.querySelector("#textinput_xpos");
        this.__yPosInput = this.__window.querySelector("#textinput_ypos");

        //Input Buttons
        this.__xPosUpButton = this.__window.querySelector("#button-xpos-up");
        this.__xPosDownButton = this.__window.querySelector("#button-xpos-down");
        this.__yPosUpButton = this.__window.querySelector("#button-ypos-up");
        this.__yPosDownButton = this.__window.querySelector("#button-ypos-down");

        let ref = this;

        //Text input changes
        this.__xPosInput.addEventListener("input", function(event) {
            ref.processNewPosition();
        });

        this.__yPosInput.addEventListener("input", function(event) {
            ref.processNewPosition();
        });

        //Position buttons
        //Decrease x
        this.__xPosDownButton.addEventListener("click", function(event) {
            let value = ref.__xPosInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value -= 0.1;
                ref.__xPosInput.value = value;
                ref.processNewPosition();
            }
        });

        //increase x
        this.__xPosUpButton.addEventListener("click", function(event) {
            let value = ref.__xPosInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value += 0.1;
                ref.__xPosInput.value = value;
                ref.processNewPosition();
            }
        });

        //increase y
        this.__yPosUpButton.addEventListener("click", function(event) {
            let value = ref.__yPosInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value += 0.1;
                ref.__yPosInput.value = value;
                ref.processNewPosition();
            }
        });

        //decrease y
        this.__yPosDownButton.addEventListener("click", function(event) {
            let value = ref.__yPosInput.value;
            value = Number.parseFloat(value);
            if (NumberUtils.isFloatOrInt(value)) {
                value -= 0.1;
                ref.__yPosInput.value = value;
                ref.processNewPosition();
            }
        });

        //Action button clicks
        this.__saveButton.addEventListener("click", function(event) {
            console.log("Save button was pressed");
            ref.hideWindow();
            ref.moveToolDelegate.unactivate();
        });

        this.__cancelButton.addEventListener("click", function(event) {
            console.log("Cancel Button was Pressed");
            ref.moveToolDelegate.revertToOriginalPosition();
            ref.hideWindow();
            ref.moveToolDelegate.unactivate();
        });
    }

    showWindow() {
        HTMLUtils.removeClass(this.__window, "hidden-block");
    }

    hideWindow() {
        HTMLUtils.addClass(this.__window, "hidden-block");
    }

    updateUIPos(pos) {
        this.__xPosInput.value = pos[0] / 1000;
        this.__yPosInput.value = pos[1] / 1000;
    }

    processNewPosition() {
        // console.log("input data", xpos, ypos);

        let xpos = Number.parseFloat(this.__xPosInput.value);
        let ypos = Number.parseFloat(this.__yPosInput.value);
        //Check if the values are valid positions
        if (!NumberUtils.isFloatOrInt(xpos) || !NumberUtils.isFloatOrInt(ypos)) {
            console.log("test");
            return;
        }
        //Convert values from mm in to microns
        xpos *= 1000;
        ypos *= 1000;

        //Tell the moveTool to set the position as the x,y pos
        this.moveToolDelegate.processUIPosition(xpos, ypos);
    }
}
