import { ComponentState } from "./ComponentState";

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

    // add elements into _StateList
    addElement(NewELement: ComponentState) {
        this._StateList[this._StateList.length] = NewELement;
    }

    // remove elements in _StateList
    removeElement(OldElement: ComponentState) {
        let Id: number = OldElement.Id;
        this._StateList.splice(Id, 1);
    }

    // modify an element in _StateList
    editElement(NewELement: ComponentState, OldElement: ComponentState) {
        let Index = this._StateList.indexOf(OldElement);
        this._StateList[Index] = NewELement;
    }
    
    // search for a element inside the StateList using the given id.
    searchElementById(id: number){
        return this._StateList[id];
    }

    // return current component state list
    get StateList() {
        return this._StateList;
    }

    // set Mode ID to current Device state

    get Id() {
        return this._ModeId;
    }

    get ModeDescription() {
        return this._ModeDescription;
    }
}