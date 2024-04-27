import { ConfigContext } from "@helpers/context/configContext";
import Logger from "@helpers/logger";
import { MooDConfig } from "@moodtypes/index";
import { useContext, useEffect, useState } from "react";

/**
 * Create a method that returns the results of hasAction in promise form
 * @param config - The config to run hasAction on
 * @param action - The action to check exists
 * @returns - Returns a promise that resolves with the results of hasAction
 */
const generateHasActionMethod = (
  config: MooDConfig,
  action: keyof Vis.Actions
) => {
  return (elementId: string = "") =>
    new Promise<{ result: boolean; id: string }>((res) => {
      Logger.Log(`Performed HasAction: ${action} with ID: ${elementId}`);

      config.functions.hasAction(action, elementId, (result, id) => {
        res({ result, id });
      });
    });
};

/**
 * Hook that checks if an action exists and is set up in MooD BA
 * @param action - The action to check exists
 * @returns - A method that accepts a elementId and returns a promise
 *  with the results of the hasAction call
 */
export function useHasAction(
  action: keyof Vis.Actions
): (elementId?: string) => Promise<{ result: boolean; id: string }> {
  const config = useContext(ConfigContext);
  const [hasActionMethod, setHasActionMethod] = useState(() =>
    generateHasActionMethod(config, action)
  );

  useEffect(() => {
    setHasActionMethod(() => generateHasActionMethod(config, action));
  }, [config]);

  return hasActionMethod;
}
