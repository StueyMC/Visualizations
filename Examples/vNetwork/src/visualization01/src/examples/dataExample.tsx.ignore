import { useData } from "@helpers/hooks/useData";
import React from "react";
import { DeepPartial, DeepReadonly } from "utility-types";

export const DataExample = () => {
  // Get the data for the first ExampleVariable by using the property name
  const [exampleVariable1] = useData("ExampleVariable1");

  // Get the first valid data for the third ExampleVariable if it has a value
  const [exampleVariable3] = useData((data) => {
    for (let i = 0; i < (data?.ExampleVariable3?.length ?? 0); i++) {
      if (data?.ExampleVariable3?.[i].Value != null)
        return data.ExampleVariable3[i];
    }
    return undefined;
  });

  return (
    <>
      <div>
        This is an example data configuartion variable 1:{" "}
        {exampleVariable1 ?? "undefined"}
      </div>
      <br />
      <div>
        This is an example data configuartion variable 3:{" "}
        {exampleVariable3?.key ?? "undefined"}
      </div>
      <br />
    </>
  );
};
