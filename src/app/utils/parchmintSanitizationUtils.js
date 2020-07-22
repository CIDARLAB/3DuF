export function sanitizeJSON(json) {
    let components = json.components;

    for (let component of components) {
        let params = component.params;

        if (params.hasOwnProperty("orientation")) {
            let rotation = 0;
            let orientation = params.orientation;
            if (orientation === "V") {
                rotation = 0;
            } else {
                rotation = 270;
            }
            console.log(`Changed Param of Component '${component.name}' : ${orientation}->${rotation}`);
            delete params.orientation;
            params.rotation = rotation;
        }
    }

    let features_layers = json.features;

    for (let i in features_layers) {
        let feature_layer = features_layers[i];
        let features = feature_layer.features;
        console.log(features);
        for (let i in features) {
            let feature = features[i];

            if (feature.hasOwnProperty("params")) {
                let params = feature.params;

                if (params.hasOwnProperty("orientation")) {
                    let rotation = 0;
                    let orientation = params.orientation;
                    if (orientation === "V") {
                        rotation = 0;
                    } else {
                        rotation = 270;
                    }
                    console.log(`Changed Param of feature '${feature.name}' : ${orientation}->${rotation}`);

                    delete params.orientation;
                    params.rotation = rotation;
                }
            }
        }
    }

    return json;
}
