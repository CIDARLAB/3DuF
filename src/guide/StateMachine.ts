import { DeviceState } from "./DeviceState";

// Create a class stored all constraint lists mapping to the existing modes. Each existing mode has one constraint list.
export class StateMachine {
    protected _StateListAll: Array<DeviceState>;
    protected _ModeId: number;
    constructor(state_list: Array<DeviceState>, mode_id: number) {
        this._ModeId = mode_id;
        this._StateListAll = state_list;
    }

    // add a list from different mode into _StateListAll
    addElement(newELement: DeviceState) {

    }

    get StateListAll() {
        return this._StateListAll;
    }

    searchStateListOneMode(ModeId: number) {
        //return this._state_list_oneMode in the given mode id
        this._StateListAll[ModeId];
    }
}