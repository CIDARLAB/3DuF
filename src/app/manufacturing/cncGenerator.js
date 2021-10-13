import ManufacturingLayer from './manufacturingLayer'
import DepthFeatureMap from './depthFeatureMap'
import { LogicalLayerType } from '../core/init'
import Device from '../core/device'

/**
 * GNCGenerator class
 */
export default class CNCGenerator {
  /**
     * Default Constructor of GNCGenerator object.
     * @param {Device} device Device object
     * @param {*} viewManagerDelegate
     */
  constructor (device, viewManagerDelegate) {
    this.__device = device
    this.__viewManagerDelegate = viewManagerDelegate

    this.__svgData = new Map()
  }

  /**
     * Gets the SVG output
     * @returns {}
     * @memberof CNCGenerator
     */
  getSVGOutputs () {
    return this.__svgData
  }

  /**
     * Generate the port layers
     * @memberof CNCGenerator
     * @returns {void}
     */
  generatePortLayers () {
    /*
        Step 1 - Get all the layers
        Step 2 - Get all the ports in each of the layers
        Step 3 - Create a manufacturing layer
                -  Populate with the ports
         */
    // let components = this.__device.components;
    const layers = this.__device.layers

    const mfglayers = []

    let isControl = false
    let isIntegrate = false

    for (const i in layers) {
      const layer = layers[i]
      const ports = []

      const features = layer.features

      if (layer.type === LogicalLayerType.CONTROL) {
        isControl = true
      } else if (layer.type === LogicalLayerType.INTEGRATION) {
        isIntegrate = true
      }

      for (const key in features) {
        const feature = features[key]
        // TODO: Include fabtype check also
        if (feature.getType() === 'Port') {
          ports.push(key)
        }
      }

      if (ports.length === 0) {
        continue
      }

      const manufacturinglayer = new ManufacturingLayer('ports_' + layer.name + '_' + i)
      // console.log("manufacturing layer :", manufacturinglayer);

      for (const fi in ports) {
        const featurekey = ports[fi]
        // console.log("Key:", featurekey);
        // console.log("rendered:feature", this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
        const issuccess = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(featurekey))
        if (!issuccess) {
          console.error('Could not find the feature for the corresponding id: ' + featurekey)
        }
      }

      if (isControl) {
        manufacturinglayer.flipX()
        isControl = false
      } else if (isIntegrate) {
        isIntegrate = false
      }

      mfglayers.push(manufacturinglayer)
    }

    console.log('mfglayers:', mfglayers)

    const ref = this
    mfglayers.forEach(function (mfglayer, index) {
      ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG())
      mfglayer.flushData()
    })

    console.log('SVG Outputs:', this.__svgData)
  }

  /**
     * Generates separate mfglayers and svgs for each of the depth layers
     * @returns {void}
     * @memberof CNCGenerator
     */
  generateDepthLayers () {
    /*
        Step 1 - Go through each of the layers
        Step 2 - At each layer:
                   Step 2.1 - Sort each of the features based on their depths
                   Step 2.2 - Generate manufacturing layers for each of the depths

         */
    const layers = this.__device.layers

    const mfglayers = []
    let isControl = false
    let isIntegrate = false

    for (const i in layers) {
      const layer = layers[i]

      const features = layer.features

      if (layer.type === LogicalLayerType.CONTROL) {
        isControl = true
      } else if (layer.type === LogicalLayerType.INTEGRATION) {
        isIntegrate = true
      }

      // Create the depthmap for this
      const featuredepthmap = new DepthFeatureMap(layer.name)

      for (const key in features) {
        const feature = features[key]
        // TODO: Modify the port check
        if (feature.fabType === 'XY' && feature.getType() !== 'Port') {
          let depth = feature.getValue('height')
          if (isIntegrate && feature.getParams().hasOwnProperty('integrate_height')) {
            depth = feature.getValue('integrate_height')
          }
          console.log('Depth of feature: ', key, depth)
          featuredepthmap.addFeature(depth, key)
        }
      }

      // Generate Manufacturing Layers for each depth
      let manufacturinglayer
      for (const depth of featuredepthmap.getDepths()) {
        manufacturinglayer = new ManufacturingLayer(layer.name + '_' + i + '_' + depth)
        const depthfeatures = featuredepthmap.getFeaturesAtDepth(depth)
        for (const j in depthfeatures) {
          const featurekey = depthfeatures[j]

          const issuccess = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(featurekey))
          if (!issuccess) {
            console.error('Could not find the feature for the corresponding id: ' + featurekey)
          }
        }

        if (isControl) {
          manufacturinglayer.flipX()
        } else if (isIntegrate) {
          // TODO: manufacturinglayer.flipX(); if same substrate
        }

        mfglayers.push(manufacturinglayer)
      }

      isControl = false
      isIntegrate = false
    }

    console.log('XY Manufacturing Layers:', mfglayers)
    const ref = this
    mfglayers.forEach(function (mfglayer, index) {
      ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG())
      mfglayer.flushData()
    })
  }

  /**
     * Generates all the edge cuts
     * @returns {void}
     * @memberof CNCGenerator
     */
  generateEdgeLayers () {
    /*
        Step 1 - Go through each of the layers
        Step 2 - Get all the EDGE features in the drawing
        Step 3 - Generate separate SVGs
         */
    const layers = this.__device.layers

    const mfglayers = []

    let manufacturinglayer

    let isControl = false
    let isIntegrate = false

    for (const i in layers) {
      const layer = layers[i]
      manufacturinglayer = new ManufacturingLayer(layer.name + '_' + i + '_EDGE')

      if (layer.type === LogicalLayerType.CONTROL) {
        isControl = true
      } else if (layer.type === LogicalLayerType.INTEGRATION) {
        isIntegrate = true
      }

      const features = layer.features

      for (const key in features) {
        const feature = features[key]
        // TODO: Modify the port check
        if (feature.fabType === 'EDGE') {
          console.log('EDGE Feature: ', key)
          const issuccess = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(key))
          if (!issuccess) {
            console.error('Could not find the feature for the corresponding id: ' + key)
          }
        }
      }

      if (isControl) {
        manufacturinglayer.flipX()
        isControl = false
      } else if (isIntegrate) {
        isIntegrate = false
      }

      mfglayers.push(manufacturinglayer)
    }

    console.log('EDGE Manufacturing Layers:', mfglayers)

    const ref = this
    mfglayers.forEach(function (mfglayer, index) {
      ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG())
      mfglayer.flushData()
    })
  }

  /**
     * Sets the device the CNCGenerator needs to work of
     * @param {Device} currentDevice
     * @returns {void}
     * @memberof CNCGenerator
     */
  setDevice (currentDevice) {
    this.__device = currentDevice
    console.log('Currentdevice:', currentDevice)
  }

  /**
     * Flush all the data
     * @returns {void}
     * @memberof CNCGenerator
     */
  flushData () {
    this.__svgData.clear()
  }
}
