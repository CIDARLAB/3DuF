import * as Registry from "../../core/registry";
import wNumb from "wnumb";

export default class ResolutionToolBar {
    constructor() {
        //Enable all the UI hooks so that we can execute the updates, actions
        this.__gridResolution = 0;
        this.__smallresolutionLabel = document.getElementById("sm-resolution");
        this.__largeresolutionLabel = document.getElementById("lg-resolution");
        this.__adaptiveGridCheckBox = document.getElementById("grid-enable-toggle");
        this.__snapRenderCheckBox = document.getElementById("render-snap-toggle");
        // this.__resolutionSlider = document.getElementById("grid-resolution-slider");
        this.__gridResolutionSlider = document.getElementById("grid-resolution-slider");
        let ref = this; // User ref for referring to this object instance
        this.__adaptiveGridCheckBox.onchange = function(event) {
            if (ref.__adaptiveGridCheckBox.checked) {
                //Enable Adaptive Grid
                Registry.currentGrid.enableAdaptiveGrid();
                ref.__gridResolutionSlider.setAttribute("disabled", true);
            } else {
                //Disable Adaptive Grid
                Registry.currentGrid.disableAdaptiveGrid();
                ref.__gridResolutionSlider.removeAttribute("disabled");
            }
        };
        this.__snapRenderCheckBox.onchange = function(event) {
            if (ref.__snapRenderCheckBox.checked) {
                //Enable Adaptive Grid
                Registry.viewManager.view.enableSnapRender();
            } else {
                //Disable Adaptive Grid
                Registry.viewManager.view.disableSnapRender();
            }
        };

        this.__setupGridResolutionSlider();
    }

    /**
     * Update the resolution labels in the UI.
     * Note: all the resolutions are displayed in microns
     * @param smallResolution
     */
    updateResolutionLabelAndSlider(smallResolution) {
        if (smallResolution != null) {
            this.__gridResolution = smallResolution;
            this.__smallresolutionLabel.innerHTML = smallResolution + " &mu;m";

            this.__gridResolutionSlider.noUiSlider.set(parseInt(smallResolution, 10));
        }
    }

    __setupGridResolutionSlider() {
        //Check if the div element has a different name now
        if (this.__gridResolutionSlider == null) {
            throw new Error("Could not find HTML element for the grid resolution slider");
        }
        //Create the noUiSlider
        noUiSlider.create(this.__gridResolutionSlider, {
            start: [500],
            connect: "lower",
            range: {
                min: [1, 1],
                "10%": [10, 10],
                "30%": [100, 100],
                "90%": [1000, 1000],
                max: [5000]
            },
            pips: {
                mode: "range",
                density: 5,
                format: wNumb({ suffix: "&mu;m" })
            },
            tooltips: [true]
            // orientation: 'vertical',
            // direction: 'rtl'
        });

        //Associate an onchange function
        let ref = this;
        let registryref = Registry;
        this.__gridResolutionSlider.noUiSlider.on("update", function(values, handle, unencoded, isTap, positions) {
            ref.__smallresolutionLabel.innerHTML = values[0] + " &mu;m";
        });

        this.__gridResolutionSlider.noUiSlider.on("change", function(values, handle, unencoded, isTap, positions) {
            let value = parseInt(values[0], 10);

            //This ensures that there is something valid present
            if (registryref.currentGrid != null) {
                registryref.currentGrid.updateGridSpacing(value);
                registryref.currentGrid.notifyViewManagerToUpdateView();
            }
        });

        //Finally Disable it
        this.__gridResolutionSlider.setAttribute("disabled", true);
        this.__gridResolutionSlider.setAttribute("height", "30%");
    }
}
