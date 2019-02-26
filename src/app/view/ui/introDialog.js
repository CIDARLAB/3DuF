import * as CookieUtils from '../../utils/cookieUtils';

export default class IntroDialog {
    constructor(){
        this._dialog = document.getElementById("intro_help_dialog");

        if (! this._dialog.showModal) {
            dialogPolyfill.registerDialog(this._dialog);
        }


        let ref = this;

        this._dialog.querySelector('.close').addEventListener('click', function() {
            ref._dialog.close();
        });

        let isfirsttime = CookieUtils.getCookie("isfirst");
        console.log("cookie data:", isfirsttime);
        if(isfirsttime != 'true'){
            this._dialog.showModal();
        }else{
            CookieUtils.setCookie("isfirst", 'false');
        }


    }
}