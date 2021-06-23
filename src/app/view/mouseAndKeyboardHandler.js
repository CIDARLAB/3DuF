import paper from "paper";
import PanTool from "./tools/panTool";

/**
 * Mouse and Keyboard Handler class
 */
export default class MouseAndKeyboardHandler {
    /**
     * Default Constructor for MouseAndKeyboardHandler object
     * @param {*} viewManagerDelegate 
     */
    constructor(viewManagerDelegate) {
        this.viewManagerDelegate = viewManagerDelegate;

        this.__leftMouseTool = null;
        this.__rightMouseTool = null;
        this.__middleMouseTool = new PanTool();

        //Prevent default keyboard window events
        window.onkeydown = function(event) {
            let key = event.keyCode || event.which;
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
        let reference = this.viewManagerDelegate;

        window.addEventListener("keydown", function(event) {
            let key = event.keyCode || event.which;

            //Saving
            if ((event.ctrlKey || event.metaKey) && key === 83) {
                event.preventDefault();
                reference.exportPanel.saveJSON();
            }

            if (key === 70) {
                //Reset the view
                reference.view.initializeView();
                reference.updateGrid();
                reference.view.updateAlignmentMarks();
            }

            //Escape key
            if (key === 27) {
                //Deselect all
                paper.project.deselectAll();

                //Change active tool to select tool
                reference.resetToDefaultTool();
            }
        });

        reference.view.setKeyDownFunction(function(event) {
            let key = event.keyCode || event.which;

            // Delete
            if (key === 46 || key === 8) {
                reference.saveDeviceState();
                reference.view.deleteSelectedFeatures();
            }
            // Copy
            if ((event.ctrlKey || event.metaKey) && key === 67) {
                //console.log("Ctl c detected");
                reference.initiateCopy();
            }
            // Cut
            if ((event.ctrlKey || event.metaKey) && key === 88) {
                //console.log("Ctl x detected");
                let selectedFeatures = reference.view.getSelectedFeatures();
                if (selectedFeatures.length > 0) {
                    reference.pasteboard[0] = selectedFeatures[0];
                }
                reference.saveDeviceState();
                reference.view.deleteSelectedFeatures();
            }
            // Paste
            if ((event.ctrlKey || event.metaKey) && key === 86) {
                //console.log("Ctl v detected");
                let pasteboardFeatures = reference.pasteboard;
                if (pasteboardFeatures.length > 0) {
                    reference.updateDefaultsFromFeature(pasteboardFeatures[0]);
                    reference.activateTool(pasteboardFeatures[0].getType());
                }
            }

            //Undo
            if (event.keyCode === 90 && (event.metaKey || event.ctrlKey)) {
                console.log("Undo executed");
                reference.undo();
            }

            let pan_multiplier;

            if (key === 37) {
                //console.log("left arrow");
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
                //console.log("Up arrow");
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
                //console.log("right arrow");
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
                //console.log("down arrow");
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
                //Select all
                reference.view.selectAllActive();
                return false;
            }

            if ((event.ctrlKey || event.metaKey) && key === 71) {
                // Center the Design
                reference.centerAll();
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
        this.viewManagerDelegate.view.setMouseDownFunction(this.constructMouseDownEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
        this.viewManagerDelegate.view.setMouseUpFunction(this.constructMouseUpEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
        this.viewManagerDelegate.view.setMouseMoveFunction(this.constructMouseMoveEvent(this.__leftMouseTool, this.__middleMouseTool, this.__leftMouseTool));
    }

    /**
     * This function is executed as a callback for every mouse down event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseDownCallback(event) {
        // console.log("testing down callback", event);
    }

    /**
     * this function is executed as a callback for every mouse up event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseUpCallback(event) {
        // console.log("testing up callback", event);
    }

    /**
     * This function is executed as a callback for every mouse move event
     * @memberof MouseAndKeyboardHandler
     * @returns {void}
     * @private
     */
    __mouseMoveCallback(event) {
        // console.log("testing move callback", event);
    }
    /**
     * 
     * @param {*} tool1 
     * @param {*} tool2 
     * @param {*} tool3 
     */
    constructMouseDownEvent(tool1, tool2, tool3) {
        if (tool1 === tool3) {
            console.log("Both right and left tool is the same");
            return this.constructMouseEvent(tool1.down, tool2.down, tool3.rightdown, this.__mouseDownCallback);
        } else {
            return this.constructMouseEvent(tool1.down, tool2.down, tool3.down);
        }
    }

    constructMouseMoveEvent(tool1, tool2, tool3) {
        return this.constructMouseEvent(tool1.move, tool2.move, tool3.move, this.__mouseUpCallback);
    }

    constructMouseUpEvent(tool1, tool2, tool3) {
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
    constructMouseEvent(func1, func2, func3, buttondownCallback) {
        return function(event) {
            let target;
            if (event.buttons) {
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
    
    static __eventButtonsToWhich(num) {
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
