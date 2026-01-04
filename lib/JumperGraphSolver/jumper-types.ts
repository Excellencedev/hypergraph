import type { Region, RegionPort } from "../types"
import type { Bounds } from "./Bounds"

export interface JRegion extends Region {
  d: {
    bounds: Bounds
  }
}
export interface JPort extends RegionPort {}
