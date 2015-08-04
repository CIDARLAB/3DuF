var Registry = require("../core/registry");
var FeatureRenderers = require("./featureRenderers");

class PaperView {
    constructor(){
        this.paperFeatures = {};
    }

    updateFeature(feature){
        if(feature.layer.device == Registry.currentDevice) {
            console.log("updating feature ID: " + feature.id);
            this.removeFeature(feature);
            this.paperFeatures[feature.id] = FeatureRenderers[feature.type](feature);
            paper.view.update(true);
        }
    }
    
    removeFeature(feature){
        if(feature.layer.device == Registry.currentDevice){
            let paperFeature = this.paperFeatures[feature.id];
            if (paperFeature) paperFeature.remove();
            paper.view.update(true);
        }
    }
}

module.exports = PaperView;
