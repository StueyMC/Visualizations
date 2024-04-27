import { useVisualizationError } from "@helpers/hooks/useVisualizationError";
import React from "react";

export const ErrorExample = () => {
  // Get a reference to the ErrorOccurred method for the Custom Visualization
  const error = useVisualizationError();

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => {
            // Directly call error message without needing a hook
            useVisualizationError("This is an example of a direct error message");

            // Use the hook function to call the error message
            error("This is an example of a hook error message");
          }}
        >
          Send an error to the Custom Visualization
        </button>
      </div>
      <br />
    </>
  );
};
