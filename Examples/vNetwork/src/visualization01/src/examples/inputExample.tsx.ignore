import { useInput } from "@helpers/hooks/useInput";
import React from "react";
import { InputsEnum } from "src/types/inputs";

export const InputExample = () => {
  // Listen to the input "Example Input"
  const exampleInput = useInput(InputsEnum.Example_Input);

  // Listen to the input "Example Input 2"
  const exampleInput2 = useInput(InputsEnum.Example_Input_2);

  return (
    <>
      <div>
        This is an example input 1 which is a Color/Shape and those are provided
        as CSV strings, which the useInput hook will automatically convert into
        an array to decrease code complexity:
        <br />[
        {(exampleInput.length == 0
          ? ""
          : exampleInput.map((val, idx) =>
              idx == exampleInput.length - 1 ? val : val + ", "
            )) ?? "undefined"}
        ]
        <br />
        Length: {exampleInput.length ?? "undefined"}
      </div>
      <br />
      <div>
        This is an example input 2: {exampleInput2?.toString() ?? "undefined"}
      </div>
    </>
  );
};
