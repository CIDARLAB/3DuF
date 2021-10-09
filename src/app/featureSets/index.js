import * as DXFSolidObjectRenderer2D from '../view/render2D/dxfSolidObjectRenderer2D'
import CustomComponent from '../core/customComponent'
import FeatureSet from './featureSet'
import * as Basic from './basic'
import Registry from '../core/registry'

const registeredFeatureSets = {
  Basic: new FeatureSet(Basic.definitions, Basic.tools, Basic.render2D, Basic.render3D, 'Basic')
}
const typeStrings = {}

// add more sets here!
const requiredSets = {
  Basic: Basic
}

// registerSets(requiredSets);

export function registerSets (sets) {
  for (const key in sets) {
    const name = key
    const set = sets[key]

    const newSet = new FeatureSet(set.definitions, set.tools, set.render2D, set.render3D, name)
    Registry.featureSet = newSet
    registeredFeatureSets[key] = newSet
    Registry.featureDefaults[key] = newSet.getDefaults()
  }
}

export function getSet (setString) {
  return registeredFeatureSets[setString]
}

export function getDefinition (typeString, setString) {
  const set = getSet(setString)
  // console.log("Set:", set);
  if (set !== undefined || set !== null) {
    const def = set.getDefinition(typeString)
    return def
  } else if (setString === 'Custom') {
    return CustomComponent.defaultParameterDefinitions()
  } else {
    return null
  }
}

export function getTool (typeString, setString) {
  const set = getSet(setString)
  return set.getTool(typeString)
}

export function getRender2D (typeString, setString) {
  let set
  if (setString === 'Custom') {
    return DXFSolidObjectRenderer2D.renderCustomComponentFeature
  } else {
    set = getSet(setString)
    return set.getRender2D(typeString)
  }
}

export function getRender3D (typeString, setString) {
  const set = getSet(setString)
  return set.getRender3D(typeString)
}

// export function getComponentPorts(params, typeString, setString = "Basic") {
//     const set = getSet(setString);
//     return set.getComponentPorts(typeString);
// }
