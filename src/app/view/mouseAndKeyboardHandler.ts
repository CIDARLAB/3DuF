import paper from "paper";
import PanTool from "./tools/panTool";
import EventBus from "@/events/events";
import { ViewManager } from "..";
import MouseTool, { MouseToolCallback } from "./tools/mouseTool";
import { saveAs } from "file-saver";
import Registry from "@/app/core/registry";

/**
 * Mouse and Keyboard Handler class
 */
export default class MouseAndKeyboardHandler {
    viewManagerDelegate: ViewManager;
    private __leftMouseTool: MouseTool | null;
    private __rightMouseTool: MouseTool | null;
    private __middleMouseTool: PanTool;

    /**
     * Default Constructor for MouseAndKeyboardHandler object
     * @param {*} viewManagerDelegate
     */
    constructor(viewManagerDelegate: ViewManager) {
        this.viewManagerDelegate = viewManagerDelegate;

        this.__leftMouseTool = null;
        this.__rightMouseTool = null;
        this.__middleMouseTool = new PanTool();

        // Prevent default keyboard window events
        window.onkeydown = function(event: KeyboardEvent) {
            const key = event.keyCode || event.which;
            if (key === 46) {
                event.preventDefault();
            }
        };

        this.__setupDefaultKeyboardShortcuts();
        // this.__updateViewMouseEvents();
    }

    /**
     * Sets the tool for the left mouse
     * @returns {void}
     * @memberof MouseAndKeyboardHandler
     */
    set leftMouseTool(tool) {
        this.__leftMouseTool = tool;
    }

    /**
     * Sets the tool for the right mouse
     * @param {} tool Selected tool
     * @returns {void}
     * @memberof MouseAndKeyboardHandler
     */
    set rightMouseTool(tool) {
        this.__rightMouseTool = tool;
    }

    /**
     * Gets the tool of the left mouse
     * @returns Returns left mouse tool
     * @memberof MouseAndKeyboardHandler
     */
    get leftMouseTool() {
        return this.__leftMouseTool;
    }

    /**
     * Gets the tool of the right mouse
     * @returns Returns right mouse tool
     * @memberof MouseAndKeyboardHandler
     */
    get rightMouseTool() {
        return this.__rightMouseTool;
    }

    /**
     * Sets up the default keyboard handlers
     * @returns {void}
     * @memberof MouseAndKeyboardHandler
     * @private
     */
    __setupDefaultKeyboardShortcuts() {
        const reference = this.viewManagerDelegate;

        window.addEventListener("keydown", function(event) {
            const key = event.keyCode || event.which;

            // Saving
            if ((event.ctrlKey || event.metaKey) && key === 83) {
                if (Registry.currentDevice === null){
                    throw Error("Current device is null !!");
                }
                event.preventDefault();
                let json = new Blob([JSON.stringify(reference.generateExportJSON())], {
                    type: "application/json"
                });
                saveAs(json, Registry.currentDevice.name + ".json");
            }

            if (key === 70) {
                // Reset the view
                reference.view.initializeView();
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
                event.preventDefault();
            }

            // Escape key
            if (key === 27) {
                // Deselect all
                paper.project.deselectAll();

                // Change active tool to select tool
                reference.resetToDefaultTool();

                // Close all windows/dialogs
                EventBus.get().emit(EventBus.CLOSE_ALL_WINDOWS);
            }
        });

        reference.view.setKeyDownFunction(function(event) {
            const key = event.keyCode || event.which;

            // Delete
            if (key === 46 || key === 8) {
                reference.saveDeviceState();
                reference.view.deleteSelectedFeatures();
            }
            // Copy
            if ((event.ctrlKey || event.metaKey) && key === 67) {
                // console.log("Ctl c detected");
                reference.initiateCopy();
            }
            // Cut
            if ((event.ctrlKey || event.metaKey) && key === 88) {
                // console.log("Ctl x detected");
                const selectedFeatures = reference.view.getSelectedFeatures();
                if (selectedFeatures.length > 0) {
                    reference.pasteboard[0] = selectedFeatures[0];
                }
                reference.saveDeviceState();
                reference.view.deleteSelectedFeatures();
            }
            // Paste
            if ((event.ctrlKey || event.metaKey) && key === 86) {
                // console.log("Ctl v detected");
                const pasteboardFeatures = reference.pasteboard;
                if (pasteboardFeatures.length > 0) {
                    reference.updateDefaultsFromFeature(pasteboardFeatures[0]);
                    reference.activateTool(pasteboardFeatures[0].getType());
                }
            }

            // Undo
            if (event.keyCode === 90 && (event.metaKey || event.ctrlKey)) {
                console.log("Undo executed");
                reference.undo();
            }

            let pan_multiplier;

            if (key === 37) {
                // console.log("left arrow");
                if (event.shiftKey) {
                    pan_multiplier = 10;
                } else if (event.ctrlKey) {
                    pan_multiplier = 0.1;
                } else {
                    pan_multiplier = 1;
                }
                reference.view.moveCenter(new paper.Point(1000 * pan_multiplier, 0));
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
            }

            if (key === 38) {
                // console.log("Up arrow");
                if (event.shiftKey) {
                    pan_multiplier = 10;
                } else if (event.ctrlKey) {
                    pan_multiplier = 0.1;
                } else {
                    pan_multiplier = 1;
                }
                reference.view.moveCenter(new paper.Point(0, 1000 * pan_multiplier));
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
            }

            if (key === 39) {
                // console.log("right arrow");
                if (event.shiftKey) {
                    pan_multiplier = 10;
                } else if (event.ctrlKey) {
                    pan_multiplier = 0.1;
                } else {
                    pan_multiplier = 1;
                }
                reference.view.moveCenter(new paper.Point(-1000 * pan_multiplier, 0));
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
            }

            if (key === 40) {
                // console.log("down arrow");
                if (event.shiftKey) {
                    pan_multiplier = 10;
                } else if (event.ctrlKey) {
                    pan_multiplier = 0.1;
                } else {
                    pan_multiplier = 1;
                }
                reference.view.moveCenter(new paper.Point(0, -1000 * pan_multiplier));
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
            }

            if ((event.ctrlKey || event.metaKey) && key === 65) {
                // Select all
                reference.view.selectAllActive();
                return false;
            }
        });
    }

