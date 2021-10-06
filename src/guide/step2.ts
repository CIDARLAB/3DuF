/*

Step2:  Make default constraints for each operation. Default constraints means a list of valves/ pumps that initially be closed before user choose inlet/ outlet.

*/

import Component from "@/app/core/component"
import { components_all } from "./step1"

// Make default constraints for each operation. For each operation, we store all valves / pumps which should be closed in this step.

// Create a new class as the element of a list. The list is used to describe all components' initial status for each operation mode.
export class component_status{

    protected _id: number;
    protected _component_info: Component;
    protected _status: boolean;
    constructor(id:number, component: Component,  status: boolean){
        this._id = id;
        this._component_info = component;
        this._status = status;
    }

    get id(){
        return this._id;
    }

    set id(value: number){
        this._id = value;
    }

    get component_info(){
        return this._component_info;
    }

    set component(value: Component){
        this._component_info = value;
    }

    get status(){
        return this._status;
    }

    set status(value: boolean){
        this._status = value;
    }
}

// Create the list for one status described above. We can call it constraint list for each mode.
export class component_status_list_oneMode{
    protected _status_list: Array<component_status>;
    protected _mode_id: number;
    constructor(status_list: Array<component_status>, mode_id: number){
        this._mode_id = mode_id;
        this._status_list = status_list;
    }

    // add elements into _status_list
    addElement(newELement: component_status){
        
    }

    // remove elements in _status_list
    removeElement(oldElement: component_status, id: number){

    }

    // modify an element in the list
    editElement(newELement: component_status, id: number){

    }

    // return current component status list
    get status_list(){
        return this._status_list;
    }
}

// Create a class stored all constraint lists mapping to the existing modes. Each existing mode has one constraint list.
export class component_status_list_allMode{
    protected _status_list_allMode: Array<component_status_list_oneMode>;
    protected _mode_id: number;
    constructor(status_list: Array<component_status_list_oneMode>, mode_id: number){
        this._mode_id = mode_id;
        this._status_list_allMode = status_list;
    }

    // add a list from different mode into _status_list_all
    addElement(newELement: component_status_list_oneMode){
    
    }

    get status_list_allMode(){
        return this._status_list_allMode;
    }

    Search_status_list_oneMode(mode_id: number){
        //return this._status_list_oneMode in the given mode id
        this._status_list_allMode[mode_id];
    }
}