import { HyperGraphSolver } from "../HyperGraphSolver"
import type {
  Connection,
  HyperGraph,
  Region,
  RegionPort,
  SerializedConnection,
  SerializedHyperGraph,
  SolvedRoute,
} from "../types"

export class JumperGraphSolver extends HyperGraphSolver<JRegion, JPort> {
  constructor(input: {
    inputGraph: HyperGraph | SerializedHyperGraph
    inputConnections: (Connection | SerializedConnection)[]
  }) {
    super({ ...input, greedyMultiplier: 1.2, rippingEnabled: true, ripCost: 1 })
  }

  override estimateCostToEnd(port: RegionPort): number {
    return 0
  }
  override getPortUsagePenalty(port: RegionPort): number {
    return 0
  }
  override computeIncreasedRegionCostIfPortsAreUsed(
    region: Region,
    port1: RegionPort,
    port2: RegionPort,
  ): number {
    return 0
  }
  override routeSolvedHook(solvedRoute: SolvedRoute) {}
}
