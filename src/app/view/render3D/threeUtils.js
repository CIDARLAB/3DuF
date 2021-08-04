import * as THREE from 'three'

export function mergeGeometries (geometries) {
  const merged = new THREE.Geometry()
  for (let i = 0; i < geometries.length; i++) {
    merged.merge(geometries[i])
  }
  return merged
}
