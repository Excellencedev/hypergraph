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

const renderSvg = (results: {
  thresholdZero: Array<{ connectionId: string; requiredRip: boolean }>
  thresholdTwo: Array<{ connectionId: string; requiredRip: boolean }>
}) => {
  const rowHeight = 40
  const gap = 10
  const leftPadding = 20
  const topPadding = 20
  const barWidth = 260
  const barHeight = 18

  const rows = [
    { label: "thresholdZero", items: results.thresholdZero },
    { label: "thresholdTwo", items: results.thresholdTwo },
  ]

  const height =
    topPadding + rows.length * rowHeight + (rows.length - 1) * gap

  let y = topPadding
  const bars = rows
    .map((row) => {
      const rowY = y
      y += rowHeight + gap
      const label = `<text x="${leftPadding}" y="${
        rowY + 14
      }" font-family="monospace" font-size="12">${row.label}</text>`
      const rects = row.items
        .map((item, index) => {
          const color = item.requiredRip ? "#e74c3c" : "#2ecc71"
          const rectX = leftPadding + 120 + index * (barWidth + 12)
          const rectY = rowY
          const rect = `<rect x="${rectX}" y="${rectY}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" />`
          const text = `<text x="${rectX + 8}" y="${
            rectY + 13
          }" font-family="monospace" font-size="11" fill="#ffffff">${
            item.connectionId
          }${item.requiredRip ? " rip" : " ok"}</text>`
          return `${rect}${text}`
        })
        .join("")
      return `${label}${rects}`
    })
    .join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}">${bars}</svg>`
}

test("hypergraph partial ripping defers ripping until threshold", () => {
  const results = {
    thresholdZero: solveWithThreshold(0),
    thresholdTwo: solveWithThreshold(2),
  }

  const svg = renderSvg({
    thresholdZero: results.thresholdZero.map(({ connectionId, requiredRip }) => ({
      connectionId,
      requiredRip,
    })),
    thresholdTwo: results.thresholdTwo.map(({ connectionId, requiredRip }) => ({
      connectionId,
      requiredRip,
    })),
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
