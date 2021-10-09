import RightClickMenu from '../ui/rightClickMenu'
import MouseTool from './mouseTool'

import Registry from '../../core/registry'
import SimpleQueue from '../../utils/simpleQueue'
import paper from 'paper'
import EventBus from '@/events/events'

export default class MouseSelectTool extends MouseTool {
  constructor (viewManager, paperview) {
    super()
    this.viewManagerDelegate = viewManager
    this.paperView = paperview
    this.dragging = false
    this.dragStart = null
    this.lastPoint = null
    this.currentSelectBox = null
    this.currentSelection = []
    const ref = this
    this.updateQueue = new SimpleQueue(function () {
      ref.dragHandler()
    }, 20)
    this.down = function (event) {
      ref.viewManagerDelegate.killParamsWindow()
      ref.mouseDownHandler(event)
      ref.dragging = true
      ref.showTarget()
    }
    this.move = function (event) {
      if (ref.dragging) {
        ref.lastPoint = MouseTool.getEventPosition(event)
        ref.updateQueue.run()
      }
      ref.showTarget()
    }
    this.up = function (event) {
      ref.dragging = false
      ref.mouseUpHandler(MouseTool.getEventPosition(event))
      ref.showTarget()
    }
  }

  keyHandler (event) {
    if (event.key === 'delete' || event.key === 'backspace') {
      console.log('Removing feature')
      this.removeFeatures()
    }
    if (event.key === 'c') {
      console.log('Detected a ctrlC')
      console.log(this.currentSelection)
    }
  }

  dragHandler () {
    if (this.dragStart) {
      if (this.currentSelectBox) {
        this.currentSelectBox.remove()
      }
      this.currentSelectBox = this.rectSelect(this.dragStart, this.lastPoint)
    }
  }

  showTarget () {
    this.viewManagerDelegate.removeTarget()
  }

  mouseUpHandler (point) {
    if (this.currentSelectBox) {
      this.currentSelection = this.viewManagerDelegate.hitFeaturesWithViewElement(this.currentSelectBox)
      this.selectFeatures()
    }
    this.killSelectBox()
  }

  removeFeatures () {
    if (this.currentSelection.length > 0) {
      for (let i = 0; i < this.currentSelection.length; i++) {
        const paperFeature = this.currentSelection[i]
        Registry.currentDevice.removeFeatureByID(paperFeature.featureID)
      }
      this.currentSelection = []
      Registry.canvasManager.render()
    }
  }

  mouseDownHandler (event) {
    const point = MouseTool.getEventPosition(event)
    const target = this.hitFeature(point)
    if (target) {
      if (target.selected) {
        const feat = this.viewManagerDelegate.getFeatureByID(target.featureID)
        this.viewManagerDelegate.updateDefaultsFromFeature(feat)
        // Check if the feature is a part of a component
        let component, connection
        if (feat.referenceID === null) {
          throw new Error('ReferenceID of feature is null')
        } else {
          component = Registry.currentDevice.getComponentByID(feat.referenceID)
          connection = Registry.currentDevice.getConnectionByID(feat.referenceID)
          if (component !== null) {
            EventBus.get().emit(EventBus.DBL_CLICK_COMPONENT, event, component)
          } else if (connection !== null) {
            EventBus.get().emit(EventBus.DBL_CLICK_CONNECTION, event, connection)
          } else {
            EventBus.get().emit(EventBus.DBL_CLICK_FEATURE, event, feat)
          }
        }

        // const rightclickmenu = this.viewManagerDelegate.rightClickMenu; // new RightClickMenu(feat);
        // rightclickmenu.show(event, feat);
        // this.rightClickMenu = rightclickmenu;
        // let func = PageSetup.getParamsWindowCallbackFunction(feat.getType(), feat.getSet());
        // func(event);
      } else {
        this.deselectFeatures()
        this.selectFeature(target)
      }
    } else {
      this.deselectFeatures()
      this.dragStart = point
    }
  }

  killSelectBox () {
    if (this.currentSelectBox) {
      this.currentSelectBox.remove()
      this.currentSelectBox = null
    }
    this.dragStart = null
  }

