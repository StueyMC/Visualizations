declare namespace Vis {
  interface Data {
    nodes: Array<Vis.Data.Node>,
    links: Array<Vis.Data.Link>,
  }
}

declare namespace Vis.Data {
  
  interface Node extends MooDElement{
    id: ID,
    name: string,
    x?: number,
    y?: number,
  }
  
  interface Link extends MooDElement{
    id: ID,
    name: string,
    source: Vis.Data.EndPoint,
    target: Vis.Data.EndPoint,
  }
  
  interface EndPoint extends MooDElement{
    id: ID,
    name: string,
  }
}