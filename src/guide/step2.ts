/*

Step2:  Make default constraints for each operation. Default constraints means a list of valves/ pumps that initially be closed before user choose inlet/ outlet.

*/

import Component from "@/app/core/component"
import { components_all } from "./step1"

// Make default constraints for each operation. For each operation, we store all valves / pumps which should be closed in this step.

// create a new class as the element of a list. The list is used to describe all components' initial status for each operation mode.
export class component_status{

    protected _component: Component;
    protected _status: boolean;
    constructor( component: Component,  status: boolean){
        this._component = component;
        this._status = status;
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