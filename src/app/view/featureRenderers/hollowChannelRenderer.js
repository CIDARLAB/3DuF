var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var HollowChannel = require("../../core/features").HollowChannel;
var Colors = require("../colors");

var renderHollowChannel = function(hollowChannel){
    let start = hollowChannel.params.getValue("start");
    let end = hollowChannel.params.getValue("end");
    let width;
    try {
        width = hollowChannel.params.getValue("width");
    } catch (err) {
        width = HollowChannel.getDefaultValues()["width"];
    }
    let r1 = PaperPrimitives.RoundedRect(start, end, width);
    let r2 = PaperPrimitives.RoundedRect(start, end, width/2);
    let comp = new paper.CompoundPath({
        children: [r1,r2],
        fillColor: Colors.GREY_700
    });
    comp.featureID = hollowChannel.id;
    return comp;
}

module.exports = renderHollowChannel;