  hitFeature (point) {
    const target = this.viewManagerDelegate.hitFeature(point)
    return target
  }

  /**
     * Function that is fired when we click to select a single object on the paperjs canvas
     * @param paperElement
     */
  selectFeature (paperElement) {
    this.currentSelection.push(paperElement)

    // Find the component that owns this feature and then select all of the friends
    const component = this.__getComponentWithFeatureID(paperElement.featureID)
    const connection = this.__getConnectionWithFeatureID(paperElement.featureID)
    if (component === null && connection === null) {
      // Does not belong to a component, hence this returns
      paperElement.selected = true
    } else if (component !== null) {
      // Belongs to the component so we basically select all features with this id
      const featureIDs = component.featureIDs
      for (const i in featureIDs) {
        const featureid = featureIDs[i]
        const actualfeature = this.viewManagerDelegate.view.paperFeatures[featureid]
        actualfeature.selected = true
      }

      this.viewManagerDelegate.view.selectedComponents.push(component)
    } else if (connection !== null) {
      const featureIDs = connection.featureIDs
      for (const i in featureIDs) {
        const featureid = featureIDs[i]
        const actualfeature = this.viewManagerDelegate.view.paperFeatures[featureid]
        actualfeature.selected = true
      }

      this.viewManagerDelegate.view.selectedConnections.push(connection)
    } else {
      throw new Error('Totally got the selection logic wrong, reimplement this')
    }
  }

  /**
     * Finds and return the corresponding Component Object in the Registry's current device associated with
     * the featureid. Returns null if no component is found.
     *
     * @param featureid
     * @return {Component}
     * @private
     */
  __getComponentWithFeatureID (featureid) {
    // Get component with the features

    const device_components = Registry.currentDevice.components

    // Check against every component
    for (const i in device_components) {
      const component = device_components[i]
      // Check against features in the in the component
      const componentfeatures = component.featureIDs
      const index = componentfeatures.indexOf(featureid)

      if (index !== -1) {
        // Found it !!
        return component
      }
    }

    return null
  }

  /**
     * Finds and return the corresponding Connection Object in the Registry's current device associated with
     * the featureid. Returns null if no connection is found.
     *
     * @param featureid
     * @return {*}
     * @private
     */
  __getConnectionWithFeatureID (featureid) {
    // Get component with the features

    const device_connections = Registry.currentDevice.connections

    // Check against every component
    for (const i in device_connections) {
      const connection = device_connections[i]
      // Check against features in the in the component
      const connection_features = connection.featureIDs
      const index = connection_features.indexOf(featureid)

      if (index !== -1) {
        // Found it !!
        return connection
      }
    }

    return null
  }

  /**
     * Function that is fired when we drag and select an area on the paperjs canvas
     */
  selectFeatures () {
    if (this.currentSelection) {
      for (let i = 0; i < this.currentSelection.length; i++) {
        const paperFeature = this.currentSelection[i]

        // Find the component that owns this feature and then select all of the friends
        const component = this.__getComponentWithFeatureID(paperFeature.featureID)

        if (component === null) {
          // Does not belong to a component hence do the normal stuff
          paperFeature.selected = true
        } else {
          // Belongs to the component so we basically select all features with this id
          const featureIDs = component.featureIDs
          for (const j in featureIDs) {
            const featureid = featureIDs[j]
            const actualfeature = this.viewManagerDelegate.view.paperFeatures[featureid]
            actualfeature.selected = true
          }

          this.viewManagerDelegate.view.selectedComponents.push(component)
        }
      }
    }
  }

  deselectFeatures () {
    if (this.rightClickMenu) {
      this.rightClickMenu.close()
    }
    this.paperView.clearSelectedItems()
    this.currentSelection = []
  }

  abort () {
    this.deselectFeatures()
    this.killSelectBox()
  }

  rectSelect (point1, point2) {
    const rect = new paper.Path.Rectangle(point1, point2)
    rect.fillColor = new paper.Color(0, 0.3, 1, 0.4)
    rect.strokeColor = new paper.Color(0, 0, 0)
    rect.strokeWidth = 2
    rect.selected = true
    return rect
  }
}
