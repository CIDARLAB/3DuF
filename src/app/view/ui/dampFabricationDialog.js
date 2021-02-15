import dialogPolyfill from "dialog-polyfill";
import * as Registry from "../../core/registry";
import axios from "axios";

export default class DAMPFabricationDialog {
    constructor() {
        this.__sendFabricationSubmissionButton = document.getElementById("send_designs_button");
        this.__dialog = document.getElementById("damp_fabricate_dialog");
        this.__showFabDialogButton = document.querySelector("#damp_fabricate");

        let ref = this;
        if (!this.__dialog.showModal) {
            dialogPolyfill.registerDialog(this.__dialog);
        }
        this.__showFabDialogButton.addEventListener("click", function() {
            ref.__dialog.showModal();
        });

        this.__sendFabricationSubmissionButton.onclick = function() {
            // Registry.viewManager.activateTool("InsertTextTool");
            let email = document.getElementById("fabricate_dialog_email_field").value;
            let address = document.getElementById("fabricate_dialog_address_field").value;
            console.log(Registry.currentDevice.toInterchangeV1());
            let endpoint = "http://fabrication-service.damplab.org/api/v1/submit";
            axios
                .post(endpoint, {
                    email: email,
                    design: JSON.stringify(Registry.currentDevice.toInterchangeV1()),
                    address: address
                })
                .then(res => {
                    console.log(res);
                    alert("Add the submission code here");
                })
                .catch(err => {
                    console.error(err);
                    alert("Error submiting the design for fabrication:" + err.message);
                });
        };

        this.__dialog.querySelector(".close").addEventListener("click", function() {
            ref.__dialog.close();
        });
    }
}
