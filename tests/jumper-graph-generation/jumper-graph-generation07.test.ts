import { test, expect } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { generateJumperX4Grid } from "lib/JumperGraphSolver/jumper-graph-generator/generateJumperX4Grid"
import { visualizeJumperGraph } from "lib/JumperGraphSolver/visualizeJumperGraph"

test("jumper-graph-generation07 - 1206x4 grid 1x1", () => {
  const jumperX4Grid = generateJumperX4Grid({
    cols: 1,
    rows: 1,
    marginX: 1,
    marginY: 1,
  })
  expect(
    getSvgFromGraphicsObject(visualizeJumperGraph(jumperX4Grid)),
  ).toMatchSvgSnapshot(import.meta.path)
})
