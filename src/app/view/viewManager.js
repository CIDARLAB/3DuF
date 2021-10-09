// import ZoomToolBar from "@/components/zoomSlider.vue";
import BorderSettingsDialog from './ui/borderSettingDialog'
import paper from 'paper'

import Registry from '../core/registry'
import * as Colors from './colors'
import { saveAs } from 'file-saver'

import Device from '../core/device'
import ChannelTool from './tools/channelTool'
import SelectTool from './tools/selectTool'
import InsertTextTool from './tools/insertTextTool'
import SimpleQueue from '../utils/simpleQueue'
import MouseSelectTool from './tools/mouseSelectTool'
import RenderMouseTool from './tools/renderMouseTool'

import ResolutionToolBar from './ui/resolutionToolBar'
import RightPanel from './ui/rightPanel'
import DXFObject from '../core/dxfObject'
import EdgeFeature from '../core/edgeFeature'
import ChangeAllDialog from './ui/changeAllDialog'
import LayerToolBar from './ui/layerToolBar'
import * as HTMLUtils from '../utils/htmlUtils'
import MouseAndKeyboardHandler from './mouseAndKeyboardHandler'
import { ComponentToolBar, inactiveBackground, inactiveText, activeText } from './ui/componentToolBar'
import DesignHistory from './designHistory'
import MoveTool from './tools/moveTool'
import ComponentPositionTool from './tools/componentPositionTool'
import MultilayerPositionTool from './tools/multilayerPositionTool'
import MultilevelPositionTool from './tools/multilevelPositionTool'
import CellPositionTool from './tools/cellPositionTool'
import ValveInsertionTool from './tools/valveInsertionTool'
import PositionTool from './tools/positionTool'
import ConnectionTool from './tools/connectionTool'
import GenerateArrayTool from './tools/generateArrayTool'
import CustomComponentManager from './customComponentManager'
import EditDeviceDialog from './ui/editDeviceDialog'
import ManufacturingPanel from './ui/manufacturingPanel'
import CustomComponentPositionTool from './tools/customComponentPositionTool'
import CustomComponent from '../core/customComponent'
import { setButtonColor } from '../utils/htmlUtils'
import ExportPanel from './ui/exportPanel'
import HelpDialog from './ui/helpDialog'
import PaperView from './paperView'
import AdaptiveGrid from './grid/adaptiveGrid'
import TaguchiDesigner from './ui/taguchiDesigner'
import RightClickMenu from './ui/rightClickMenu'
import IntroDialog from './ui/introDialog'
import DAFDPlugin from '../plugin/dafdPlugin'
import { Examples } from '../index'
import Feature from '../core/feature'
import Layer from '../core/layer'
import Component from '../core/component'
import DAMPFabricationDialog from './ui/dampFabricationDialog'
import ControlCellPositionTool from './tools/controlCellPositionTool'
import EventBus from '@/events/events'
import { ComponentAPI } from '@/componentAPI'
import RenderLayer from '@/app/view/renderLayer'

import LoadUtils from '@/app/view/loadUtils'
import ExportUtils from '@/app/view/exportUtils'
import { LogicalLayerType } from '@/app/core/init'

/**
 * View manager class
 */
import { MultiplyOperation } from 'three'

export default class ViewManager {
  /**
     * Default ViewManger Constructor
     */
  constructor () {
    this.view = new PaperView('c', this)
    this.__grid = new AdaptiveGrid(this)
    Registry.currentGrid = this.__grid
    this.renderLayers = []
    this.activeRenderLayer = null
    this.nonphysElements = [] // TODO - Keep track of what types of objects fall here UIElements
    this.tools = {}
    this.rightMouseTool = new SelectTool()
    this.__currentDevice = null
    const reference = this
    this.updateQueue = new SimpleQueue(function () {
      reference.view.refresh()
    }, 20)

    this.saveQueue = new SimpleQueue(function () {
      reference.saveToStorage()
    })

    this.undoStack = new DesignHistory()
    this.pasteboard = []

    this.mouseAndKeyboardHandler = new MouseAndKeyboardHandler(this)

    this.view.setResizeFunction(function () {
      reference.updateGrid()
      reference.updateAlignmentMarks()

      reference.view.updateRatsNest()
      reference.view.updateComponentPortsRender()
      reference.updateDevice(Registry.currentDevice)
    })

    const func = function (event) {
      reference.adjustZoom(event.deltaY, reference.getEventPosition(event))
    }

    // this.manufacturingPanel = new ManufacturingPanel(this);

    // this.exportPanel = new ExportPanel(this);

    this.view.setMouseWheelFunction(func)
    this.minZoom = 0.0001
    this.maxZoom = 5
    this.setupTools()
    const ref = this
    EventBus.get().on(EventBus.UPDATE_RENDERS, function (feature, refresh = true) {
      if (ref.ensureFeatureExists(feature)) {
        ref.view.updateFeature(feature)
        ref.refresh(refresh)
      }
    })

    // TODO: Figure out how remove UpdateQueue as dependency mechanism
    this.__grid.setColor(Colors.BLUE_500)

    // Removed from Page Setup
    this.threeD = false
    this.renderer = Registry.threeRenderer
    // this.__button2D = document.getElementById("button_2D");
    // this.__canvasBlock = document.getElementById("canvas_block");
    // this.__renderBlock = document.getElementById("renderContainer");
    this.setupDragAndDropLoad('#c')
    this.setupDragAndDropLoad('#renderContainer')
    this.switchTo2D()
  }

  /**
     * Returns the current device the ViewManager is displaying. Right now I'm using this to replace the
     * Registry.currentDevice dependency, however this might change as the modularity requirements change.
     *
     * @return {Device}
     * @memberof ViewManager
     */
  get currentDevice () {
    return this.__currentDevice
  }

  /**
     * Initiates the copy operation on the selected feature
     * @returns {void}
     * @memberof ViewManager
     */
  initiateCopy () {
    const selectedFeatures = this.view.getSelectedFeatures()
    if (selectedFeatures.length > 0) {
      this.pasteboard[0] = selectedFeatures[0]
    }
  }

  /**
     * Initiating the zoom toolbar
     * @memberof ViewManager
     * @returns {void}
     */
  setupToolBars () {
    // Initiating the zoom toolbar
    // this.zoomToolBar = new ZoomToolBar(0.0001, 5);
    // this.componentToolBar = new ComponentToolBar(this);
    this.resetToDefaultTool()
  }

