import { expect, test } from "bun:test"
import { HyperGraphPartialRippingSolver } from "lib/HyperGraphPartialRippingSolver"
import type { HyperGraph, Connection } from "lib/types"

type BasicRegion = {
  regionId: string
  ports: BasicPort[]
  d: Record<string, never>
}

type BasicPort = {
  portId: string
  region1: BasicRegion
  region2: BasicRegion
  d: Record<string, never>
  assignment?: never
  ripCount?: number
}

const buildGraph = (): { graph: HyperGraph; connections: Connection[] } => {
  const regionA: BasicRegion = { regionId: "A", ports: [], d: {} }
  const regionB: BasicRegion = { regionId: "B", ports: [], d: {} }
  const regionC: BasicRegion = { regionId: "C", ports: [], d: {} }
  const regionD: BasicRegion = { regionId: "D", ports: [], d: {} }
  const regionE: BasicRegion = { regionId: "E", ports: [], d: {} }
  const regionF: BasicRegion = { regionId: "F", ports: [], d: {} }
  const regionG: BasicRegion = { regionId: "G", ports: [], d: {} }

  const port1: BasicPort = {
    portId: "P1",
    region1: regionA,
    region2: regionC,
    d: {},
  }
  const port2: BasicPort = {
    portId: "P2",
    region1: regionC,
    region2: regionB,
    d: {},
  }
  const port3: BasicPort = {
    portId: "P3",
    region1: regionA,
    region2: regionD,
    d: {},
  }
  const port4: BasicPort = {
    portId: "P4",
    region1: regionD,
    region2: regionE,
    d: {},
  }
  const port5: BasicPort = {
    portId: "P5",
    region1: regionE,
    region2: regionB,
    d: {},
  }
  const port6: BasicPort = {
    portId: "P6",
    region1: regionA,
    region2: regionF,
    d: {},
  }
  const port7: BasicPort = {
    portId: "P7",
    region1: regionF,
    region2: regionG,
    d: {},
  }
  const port8: BasicPort = {
    portId: "P8",
    region1: regionG,
    region2: regionB,
    d: {},
  }

  regionA.ports.push(port1, port3, port6)
  regionB.ports.push(port2, port5, port8)
  regionC.ports.push(port1, port2)
  regionD.ports.push(port3, port4)
  regionE.ports.push(port4, port5)
  regionF.ports.push(port6, port7)
  regionG.ports.push(port7, port8)

  const graph: HyperGraph = {
    regions: [regionA, regionB, regionC, regionD, regionE, regionF, regionG],
    ports: [port1, port2, port3, port4, port5, port6, port7, port8],
  }

  const connections: Connection[] = [
    {
      connectionId: "conn-1",
      mutuallyConnectedNetworkId: "net-1",
      startRegion: regionA,
      endRegion: regionB,
    },
    {
      connectionId: "conn-2",
      mutuallyConnectedNetworkId: "net-2",
      startRegion: regionA,
      endRegion: regionB,
    },
  ]

  return { graph, connections }
}

class BasicPartialRippingSolver extends HyperGraphPartialRippingSolver<
  BasicRegion,
  BasicPort
> {
  override estimateCostToEnd(): number {
    return 0
  }

  override computeIncreasedRegionCostIfPortsAreUsed(): number {
    return 1
  }

  override getPortUsagePenalty(port: BasicPort): number {
    return (port.ripCount ?? 0) * 5
  }
}

const solveWithThreshold = (ripCostThreshold: number) => {
  const { graph, connections } = buildGraph()
  const solver = new BasicPartialRippingSolver({
    inputGraph: graph,
    inputConnections: connections,
    ripCostThreshold,
  })
  solver.solve()
  return solver.solvedRoutes.map((route) => ({
    connectionId: route.connection.connectionId,
    requiredRip: route.requiredRip,
    portIds: route.path.map((candidate) => candidate.port.portId),
  }))
}

const escapeSvgText = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

test("hypergraph partial ripping defers ripping until threshold", () => {
  const results = {
    thresholdZero: solveWithThreshold(0),
    thresholdTwo: solveWithThreshold(2),
  }

  const payload = escapeSvgText(JSON.stringify(results, null, 2))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text x="10" y="20" font-family="monospace" font-size="12">${payload}</text></svg>`

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
