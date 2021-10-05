/*

Step1: Read all components from json file in 3DuF.

*/

import Component from "@/app/core/component";
import Registry from "@/app/core/registry";
import * as Examples from "@/app/examples/jsonExamples";


let viewManager = Registry.viewManager;
export let components_all: Array<Component>;

// check all components inside the current device and store them into components_all
if (viewManager != null){
    console.log(viewManager.currentDevice.components);
    components_all = viewManager.currentDevice.components
} 

// add codes to figure out special components like MUX if the component list above is not enough