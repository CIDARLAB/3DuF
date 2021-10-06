import Component from "@/app/core/component";

// Create a new class as the element of a list. The list is used to describe all components' initial state for each operation mode.
export class ComponentState {
    protected _Id: number;
    protected _ComponentInfo: Component;
    protected _State: boolean;
    constructor(id: number, component: Component, state: boolean) {
        this._Id = id;
        this._ComponentInfo = component;
        this._State = state;
    }

    get Id() {
        return this._Id;
    }

    set Id(value: number) {
        this._Id = value;
    }

    get ComponentInfo() {
        return this._ComponentInfo;
    }

    set ComponentInfo(value: Component) {
        this._ComponentInfo = value;
    }

    get State() {
        return this._State;
    }

    set State(value: boolean) {
        this._State = value;
    }
}