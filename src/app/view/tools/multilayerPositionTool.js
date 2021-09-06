import PositionTool from './positionTool'
import { ComponentAPI } from '@/componentAPI'
import Registry from '../../core/registry'
import Device from '../../core/device'

export default class MultilayerPositionTool extends PositionTool {
  constructor (viewManagerDelegate, typeString, setString, currentParameters = null) {
    super(viewManagerDelegate, typeString, setString, currentParameters)
  }

  createNewFeature (point) {
    const featureIDs = []
    const currentlevel = Math.floor(Registry.viewManager.renderLayers.indexOf(Registry.currentLayer) / 3)
    const flowlayer = currentlevel * 3
    const controllayer = currentlevel * 3 + 1
    const intlayer = currentlevel * 3 + 2

    // Set up flow layer component
    const paramvalues = this.getCreationParameters(point)
    let newFeature = Device.makeFeature(this.typeString, paramvalues)
    this.currentFeatureID = newFeature.ID
    this.viewManagerDelegate.addFeature(newFeature, flowlayer)

    featureIDs.push(newFeature.ID)

    const params_to_copy = newFeature.getParams()

    let newtypestring
    const paramstoadd = newFeature.getParams()
    // Set up control layer component
    if (ComponentAPI.library[this.typeString + '_control']) {
      newtypestring = this.typeString + '_control'
      newFeature = Device.makeFeature(newtypestring, {
        position: PositionTool.getTarget(point)
      })
      newFeature.setParams(paramstoadd)

      this.currentFeatureID = newFeature.ID
      this.viewManagerDelegate.addFeature(newFeature, controllayer)

      featureIDs.push(newFeature.ID)
    }
    console.log(ComponentAPI.library[this.typeString + '_integration'])

    // Set up integration layer component
    if (ComponentAPI.library[this.typeString + '_integration']) {
      newtypestring = this.typeString + '_integration'
      newFeature = Device.makeFeature(newtypestring, paramvalues)
      newFeature.setParams(paramstoadd)

      this.currentFeatureID = newFeature.ID
      this.viewManagerDelegate.addFeature(newFeature, intlayer)

      featureIDs.push(newFeature.ID)
    }

    super.createNewComponent(this.typeString, params_to_copy, featureIDs)
    Registry.viewManager.saveDeviceState()
  }

  showTarget () {
    const target = PositionTool.getTarget(this.lastPoint)
    this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters)
  }
}
