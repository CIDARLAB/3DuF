let Registry = require("../../core/registry");

export default class ZoomToolBar {
    constructor(zoom_min, zoom_max){
        this.__zoomSlider = document.getElementById("zoom-slider");

        this.__setupZoomSlider(zoom_min, zoom_max);
    }

    __setupZoomSlider(zoom_min, zoom_max) {
        if(this.__zoomSlider == null){
            throw new Error("Could not find HTML element for the grid resolution slider");
        }

        //Create the nouislider
        let zoom_optimal = Registry.viewManager.view.computeOptimalZoom();
        console.log("toptimal zoom", zoom_optimal);
        //Create the noUiSlider
        noUiSlider.create(this.__zoomSlider, {
            start: [zoom_optimal],
            connect: "lower",
            step: (zoom_max - zoom_min)/100,
            range: {
                'min': zoom_min,
                'max': zoom_max
            },
            // pips: { mode: 'range', density: 5 , format: wNumb({suffix:"&mu;m"})},
            orientation: 'vertical',
            direction: 'rtl'
        });

        //Create the onupdate method
        let registryref = Registry;
        let ref = this;
        this.__zoomSlider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
            console.log('isTap', tap);
            console.log('handle', handle);
            if(ref.__isUserGeneratedEvent){
                console.log('Zoom Value:', values[0]);
                //TODO - Map this directly to the zoom functions
                console.log(registryref);
                try{
                    registryref.viewManager.setZoom(values[0]);
                }catch (e) {
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
    setZoom(zoom){
        console.log("Text");
        this.__isUserGeneratedEvent = false;
        this.__zoomSlider.noUiSlider.set(zoom);
    }
}