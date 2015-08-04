//From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexStringToPaperColor(hexString){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
    let color = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    if(color){
        return new paper.Color(color.r/255, color.g/255, color.b/255);
    }
}

module.exports.hexStringToPaperColor = hexStringToPaperColor;