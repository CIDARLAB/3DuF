import PositionTool from './positionTool'
import { ComponentAPI } from '@/componentAPI'
import Registry from '../../core/registry'
import Device from '../../core/device'

export default class MultilevelPositionTool extends PositionTool {
  constructor (viewManagerDelegate, typeString, setString, flowLayer = Registry.currentLayer, controlLayer = null, intLayer = null, currentParameters = null) {
    super(viewManagerDelegate, typeString, setString, currentParameters)
    this.flowlayer = flowLayer
    this.controllayer = controlLayer
    this.intlayer = intLayer
  }

  createNewFeature (point) {
    const featureIDs = []

    // Set up flow layer component
    const paramvalues = this.getCreationParameters(point)
    let newFeature = Device.makeFeature(this.typeString, paramvalues)
    this.currentFeatureID = newFeature.ID
    this.viewManagerDelegate.addFeature(newFeature, this.flowlayer)

    featureIDs.push(newFeature.ID)

    const params_to_copy = newFeature.getParams()

    let newtypestring
    const paramstoadd = newFeature.getParams()
    // Set up control layer component
    if (ComponentAPI.library[this.typeString + '_control']) {
      newFeature.setParams(paramstoadd)

      this.currentFeatureID = newFeature.ID
      this.viewManagerDelegate.addFeature(newFeature, this.controllayer)

      featureIDs.push(newFeature.ID)
    }

    // Set up integration layer component
    if (ComponentAPI.library[this.typeString + '_integration']) {
      newtypestring = this.typeString + '_integration'
      newFeature = Device.makeFeature(newtypestring, paramvalues)
      newFeature.setParams(paramstoadd)

      this.currentFeatureID = newFeature.ID
      this.viewManagerDelegate.addFeature(newFeature, this.intlayer)

      featureIDs.push(newFeature.ID)
    }

    super.createNewComponent(this.typeString, params_to_copy, featureIDs)
    this.viewManagerDelegate.saveDeviceState()
  }

  showTarget () {
    const target = PositionTool.getTarget(this.lastPoint)
    this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters)
  }
}
