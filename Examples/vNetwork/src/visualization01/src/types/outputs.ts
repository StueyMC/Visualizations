export enum OutputsEnum {
  hoverNode = "hoverNode",
  hoverEdge = "hoverEdge",
  hoverPath = "hoverPath",
}

export interface OutputsTypes {
  [OutputsEnum.hoverNode]: Elements,
  [OutputsEnum.hoverEdge]: Elements,
  [OutputsEnum.hoverPath]: Elements
}

declare global {
  namespace Vis {
    type Outputs = {
      [key in OutputsEnum]: OutputsTypes[key];
    }
  }
}