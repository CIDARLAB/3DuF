/*

Step2:  Make default constraints for each operation. Default constraints means a list of valves/ pumps that initially be closed before user choose inlet/ outlet.

*/

import Component from "@/app/core/component";
import { components_all } from "./step1";
import { ComponentState } from "./ComponentState";
import { DeviceState } from "./DeviceState";
import { StateMachine } from "./StateMachine";
import Registry from "@/app/core/registry";
// Make default constraints for each operation. For each operation, we store all valves / pumps which should be closed in this step.

// initialize a new DeviceState with all components in current device remarked as false
function initializeDeviceState(ModeID: number, ModeDescription: string) {
    if (Registry.viewManager?.currentDevice === undefined) {
        throw Error("current device not defined");
    }

    let CurrentComponentState: ComponentState;
    let CurrentDeviceState: DeviceState;
    let counter: number = 0;
    CurrentDeviceState = new DeviceState([], ModeID, ModeDescription);

    for (let component of components_all) {
        CurrentComponentState = new ComponentState(counter, component, false);
        CurrentDeviceState.addElement(CurrentComponentState);
        counter += 1;
    }
    console.log(CurrentDeviceState);
    return CurrentDeviceState;
}

// figure out which component the user click on and return it
function detectChosenComponents(position: [number, number]) {
    let value: Component;

    // return the chosen component
    // return value;
}

// record which components are chosen and change their states in the statelist of CurrentDeviceState
export function editDeviceState(ModeID: number, ModeDescription: string): DeviceState {
    // locate the position that user point out using the function called MouseClick();
    // let MousePosition: [number,number] = MouseClick();

    let ChosenComponent: Component;
    let CurrentDeviceState: DeviceState;

    // ModeID and ModeDescription is given by wepage, get a initilized DeviceState
    CurrentDeviceState = initializeDeviceState(ModeID, ModeDescription);

    // ChosenComponent = detectChosenComponents(MousePosition);

    CurrentDeviceState.editElementState(components_all[0], true);
    return CurrentDeviceState;
}

export function makeStateMachine() {
    //i is the counter to provide Mode ID
    // let counter: number = 0;
    // let StateMachineInStep2: StateMachine;
    // let CurrentDeviceState: DeviceState = editDeviceState(1, "test")
    // StateMachineInStep2 = new StateMachine([CurrentDeviceState], 1)
    // console.log(StateMachineInStep2);
    console.log("hello");
}
