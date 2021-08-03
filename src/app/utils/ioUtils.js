export function mapToJson (map) {
  console.log('map to json')
  const object = {}
  for (const [k, v] of map) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    object[k] = v
  }
  return object
}

export function jsonToMap (jsonStr) {
  console.log('json to map')
  const ret = new Map()
  for (const key in jsonStr) {
    const value = jsonStr[key]
    console.log('Setting:', key, value)
    ret.set(key, value)
  }
  return ret
}

function fixDeviceDimensionParams (json) {
  if (Object.prototype.hasOwnProperty.call(json, 'params')) {
    if (Object.prototype.hasOwnProperty.call(json.params, 'width')) {
      const xspan = json.params.width
      json.params.xspan = xspan
      delete json.params.width
      console.warn('Fixed issue with incorrect device xspan param')
    }
    if (Object.prototype.hasOwnProperty.call(json.params, 'length')) {
      const yspan = json.params.length
      json.params.yspan = yspan
      delete json.params.length
      console.warn('Fixed issue with incorrect device yspan param')
    }
  }
}

export function sanitizeV1Plus (jsonstr) {
  fixDeviceDimensionParams(jsonstr)
  // TODO: add other proceses
}
