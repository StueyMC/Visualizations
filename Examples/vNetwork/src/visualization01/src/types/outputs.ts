export enum OutputsEnum {
  hoverNode = "hoverNode",
  hoverEdge = "hoverEdge",
}

export interface OutputsTypes {
  [OutputsEnum.hoverNode]: Elements,
  [OutputsEnum.hoverEdge]: Elements
}

declare global {
  namespace Vis {
    type Outputs = {
      [key in OutputsEnum]: OutputsTypes[key];
    }
  }
}