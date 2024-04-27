import { ConfigContext } from "@helpers/context/configContext";
import Logger from "@helpers/logger";
import { useContext, useEffect, useState } from "react";
import { useHasAction } from "./useHasAction";
import { useVisualizationError } from "./useVisualizationError";
import { MooDConfig } from "@moodtypes/index";
/**
 * Generates an async method that will execute performAction with the correct values
 *  and return if the action exists and has been set up in MooD BA
 * @param config - The Config to run performAction on
 * @param action - The action to execute
 * @param hasAction - The hasAction hook to check if the action has been set up
 * @returns - A method that accepts the parameters for performAction and returns a promise
 */
const setupStrictActionMethod = (
  config: MooDConfig,
  action: keyof Vis.Actions,
  hasAction: (elementId?: string) => Promise<{
    result: boolean;
    id: string;
  }>,
  visualizationError: (message: string) => void
) => {
  return () => (elementId: string, event: { pageX: number; pageY: number }) =>
    new Promise<void>((res, rej) => {
      hasAction(elementId)
        .then((result) => {
          if (result.result) {
            Logger.Log(
              `Performed Action: ${action} with ID: ${elementId}, event: x: ${event.pageX}, y: ${event.pageY}`
            );

            config.functions.performAction(action, elementId, event);
            return res();
          }
          rej();
        })
        .catch((error) => {
          Logger.Error(error);
          visualizationError(
            `An error occurred inside hasAction whilst checking ${action} has been set up in MooD BA`
          );
          rej();
        });
    });
};

/**
 * Hook that allows a custom visualization to perform a MooD action from anywhere
 *  if the action has been set up in MooD BA
 * @param action - The action to that will be fired
 * @returns - A method that will fire the action requested
 *  and resolve if available and the hasAction for this action
 */
export function useStrictAction(action: keyof Vis.Actions): [
  action: (
    id: string,
    event: { pageX: number; pageY: number }
  ) => Promise<void>,
  hasAction: (elementId?: string) => Promise<{
    result: boolean;
    id: string;
  }>
] {
  const config = useContext(ConfigContext);
  const hasAction = useHasAction(action);
  const visualizationError = useVisualizationError();
  const [invokeAction, setActionFunction] = useState<
    (id: string, event: { pageX: number; pageY: number }) => Promise<void>
  >(setupStrictActionMethod(config, action, hasAction, visualizationError));

  useEffect(() => {
    setActionFunction(
      setupStrictActionMethod(config, action, hasAction, visualizationError)
    );
  }, [config, hasAction]);

  return [invokeAction, hasAction];
}
