import ComponentPortRenderer2D from "./componentPortRenderer2D";

export default class PaperComponentPortView {
    constructor(paperlayer, viewmanager) {
        this._paperlayer = paperlayer;
        this._componentAndRenderMap = new Map();
        this._activeRenders = [];
        this._viewManagerDelegate = viewmanager;
        this._enabled = true;
    }

    addComponentPortElements(component) {
        const zfactor = 1;
        if (!this._componentAndRenderMap.has(component.getID())) {
            this._componentAndRenderMap.set(component.getID(), []);
        }

        const componentportrenders = this._componentAndRenderMap.get(component.getID());

        for (const key of component.ports.keys()) {
            const render = ComponentPortRenderer2D.renderComponentPort(component.ports.get(key), undefined, undefined, zfactor);
            componentportrenders.push(render);
        }
    }

    updateRenders() {
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
        console.log("TEST");
    }

    disable() {
        this.clearActiveRenders();
        this._enabled = false;
    }
}
