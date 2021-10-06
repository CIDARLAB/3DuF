/*

Step2:  Make default constraints for each operation. Default constraints means a list of valves/ pumps that initially be closed before user choose inlet/ outlet.

*/

import Component from "@/app/core/component";
import { components_all } from "./step1";
import { ComponentState } from "./ComponentState";
import { DeviceState } from "./DeviceState";
import { StateMachine } from "./StateMachine";
// Make default constraints for each operation. For each operation, we store all valves / pumps which should be closed in this step.


