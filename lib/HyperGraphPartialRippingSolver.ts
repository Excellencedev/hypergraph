import type { Connection, HyperGraph, SerializedConnection } from "./types"
import type { Candidate, Region, RegionPort, SerializedHyperGraph } from "./types"
import { HyperGraphSolver } from "./HyperGraphSolver"

export type HyperGraphPartialRippingInput = {
  inputGraph: HyperGraph | SerializedHyperGraph
  inputConnections: (Connection | SerializedConnection)[]
  greedyMultiplier?: number
  ripCost?: number
  rippingEnabled?: boolean
  ripCostThreshold?: number
}

export class HyperGraphPartialRippingSolver<
  RegionType extends Region = Region,
  RegionPortType extends RegionPort = RegionPort,
  CandidateType extends Candidate<RegionType, RegionPortType> = Candidate<
    RegionType,
    RegionPortType
  >,
> extends HyperGraphSolver<RegionType, RegionPortType, CandidateType> {
  override getSolverName(): string {
    return "HyperGraphPartialRippingSolver"
  }

  ripCostThreshold = 0

  constructor(input: HyperGraphPartialRippingInput) {
    super({
      ...input,
      rippingEnabled: input.rippingEnabled ?? true,
    })
    this.ripCostThreshold = input.ripCostThreshold ?? this.ripCostThreshold
  }

  override shouldAllowRip(candidate: CandidateType): boolean {
    const priorCost = candidate.parent?.g ?? 0
    return priorCost >= this.ripCostThreshold
  }
}
