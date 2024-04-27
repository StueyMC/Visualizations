export enum ActionsEnum {}

interface ActionsTypes {
  [key: string | number | symbol]: never;
}

declare global {
  namespace Vis {
    type Actions = {
      [key in ActionsEnum]: ActionsTypes[key];
    }
  }
}