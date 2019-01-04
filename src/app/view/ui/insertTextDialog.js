const Registry = require('../../core/registry');

export default class InsertTextDialog{
    constructor(){

        this.__acceptTextButton = document.getElementById("accept_text_button");
        this.__dialog = document.getElementById('insert_text_dialog');
        this.__showTextLabelButton = document.querySelector('#insert_text_button');

        if (! this.__dialog.showModal) {
            dialogPolyfill.registerDialog(this.__dialog);
        }
        this.__showTextLabelButton.addEventListener('click', function() {
            this.__dialog.showModal();
        });

        let ref = this;
        this.__acceptTextButton.onclick = function(){
            Registry.viewManager.activateTool("InsertTextTool");
            Registry.text = document.getElementById("inserttext_textinput").value;
            ref.__dialog.close();
        };

        this.__dialog.querySelector('.close').addEventListener('click', function() {
            ref.__dialog.close();
        });

    }
}