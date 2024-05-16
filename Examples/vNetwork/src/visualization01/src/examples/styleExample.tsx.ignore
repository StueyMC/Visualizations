import { useStyle } from "@helpers/hooks/useStyle";
import React, { useRef } from "react";

export const StyleExample = () => {
  // Get the style of the custom visualization
  //  We can pass a generic type to useStyle to add extra styling
  //  to the returned style type if we are breaking out of the Custom Visualization's style config
  const [style, updateStyle] = useStyle<
    Vis.Style & {
      typeSafeButNotInConfig: boolean;
    }
  >();
  const visualizationStyleKeyRef = useRef<HTMLInputElement>(null);
  const visualizationStyleValueRef = useRef<HTMLInputElement>(null);

  let b: boolean = true;

  return (
    <>
      <div>
        <div>Update the style of the custom visualization:</div>
        {JSON.stringify(style)}
        <div />
        <button
          type="button"
          onClick={() => {
            updateStyle((style) => {
              style.DevelopmentMode = !style.DevelopmentMode;
              return style;
            });
          }}
        >
          Invert Custom Visualization Style
        </button>
        <div />
        <button
          type="button"
          onClick={() => {
            updateStyle(
              (
                style: Vis.Style & {
                  typeSafeButNotInConfig: boolean;
                }
              ) => {
                style["notTypeSafeAndNotInConfig"] = !(
                  style["notTypeSafeAndNotInConfig"] ?? false
                );

                style.typeSafeButNotInConfig = !style.typeSafeButNotInConfig;
              }
            );
          }}
        >
          Invert Custom Visualization non config values
        </button>
        <br />
        <br />
        <div />
        We can add any values we want to the style however these changes wont be
        type safe
        <div />
        <input ref={visualizationStyleKeyRef} type="text" />
        <input ref={visualizationStyleValueRef} type="text" />
        <div />
        <button
          type="button"
          onClick={() => {
            updateStyle((style) => {
              if (visualizationStyleKeyRef?.current?.value == null) return;
              style[visualizationStyleKeyRef.current.value] =
                visualizationStyleValueRef.current!.value;
            });
          }}
        >
          Add a key/value to the Custom Visualization Style
        </button>
      </div>
      <br />
    </>
  );
};
