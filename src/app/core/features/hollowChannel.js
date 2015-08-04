var Feature = require("../feature");
var Registry = require("../registry");
var Params = require("../params");
var Parameters = require("../parameters");
var PaperPrimitives = require('../../view/paperPrimitives');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;


class HollowChannel extends Feature {
    constructor(values, name = "New HollowChannel") {
        let params = new Params(values, HollowChannel.getUniqueParameters(), HollowChannel.getHeritableParameters());
        super(HollowChannel.typeString(), params, name);
    }

    static getUniqueParameters() {
        return {
            "start": PointValue.typeString(),
            "end": PointValue.typeString()
        }
    }

    static getHeritableParameters() {
        return {
            "width": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "width": .4 * 1000,
            "height": .4 * 1000
        };
    }

    static typeString() {
        return "HollowChannel";
    }

    render2D() {
        let start = this.params.getValue("start");
        let end = this.params.getValue("end");
        let width;
        try {
            width = this.params.getValue("width");
        } catch (err) {
            width = HollowChannel.getDefaultValues()["width"];
        }

        let r1 = PaperPrimitives.RoundedRect(start, end, width);
        let r2 = PaperPrimitives.RoundedRect(start, end, width/2);
        let comp = new paper.CompoundPath({
            children: [r1,r2],
            fillColor: new paper.Color(0,0,0)
        });
        comp.featureID = this.id;
        return comp;
    }
}

Registry.registeredFeatures[HollowChannel.typeString()] = HollowChannel;

module.exports = HollowChannel;