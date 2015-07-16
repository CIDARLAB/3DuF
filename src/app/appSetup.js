// to build me, run: watchify appSetup.js -t babelify -v --outfile "../../3DuFapp.js"
// from the src/app folder!

var paperFunctions = require("./paperFunctions");

paper.install(window);
paper.setup("c");

window.onload = function(){
    paperFunctions.setup()
    paperFunctions.channel([100,100],[200,200],20);
};

document.getElementById("c").onmousewheel = function(event){
    view.zoom = paperFunctions.changeZoom(view.zoom, event.wheelDelta);
    console.log(event.offsetX);
}






