import { getVisualizationData } from "@helpers/config";
import { ConfigContext } from "@helpers/context/configContext";
import { ReadonlyOptional } from "@moodtypes/index";
import { useContext, useEffect, useState } from "react";
import { DeepPartial } from "utility-types";

export const updateDataEventKey = "mood-update-data";
export type updateDataEvent = CustomEvent<null>;

/**
 * Because we are creating a new custom event for useData we need to update TS's
 *  accepted event types to allow us to execute/listen-to the new event
 */
declare global {
  interface WindowEventMap {
    [updateDataEventKey]: updateDataEvent;
  }
}

/**
 * Hook into the custom visualization's config and listen to any data updates
 * @param accessor - The top level key to get from Vis.Data
 */
export function useData<TDataType>(
  accessor: (data: ReadonlyOptional<Vis.Data>) => TDataType
): [
  data: undefined | ReadonlyOptional<TDataType>,
  getMutableClone: () => undefined | DeepPartial<TDataType>
];

/**
 * Hook into the custom visualization's config and listen to any data updates
 * @param accessor - A method to return the data from Vis.Data
 */
export function useData<TDataType extends keyof Vis.Data>(
  accessor: TDataType
): [
  data: undefined | ReadonlyOptional<Vis.Data[TDataType]>,
  getMutableClone: () => undefined | DeepPartial<Vis.Data[TDataType]>
];

/**
 * Hook into the custom visualization's config and listen to any data updates
 * @param accessor - A top level key or method to return the data from Vis.Data
 */
export function useData<
  TAccessorType extends
    | keyof Vis.Data
    | ((data?: ReadonlyOptional<Vis.Data>) => TDataType | undefined),
  TDataType
>(accessor: TAccessorType): [data: any, getMutableClone: () => any] {
  const config = useContext(ConfigContext);
  const [value, setValue] = useState<any>(
    typeof accessor == "function"
      ? accessor(getVisualizationData())
      : getVisualizationData()![accessor as keyof Vis.Data]
  );

  useEffect(() => {
    const updateSetValue = () => {
      const newValue =
        typeof accessor == "function"
          ? accessor(getVisualizationData())
          : getVisualizationData()?.[accessor as keyof Vis.Data];

      if (newValue != value) setValue(newValue);
    };
    document.addEventListener(updateDataEventKey, updateSetValue);
    return () => {
      document.removeEventListener(updateDataEventKey, updateSetValue);
    };
  }, [config, value]);

  return [
    value,
    () => {
      return structuredClone(
        typeof accessor == "function"
          ? accessor(getVisualizationData(true))
          : getVisualizationData(true)?.[accessor as keyof Vis.Data]
      );
    },
  ];
}
