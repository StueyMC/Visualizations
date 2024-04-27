import React from "react";

// The following import may fail if a user has not
//  built the custom visualization at least once so we ignore it
//@ts-ignore
import visualizationConfig from "@core/visualization.config.json";

export const JSONExample = () => {
  return (
    <>
      <div>
        This is an example of displaying a JSON file (in this instance the
        custom visualization config):
        <JSONObject property={visualizationConfig} />
      </div>
      <br />
    </>
  );
};

/**
 * Very simple recursive JSON rendering
 */
const JSONObject = ({ property }: { property: any }) => {
  // Check if the property is an object or an array
  const isObject = typeof property === "object" && property !== null;

  if (!isObject) {
    if (typeof property === "string" && property.length == 0)
      return <span>""</span>; // Render empty strings
    return <span>{`${property}`}</span>; // Render primitive values directly
  }

  if (Array.isArray(property)) {
    return (
      <ul>
        {property.map((item, index) => (
          <li key={index}>
            <JSONObject property={item} />
            {index != property.length - 1 && <br />}
          </li>
        ))}
      </ul>
    );
  }

  // Render object properties
  return (
    <ul>
      {Object.entries(property).map(([key, value], index) => (
        <li key={index}>
          <strong>{key}:</strong> <JSONObject property={value} />
        </li>
      ))}
    </ul>
  );
};
