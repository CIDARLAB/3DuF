import ComponentPortRenderer2D from "./componentPortRenderer2D";

export default class PaperComponentPortView {
    constructor(paperlayer, viewmanager){
        this._paperlayer = paperlayer;
        this._componentAndRenderMap = new Map();
        this._activeRenders = [];
        this._viewManagerDelegate = viewmanager;
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
        this.clearActiveRenders();
        let components = this._viewManagerDelegate.currentDevice.getComponents();
        for(let i in components){
            let component = components[i];
            ComponentPortRenderer2D.renderComponentPorts(component);
        }

    }

    clearActiveRenders(){
        if(this._activeRenders){
            for(let i in this._activeRenders){
                this._activeRenders[i].remove();
            }
        }

        this._activeRenders = [];
    }
}