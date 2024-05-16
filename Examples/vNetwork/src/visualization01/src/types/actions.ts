export enum ActionsEnum {
  Node_Click = 'Node Click',
  Edge_Click = 'Edge Click',
  Path_Click = 'Path Click',
}

export interface ActionsTypes {
  [ActionsEnum.Node_Click]: MooDAction
  [ActionsEnum.Edge_Click]: MooDAction
  [ActionsEnum.Path_Click]: MooDAction
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vis {
    type Actions = {
      [key in ActionsEnum]: ActionsTypes[key];
    }
  }
}