  /**
     * Sets the initial state of the name map
     * @memberof ViewManager
     * @returns {void}
     */
  setNameMap () {
    const newMap = new Map()
    for (let i = 0; i < this.currentDevice.layers.length; i++) {
      const [nameStr, nameNum] = this.currentDevice.layers[i].name.split('_')
      if (newMap.has(nameStr)) {
        if (newMap.get(nameStr) < nameNum) newMap.set(nameStr, parseInt(nameNum))
      } else {
        newMap.set(nameStr, parseInt(nameNum))
      }
    }
    for (let i = 0; i < this.currentDevice.connections.length; i++) {
      const [nameStr, nameNum] = this.currentDevice.connections[i].name.split('_')
      if (newMap.has(nameStr)) {
        if (newMap.get(nameStr) < nameNum) newMap.set(nameStr, parseInt(nameNum))
      } else {
        newMap.set(nameStr, parseInt(nameNum))
      }
    }
    for (let i = 0; i < this.currentDevice.components.length; i++) {
      const [nameStr, nameNum] = this.currentDevice.components[i].name.split('_')
      if (newMap.has(nameStr)) {
        if (newMap.get(nameStr) < nameNum) newMap.set(nameStr, parseInt(nameNum))
      } else {
        newMap.set(nameStr, parseInt(nameNum))
      }
    }
    for (let i = 0; i < this.renderLayers.length; i++) {
      const [nameStr, nameNum] = this.renderLayers[i].name.split('_')
      if (newMap.has(nameStr)) {
        if (newMap.get(nameStr) < nameNum) newMap.set(nameStr, parseInt(nameNum))
      } else {
        newMap.set(nameStr, parseInt(nameNum))
      }
    }

    this.currentDevice.nameMap = newMap
  }

  /**
     * Adds a device to the view manager
     * @param {Device} device Device to be added
     * @param {Boolean} refresh Default true
     * @memberof ViewManager
     * @returns {void}
     */
  addDevice (device, refresh = true) {
    this.view.addDevice(device)
    this.__addAllDeviceLayers(device, false)
    this.refresh(refresh)
  }

  /**
     * Adds all the layers in the device
     * @param {Device} device Selected device
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof ViewManager
     * @returns {void}
     * @private
     */
  __addAllDeviceLayers (device, refresh = true) {
    for (let i = 0; i < device.layers.length; i++) {
      const layer = device.layers[i]
      this.addLayer(layer, i, false)
    }
  }

  /**
     * Removes all layers in the device
     * @param {Device} device Selected device
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof ViewManager
     * @returns {void}
     */
  __removeAllDeviceLayers (device, refresh = true) {
    for (let i = 0; i < device.layers.length; i++) {
      const layer = device.layers[i]
      this.removeLayer(layer, i, false)
    }
  }

  /**
     * Removes the device from the view
     * @param {Device} device Selected device to remove
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  removeDevice (device, refresh = true) {
    this.view.removeDevice(device)
    this.__removeAllDeviceLayers(device, false)
    this.refresh(refresh)
  }

  /**
     * Updates the device in the view
     * @param {Device} device Selected device to update
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  updateDevice (device, refresh = true) {
    this.view.updateDevice(device)
    this.refresh(refresh)
  }

  /**
     * Adds a feature to the view
     * @param {Feature} feature Feature to add
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  addFeature (feature, index = this.activeRenderLayer, isPhysicalFlag = true, refresh = true) {
    // let isPhysicalFlag = true;
    this.renderLayers[index].addFeature(feature, isPhysicalFlag)
    if (this.ensureFeatureExists(feature)) {
      this.view.addFeature(feature)
      this.refresh(refresh)
    }
  }

  /**
     * Returns the component identified by the id
     * @param {string} id ID of the feature to get the component
     * @return {UIElement|null}
     * @memberof ViewManager
     */
  getNonphysElementFromFeatureID (id) {
    for (const i in this.nonphysElements) {
      const element = this.nonphysElements[i]
      // go through each component's features
      for (const j in element.featureIDs) {
        if (element.featureIDs[j] === id) {
          return element
        }
      }
    }

    return null
  }

  /**
     * Updates a feature from the view
     * @param {Feature} feature Feature to update
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  updateFeature (feature, refresh = true) {
    if (this.ensureFeatureExists(feature)) {
      this.view.updateFeature(feature)
      this.refresh(refresh)
    }
  }

  /**
     * Removes feature from the view
     * @param {Feature} feature Feature to remove
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  removeFeature (feature, refresh = true) {
    const layer = this.getRenderLayerByID(feature.ID)
    if (this.ensureFeatureExists(feature)) {
      this.view.removeFeature(feature)
      this.refresh(refresh)
    }
    layer.removeFeatureByID(feature.ID)
  }

  /**
     * Removes feature from the view
     * @param {string} feature Feature to remove
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  removeFeatureByID (featureID, refresh = true) {
    const layer = this.getRenderLayerByID(featureID)
    const feature = layer.getFeature(featureID)
    if (this.ensureFeatureExists(feature)) {
      this.view.removeFeature(feature)
      this.refresh(refresh)
    }
    layer.removeFeatureByID(featureID)
  }

  /**
     * Adds layer to the view
     * @param {Layer} layer Layer to add
     * @param {Number} index Index of the layer
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  addLayer (layer, index, refresh = true) {
    if (this.__isLayerInCurrentDevice(layer)) {
      this.view.addLayer(layer, index, false)
      this.__addAllLayerFeatures(layer, index, false)
      this.refresh(refresh)
    }
  }

  /**
     * Create a new set of layers (flow, control and cell) for the upcoming level.
     * @returns {void}
     * @memberof ViewManager
     */
  createNewLayerBlock () {
    // Generate model layers
    let groupNum = Registry.currentDevice.layers.length
    if (groupNum != 0) groupNum = groupNum / 3

    const newlayers = []
    newlayers[0] = new Layer({ z_offset: 0, flip: false }, this.currentDevice.generateNewName('LayerFlow'), LogicalLayerType.FLOW, groupNum.toString())
    newlayers[1] = new Layer({ z_offset: 0, flip: false }, this.currentDevice.generateNewName('LayerControl'), LogicalLayerType.CONTROL, groupNum.toString())
    newlayers[2] = new Layer({ z_offset: 0, flip: false }, this.currentDevice.generateNewName('LayerIntegration'), LogicalLayerType.INTEGRATION, groupNum.toString())
    // Add model layers to current device
    Registry.currentDevice.createNewLayerBlock(newlayers)

    // Find all the edge features
    const edgefeatures = []
    const devicefeatures = Registry.currentDevice.layers[0].features
    let feature

    for (const i in devicefeatures) {
      feature = devicefeatures[i]
      if (feature.fabType === 'EDGE') {
        edgefeatures.push(feature)
      }
    }

    // Add the Edge Features from layer '0'
    // to all other layers
    for (const i in newlayers) {
      for (const j in edgefeatures) {
        newlayers[i].addFeature(edgefeatures[j], false)
      }
    }

    // Added the new layers
    for (const i in newlayers) {
      const layertoadd = newlayers[i]
      const index = this.view.paperLayers.length
      this.addLayer(layertoadd, index, true)
    }

    // Add new renderLayers
    this.renderLayers[this.renderLayers.length] = new RenderLayer(this.currentDevice.generateNewName('RenderLayerFlow'), newlayers[0], LogicalLayerType.FLOW)
    this.renderLayers[this.renderLayers.length] = new RenderLayer(this.currentDevice.generateNewName('RenderLayerControl'), newlayers[1], LogicalLayerType.CONTROL)
    this.renderLayers[this.renderLayers.length] = new RenderLayer(this.currentDevice.generateNewName('RenderLayerIntegration'), newlayers[2], LogicalLayerType.INTEGRATION)
    for (const i in edgefeatures) {
      this.renderLayers[this.renderLayers.length - 3].addFeature(edgefeatures[i])
      this.renderLayers[this.renderLayers.length - 2].addFeature(edgefeatures[i])
      this.renderLayers[this.renderLayers.length - 1].addFeature(edgefeatures[i])
    }

    this.setActiveRenderLayer(this.renderLayers.length - 3)
  }

