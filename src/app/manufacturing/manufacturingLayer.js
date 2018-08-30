import paper from 'paper';

export default class ManufacturingLayer{
    constructor(name){
        this.__features = [];
        this.__name = name;
        this.__paperGroup = new paper.Group();
    }

    get name(){
        return this.__name;
    }

    addFeature(feature){
        let copy = feature.clone();
        console.log("Copied feature",copy);
        this.__features.push(copy);

        this.__paperGroup.addChild(copy);
    }

    flipX(){
        console.warn("Implement method to flip the the group");
        /*
        Step 1 - Add a border ?
        Step 2 - Flip the whole godamn thing
        Step 3 - Remove the border ?
         */
    }

    exportToSVG(){
        return this.__paperGroup.exportSVG();
    }
}