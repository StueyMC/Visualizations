import { ConfigContext } from "@helpers/context/configContext";
import Logger from "@helpers/logger";
import { MooDConfig } from "@moodtypes/index";
import { useContext, useEffect, useState } from "react";

/**
 * Generates an async method that will execute performAction with the correct values and return immediately
 * @param config - The Config to run performAction on
 * @param action - The action to execute
 * @returns - A method that accepts the parameters for performAction and returns a promise
 */
const setupActionMethod = (config: MooDConfig, action: keyof Vis.Actions) => {
  return () => (elementId: string, event: { pageX: number; pageY: number }) => {
    Logger.Log(
      `Performed Action: ${action} with ID: ${elementId}, event: x: ${event.pageX}, y: ${event.pageY}`
    );

    config.functions.performAction(action, elementId, event);
  };
};

/**
 * Hook that allows a custom visualization to perform a MooD action from anywhere
 * @param action - The action to that will be fired
 * @returns - A method that will fire the action requested
 */
export function useAction(
  action: keyof Vis.Actions
): (id: string, event: { pageX: number; pageY: number }) => void {
  const config = useContext(ConfigContext);

  const [invokeAction, setActionFunction] = useState<
    (id: string, event: { pageX: number; pageY: number }) => void
  >(setupActionMethod(config, action));

  useEffect(() => {
    setActionFunction(setupActionMethod(config, action));
  }, [config]);

  return invokeAction;
}
