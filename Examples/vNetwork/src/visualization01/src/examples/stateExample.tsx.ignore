import { ConfigContext } from "@helpers/context/configContext";
import { useVisualizationState } from "@helpers/hooks/useVisualizationState";
import React, { useContext, useRef } from "react";

export const StateExample = () => {
  // Directly read from the config, this is not preferred as mutating
  //  this will not automatically update with the rest of the custom visualization
  //  nor will it update the rest of the custom visualization when values are changed
  const config = useContext(ConfigContext);

  // Get the state of the custom visualization
  //  We can pass a generic type to useVisualizationState to add extra state
  //  to the returned state type if we are breaking out of the Custom Visualization's state config
  const [visualizationState, updateVisualizationState, rawVisualizationState] =
    useVisualizationState<
      Vis.State & {
        typeSafeButNotInConfig: boolean;
      }
    >();
  const visualizationStateKeyRef = useRef<HTMLInputElement>(null);
  const visualizationStateValueRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        <div>Update the state of the custom visualization:</div>
        State is editable: {config.state?.editable}
        <div />
        {rawVisualizationState}
        <div />
        <button
          type="button"
          onClick={() => {
            updateVisualizationState((state: Vis.State) => {
              state.ExampleState = !state.ExampleState;
            });
          }}
        >
          Invert Custom Visualization Example State
        </button>
        <div />
        <button
          type="button"
          onClick={() => {
            updateVisualizationState((state) => {
              state["notTypeSafeAndNotInConfig"] = !(
                state["notTypeSafeAndNotInConfig"] ?? false
              );

              state.typeSafeButNotInConfig = !(
                state.typeSafeButNotInConfig ?? false
              );
            });
          }}
        >
          Invert Custom Visualization non config values state
        </button>
        <br />
        <br />
        <div />
        We can add any values we want to the state however these changes wont be
        type safe
        <div />
        <input ref={visualizationStateKeyRef} type="text" />
        <input ref={visualizationStateValueRef} type="text" />
        <div />
        <button
          type="button"
          onClick={() => {
            updateVisualizationState((state) => {
              if (visualizationStateKeyRef.current?.value == null) return;
              state[visualizationStateKeyRef.current.value] =
                visualizationStateValueRef.current?.value;
            });
          }}
        >
          Add a key/value to the Custom Visualization State
        </button>
      </div>
      <br />
    </>
  );
};
