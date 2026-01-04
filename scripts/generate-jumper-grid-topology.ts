import type { JPort, JRegion } from "../lib/JumperGraphSolver/jumper-types"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { JumperGraphSolver } from "../lib/JumperGraphSolver/JumperGraphSolver"
import { visualizeJumperGraph } from "../lib/JumperGraphSolver/visualizeJumperGraph"

const dims0603 = {
  padToPad: 1.65,
  padLength: 0.8,
  padWidth: 0.95,
}

// There are two pads, each pad is a region. Each pad has 3 ports
// that are on the outer edges
// There is a region between the two pads (the underjumper region)
// that does not have ports to the pads (because using the pads and
// underjumper is a of jumper)
// There are then 13 regions surrounding all these regions along
// the tops and edges
// for a total of 16 regions/jumper
// General regions have points that connect the regions on the edge
// of each region they're adjacent to (but not diagonal from)

export const generateSingleJumperRegions = ({
  center,
  idPrefix,
}: {
  center: { x: number; y: number }
  idPrefix: string
}) => {
  const regions: JRegion[] = []
  const ports: JPort[] = []

  // TODO

  return {
    regions,
    ports,
  }
}

const singleJumperTopology = generateSingleJumperRegions({
  center: { x: 0, y: 0 },
  idPrefix: "singleJumper",
})
Bun.write(
  "singlejumper.svg",
  getSvgFromGraphicsObject(
    visualizeJumperGraph({
      ports: singleJumperTopology.ports,
      regions: singleJumperTopology.regions,
    }),
  ),
)
