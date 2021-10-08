import { DeviceState } from "./DeviceState";

// Create a class stored all constraint lists mapping to the existing modes. Each existing mode has one constraint list.
export class StateMachine {
    protected _StateListAll: Array<DeviceState>;
    protected _AmountOfModes: number;
    constructor(state_list: Array<DeviceState>, value: number) {
        this._AmountOfModes = value;
        this._StateListAll = state_list;
    }

    // add a constraint list into _StateListAll
    addElement(NewELement: DeviceState) {
        this._StateListAll[this._StateListAll.length] = NewELement;
    }

    // remove a constraint list from _StateListAll
    removeElement(OldELement: DeviceState) {
        let Id: number = OldELement.ModeId;
        this._StateListAll.splice(Id, 1);
    }

    // modify an element in _StateListAll
    editElement(NewELement: DeviceState, OldElement: DeviceState) {
        let Index = this._StateListAll.indexOf(OldElement);
        this._StateListAll[Index] = NewELement;
    }

    set StateListAll(value: Array<DeviceState>) {
        this._StateListAll = value;
    }
    get StateListAll() {
        return this._StateListAll;
    }

    //return the element DeviceState using the given mode id
    searchConstraint(ModeId: number) {
        let TargetMode: DeviceState;
        for (let values of this._StateListAll) {
            if (values.ModeId === ModeId) {
                TargetMode = values;
                return TargetMode;
            }
        }
    }

    get AmountOfModes() {
        return this._AmountOfModes;
    }

    set AmountOfModes(value: number) {
        this._AmountOfModes = value;
    }
}