  /**
     * Deletes the layers at the level index, we have 3-set of layers so it deletes everything at
     * that level
     * @param {number} levelindex Integer only
     * @returns {void}
     * @memberof ViewManager
     */
  deleteLayerBlock (levelindex) {
    // Delete the levels in the device model
    Registry.currentDevice.deleteLayer(levelindex * 3)
    Registry.currentDevice.deleteLayer(levelindex * 3)
    Registry.currentDevice.deleteLayer(levelindex * 3)

    // Delete levels in render model
    this.renderLayers.splice(levelindex * 3, 3)
    if (this.activeRenderLayer > levelindex * 3 + 2) {
      this.setActiveRenderLayer(this.activeRenderLayer - 3)
    } else if (this.activeRenderLayer < levelindex * 3) {
      console.log('No change')
    } else {
      if (levelindex == 0) {
        if (this.renderLayers.length == 0) {
          this.setActiveRenderLayer(null)
        } else {
          this.setActiveRenderLayer(0)
        }
      } else {
        this.setActiveRenderLayer((levelindex - 1) * 3)
      }
    }

    // Delete the levels in the render model
    this.view.removeLayer(levelindex * 3)
    this.view.removeLayer(levelindex * 3)
    this.view.removeLayer(levelindex * 3)
    this.updateActiveLayer()
    this.refresh()
  }

  setActiveRenderLayer (index) {
    this.activeRenderLayer = index
    Registry.currentLayer = this.renderLayers[index] // Registry.currentDevice.layers[index];
    this.updateActiveLayer()
  }

  /**
     * Removes layer from the view
     * @param {Layer} layer Layer to be removed from the view
     * @param {Number} index Index of the layer to remove
     * @param {Boolean} refresh Default to true
     * @returns {view}
     * @memberof ViewManager
     */
  removeLayer (layer, index, refresh = true) {
    if (this.__isLayerInCurrentDevice(layer)) {
      this.view.removeLayer(layer, index)
      this.__removeAllLayerFeatures(layer)
      this.refresh(refresh)
    }
  }

  /**
     * Converts the layers to SVG format
     * @returns {}
     * @memberof ViewManager
     */
  layersToSVGStrings () {
    return this.view.layersToSVGStrings()
  }

  /**
     * Adds all the features of the layer
     * @param {Layer} layer Selected layer
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     * @private
     */
  __addAllLayerFeatures (layer, index, refresh = true) {
    for (const key in layer.features) {
      const feature = layer.features[key]
      this.addFeature(feature, index, false)
      this.refresh(refresh)
    }
  }

  /**
     * Updates all the feature of the layer
     * @param {Layer} layer Selected layer
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  __updateAllLayerFeatures (layer, refresh = true) {
    for (const key in layer.features) {
      const feature = layer.features[key]
      this.updateFeature(feature, false)
      this.refresh(refresh)
    }
  }

  /**
     * Removes all feature of the layer
     * @param {Layer} layer Selected layer
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  __removeAllLayerFeatures (layer, refresh = true) {
    for (const key in layer.features) {
      const feature = layer.features[key]
      this.removeFeature(feature, false)
      this.refresh(refresh)
    }
  }

  /**
     * Updates layer
     * @param {Layer} layer Selected layer to be updated
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  updateLayer (layer, refresh = true) {
    if (this.__isLayerInCurrentDevice(layer)) {
      this.view.updateLayer(layer)
      this.refresh(refresh)
    }
  }

  /**
     * Updates the active layer
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  updateActiveLayer (refresh = true) {
    this.view.setActiveLayer(this.activeRenderLayer)
    this.refresh(refresh)
  }

  /**
     * Removes the grid
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  removeGrid (refresh = true) {
    if (this.__hasCurrentGrid()) {
      this.view.removeGrid()
      this.refresh(refresh)
    }
  }

  /**
     * Update grid
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  updateGrid (refresh = true) {
    if (this.__hasCurrentGrid()) {
      this.view.updateGrid(Registry.currentGrid)
      this.refresh(refresh)
    }
  }

  /**
     * Update the alignment marks of the view
     * @returns {void}
     * @memberof ViewManager
     */
  updateAlignmentMarks () {
    this.view.updateAlignmentMarks()
  }

  /**
     * Clear the view
     * @returns {void}
     * @memberof ViewManager
     */
  clear () {
    this.view.clear()
  }

  /**
     * Sets a specific value of zoom
     * @param {Number} zoom Zoom value
     * @param {boolean} refresh Whether it will refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  setZoom (zoom, refresh = true) {
    if (zoom > this.maxZoom) zoom = this.maxZoom
    else if (zoom < this.minZoom) zoom = this.minZoom
    this.view.setZoom(zoom)
    this.updateGrid(false)
    this.updateAlignmentMarks()
    this.view.updateRatsNest()
    this.view.updateComponentPortsRender()

    this.updateDevice(Registry.currentDevice, false)
    this.__updateViewTarget(false)
    this.refresh(refresh)
  }

  /**
     * Automatically generates a rectangular border for the device
     * @returns {void}
     * @memberof ViewManager
     */
  generateBorder () {
    const borderfeature = new EdgeFeature(null, null)

    // Get the bounds for the border feature and then update the device dimensions
    const xspan = Registry.currentDevice.getXSpan()
    const yspan = Registry.currentDevice.getYSpan()
    borderfeature.generateRectEdge(xspan, yspan)

    // Adding the feature to all the layers
    for (const i in Registry.currentDevice.layers) {
      const layer = Registry.currentDevice.layers[i]
      layer.addFeature(borderfeature)
    }
  }

