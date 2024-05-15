import * as vNG from 'v-network-graph'

export class Edge {
  readonly id: string
  readonly source: string
  readonly target: string
  protected traversed: boolean

  constructor (edgeId: string, edge: vNG.Edge) {
    this.id = edgeId
    this.source = edge.source
    this.target = edge.target
    this.traversed = false
  }

  public traverse (): void {
    this.traversed = true
  }

  public isTraversed (): boolean {
    return this.traversed
  }
}
