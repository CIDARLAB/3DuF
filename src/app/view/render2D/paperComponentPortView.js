import ComponentPortRenderer2D from "./componentPortRenderer2D";

export default class PaperComponentPortView {
    constructor(paperlayer, viewmanager){
        this._paperlayer = paperlayer;
        this._componentAndRenderMap = new Map();
        this._activeRenders = [];
        this._viewManagerDelegate = viewmanager;
        this._enabled = false;
    }

    addComponentPortElements(component){
        if(!this._componentAndRenderMap.has(component.getID())){
            this._componentAndRenderMap.set(component.getID(), [])
        }

        let componentportrenders = this._componentAndRenderMap.get(component.getID());

        for(let key of component.ports.keys()){
            let render = ComponentPortRenderer2D.renderComponentPort(component.ports.get(key));
            componentportrenders.push(render);
        }
    }

    updateRenders(){
        if(!this._enabled){
            return;
        }
        this.clearActiveRenders();
        let components = this._viewManagerDelegate.currentDevice.getComponents();
        for(let i in components){
            let component = components[i];
            let renders = ComponentPortRenderer2D.renderComponentPorts(component);
            for(let i in renders){
                this._activeRenders.push(renders[i]);
                this._paperlayer.addChild(renders[i]);
            }
        }

    }

    clearActiveRenders(){
        if(!this._enabled){
            return;
        }
        if(this._activeRenders){
            for(let i in this._activeRenders){
                this._activeRenders[i].remove();
            }
        }

        this._activeRenders = [];
    }
}