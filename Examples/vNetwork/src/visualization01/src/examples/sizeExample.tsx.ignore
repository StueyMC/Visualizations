import { useSize } from "@helpers/hooks/useSize";
import React, { useRef } from "react";

export const SizeExample = () => {
  // Get the size of the custom visualization and a method to update this size
  //  Updating the size of a custom visualization requires overflow to be enabled
  //  in MooD BA for the visualization, this may be an experimental feature
  const [size, setSize] = useSize();
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        <div>Current Size:</div>
        <div>Width: {size.width}</div>
        <div>Height: {size.height}</div>
        <br />
        <div>Update the size of the custom visualization:</div>
        Width: <input ref={widthRef} type="number" />
        <div />
        Height: <input ref={heightRef} type="number" />
        <div />
        <button
          type="button"
          onClick={() => {
            setSize(
              widthRef.current == null
                ? undefined
                : parseFloat(widthRef.current?.value),
              heightRef.current == null
                ? undefined
                : parseFloat(heightRef.current?.value)
            );
          }}
        >
          Update Custom Visualization Size
        </button>
      </div>
      <br />
    </>
  );
};
