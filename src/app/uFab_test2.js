//watchify uFab_test.js -t babelify -v --outfile bundle.js
//watchify uFab_test2.js -t babelify -v --outfile ../../renderer/static/js/uFabApp.js

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






