export enum OutputsEnum {}

export interface OutputsTypes {
  [key: string | number | symbol]: never;
}

declare global {
  namespace Vis {
    type Outputs = {
      [key in OutputsEnum]: OutputsTypes[key];
    }
  }
}