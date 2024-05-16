import { MooDConfig } from "@moodtypes/index";
import {
  setVisualizationData,
  setVisualizationState,
  updateFrozenVisualizationData,
  updateFrozenVisualizationInputs,
  updateFrozenVisualizationOutputs,
  updateFrozenVisualizationStyle,
} from "./config";
import Logger from "./logger";

/**
 * Ensure that any config production hooks are set up
 * @param config - The config to set up
 * @returns - The config
 */
export const setupProductionConfig = (config: MooDConfig): MooDConfig => {
  //This allows us to listen to any errors that MooD tells us about
  const errorOccurredSuper = config.functions.errorOccurred;
  config.functions.errorOccurred = (error: String) => {
    errorOccurredSuper?.(error);
    if (Logger.developmentMode) {
      Logger.Error(error);
    } else {
      console.error(error);
    }
  };

  /**
   * The visualization state is stored in a string format
   * This visualization expects that string to be in a JSON format
   */
  if (config?.state != null) {
    try {
      setVisualizationState(
        config?.state?.value != ""
          ? JSON.parse(config?.state?.value)
          : undefined
      );
    } catch (e) {
      const errorMessage =
        e +
        "Custom Visualisation State is not set up correctly," +
        "please ensure that the state is a valid JSON string";
      config.functions.errorOccurred(errorMessage);
      throw errorMessage;
    }
  }

  // Setup all default frozen objects
  updateFrozenVisualizationData();
  updateFrozenVisualizationInputs();
  updateFrozenVisualizationOutputs();
  updateFrozenVisualizationStyle();

  //This allows us to update the state of the Custom Visualization
  const updateStateSuper = config.functions.updateState;
  config.functions.updateState = (state: string) => {
    if (config.state == null)
      return config.functions.errorOccurred(
        "Trying to update Visualization's state before it has been set up"
      );

    if (!config.state.editable) {
      config.functions.errorOccurred(
        "Custom Visualization tried to edit un-editable state, " +
          "please allow the visualization to update state"
      );
      return;
    }

    Logger.Log(`Updated Custom Visualization State with: ${state}`);

    updateStateSuper?.(state);

    config.state.value = state;
    setVisualizationState(JSON.parse(state));
  };

  //This allows us to update the size of the Custom Visualization
  const updateSizeSuper = config.functions.updateSize;
  config.functions.updateSize = (width: number, height: number) => {
    Logger.Log(
      `Updated Custom Visualization Size with Width: ${width}, Height: ${height}`
    );

    updateSizeSuper?.(width, height);

    config.width = width + "px";
    config.height = height + "px";
  };

  //This allows us to update what is inside the inputs whenever they change
  const inputChangedSuper = config.functions.inputChanged;
  config.functions.inputChanged = <TInputKey extends keyof Vis.Inputs>(
    name: TInputKey,
    value: Vis.Inputs[TInputKey]
  ) => {
    Logger.Log(`Updating input: ${name} with value: `, JSON.stringify(value));

    inputChangedSuper?.(name, value);

    if (config.inputs == null)
      return config.functions.errorOccurred(
        "Trying to update Visualization's input before it has been set up"
      );

    config.inputs[name] = value;
    updateFrozenVisualizationInputs();
  };

  //This allows us to update what is inside the outputs whenever they change
  const updateOutputSuper = config.functions.updateOutput;
  config.functions.updateOutput = <TOutputKey extends keyof Vis.Outputs>(
    name: TOutputKey,
    value: MooDOutputRawType<Vis.Outputs, TOutputKey>
  ) => {
    Logger.Log(`Updating output: ${name} with value: `, JSON.stringify(value));

    updateOutputSuper?.(name, value);

    if (config.outputs == null)
      return config.functions.errorOccurred(
        "Trying to update Visualization's output before it has been set up"
      );

    config.outputs[name] = value as any;
    updateFrozenVisualizationOutputs();
  };

  const dataChangedSuper = config.functions.dataChanged;
  config.functions.dataChanged = (data) => {
    Logger.Log("Data has been changed, updating custom visualization");

    dataChangedSuper?.(data);
    setVisualizationData(data);
  };

  return config;
};
