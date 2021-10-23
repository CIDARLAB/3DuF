import { Registry } from "..";


    // /**
    //  * This is the method we need to call to fix the valvemaps
    //  * @memberof ViewManager
    //  */
    // export function createValveMapFromSelection() {
    //     if(Registry.currentDevice === null){
    //         throw new Error("no currendevice found in viewmanager");
    //     }

    //     // TODO: Run through the current selection and generate the valve map for every
    //     // vavle that is in the Selection
    //     const selection = this.tools.MouseSelectTool.currentSelection;
    //     const valves = [];
    //     let connection = null;
    //     // TODO: run though the items
    //     for (const render_element of selection) {
    //         // Check if render_element is associated with a VALVE/VALVE3D
    //         const component = Registry.currentDevice.getComponentForFeatureID(render_element.featureID);
    //         if (component !== null) {
    //             console.log("Component Type:", component.mint);
    //             const type = component.mint;
    //             if (type === "VALVE" || type === "VALVE3D") {
    //                 valves.push(component);
    //             }
    //         }

    //         connection = Registry.currentDevice.getConnectionForFeatureID(render_element.featureID);
    //         if(connection === null){
    //             throw new Error(`Could not find a connection that has a corresponding id: ${render_element.featureID}`);
    //         }
    //     }


    //     // Add to the valvemap
    //     for (const valve of valves) {
    //         let valve_type = false;
    //         if (valve.mint === "VALVE3D") {
    //             valve_type = true;
    //         }
    //         console.log("Adding Valve: ", valve);
    //         Registry.currentDevice.insertValve(valve, connection, valve_type);
    //     }
    // }
