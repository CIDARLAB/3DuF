import * as Registry from "../../core/registry";

export default class ZoomToolBar {
    constructor(zoom_min, zoom_max) {
        this.__zoomSlider = document.getElementById("zoom-slider");

        this.__setupZoomSlider(zoom_min, zoom_max);
    }

    __setupZoomSlider(zoom_min, zoom_max) {
        if (this.__zoomSlider === null) {
            throw new Error("Could not find HTML element for the grid resolution slider");
        }

        //Create the nouislider
        let zoom_optimal = Math.log10(Registry.viewManager.view.computeOptimalZoom());
        //Create the noUiSlider
        noUiSlider.create(this.__zoomSlider, {
            start: [zoom_optimal],
            connect: "lower",
            range: {
                min: -3.61,
                max: 0.6545
            },
            // pips: { mode: 'range', density: 5 , format: wNumb({suffix:"&mu;m"})},
            orientation: "vertical",
            direction: "rtl"
        });

        //Create the onupdate method
        let registryref = Registry;
        let ref = this;
        this.__zoomSlider.noUiSlider.on("update", function(values, handle, unencoded, tap, positions) {
            if (ref.__isUserGeneratedEvent) {
                console.log("Zoom Value:", values[0]);
                //TODO - Map this directly to the zoom functions
                console.log(registryref);
                try {
                    registryref.viewManager.setZoom(ZoomToolBar.convertLinearToZoomScale(values[0]));
                } catch (e) {
                    console.log("Could not set the zoom");
                }
            }
            ref.__isUserGeneratedEvent = true;
        });
    }

    /**
     * Pass the value that needs to be set for the
     * @param zoom
     */
    setZoom(zoom) {
        this.__isUserGeneratedEvent = false;
        this.__zoomSlider.noUiSlider.set(ZoomToolBar.convertZoomtoLinearScale(zoom));
    }

    static convertLinearToZoomScale(linvalue) {
        return Math.pow(10, linvalue);
    }

    static convertZoomtoLinearScale(zoomvalue) {
        return Math.log10(zoomvalue);
    }
}
