import dialogPolyfill from "dialog-polyfill";
export default class HelpDialog {
    constructor() {
        const helpdialog = document.querySelector("#help_dialog");
        const showhelpModalButton = document.querySelector("#infobutton");

        if (!helpdialog.showModal) {
            dialogPolyfill.registerDialog(helpdialog);
        }

        showhelpModalButton.addEventListener("click", function () {
            helpdialog.showModal();
        });

        helpdialog.querySelector(".close").addEventListener("click", function () {
            helpdialog.close();
        });
    }
}
