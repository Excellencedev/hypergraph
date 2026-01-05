import { test, expect } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { generateJumperX4Grid } from "lib/JumperGraphSolver/jumper-graph-generator/generateJumperX4Grid"
import { visualizeJumperGraph } from "lib/JumperGraphSolver/visualizeJumperGraph"

test("jumper-graph-generation08 - 1206x4 grid 3x3", () => {
  const jumperX4Grid = generateJumperX4Grid({
    cols: 3,
    rows: 3,
    marginX: 2,
    marginY: 1,
    xChannelPointCount: 3,
    yChannelPointCount: 2,
  })
  expect(
    getSvgFromGraphicsObject(visualizeJumperGraph(jumperX4Grid)),
  ).toMatchSvgSnapshot(import.meta.path)
})
