import EventEmitter from "eventemitter3";

class EventBus extends EventEmitter {
    private static instance: EventBus | null = null;

    static get(): EventBus {
        if (EventBus.instance === null) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

<<<<<<< HEAD
    static NAVBAR_SCOLL_EVENT = "navbar_scroll_event";
=======
    static NAVBAR_SCROLL_EVENT = "navbar_scroll_event";
    static SHOW_COMPONENT_PARAMS = "show_component_params_event";
    static SHOW_CONNECTION_PARAMS = "show_connection_params_event";
    static UPDATE_GRID_SIZE = "update_grid_size";
    static EDIT_CONNECTION = "edit_connection";
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
}

export default EventBus;
