var Feature = require("../feature");
var Registry = require("../registry");
var Params = require("../params");
var Parameters = require("../parameters");

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

        let startPoint = new paper.Point(start[0], start[1]);
        let endPoint = new paper.Point(end[0], end[1]);

        let vec = endPoint.subtract(startPoint);
        let ori = new paper.Path.Rectangle({
            size: [vec.length + width, width],
            point: start,
            radius: width/2
        });
        ori.translate([-width/2, -width / 2]);
        ori.rotate(vec.angle, start);

        let rec = new paper.Path.Rectangle({
            size: [vec.length + width/2, width/2],
            point: start,
            radius: width/4
        });
        rec.translate([-width/4, -width / 4]);
        rec.rotate(vec.angle, start);

        return new paper.CompoundPath({
            children: [ori, rec],
            fillColor: new paper.Color(0,0,0)
        });
    }
}

Registry.registeredFeatures[HollowChannel.typeString()] = HollowChannel;

module.exports = HollowChannel;