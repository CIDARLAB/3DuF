import CustomComponentToolBar from "./customComponentToolBar";

export default class RightPanel {
    constructor(viewManagerDelegate) {
        this.__viewManagerDelegate = viewManagerDelegate;
        this.__showResolutionToolBarButton = document.getElementById("grid-toolbar-show-button");
        this.__resolutionToolBar = document.getElementById("resolution-toolbar");
        this.customComponentToolBar = new CustomComponentToolBar(this.__viewManagerDelegate.customComponentManager);

        //Do the click handler here
        let ref = this;
        this.__showResolutionToolBarButton.onclick = function(event) {
            // console.log(ref.__resolutionToolBar.classList);
            ref.__resolutionToolBar.classList.toggle("showtoolbar");
            ref.__resolutionToolBar.classList.toggle("hidetoolbar");
            // console.log("button clicked");
            // console.log(ref.__resolutionToolBar.classList);
        };
    }
}
