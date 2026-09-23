import paper from "paper";
import Registry from "@/app/core/registry";
import EventBus from "@/events/events";

/** Same side effects as pressing Escape in the main window handler (deselect, default tool, close sidebar settings / dialogs). */
export function exitCanvasSettingsLikeEscape(): void {
    paper.project.deselectAll();
    const vm = Registry.viewManager;
    if (vm) {
        // Prefer deactivate so placement tools removeTarget / clear lastTarget*
        // before select mode; otherwise wheel zoom resurrects the ghost.
        try {
            vm.deactivateComponentPlacementTool();
        } catch {
            vm.resetToDefaultTool();
        }
        try {
            if (vm.tools && vm.tools.MoveTool) {
                vm.tools.MoveTool.deactivate();
            }
        } catch {
            /* MoveTool may be unset during early init */
        }
        vm.removeTarget();
        vm.view.clearSelectedItems();
    }
    EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
    EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
    EventBus.get().emit(EventBus.CLOSE_ALL_WINDOWS);
}
