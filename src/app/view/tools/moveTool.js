import MouseTool from './mouseTool'

import Registry from '../../core/registry'

export default class MoveTool extends MouseTool {
  constructor () {
    super()

    // Use the startpoint to calculate the delta for movement
    this.__startPoint = null
    this.__dragging = false
    this.callback = null

    // this.dragging = false;
    // this.dragStart = null;
    // this.lastPoint = null;
    // this.currentSelectBox = null;
    // this.currentSelection = [];
    const ref = this
    // this.updateQueue = new SimpleQueue(function () {
    //     ref.dragHandler();
    // }, 20);
    this.down = function (event) {
      // Registry.viewManager.killParamsWindow();
      ref.mouseDownHandler(event)
      // ref.dragging = true;
      // ref.showTarget();
    }
    this.move = function (event) {
      // if (ref.dragging) {
      //     ref.lastPoint = MouseTool.getEventPosition(event);
      //     ref.updateQueue.run();
      // }
      // ref.showTarget();
      ref.dragHandler(event)
    }
    this.up = function (event) {
      // ref.dragging = false;
      ref.mouseUpHandler(event)
      // ref.showTarget();
    }
  }

  /**
     * Default activation method
     * @param component
     */
  activate (component, callback) {
    // console.log("Activating the tool for a new component", component);
    // Store the component position here
    this.__currentComponent = component
    this.__originalPosition = component.getPosition()
    this.callback = callback
  }

  /**
     * Default deactivation method
     */
  deactivate () {
    Registry.viewManager.resetToDefaultTool()
  }

  /**
     * Method that can process the update of the component position
     * @param xpos
     * @param ypos
     */
  processUIPosition (xpos, ypos) {
    this.__currentComponent.updateComponentPosition([xpos, ypos])
    this.callback(xpos, ypos)
  }

  /**
     * Updates the position of the current selected component
     * @param xpos
     * @param ypos
     * @private
     */
  __updatePosition (xpos, ypos) {
    this.processUIPosition(xpos, ypos)
  }

  /**
     * Reverts the position to the original position
     */
  revertToOriginalPosition () {
    this.__currentComponent.updateComponentPosition(this.__originalPosition)
  }

  /**
     * Function that handles the dragging of the mouse
     * @param event
     */
  dragHandler (event) {
    if (this.__dragging) {
      const point = MouseTool.getEventPosition(event)
      const target = Registry.viewManager.snapToGrid(point)
      // console.log("Point:", point, target, this.__startPoint);
      const delta = {
        x: target.x - this.__startPoint.y,
        y: target.y - this.__startPoint.y
      }
      this.__startPoint = target
      // console.log("delta:", delta);

      // let oldposition = this.__currentComponent.getPosition();
      // // console.log("oldposition:", oldposition);
      //
      // let newposition = [oldposition[0] + delta.x, oldposition[1] + delta.y];
      // console.log("Newposition:", newposition);
      // this.__currentComponent.updateComponentPosition(newposition);
      this.__updatePosition(target.x, target.y)
    }
  }

  // showTarget() {
  //     Registry.viewManager.removeTarget();
  // }

  /**
     * Method that handles the mouse up event
     * @param event
     */
  mouseUpHandler (event) {
    const point = MouseTool.getEventPosition(event)
    // console.log("Point:", point, event);
    const target = Registry.viewManager.snapToGrid(point)

    // console.log("Start:",this.__startPoint, "End:" ,target);
    this.__dragging = false
  }

  /**
     * Method that handles the movement of the mouse cursor
     * @param event
     */
  mouseDownHandler (event) {
    const point = MouseTool.getEventPosition(event)
    const target = Registry.viewManager.snapToGrid(point)
    this.__startPoint = target
    this.__dragging = true
  }
}
