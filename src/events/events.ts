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
    static DBL_CLICK_COMPONENT = "dbl_click_component";
    static DBL_CLICK_ELEMENT = "dbl_click_element";
    static DBL_CLICK_CONNECTION = "dbl_click_connection";
    static DBL_CLICK_FEATURE = "dbl_click_connection";
    static UPDATE_RENDERS = "update_renders";
    static RIGHT_CLICK = "right_click";
    static CLOSE_ALL_WINDOWS = "close_all_windows";
    /** Payload: { mint: string | null } — only one sidebar component row may be “active” */
    static SIDEBAR_COMPONENT_ACTIVATED = "sidebar_component_activated";
    /**
     * Payload: { mint: string | null; placementPanelAnchor?: { left: number; top: number } }
     * — only one settings panel may be open; null = none.
     * When opening placement defaults from the gear, include placementPanelAnchor (screen coords)
     * so the floating settings card can anchor beside the sidebar row.
     */
    static SIDEBAR_SETTINGS_OPENED = "sidebar_settings_opened";
    /** Payload: { anchor: { left: number; top: number } } — reposition sidebar-anchored placement settings card on scroll */
    static SIDEBAR_PLACEMENT_SETTINGS_REPOSITION = "sidebar_placement_settings_reposition";
    /** Payload: boolean — show or hide the “press Esc to stop connection” banner */
    static CONNECTION_ESC_HINT = "connection_esc_hint";
    /** Emitted when the active render layer (FLOW / CTRL / … tab) changes — UI panels can mirror canvas emphasis */
    static ACTIVE_RENDER_LAYER_CHANGED = "active_render_layer_changed";
    /** Payload: boolean — canvas shows only FLOW/CONTROL ports (cover-layer view) */
    static PORTS_ONLY_VIEW_CHANGED = "ports_only_view_changed";
    static UPDATE_ZOOM = "update_zoom";
}

/** Sidebar row id for Connection (distinct from device MINT strings). */
export const SIDEBAR_CONNECTION_ID = "__SIDEBAR_CONNECTION__";

export default EventBus;
