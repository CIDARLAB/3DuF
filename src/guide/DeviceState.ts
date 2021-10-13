import { ComponentState } from "./ComponentState";
import Component from "@/app/core/component";

// Create the list for one state described above. We can call it constraint list for each mode.

export class DeviceState {
    protected _StateList: Array<ComponentState>;
    protected _ModeId: number;
    protected _ModeDescription: string;
    constructor(state_list: Array<ComponentState>, mode_id: number, text: string) {
        this._ModeId = mode_id;
        this._StateList = state_list;
        this._ModeDescription = text;
    }

    // Operations on StateList
    // set components' statelist to current DeviceState
    set StateList(state_list: Array<ComponentState>){
        this._StateList = state_list;
    }

    // return current component state list
    get StateList() {
        return this._StateList;
    }
    // add elements into _StateList
    addElement(NewELement: ComponentState) {
        this._StateList[this._StateList.length] = NewELement;
    }

    // remove elements in _StateList
    removeElement(OldElement: ComponentState) {
        let Id: number = OldElement.Id;
        this._StateList.splice(Id, 1);
    }

    // modify an element's state in _StateList
    editElementState(ELement: Component, state: number) {
        for (let i:number = 0; i <= this._StateList.length; i++){
            if (this._StateList[i].ComponentInfo == ELement){
                this._StateList[i].State = state;
                break;
            }
        }
    }
    
    // search for a element inside the StateList using the given component id.
    searchElementById(id: number){
        return this._StateList[id];
    }

    // Operations on ModeID
    // set Mode ID to current Device state
    set ModeId(value:number){
        this._ModeId = value;
    }
    // return Mode ID from current Device state
    get ModeId() {
        return this._ModeId;
    }

    // Operations on ModeDescription
    // set Mode description to current Device state
    set ModeDescription(value: string){
        this._ModeDescription = value;
    }

    // return Mode description from current Device state
    get ModeDescription() {
        return this._ModeDescription;
    }
}