import EventEmitter from "eventemitter3";

class EventBus extends EventEmitter {
    private static instance: EventBus | null = null;

    static get(): EventBus {
        if (EventBus.instance === null) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    static NAVBAR_SCROLL_EVENT = "navbar_scroll_event";
    static SHOW_COMPONENT_PARAMS = "show_component_params_event";
    static SHOW_CONNECTION_PARAMS = "show_connection_params_event";
    static UPDATE_GRID_SIZE = "update_grid_size";
    static EDIT_CONNECTION = "edit_connection";
}

export default EventBus;
