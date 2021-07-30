export function sanitizeJSON (json) {
  const components = json.components

  for (const component of components) {
    const params = component.params

    if (Object.prototype.hasOwnProperty.call(params, 'orientation')) {
      let rotation = 0
      const orientation = params.orientation
      if (orientation === 'V') {
        rotation = 0
      } else {
        rotation = 270
      }
      console.log(`Changed Param of Component '${component.name}' : ${orientation}->${rotation}`)
      delete params.orientation
      params.rotation = rotation
    }
  }

  const features_layers = json.features

  for (const i in features_layers) {
    const feature_layer = features_layers[i]
    const features = feature_layer.features
    console.log(features)
    for (const i in features) {
      const feature = features[i]

      if (Object.prototype.hasOwnProperty.call(feature, 'params')) {
        const params = feature.params

        if (Object.prototype.hasOwnProperty.call(params, 'orientation')) {
          let rotation = 0
          const orientation = params.orientation
          if (orientation === 'V') {
            rotation = 0
          } else {
            rotation = 270
          }
          console.log(`Changed Param of feature '${feature.name}' : ${orientation}->${rotation}`)

          delete params.orientation
          params.rotation = rotation
        }
      }
    }
  }

  return json
}
