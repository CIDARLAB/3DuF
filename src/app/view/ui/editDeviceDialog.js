import * as Registry from "../../core/registry";

export default class EditDeviceDialog {
    constructor(viewManagerDelegate) {
        this.viewManagerDelegate = viewManagerDelegate;
        this.__window = document.getElementById("edit_device_dialog");

        this.saveDeviceSettingsButton = document.getElementById("accept_resize_button");

        this.__yspanTextInput = document.getElementById("yspan_textinput");
        this.__xspanTextInput = document.getElementById("xspan_textinput");

        this.__deviceNameTextInput = document.getElementById("devicename_textinput");

        let ref = this;

        this.saveDeviceSettingsButton.onclick = function() {
            //Save the name
            let devicename = ref.__deviceNameTextInput.value;
            if (devicename != "" || devicename != null) {
                Registry.currentDevice.setName(devicename);
            }

            //Do the resizing
            let xspan = ref.__xspanTextInput.value;
            let yspan = ref.__yspanTextInput.value;
            console.log("Resizing the device to: " + xspan + ", " + yspan);

            if (xspan != "" && yspan != "") {
                //Convert the dimensions to microns from mm
                Registry.currentDevice.setXSpan(xspan * 1000);
                Registry.currentDevice.setYSpan(yspan * 1000);

                //Delete the existing border
                ref.viewManagerDelegate.deleteBorder();

                //Update the device borders
                ref.viewManagerDelegate.generateBorder();
                //Close the dialog
                ref.__window.close();

                //Refresh the view
                ref.viewManagerDelegate.updateGrid();
                Registry.currentDevice.updateView();

                ref.viewManagerDelegate.view.initializeView();
                ref.viewManagerDelegate.view.refresh();
                // Registry.viewManager.view.updateGrid();
                ref.viewManagerDelegate.view.updateAlignmentMarks();
            }
        };

        this.showModalButton = document.querySelector("#resize_button");

        this.showModalButton.addEventListener("click", function() {
            ref.__window.showModal();
            ref.setupInitialValues();
        });

        this.__window.querySelector(".close").addEventListener("click", function() {
            ref.__window.close();
        });
    }

    setupInitialValues() {
        console.log("TODO: load the device data");
        console.log(Registry.currentDevice.getName());
        this.__deviceNameTextInput.value = Registry.currentDevice.getName();
        this.__xspanTextInput.value = Registry.currentDevice.getXSpan() / 1000;
        this.__yspanTextInput.value = Registry.currentDevice.getYSpan() / 1000;
    }
}
