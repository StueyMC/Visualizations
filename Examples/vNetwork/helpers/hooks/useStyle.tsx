import { getVisualizationStyle, setVisualizationStyle } from "@helpers/config";
import { ConfigContext } from "@helpers/context/configContext";
import Logger from "@helpers/logger";
import { ReadonlyOptional } from "@moodtypes/index";
import { useContext, useEffect, useState } from "react";
import { DeepPartial } from "utility-types";

export const updateVisualizationStyleEventKey = "mood-update-style";
export type updateVisualizationStyleEvent = CustomEvent<null>;

/**
 * Because we are creating a new custom event for useStyle we need to update TS's
 *  accepted event types to allow us to execute/listen-to the new event
 */
declare global {
  interface WindowEventMap {
    [updateVisualizationStyleEventKey]: updateVisualizationStyleEvent;
  }
}

/**
 * Hook that allows getting/updating the Custom Visualization style
 * @returns - An object containing the style and a method that can update it
 */
export function useStyle<TStyleOverride extends Vis.Style = Vis.Style>(): [
  readonlyStyle: ReadonlyOptional<TStyleOverride>,
  updateStyle: (
    updateStyleCallback: (style: DeepPartial<TStyleOverride>) => void
  ) => void
] {
  const config = useContext(ConfigContext);
  const [style, setStyle] = useState(getVisualizationStyle());

  useEffect(() => {
    const updateSetStyle = (event: updateVisualizationStyleEvent) => {
      setStyle(getVisualizationStyle());
    };
    document.addEventListener(updateVisualizationStyleEventKey, updateSetStyle);
    return () => {
      document.removeEventListener(
        updateVisualizationStyleEventKey,
        updateSetStyle
      );
    };
  }, [config]);

  return [
    (style ?? {}) as ReadonlyOptional<TStyleOverride>,
    (updateStyleCallback: (style: DeepPartial<TStyleOverride>) => void) => {
      // Get a mutable version of the style and invoke the callback with that
      const newStyle = getVisualizationStyle(true) ?? {};

      updateStyleCallback(newStyle as DeepPartial<TStyleOverride>);

      //Update the config style to be the changed style
      setVisualizationStyle(newStyle);
      Logger.Log(`Updated Custom Visualization Style`);

      //Send an event to any useStyle hook listeners
      document.dispatchEvent(new CustomEvent(updateVisualizationStyleEventKey));
    },
  ];
}
