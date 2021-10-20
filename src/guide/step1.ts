/*

Step1: Read all components from json file in 3DuF.

*/
import Component from "@/app/core/component";
import Registry from "@/app/core/registry";
import * as Examples from "@/app/examples/jsonExamples";

let viewManager = Registry.viewManager;

// classify all different types of components into the separate list inside the FeatureTable
export let FeatureTable: {[key: string]: Array<paper.Path>} = {"":[]};

// store all components in current device
export let components_all: Array<Component>;


export function ComponentStorage(){
    
    console.log("step1 starts!");
    // check all components inside the current device and store them into components_all
    if (viewManager != null) {
        components_all = viewManager.currentDevice.components;
        let Types: Array<string> = [];
        let FeatureInfo: Array<paper.Path> = [];

        for (let ele of components_all){
            let num = ele.featureIDs[0];
            if (Types.indexOf(ele.mint) == -1){
                FeatureTable[ele.mint] = [viewManager.view.paperFeatures[[num]]];
                Types.push(ele.mint);
            }
            else{
                FeatureTable[ele.mint].push(viewManager.view.paperFeatures[[num]]);
            }
            FeatureInfo.push(viewManager.view.paperFeatures[[num]]);
        }
        delete FeatureTable[""];
        console.log(FeatureInfo);
        console.log(FeatureTable);
        viewManager.view.showChosenFeatures(FeatureInfo);

    }
}

export function showChosenTypes(){

}

