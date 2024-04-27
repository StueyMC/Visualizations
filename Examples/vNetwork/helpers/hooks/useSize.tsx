import { getVisualizationSize } from "@helpers/config";
import { ConfigContext } from "@helpers/context/configContext";
import { useContext, useEffect, useState } from "react";

export const updateSizeEventKey = "mood-update-size";
export type updateSizeEvent = CustomEvent<null>;

/**
 * Because we are creating a new custom event for useSize we need to update TS's
 *  accepted event types to allow us to execute/listen-to the new event
 */
declare global {
  interface WindowEventMap {
    [updateSizeEventKey]: updateSizeEvent;
  }
}

/**
 * Hook that allows getting/updating the size of a Custom Visualization
 * @returns - An object containing the width/height and a method that can update those
 */
export function useSize(): [
  size: Readonly<{ width: number; height: number }>,
  setSize: (width?: number, height?: number) => void
] {
  const config = useContext(ConfigContext);
  const [size, setSize] = useState(
    getVisualizationSize() ?? { width: 0, height: 0 }
  );

  useEffect(() => {
    const updateSetSize = (event: updateSizeEvent) => {
      setSize(getVisualizationSize()!);
    };
    document.addEventListener(updateSizeEventKey, updateSetSize);
    return () => {
      document.removeEventListener(updateSizeEventKey, updateSetSize);
    };
  }, [config]);

  return [
    size,
    (width?: number, height?: number) =>
      config.functions.updateSize(
        isNaN(width ?? NaN) ? size.width : width!,
        isNaN(height ?? NaN) ? size.height : height!
      ),
  ];
}
