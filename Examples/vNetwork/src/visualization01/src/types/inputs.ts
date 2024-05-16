export enum InputsEnum {}

export interface InputsTypes {
  [key: string | number | symbol]: never
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vis {
    type Inputs = {
      [key in InputsEnum]: InputsTypes[key];
    }
  }
}
