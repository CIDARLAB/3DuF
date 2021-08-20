export default class UIElement{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(){
        console.log(`Drawing at ${this.x}, ${this.y}`);
    }
}