    /**
     * Updates mouse events
     * @returns {void}
     * @memberof MouseAndKeyboardHandler
     */
    updateViewMouseEvents() {
        console.log("Setting down handler:");

        this.viewManagerDelegate.view.setMouseDownFunction(this.constructMouseDownEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));


        // this.viewManagerDelegate.view.setMouseDownFunction(this.constructMouseDownEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
        this.viewManagerDelegate.view.setMouseUpFunction(this.constructMouseUpEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
        this.viewManagerDelegate.view.setMouseMoveFunction(this.constructMouseMoveEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
    }

    /**
     * This function is executed as a callback for every mouse down event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseDownCallback(event: MouseEvent) {
        console.log("testing down callback", event);
    }

    /**
     * this function is executed as a callback for every mouse up event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseUpCallback(event: MouseEvent) {
        console.log("testing up callback", event);
    }

    /**
     * This function is executed as a callback for every mouse move event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseMoveCallback(event: MouseEvent) {
        console.log("testing move callback", event);
    }

    /**
     *
     * @param {*} tool1
     * @param {*} tool2
     * @param {*} tool3
     */
    constructMouseDownEvent(tool1: MouseTool, tool2: MouseTool, tool3: MouseTool) {
        console.log("Tool1: ", tool1, "Tool2: ", tool2, "Tool3: ", tool3);
        if (tool1 === tool3) {
            console.log("Both right and left tool is the same");
            return this.constructMouseEvent(tool1.down, tool2.down, tool3.rightdown, this.__mouseDownCallback);
        } else {
            return this.constructMouseEvent(tool1.down, tool2.down, tool3.down, null);
        }
    }

    constructMouseMoveEvent(tool1: MouseTool, tool2: MouseTool, tool3: MouseTool) {
        return this.constructMouseEvent(tool1.move, tool2.move, tool3.move, this.__mouseUpCallback);
    }

    constructMouseUpEvent(tool1: MouseTool, tool2: MouseTool, tool3: MouseTool) {
        return this.constructMouseEvent(tool1.up, tool2.up, tool3.up, this.__mouseMoveCallback);
    }

    /**
     *
     * @param {*} func1
     * @param {*} func2
     * @param {*} func3
     * @param {*} buttondownCallback
     * @memberof MouseAndKeyboardHandler
     * @returns {Function}
     */
    constructMouseEvent(func1: MouseToolCallback, func2: MouseToolCallback, func3: MouseToolCallback, buttondownCallback: MouseToolCallback | null = null) {
        console.log("construct mouse event!");
        return function(event: MouseEvent) {
            let target;
            if (event.buttons) {
                if(buttondownCallback == null){
                    throw Error("No buttondownCallback set");
                }
                buttondownCallback(event);
                target = MouseAndKeyboardHandler.__eventButtonsToWhich(event.buttons);
            } else {
                target = event.which;
            }
            if (target === 2) {
                func2(event);
            } else if (target === 3) {
                func3(event);
            } else if (target === 1 || target === 0) {
                func1(event);
            }
        };
    }

    static __eventButtonsToWhich(num: number) {
        if (num === 1) {
            return 1;
        } else if (num === 2) {
            return 3;
        } else if (num === 4) {
            return 2;
        } else if (num === 3) {
            return 2;
        }
    }
}
