import { OutputsEnum } from "../../src/visualization01/src/types/outputs"

export const getOutputs = (): Vis.Outputs => {
  const newObject: any = {};
  let retVal: Vis.Outputs;
  Object.keys(OutputsEnum).forEach(output => {
    newObject[output] = ""
  });
  retVal = {...newObject};
  // Object.assign(retVal, newObject)
  // const retVal = Object.fromEntries(Object.keys(OutputsEnum).map(key => [[key], ""]));
  return retVal;

}
