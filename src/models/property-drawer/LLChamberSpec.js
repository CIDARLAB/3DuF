const LLChamberSpec = [
  {
    name: 'height',
    min: 1,
    max: 50000,
    step: 1,
    units: 'µm',
    value: 250
  },
  {
    name: 'length',
    min: 1,
    max: 50000,
    step: 1,
    units: 'µm',
    value: 500
  },
  {
    name: 'rotation',
    min: 1,
    max: 360,
    step: 1,
    units: '°',
    value: 0
  },
  {
    name: 'width',
    min: 1,
    max: 50000,
    step: 1,
    units: 'µm',
    value: 400
  },
  {
    name: 'spacing',
    min: 1,
    max: 20000,
    step: 1,
    units: 'µm',
    value: 2000
  },
  {
    name: 'numberOfChambers',
    min: 1,
    max: 10000,
    step: 1,
    units: '¹⁰',
    value: 1
  }
]
export default LLChamberSpec
