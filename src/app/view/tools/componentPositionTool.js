import PositionTool from './positionTool'
import Registry from '../../core/registry'
import Device from '../../core/device'

export default class ComponentPositionTool extends PositionTool {
  constructor (viewManagerDelegate, typeString, setString, currentParams) {
    super(viewManagerDelegate, typeString, setString, currentParams)
  }

  createNewFeature (point) {
    const featureIDs = []

    const newFeature = Device.makeFeature(this.typeString, {
      position: PositionTool.getTarget(point)
    })
    this.currentFeatureID = newFeature.ID

    Registry.viewManager.addFeature(newFeature)

    featureIDs.push(newFeature.ID)

    const params_to_copy = newFeature.getParams()

    super.createNewComponent(this.typeString, params_to_copy, featureIDs)
    Registry.viewManager.saveDeviceState()
  }
}
