import EventEmitter from "eventemitter3";

class EventBus extends EventEmitter {
    private static instance: EventBus | null = null;

    static get(): EventBus {
        if (EventBus.instance === null) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    static NAVBAR_SCOLL_EVENT = "navbar_scroll_event";
}

export default EventBus;
