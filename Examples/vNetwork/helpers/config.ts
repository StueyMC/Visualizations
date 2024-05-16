import { DeepPartial, DeepReadonly } from "utility-types";
import { setupDevelopmentConfig } from "./development";
import Logger from "./logger";
import { setupProductionConfig } from "./production";
import { MooDConfig, ReadonlyOptional } from "@moodtypes/index";
import { InputsEnum } from "@core/src/types/inputs";
import { _DeepReadonlyObject } from "utility-types/dist/mapped-types";
import { OutputsEnum } from "@core/src/types/outputs";

/**
 * Recursively deep freeze an object with circular references
 * @param obj - The object to deep freeze
 */
export const deepFreeze = (obj: any) => {
  if (obj == null) return undefined;
  Object.freeze(obj);
  Object.values(obj)
    .filter((prop) => !Object.isFrozen(prop))
    .forEach(deepFreeze);
};

/**
 * Store the mutable version of the custom visualization's config
 */
let visualizationConfig: MooDConfig;

/**
 * Return the MooD config
 */
export const getVisualizationConfig = () => {
  if (visualizationConfig == null)
    throw "Unable to get Visualization config because it hasn't been set up yet";

  return visualizationConfig;
};

/**
 * Set up the config and stores it to a variable not exposed
 */
export const setVisualizationConfig = (config: MooDConfig) => {
  visualizationConfig = config;
  setupProductionConfig(setupDevelopmentConfig(config));
};

/**
 * Store the immutable version of the custom visualization's data
 */
let frozenVisualizationData: DeepReadonly<Vis.Data> | undefined;

/**
 * Return the MooD config's data variable
 * @param mutable - Determines if the returned style is the original mutable or a frozen copy
 */
export const getVisualizationData = <TBoolean extends false | true>(
  mutable?: TBoolean
): TBoolean extends false
  ? ReadonlyOptional<Vis.Data> | undefined
  : DeepPartial<Vis.Data> | undefined => {
  if (!mutable) {
    if (frozenVisualizationData == null) updateFrozenVisualizationData();
    return frozenVisualizationData as Vis.Data;
  } else {
    return getVisualizationConfig().data;
  }
};

/**
 * Update config.data to a new data object and let useData hooks know
 * @param data - The data to set the config.data to
 */
export const setVisualizationData = (data: Vis.Data) => {
  getVisualizationConfig().data = data;
  updateFrozenVisualizationData();
};

/**
 * Clone and deep freeze the visualization data into frozenVisualizationData
 */
export const updateFrozenVisualizationData = () => {
  const dataClone = structuredClone(getVisualizationConfig().data);
  deepFreeze(dataClone);
  frozenVisualizationData = dataClone as DeepReadonly<Vis.Data>;
};

/**
 * Store the immutable version of the custom visualization's style
 */
let frozenVisualizationStyle: ReadonlyOptional<Vis.Style> | undefined;

/**
 * Return the MooD config's style variable
 * @param mutable - Determines if the returned style is the original mutable or a frozen copy
 */
export const getVisualizationStyle = <TBoolean extends false | true>(
  mutable?: TBoolean
): TBoolean extends false
  ? ReadonlyOptional<Vis.Style> | undefined
  : DeepPartial<Vis.Style> | undefined => {
  if (!mutable) {
    if (frozenVisualizationStyle == null) updateFrozenVisualizationStyle();
    return frozenVisualizationStyle;
  } else {
    return visualizationConfig?.style;
  }
};

/**
 * Update config.style to a new style object and let useStyle hooks know
 * @param style - The style to set the config.style to
 */
export const setVisualizationStyle = (style: DeepPartial<Vis.Style>) => {
  getVisualizationConfig().style = style as Vis.Style;
  updateFrozenVisualizationStyle();

  //Update logger development mode in case it has changed
  Logger.developmentMode =
    typeof (style.DevelopmentMode ?? false) != "boolean"
      ? false
      : style.DevelopmentMode!;
};

/**
 * Clone and deep freeze the visualization style into frozenVisualizationStyle
 */
export const updateFrozenVisualizationStyle = () => {
  const styleClone = structuredClone(getVisualizationConfig().style);
  deepFreeze(styleClone);
  frozenVisualizationStyle = styleClone;
};

/**
 * Store the mutable version of the custom visualization's state
 */
let visualizationState: DeepPartial<Vis.State> | undefined;

/**
 * Store the immutable version of the custom visualization's state
 */
let frozenVisualizationState: ReadonlyOptional<Vis.State> | undefined;

/**
 * Return the MooD config's state variable
 * @param mutable - Determines if the returned state is the original mutable or a frozen copy
 */
export const getVisualizationState = <TBoolean extends false | true>(
  mutable?: TBoolean
): TBoolean extends false
  ? ReadonlyOptional<Vis.State> | undefined
  : DeepPartial<Vis.State> | undefined => {
  if (!mutable) {
    if (frozenVisualizationState == null) updateFrozenVisualizationState();

    return frozenVisualizationState;
  } else {
    return visualizationState;
  }
};

/**
 * Update state to a new state object and let useState hooks know
 * @param state - The state to set the custom visualization state to
 */
export const setVisualizationState = (state: Vis.State) => {
  visualizationState = state;
  updateFrozenVisualizationState();
};

/**
 * Clone and deep freeze the visualization state into frozenVisualizationState
 */
export const updateFrozenVisualizationState = () => {
  const stateClone = structuredClone(visualizationState);
  deepFreeze(stateClone);
  frozenVisualizationState = stateClone as ReadonlyOptional<Vis.State>;
};

/**
 * Store the immutable version of the custom visualization's inputs
 */
let frozenVisualizationInputs: DeepReadonly<Vis.Inputs> | undefined;

/**
 * Return the MooD config's inputs variable
 */
export const getVisualizationInputs = (): DeepReadonly<Vis.Inputs> extends
  | _DeepReadonlyObject<unknown>
  | undefined
  ? { [key in InputsEnum]: any }
  : DeepReadonly<Vis.Inputs> | undefined => {
  if (frozenVisualizationInputs == null) updateFrozenVisualizationData();
  return frozenVisualizationInputs as DeepReadonly<Vis.Inputs>;
};

/**
 * Clone and deep freeze the visualization inputs into frozenVisualizationInputs
 */
export const updateFrozenVisualizationInputs = () => {
  const inputsClone = structuredClone(getVisualizationConfig().inputs);
  deepFreeze(inputsClone);
  frozenVisualizationInputs = inputsClone as DeepReadonly<Vis.Inputs>;
};

/**
 * Store the immutable version of the custom visualization's outputs
 */
let frozenVisualizationOutputs: DeepReadonly<Vis.Outputs> | undefined;

/**
 * Return the MooD config's outputs variable
 */
export const getVisualizationOutputs = (): DeepReadonly<Vis.Outputs> extends
  | _DeepReadonlyObject<unknown>
  | undefined
  ? { [key in OutputsEnum]: any }
  : DeepReadonly<Vis.Outputs> | undefined => {
  if (frozenVisualizationOutputs == null) updateFrozenVisualizationData();
  return frozenVisualizationOutputs as DeepReadonly<Vis.Outputs>;
};

/**
 * Clone and deep freeze the visualization outputs into frozenVisualizationOutputs
 */
export const updateFrozenVisualizationOutputs = () => {
  const outputsClone = structuredClone(getVisualizationConfig().outputs);
  deepFreeze(outputsClone);
  frozenVisualizationOutputs = outputsClone as DeepReadonly<Vis.Outputs>;
};
