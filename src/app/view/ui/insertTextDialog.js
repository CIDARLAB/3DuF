const Registry = require('../../core/registry');

export default class InsertTextDialog{
    constructor(){

        this.__acceptTextButton = document.getElementById("accept_text_button");
        this.__dialog = document.getElementById('insert_text_dialog');

        let ref = this;
        this.__acceptTextButton.onclick = function(){
            Registry.viewManager.activateTool("InsertTextTool");
            Registry.text = document.getElementById("inserttext_textinput").value;
            ref.__dialog.close();
        };
    }
}