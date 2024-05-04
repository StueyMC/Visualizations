declare namespace Vis {
  interface Data {
    nodes: Array<Vis.Data.Node>,
    edges: Array<Vis.Data.Edge>,
    paths?: Array<Vis.Data.Path>,
  }
}

declare namespace Vis.Data {
  
  interface Node extends MooDElement{
    id: ID,
    name: string,
    x?: number,
    y?: number,
  }
  
  interface Edge extends MooDElement{
    id: ID,
    name: string,
    source: Vis.Data.EndPoint,
    target: Vis.Data.EndPoint,
  }
  
  interface Path extends MooDElement{
    id: ID,
    name: string,
    path: Vis.Data.EndPoint,
    edge: Vis.Data.EndPoint,
  }
  
  interface EndPoint extends MooDElement{
    id: ID,
    name: string,
  }
}