  /**
     * Accepts a DXF object and then converts it into a feature, an edgeFeature in particular
     * @param dxfobject
     * @returns {void}
     * @memberof ViewManager
     */
  importBorder (dxfobject) {
    const customborderfeature = new EdgeFeature(null, null)
    for (const i in dxfobject.entities) {
      const foo = new DXFObject(dxfobject.entities[i])
      customborderfeature.addDXFObject(foo)
    }

    // Adding the feature to all the layers
    for (const i in Registry.currentDevice.layers) {
      const layer = Registry.currentDevice.layers[i]
      layer.addFeature(customborderfeature)
    }

    // Get the bounds for the border feature and then update the device dimensions
    const bounds = this.view.getRenderedFeature(customborderfeature.ID).bounds

    Registry.currentDevice.setXSpan(bounds.width)
    Registry.currentDevice.setYSpan(bounds.height)
    // Refresh the view
    Registry.viewManager.view.initializeView()
    Registry.viewManager.view.refresh()
  }

  /**
     * Deletes the border
     * @returns {void}
     * @memberof ViewManager
     */
  deleteBorder () {
    /*
        1. Find all the features that are EDGE type
        2. Delete all these features
         */

    console.log('Deleting border...')

    const features = Registry.currentDevice.getAllFeaturesFromDevice()
    console.log('All features', features)

    const edgefeatures = []

    for (const i in features) {
      // Check if the feature is EDGE or not
      if (features[i].fabType === 'EDGE') {
        edgefeatures.push(features[i])
      }
    }

    // Delete all the features
    for (const i in edgefeatures) {
      Registry.currentDevice.removeFeatureByID(edgefeatures[i].ID)
    }

    console.log('Edgefeatures', edgefeatures)
  }

  /**
     * Removes the target view
     * @memberof ViewManager
     * @returns {void}
     */
  removeTarget () {
    this.view.removeTarget()
  }

