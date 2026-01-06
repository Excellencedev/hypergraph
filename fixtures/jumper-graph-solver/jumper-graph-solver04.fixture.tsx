import { useState, useCallback } from "react"
import { GenericSolverDebugger } from "@tscircuit/solver-utils/react"
import { generateJumperX4Grid } from "lib/JumperGraphSolver/jumper-graph-generator/generateJumperX4Grid"
import { createProblemFromBaseGraph } from "lib/JumperGraphSolver/jumper-graph-generator/createProblemFromBaseGraph"
import { JumperGraphSolver } from "lib/JumperGraphSolver/JumperGraphSolver"

export default () => {
  const [cols, setCols] = useState(1)
  const [rows, setRows] = useState(1)
  const [numCrossings, setNumConnections] = useState(2)
  const [randomSeed, setRandomSeed] = useState(42)
  const [isSearching, setIsSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState("")

  const baseGraph = generateJumperX4Grid({
    cols,
    rows,
    marginX: 1.2,
    marginY: 1.2,
    outerPaddingX: 2,
    outerPaddingY: 2,
    innerColChannelPointCount: 3,
    innerRowChannelPointCount: 3,
    regionsBetweenPads: true,
  })

  const graphWithConnections = createProblemFromBaseGraph({
    baseGraph,
    numCrossings: numCrossings,
    randomSeed,
  })

  const findFailingSeed = useCallback(async () => {
    setIsSearching(true)
    let currentSeed = randomSeed

    const checkSeed = (seed: number): boolean => {
      const graph = createProblemFromBaseGraph({
        baseGraph,
        numCrossings,
        randomSeed: seed,
      })

      const solver = new JumperGraphSolver({
        inputGraph: {
          regions: graph.regions,
          ports: graph.ports,
        },
        inputConnections: graph.connections,
      })

      try {
        solver.solve()
        return solver.solved
      } catch {
        return false
      }
    }

    const searchBatch = () => {
      for (let i = 0; i < 10; i++) {
        currentSeed++
        setSearchStatus(`Testing seed ${currentSeed}...`)

        if (!checkSeed(currentSeed)) {
          setRandomSeed(currentSeed)
          setSearchStatus(`Found failing seed: ${currentSeed}`)
          setIsSearching(false)
          return true
        }
      }
      return false
    }

    const runSearch = () => {
      if (searchBatch()) return
      if (currentSeed < randomSeed + 10000) {
        setTimeout(runSearch, 0)
      } else {
        setSearchStatus("No failing seed found in 10000 attempts")
        setIsSearching(false)
      }
    }

    runSearch()
  }, [baseGraph, numCrossings, randomSeed])

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Cols:{" "}
          <input
            type="number"
            min={1}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>{" "}
        <label>
          Rows:{" "}
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>{" "}
        <label>
          Crossings:{" "}
          <input
            type="number"
            min={1}
            max={26}
            value={numCrossings}
            onChange={(e) => setNumConnections(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>{" "}
        <label>
          Seed:{" "}
          <input
            type="number"
            value={randomSeed}
            onChange={(e) => setRandomSeed(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>{" "}
        <button
          onClick={findFailingSeed}
          disabled={isSearching}
          style={{ marginLeft: 8 }}
        >
          {isSearching ? "Searching..." : "Find Failing Seed"}
        </button>
        {searchStatus && (
          <span style={{ marginLeft: 8, color: "#666" }}>{searchStatus}</span>
        )}
      </div>
      <GenericSolverDebugger
        key={`${cols}-${rows}-${numCrossings}-${randomSeed}`}
        createSolver={() =>
          new JumperGraphSolver({
            inputGraph: {
              regions: graphWithConnections.regions,
              ports: graphWithConnections.ports,
            },
            inputConnections: graphWithConnections.connections,
          })
        }
      />
    </div>
  )
}
