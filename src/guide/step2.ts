/*

Step2:  Make default constraints for each operation. Default constraints means a list of valves/ pumps that initially be closed before user choose inlet/ outlet.

*/

import Component from "@/app/core/component"
import { components_all } from "./step1"

// Make default constraints for each operation. For each operation, we store all valves / pumps which should be closed in this step.

// Create a new class as the element of a list. The list is used to describe all components' initial status for each operation mode.
export class component_status{

    protected _id: number;
    protected _component: Component;
    protected _status: boolean;
    constructor(id:number, component: Component,  status: boolean){
        this._id = id;
        this._component = component;
        this._status = status;
    }

    get id(){
        return this._id;
    }

    set id(value: number){
        this._id = value;
    }

    get component(){
        return this._component;
    }

    set component(value: Component){
        this._component = value;
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
    protected _length: number;
    constructor(status_list: Array<component_status>, length: number){
        this._length = length;
        this._status_list = status_list;
    }

    // add elements into _status_list
    addElement(newELement: component_status){
        
    }

    // remove elements in _status_list
    removeElement(oldElement: component_status, id: number){

    }

    // modify an element in the list
    changeElement(newELement: component_status, id: number){
        
    }

}

// Create a class stored all constraint lists mapping to the existing modes. Each existing mode has one constraint list.
export class component_status_list_allMode{

}