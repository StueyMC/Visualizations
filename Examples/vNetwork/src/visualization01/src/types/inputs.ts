export enum InputsEnum {}

export interface InputsTypes {
  [key: string | number | symbol]: never;
}

declare global {
  namespace Vis {
    type Inputs = {
      [key in InputsEnum]: InputsTypes[key];
    }
  }
}