import { ConfigContext } from "@helpers/context/configContext";
import React, { useContext } from "react";

export const ConfigExample = () => {
  // Directly read from the config, this is not preferred as mutating
  //  this will not automatically update with the rest of the custom visualization
  //  nor will it update the rest of the custom visualization when values are changed
  const config = useContext(ConfigContext);

  return (
    <>
      <div>
        This is an example entrypoint for a Custom Visualization with:
        <div> a version number of: {config.version}</div>
        <div> a width of: {config.width} </div>
        <div> a height of: {config.height}</div>
      </div>
      <br />
    </>
  );
};
