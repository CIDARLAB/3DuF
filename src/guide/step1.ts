import Component from "@/app/core/component";
import Registry from "@/app/core/registry";
import * as Examples from "@/app/examples/jsonExamples";


let viewManager = Registry.viewManager;


if (viewManager != null) console.log(viewManager.currentDevice.components);
