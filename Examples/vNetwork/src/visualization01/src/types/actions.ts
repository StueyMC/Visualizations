export enum ActionsEnum {
  Node_Click = "Node Click",
  Edge_Click = "Edge Click",
}

export interface ActionsTypes {
  [ActionsEnum.Node_Click]: MooDAction,
  [ActionsEnum.Edge_Click]: MooDAction,
}

declare global {
  namespace Vis {
    type Actions = {
      [key in ActionsEnum]: ActionsTypes[key];
    }
  }
}