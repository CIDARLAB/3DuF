import PositionTool from './positionTool'
import { ComponentAPI } from '@/componentAPI'
import Registry from '../../core/registry'
import Device from '../../core/device'

export default class MultilayerPositionTool extends PositionTool {
  constructor (typeString, setString) {
    super(typeString, setString)
  }

  createNewFeature (point) {
    const featureIDs = []
    const currentlevel = Math.floor(Registry.viewManager.renderLayers.indexOf(Registry.currentLayer) / 3)
    const flowlayer = currentlevel * 3
    const controllayer = currentlevel * 3 + 1
    const intlayer = currentlevel * 3 + 2

    // Set up flow layer component
    let newFeature = Device.makeFeature(this.typeString, {
      position: PositionTool.getTarget(point)
    })
    this.currentFeatureID = newFeature.ID
    Registry.viewManager.addFeature(newFeature, flowlayer)

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
      Registry.viewManager.addFeature(newFeature, controllayer)

      featureIDs.push(newFeature.ID)
    }

    // Set up integration layer component
    if (ComponentAPI.library[this.typeString + '_integration']) {
      newtypestring = this.typeString + '_integration'
      newFeature = Device.makeFeature(newtypestring, {
        position: PositionTool.getTarget(point)
      })
      newFeature.setParams(paramstoadd)

      this.currentFeatureID = newFeature.ID
      Registry.viewManager.addFeature(newFeature, intlayer)

      featureIDs.push(newFeature.ID)
    }

    super.createNewComponent(this.typeString, params_to_copy, featureIDs)
    Registry.viewManager.saveDeviceState()
  }

  showTarget () {
    const target = PositionTool.getTarget(this.lastPoint)
    Registry.viewManager.updateTarget(this.typeString, this.setString, target)
  }
}
