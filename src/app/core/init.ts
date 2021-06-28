type Point = [number, number]

type Segment = number[]

type ConnectionInterchangeV1 = {
    id: string
    name: string
    entity: string
    source: any
    sinks: any
    paths?: [number, number][]
    params: any
    xspan?: number
    yspan?: number
    ports?: any[]
    layer?: string
}