  /**
     * Update the target view
     * @param {string} featureType
     * @param {string} featureSet
     * @param {Array<number>} position Array with X and Y coordinates
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  updateTarget (featureType, featureSet, position, currentParameters, refresh = true) {
    this.view.addTarget(featureType, featureSet, position, currentParameters)
    this.view.updateAlignmentMarks()
    this.view.updateRatsNest()
    this.refresh(refresh)
  }

  /**
     * Update the view target
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  __updateViewTarget (refresh = true) {
    this.view.updateTarget()
    this.updateAlignmentMarks()
    this.view.updateRatsNest()
    this.view.updateComponentPortsRender()
    this.refresh(refresh)
  }

  /**
     * Adjust the zoom value in a certain point
     * @param {Number} delta Value of zoom
     * @param {Array<number>} point Coordinates to zoom in
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  adjustZoom (delta, point, refresh = true) {
    const belowMin = this.view.getZoom() >= this.maxZoom && delta < 0
    const aboveMax = this.view.getZoom() <= this.minZoom && delta > 0
    if (!aboveMax && !belowMin) {
      this.view.adjustZoom(delta, point)
      this.updateGrid(false)
      // this.updateAlignmentMarks();
      this.view.updateRatsNest()
      this.view.updateComponentPortsRender()
      this.updateDevice(Registry.currentDevice, false)
      this.__updateViewTarget(false)
    } else {
      // console.log("Too big or too small!");
    }
    this.refresh(refresh)
  }

  /**
     * Sets the center value
     * @param {Array<number>} center Center coordinates
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
  setCenter (center, refresh = true) {
    this.view.setCenter(center)
    this.updateGrid(false)
    // this.updateAlighmentMarks();

    this.updateDevice(Registry.currentDevice, false)
    this.refresh(refresh)
  }

  /**
     * Moves center by a certain value
     * @param {number} delta
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  moveCenter (delta, refresh = true) {
    this.view.moveCenter(delta)
    this.updateGrid(false)
    // this.updateAlignmentMarks();
    this.view.updateRatsNest()
    this.view.updateComponentPortsRender()
    this.updateDevice(Registry.currentDevice, false)
    this.refresh(refresh)
  }

  /**
     * Save the device to JSON format
     * @returns {void}
     * @memberof ViewManager
     */
  saveToStorage () {
    if (Registry.currentDevice) {
      try {
        localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()))
      } catch (err) {
        // can't save, so.. don't?
      }
    }
  }

  /**
     * Refresh the view
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
  refresh (refresh = true) {
    this.updateQueue.run()
    // Update the toolbar
    const spacing = Registry.currentGrid.getSpacing()
    // TODO - undo this
    // this.resolutionToolBar.updateResolutionLabelAndSlider(spacing);
  }

  /**
     * Gets the coordinates of the project
     * @param {*} event
     * @returns {Array<number>} Returns the X and Y coordinates
     * @memberof ViewManager
     */
  getEventPosition (event) {
    return this.view.getProjectPosition(event.clientX, event.clientY)
  }

  /**
     * Checks if it has current grid
     * @returns {Boolean}
     * @memberof ViewManager
     */
  __hasCurrentGrid () {
    if (Registry.currentGrid) return true
    else return false
  }

  /**
     * Checks if layer is in the current device
     * @param {Layer} layer Layer to check if it's on the current device
     * @returns {Boolean}
     * @memberof ViewManager
     */
  __isLayerInCurrentDevice (layer) {
    if (Registry.currentDevice && layer.device === Registry.currentDevice) return true
    else return false
  }

  /**
     * Checks if feature is in the current device
     * @param {Object} feature Feature to check if it's on the current device
     * @returns {Boolean}
     * @memberof ViewManager
     */
  isFeatureInCurrentDevice (feature) {
    if (Registry.currentDevice && this.__isLayerInCurrentDevice(feature.layer)) return true
    else return false
  }

  /**
     * Checks if feature exists
     * @param {Feature} feature Feature to check whether in existence
     * @returns {Boolean}
     * @memberof ViewManager
     */
  ensureFeatureExists (feature) {
    for (let i = 0; i < this.renderLayers.length; i++) {
      if (this.renderLayers[i].containsFeature(feature)) {
        return true
      }
    }
    return false
  }

  /**
     * Loads a device from a JSON format
     * @param {JSON} json
     * @returns {void}
     * @memberof ViewManager
     */
  loadDeviceFromJSON (json) {
    let device
    Registry.viewManager.clear()
    // Check and see the version number if its 0 or none is present,
    // its going the be the legacy format, else it'll be a new format
    const version = json.version

    if (version === null || undefined === version || version == 1 || version == 1.1 || version == 1.2) {
      const ret = LoadUtils.loadFromScratch(json)
      device = ret[0]
      Registry.currentDevice = device
      this.__currentDevice = device

      this.renderLayers = ret[1]

      this.setNameMap()
      // } else if (version == 1.1 || version == "1.1") {
      //     // this.loadCustomComponents(json);
      //     device = Device.fromInterchangeV1_1(json);
      //     Registry.currentDevice = device;
      //     this.__currentDevice = device;

      //     // TODO: Add separate render layers to initializing json, make fromInterchangeV1_1???
      //     for (const i in json.layers) {
      //         const newRenderLayer = RenderLayer.fromInterchangeV1(json.renderLayers[i]);
      //         this.renderLayers.push(newRenderLayer);
      //     }
    } else {
      alert("Version '" + version + "' is not supported by 3DuF !")
    }
    // Common Code for rendering stuff
    // console.log("Feature Layers", Registry.currentDevice.layers);
    Registry.currentLayer = this.renderLayers[0]
    Registry.currentTextLayer = Registry.currentDevice.textLayers[0]

    this.activeRenderLayer = 0

    // TODO: Need to replace the need for this function, right now without this, the active layer system gets broken
    this.addDevice(Registry.currentDevice)

    // In case of MINT exported json, generate layouts for rats nests
    this.__initializeRatsNest()

    this.view.initializeView()
    this.updateGrid()
    this.updateDevice(Registry.currentDevice)
    this.refresh(true)
    Registry.currentLayer = this.renderLayers[0]
    // this.layerToolBar.setActiveLayer("0");
    this.updateActiveLayer()
  }

  /**
     * Removes the features of the current device by searching on it's ID
     * @param {*} paperElements
     * @returns {void}
     * @memberof ViewManager
     */
  removeFeaturesByPaperElements (paperElements) {
    if (paperElements.length > 0) {
      for (let i = 0; i < paperElements.length; i++) {
        const paperFeature = paperElements[i]
        Registry.currentDevice.removeFeatureByID(paperFeature.featureID)
      }
      this.currentSelection = []
    }
  }

  /**
     * Updates the component parameters of a specific component
     * @param {string} componentname
     * @param {Array} params
     * @returns {void}
     * @memberof ViewManager
     */
  updateComponentParameters (componentname, params) {
    const component = this.__currentDevice.getComponentByName(componentname)
    for (const key in params) {
      component.updateParameter(key, params[key])
    }
  }

  /**
     * Returns a Point, coordinate list that is the closes grid coordinate
     * @param {Array<number>} point Array with the X and Y coordinates
     * @return {void|Array<number>}
     * @memberof ViewManager
     */
  snapToGrid (point) {
    if (Registry.currentGrid) return Registry.currentGrid.getClosestGridPoint(point)
    else return point
  }

  /**
     * Gets the features of a specific type ?
     * @param {string} typeString
     * @param {string} setString
     * @param {Array} features Array with features
     * @returns {Array} Returns array with the features of a specific type
     * @memberof ViewManager
     */
  getFeaturesOfType (typeString, setString, features) {
    const output = []
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      if (feature.getType() === typeString && feature.getSet() === setString) {
        output.push(feature)
      }
    }
    return output
  }

  /**
     * Updates all feature parameters
     * @param {string} valueString
     * @param {*} value
     * @param {Array} features Array of features
     * @returns {void}
     * @memberof ViewManager
     */
  adjustAllFeatureParams (valueString, value, features) {
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      feature.updateParameter(valueString, value)
    }
  }

  /**
     * Adjust all parameters of the same type
     * @param {string} typeString
     * @param {string} setString
     * @param {string} valueString
     * @param {*} value
     * @returns {void}
     * @memberof ViewManager
     */
  adjustParams (typeString, setString, valueString, value) {
    const selectedFeatures = this.view.getSelectedFeatures()
    if (selectedFeatures.length > 0) {
      const correctType = this.getFeaturesOfType(typeString, setString, selectedFeatures)
      if (correctType.length > 0) {
        this.adjustAllFeatureParams(valueString, value, correctType)
      }

      // Check if any components are selected
      // TODO: modify parameters window to not have chain of updates
      // Cycle through all components and connections and change the parameters
      for (const i in this.view.selectedComponents) {
        this.view.selectedComponents[i].updateParameter(valueString, value)
      }
      for (const i in this.view.selectedConnections) {
        this.view.selectedConnections[i].updateParameter(valueString, value)
      }
    } else {
      this.updateDefault(typeString, setString, valueString, value)
    }
  }

  /**
     * Updates the default feature parameter
     * @param {string} typeString
     * @param {string} setString
     * @param {string} valueString
     * @param value
     * @returns {void}
     * @memberof ViewManager
     */
  updateDefault (typeString, setString, valueString, value) {
    // Registry.featureDefaults[setString][typeString][valueString] = value;
    const defaults = ComponentAPI.getDefaultsForType(typeString)
    defaults[valueString] = value
  }

  /**
     * Updates the defaults in the feature
     * @param {Feature} feature Feature object
     * @returns {void}
     * @memberof ViewManager
     */
  updateDefaultsFromFeature (feature) {
    const heritable = feature.getHeritableParams()
    for (const key in heritable) {
      this.updateDefault(feature.getType(), null, key, feature.getValue(key))
    }
  }

  /**
     * Reverts the feature to default
     * @param {string} valueString
     * @param {Feature} feature
     * @returns {void}
     * @memberof ViewManager
     */
  revertFieldToDefault (valueString, feature) {
    feature.updateParameter(valueString, Registry.featureDefaults[feature.getSet()][feature.getType()][valueString])
  }

  /**
     * Reverts the feature to params to defaults
     * @param {Feature} feature
     * @returns {void}
     * @memberof ViewManager
     */
  revertFeatureToDefaults (feature) {
    const heritable = feature.getHeritableParams()
    for (const key in heritable) {
      this.revertFieldToDefault(key, feature)
    }
  }

  /**
     * Reverts features to defaults
     * @param {Array} features Features to revert to default
     * @returns {void}
     * @memberof ViewManager
     */
  revertFeaturesToDefaults (features) {
    for (const feature in features) {
      this.revertFeatureToDefaults(feature)
    }
  }

  /**
     * Checks if the point intersects with any other feature
     * @param {Array<number>} point Array with the X and Y coordinates
     * @return PaperJS rendered Feature
     * @memberof ViewManager
     */
  hitFeature (point) {
    return this.view.hitFeature(point)
  }

  /**
     * Checks if the point intersects with any other feature
     * @param {string} ID of feature object
     * @return {Feature}
     * @memberof ViewManager
     */

  getFeatureByID (featureID) {
    const layer = this.getRenderLayerByID(featureID)
    return layer.getFeature(featureID)
  }

  /**
     * Checks if the point intersects with any other feature
     * @param {string} ID of feature object
     * @return {RenderLayer}
     * @memberof ViewManager
     */
  getRenderLayerByID (featureID) {
    for (let i = 0; i < this.renderLayers.length; i++) {
      const layer = this.renderLayers[i]
      if (layer.containsFeatureID(featureID)) {
        return layer
      }
    }
    // Should textlayer logic be here or in device? (Currently in device)
    // for (let i = 0; i < this.__textLayers.length; i++) {
    //     let layer = this.__textLayers[i];
    //     if (layer.containsFeatureID(featureID)) {
    //         return layer;
    //     }
    // }
    throw new Error('FeatureID ' + featureID + ' not found in any renderLayer.')
  }

  /**
     * Checks if the element intersects with any other feature
     * @param element
     * @return {*|Array}
     * @memberof ViewManager
     */
  hitFeaturesWithViewElement (element) {
    return this.view.hitFeaturesWithViewElement(element)
  }

  /**
     * Activates the given tool
     * @param {string} toolString
     * @param rightClickToolString
     * @returns {void}
     * @memberof ViewManager
     */
  activateTool (toolString, rightClickToolString = 'SelectTool') {
    if (this.tools[toolString] === null) {
      throw new Error('Could not find tool with the matching string')
    }
    // Cleanup job when activating new tool
    this.view.clearSelectedItems()

    this.mouseAndKeyboardHandler.leftMouseTool = this.tools[toolString]
    this.mouseAndKeyboardHandler.rightMouseTool = this.tools[rightClickToolString]
    this.mouseAndKeyboardHandler.updateViewMouseEvents()
  }

  /**
     * Switches to 2D
     * @returns {void}
     * @memberof ViewManager
     */
  switchTo2D () {
    if (this.threeD) {
      this.threeD = false
      const center = this.renderer.getCameraCenterInMicrometers()
      const zoom = this.renderer.getZoom()
      let newCenterX = center[0]
      if (newCenterX < 0) {
        newCenterX = 0
      } else if (newCenterX > Registry.currentDevice.params.getValue('width')) {
        newCenterX = Registry.currentDevice.params.getValue('width')
      }
      let newCenterY = paper.view.center.y - center[1]
      if (newCenterY < 0) {
        newCenterY = 0
      } else if (newCenterY > Registry.currentDevice.params.getValue('height')) {
        newCenterY = Registry.currentDevice.params.getValue('height')
      }
      HTMLUtils.setButtonColor(this.__button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText)
      HTMLUtils.setButtonColor(this.__button3D, inactiveBackground, inactiveText)
      Registry.viewManager.setCenter(new paper.Point(newCenterX, newCenterY))
      Registry.viewManager.setZoom(zoom)
      HTMLUtils.addClass(this.__renderBlock, 'hidden-block')
      HTMLUtils.removeClass(this.__canvasBlock, 'hidden-block')
      HTMLUtils.removeClass(this.__renderBlock, 'shown-block')
      HTMLUtils.addClass(this.__canvasBlock, 'shown-block')
    }
  }

  /**
     * Switches to 3D
     * @returns {void}
     * @memberof ViewManager
     */
  switchTo3D () {
    if (!this.threeD) {
      this.threeD = true
      setButtonColor(this.__button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText)
      setButtonColor(this.__button2D, inactiveBackground, inactiveText)
      this.renderer.loadJSON(Registry.currentDevice.toJSON())
      const cameraCenter = this.view.getViewCenterInMillimeters()
      const height = Registry.currentDevice.params.getValue('height') / 1000
      const pixels = this.view.getDeviceHeightInPixels()
      this.renderer.setupCamera(cameraCenter[0], cameraCenter[1], height, pixels, paper.view.zoom)
      this.renderer.showMockup()
      HTMLUtils.removeClass(this.__renderBlock, 'hidden-block')
      HTMLUtils.addClass(this.__canvasBlock, 'hidden-block')
      HTMLUtils.addClass(this.__renderBlock, 'shown-block')
      HTMLUtils.removeClass(this.__canvasBlock, 'shown-block')
    }
  }

  /**
     * Loads a device from a JSON format when the user drags and drops it on the grid
     * @param selector
     * @returns {void}
     * @memberof ViewManager
     */
  setupDragAndDropLoad (selector) {
    const dnd = new HTMLUtils.DnDFileController(selector, function (files) {
      const f = files[0]

      const reader = new FileReader()
      reader.onloadend = function (e) {
        let result = this.result
        // try {
        result = JSON.parse(result)
        Registry.viewManager.loadDeviceFromJSON(result)
        Registry.viewManager.switchTo2D()
        // } catch (error) {
        //     console.error(error.message);
        //     alert("Unable to parse the design file, please ensure that the file is not corrupted:\n" + error.message);
        // }
      }
      try {
        reader.readAsText(f)
      } catch (err) {
        console.log('unable to load JSON: ' + f)
      }
    })
  }

  /**
     * Closes the params window
     * @returns {void}
     * @memberof ViewManager
     */
  killParamsWindow () {
    const paramsWindow = document.getElementById('parameter_menu')
    if (paramsWindow) paramsWindow.parentElement.removeChild(paramsWindow)
  }

  /**
     * This method saves the current device to the design history
     * @memberof ViewManager
     * @returns {void}
     */
  saveDeviceState () {
    console.log('Saving to stack')

    const save = JSON.stringify(Registry.currentDevice.toInterchangeV1())

    this.undoStack.pushDesign(save)
  }

  /**
     * Undoes the recent update
     * @returns {void}
     * @memberof ViewManager
     */
  undo () {
    const previousdesign = this.undoStack.popDesign()
    console.log(previousdesign)
    if (previousdesign) {
      const result = JSON.parse(previousdesign)
      this.loadDeviceFromJSON(result)
    }
  }

  /**
     * Resets the tool to the default tool
     * @returns {void}
     * @memberof ViewManager
     */
  resetToDefaultTool () {
    this.cleanupActiveTools()
    this.activateTool('MouseSelectTool')
    // this.activateTool("RenderMouseTool");
    // this.componentToolBar.setActiveButton("SelectButton");
  }

  /**
     * Runs cleanup method on the activated tools
     * @returns {void}
     * @memberof ViewManager
     */
  cleanupActiveTools () {
    if (this.mouseAndKeyboardHandler.leftMouseTool) {
      this.mouseAndKeyboardHandler.leftMouseTool.cleanup()
    }
    if (this.mouseAndKeyboardHandler.rightMouseTool) {
      this.mouseAndKeyboardHandler.rightMouseTool.cleanup()
    }
  }

  /**
     * Updates the renders for all the connection in the blah
     * @returns {void}
     * @memberof ViewManager
     */
  updatesConnectionRender (connection) {
    // First Redraw all the segements without valves or insertions
    connection.regenerateSegments()

    // Get all the valves for a connection
    const valves = Registry.currentDevice.getValvesForConnection(connection)

    // Cycle through each of the valves
    for (const j in valves) {
      const valve = valves[j]
      const is3D = Registry.currentDevice.getIsValve3D(valve)
      if (is3D) {
        const boundingbox = valve.getBoundingRectangle()
        connection.insertFeatureGap(boundingbox)
      }
    }
  }

  /**
     * Shows in the UI a message
     * @param {string} message Messsage to display
     * @returns {void}
     * @memberof ViewManager
     */
  showUIMessage (message) {
    this.messageBox.MaterialSnackbar.showSnackbar({
      message: message
    })
  }

  /**
     * Sets up all the tools to be used by the user
     * @returns {void}
     * @memberof ViewManager
     */
  setupTools () {
    this.tools.MouseSelectTool = new MouseSelectTool(this, this.view)
    this.tools.RenderMouseTool = new RenderMouseTool(this, this.view)
    this.tools.InsertTextTool = new InsertTextTool(this)
    this.tools.Chamber = new ComponentPositionTool('Chamber', 'Basic')
    this.tools.Valve = new ValveInsertionTool('Valve', 'Basic')
    this.tools.Channel = new ChannelTool('Channel', 'Basic')
    this.tools.Connection = new ConnectionTool('Connection', 'Basic')
    this.tools.RoundedChannel = new ChannelTool('RoundedChannel', 'Basic')
    this.tools.Node = new ComponentPositionTool('Node', 'Basic')
    this.tools.CircleValve = new ValveInsertionTool('CircleValve', 'Basic')
    this.tools.RectValve = new ComponentPositionTool('RectValve', 'Basic')
    this.tools.Valve3D = new ValveInsertionTool('Valve3D', 'Basic', true)
    this.tools.Port = new ComponentPositionTool('Port', 'Basic')
    this.tools.Anode = new ComponentPositionTool('Anode', 'Basic') // Ck
    this.tools.Cathode = new ComponentPositionTool('Cathode', 'Basic') // Ck
    this.tools.Via = new PositionTool('Via', 'Basic')
    this.tools.DiamondReactionChamber = new ComponentPositionTool('DiamondReactionChamber', 'Basic')
    this.tools.thermoCycler = new ComponentPositionTool('thermoCycler', 'Basic')
    this.tools.BetterMixer = new ComponentPositionTool('BetterMixer', 'Basic')
    this.tools.CurvedMixer = new ComponentPositionTool('CurvedMixer', 'Basic')
    this.tools.Mixer = new ComponentPositionTool('Mixer', 'Basic')
    this.tools.GradientGenerator = new ComponentPositionTool('GradientGenerator', 'Basic')
    this.tools.Tree = new ComponentPositionTool('Tree', 'Basic')
    this.tools.YTree = new ComponentPositionTool('YTree', 'Basic')
    this.tools.Mux = new MultilayerPositionTool('Mux', 'Basic')
    this.tools.Transposer = new MultilayerPositionTool('Transposer', 'Basic')
    this.tools.RotaryMixer = new MultilayerPositionTool('RotaryMixer', 'Basic')
    this.tools.CellTrapL = new CellPositionTool('CellTrapL', 'Basic')
    this.tools.Gelchannel = new CellPositionTool('Gelchannel', 'Basic') // ck
    this.tools.DropletGen = new ComponentPositionTool('DropletGen', 'Basic')
    this.tools.Transition = new PositionTool('Transition', 'Basic')
    this.tools.AlignmentMarks = new MultilayerPositionTool('AlignmentMarks', 'Basic')
    this.tools.Pump = new MultilayerPositionTool('Pump', 'Basic')
    this.tools.Pump3D = new MultilayerPositionTool('Pump3D', 'Basic')
    this.tools.LLChamber = new MultilayerPositionTool('LLChamber', 'Basic')
    this.tools['3DMixer'] = new MultilayerPositionTool('3DMixer', 'Basic')

    // All the new tools
    this.tools.MoveTool = new MoveTool()
    this.tools.GenerateArrayTool = new GenerateArrayTool()

    // new
    this.tools.Filter = new ComponentPositionTool('Filter', 'Basic')
    this.tools.CellTrapS = new CellPositionTool('CellTrapS', 'Basic')
    this.tools['3DMux'] = new MultilayerPositionTool('3DMux', 'Basic')
    this.tools.ChemostatRing = new MultilayerPositionTool('ChemostatRing', 'Basic')
    this.tools.Incubation = new ComponentPositionTool('Incubation', 'Basic')
    this.tools.Merger = new ComponentPositionTool('Merger', 'Basic')
    this.tools.PicoInjection = new ComponentPositionTool('PicoInjection', 'Basic')
    this.tools.Sorter = new ComponentPositionTool('Sorter', 'Basic')
    this.tools.Splitter = new ComponentPositionTool('Splitter', 'Basic')
    this.tools.CapacitanceSensor = new ComponentPositionTool('CapacitanceSensor', 'Basic')
    this.tools.DropletGenT = new ComponentPositionTool('DropletGenT', 'Basic')
    this.tools.DropletGenFlow = new ComponentPositionTool('DropletGenFlow', 'Basic')
    this.tools.LogicArray = new ControlCellPositionTool('LogicArray', 'Basic')
  }

  /**
     * Adds a custom component tool
     * @param {string} identifier
     * @returns {void}
     * @memberof ViewManager
     */
  addCustomComponentTool (identifier) {
    const customcomponent = this.customComponentManager.getCustomComponent(identifier)
    this.tools[identifier] = new CustomComponentPositionTool(customcomponent, 'Custom')
    Registry.featureDefaults.Custom[identifier] = CustomComponent.defaultParameterDefinitions().defaults
  }

  /**
     * Initialize the default placement for components
     * @returns {void}
     * @memberof ViewManager
     */
  __initializeRatsNest () {
    // Step 1 generate features for all the components with some basic layout
    const components = this.currentDevice.components
    const xpos = 10000
    const ypos = 10000
    for (const i in components) {
      const component = components[i]
      const currentposition = component.getPosition()
      // TODO: Refine this logic, it sucks
      if (currentposition[0] === 0 && currentposition === 0) {
        if (!component.placed) {
          this.__generateDefaultPlacementForComponent(component, xpos * (parseInt(i) + 1), ypos * (Math.floor(parseInt(i) / 5) + 1))
        }
      } else {
        if (!component.placed) {
          this.__generateDefaultPlacementForComponent(component, currentposition[0], currentposition[1])
        }
      }
    }

    // TODO: Step 2 generate rats nest renders for all the components

    this.view.updateRatsNest()
    this.view.updateComponentPortsRender()
  }

  /**
     * Generates the default placement for components
     * @param {Component} component
     * @param {number} xpos Default X coordinate
     * @param {number} ypos Default Y coordinate
     * @returns {void}
     * @memberof ViewManager
     */
  __generateDefaultPlacementForComponent (component, xpos, ypos) {
    const params_to_copy = component.params.toJSON()

    params_to_copy.position = [xpos, ypos]

    // Get default params and overwrite them with json params, this can account for inconsistencies
    const renderdefkeys = ComponentAPI.getRenderTypeKeysForMINT(component.mint)
    for (let i = 0; i < renderdefkeys.length; i++) {
      const key = renderdefkeys[i]
      const newFeature = Device.makeFeature(key, params_to_copy)
      component.addFeatureID(newFeature.ID)
      Registry.currentLayer.addFeature(newFeature)
    }

    // Set the component position
    component.updateComponentPosition([xpos, ypos])
  }

  /**
     * Generates a JSON format file to export it
     * @returns {void}
     * @memberof ViewManager
     */
  generateExportJSON () {
    const json = ExportUtils.toScratch(this)
    // const json = this.currentDevice.toInterchangeV1_1();
    // json.customComponents = this.customComponentManager.toJSON();
    return json
  }

  /**
     * This method attempts to load any custom components that are stored in the custom components property
     * @param json
     */
  loadCustomComponents (json) {
    if (Object.prototype.hasOwnProperty.call(json, 'customComponents')) {
      this.customComponentManager.loadFromJSON(json.customComponents)
    }
  }

  /**
     * Activates DAFD plugin
     * @param {*} params
     * @returns {void}
     * @memberof ViewManager
     */
  activateDAFDPlugin (params = null) {
    this.loadDeviceFromJSON(JSON.parse(Examples.dafdtemplate))

    if (params === null) {
      params = {
        orificeSize: 750,
        orificeLength: 200,
        oilInputWidth: 800,
        waterInputWidth: 900,
        outputWidth: 900,
        outputLength: 500,
        height: 100
      }
    }

    DAFDPlugin.fixLayout(params)
  }

  /**
     * This is the method we need to call to fix the valvemaps
     * @memberof ViewManager
     */
  createValveMapFromSelection () {
    // TODO: Run through the current selection and generate the valve map for every
    // vavle that is in the Selection
    const selection = this.tools.MouseSelectTool.currentSelection
    const valves = []
    let connection = null
    // TODO: run though the items
    for (const render_element of selection) {
      // Check if render_element is associated with a VALVE/VALVE3D
      const component = this.currentDevice.getComponentForFeatureID(render_element.featureID)
      if (component !== null) {
        console.log('Component Type:', component.getType())
        const type = component.getType()
        if (type === 'Valve3D' || type === 'Valve') {
          valves.push(component)
        }
      }

      connection = this.currentDevice.getConnectionForFeatureID(render_element.featureID)
    }

    // Add to the valvemap
    for (const valve of valves) {
      let valve_type = false
      if (valve.getType() === 'Valve3D') {
        valve_type = true
      }
      console.log('Adding Valve: ', valve)
      this.currentDevice.insertValve(valve, connection, valve_type)
    }
  }

  /**
     * Activates the corresponding placement tool for the given type of component and returns the active tool
     * @param {*} minttype
     * @returns
     */
  activateComponentPlacementTool (minttype, currentParameters) {
    if (minttype === null) {
      throw new Error('Found null when looking for MINT Type')
    }
    // Cleanup job when activating new tool
    this.view.clearSelectedItems()

    let activeTool = null
    const renderer = ComponentAPI.getRendererForMINT(minttype)
    if (renderer.placementTool === 'componentPositionTool') {
      activeTool = new ComponentPositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
    } else if (renderer.placementTool === 'controlCellPositionTool') {
      activeTool = new ControlCellPositionTool(this, 'ControlCell', 'Basic', currentParameters)
    } else if (renderer.placementTool === 'customComponentPositionTool') {
      activeTool = CustomComponentPositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic')
    } else if (renderer.placementTool === 'positionTool') {
      activeTool = new PositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
    } else if (renderer.placementTool === 'multilayerPositionTool') {
      activeTool = new MultilayerPositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
    } else if (renderer.placementTool === 'valveInsertionTool') {
      activeTool = new ValveInsertionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
    } else if (renderer.placementTool === 'CellPositionTool') {
      activeTool = new CellPositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
    } else if (renderer.placementTool === 'multilevelPositionTool') {
      // TODO: Add pop up window when using the multilevel position tool to get layer indices
      activeTool = new MultilevelPositionTool(this, ComponentAPI.getTypeForMINT(minttype), 'Basic', currentParameters)
      throw new Error('multilevel position tool ui/input elements not set up')
    }

    if (activeTool === null) {
      throw new Error(`Could not initialize the tool ${minttype}`)
    }

    this.mouseAndKeyboardHandler.leftMouseTool = activeTool
    this.mouseAndKeyboardHandler.rightMouseTool = activeTool
    this.mouseAndKeyboardHandler.updateViewMouseEvents()

    return activeTool
  }

  deactivateComponentPlacementTool () {
    console.log('Deactivating Component Placement Tool')
    this.mouseAndKeyboardHandler.leftMouseTool.deactivate()
    this.mouseAndKeyboardHandler.rightMouseTool.deactivate()
    this.resetToDefaultTool()
  }
}
