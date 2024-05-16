import * as vNG from 'v-network-graph'
import { Path } from './path'

/**
 * Place the edges within each path in the correct order
 * Each path is validated to ensure that there is a realisable path over
 * all of the edges in it. Invalid paths are left unaltered
 * @param paths the set of paths to process. Edges are reordered in place
 * @param edges the edges for the graph
 * @returns an array of reports, one element for each invalid path
 */
export function orderPathEdges (paths: vNG.Paths, edges: vNG.Edges): string[] {
  const report: string[] = []

  for (const pathId in paths) {
    try {
      const vNGpath = paths[pathId]
      const path = new Path(pathId, vNGpath, edges)
      let errorReport = path.validate()
      if (errorReport === undefined) {
        errorReport = path.orderEdges()
      }

      if (errorReport !== undefined) {
        report.push(errorReport)
      }
    } catch (e) {
      report.push((e.name as string) + ': ' + (e.message as string))
    }
  }

  return report
}
