import Component from "@/app/core/component";
import { Point } from "paper/dist/paper-core";
import ViewManager from "../viewManager";
import ComponentPortRenderer2D from "./componentPortRenderer2D";

export default class PaperComponentPortView {

    private _viewManagerDelegate: ViewManager;
    private _componentAndRenderMap: Map<string, Array<any>>;
    private _activeRenders: Array<any>;
    private _paperlayer: paper.Group;
    private _enabled: boolean;

    constructor(paperlayer: paper.Group, viewmanager: ViewManager) {
        this._paperlayer = paperlayer;
        this._componentAndRenderMap = new Map();
        this._activeRenders = [];
        this._viewManagerDelegate = viewmanager;
        this._enabled = true;
    }

    addComponentPortElements(component: Component) {
        const zfactor = 1;
        if (!this._componentAndRenderMap.has(component.id)) {
            this._componentAndRenderMap.set(component.id, []);
        }

        const componentportrenders = this._componentAndRenderMap.get(component.id);

        if (componentportrenders === undefined) {
            console.error(`component ${component.id} has no port renders`);
            return;
        }

        for (const key of component.ports.keys()) {
            const componentport = component.ports.get(key);
            if (componentport === undefined) {
                console.error(`component ${component.id} has no port ${key}`);
                continue;
            }
            // TODO - Fix this API
            const render = ComponentPortRenderer2D.renderComponentPort(componentport, [0,0], 0, zfactor);
            componentportrenders.push(render);
        }
    }

    updateRenders() {
        if(this._viewManagerDelegate.currentDevice === null){
            console.error("No device selected, not rendering component ports");
            return;
        }

        if (!this._enabled) {
            this.clearActiveRenders();
            return;
        }
        this.clearActiveRenders();
        const components = this._viewManagerDelegate.currentDevice.components;
        for (const i in components) {
            const component = components[i];
            const renders = ComponentPortRenderer2D.renderComponentPorts(component);
            for (const j in renders) {
                this._activeRenders.push(renders[j]);
                this._paperlayer.addChild(renders[j]);
            }
        }
    }

    clearActiveRenders() {
        if (!this._enabled) {
            return;
        }
        if (this._activeRenders) {
            for (const i in this._activeRenders) {
                this._activeRenders[i].remove();
            }
        }

        this._activeRenders = [];
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this.clearActiveRenders();
        this._enabled = false;
    }
}
