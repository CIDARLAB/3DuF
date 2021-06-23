type Point = [number, number]

type Segment = number[]

type InterchangeV1 = {
    id: string
    name: string
    entity: string
    source: any
    sinks: any
    paths: [number, number][]
    params: any
}
