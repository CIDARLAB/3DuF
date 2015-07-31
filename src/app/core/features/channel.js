var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

class Channel extends Feature {
    constructor(values, name = "New Channel") {
        let params = new Params(values, Channel.getUniqueParameters(), Channel.getHeritableParameters());
        super(Channel.typeString(), params, name);
    }

    static typeString() {
        return "Channel";
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

    render2D() {
        let start = this.params.getValue("start");
        let end = this.params.getValue("end");
        //TODO: figure out inheritance pattern for values!
        let width;
        try {
            width = this.params.getValue("width");
        } catch (err) {
            width = Channel.getDefaultValues()["width"];
        }

        let startPoint = new paper.Point(start[0], start[1]);
        let endPoint = new paper.Point(end[0], end[1]);

        let c1 = new paper.Path.Circle(startPoint, width / 2);
        let c2 = new paper.Path.Circle(endPoint, width / 2);

        let vec = endPoint.subtract(startPoint);
        let rec = new paper.Path.Rectangle({
            size: [vec.length, width],
            point: start,
        });

        rec.translate([0, -width / 2]);
        rec.rotate(vec.angle, start);
        let grp = new paper.Group([rec, c1, c2]);
        grp.fillColor = new paper.Color(0, 0, 1);
        return grp;
    }
}

Registry.registeredFeatures[Channel.typeString()] = Channel;

module.exports = Channel;