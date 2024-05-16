import { useExternalMessage } from "@helpers/hooks/useExternalMessage";
import React, { useRef } from "react";

export const ExternalMessageExample = () => {
  // Get a reference to the window message handler but configured for Custom Visualization / MooDBA
  const [dataMessageToExternal, postMessageToExternal] = useExternalMessage<
    string,
    "MessageToExternal"
  >("MessageToExternal");
  const messageRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        This is an example of using "MessageToExternal" External Message Data:{" "}
        <input ref={messageRef} type="text" />
        <div />
        <br />
        <button
          type="button"
          onClick={() => {
            postMessageToExternal(messageRef.current?.value);
          }}
        >
          Post a "MessageToExternal" message to the parent page of the the
          Custom Visualization
        </button>
      </div>
      <br />
      <div>Last received message: {dataMessageToExternal}</div>
      <br />
      <div>
        Use something similar to the following code to respond to a message:
      </div>
      <div
        style={{
          whiteSpace: "pre",
          padding: "5px",
          backgroundColor: "lightgray",
        }}
      >
        <code>
          {
            // window.addEventListener("message", (event) => {
            //   let message = null;
            //   try {
            //     message = JSON.parse(event.data);
            //   } catch {
            //     // If the message is not in the expected format, then ignore it
            //     return;
            //   }
            //
            //   // This is an example function that returns the same data back
            //   if (message.action === "MessageToExternal") {
            //     event.source.postMessage(
            //       JSON.stringify({
            //         action: "MessageToExternal",
            //         data: message.data,
            //       }),
            //       "*"
            //     );
            //   }
            // });
          }
          <span>{'window.addEventListener("message", (event) => {\n'}</span>
          <span>{"    let message = null;\n"}</span>
          <span>{"    try {\n"}</span>
          <span>{"        message = JSON.parse(event.data);\n"}</span>
          <span>{"    } catch {\n"}</span>
          <span>
            {
              "        // If the message is not in the expected format, then ignore it\n"
            }
          </span>
          <span>{"        return;\n"}</span>
          <span>{"    }\n\n"}</span>
          <span>
            {
              "    // This is an example function that returns the same data back\n"
            }
          </span>
          <span>{'    if (message.action == "MessageToExternal") {\n'}</span>
          <span>{"        event.source.postMessage(\n"}</span>
          <span>{"            JSON.stringify({\n"}</span>
          <span>{'                action: "MessageToExternal",\n'}</span>
          <span>{"                data: message.data,\n"}</span>
          <span>{"            }),\n"}</span>
          <span>{'            "*"\n'}</span>
          <span>{"        );\n"}</span>
          <span>{"    }\n"}</span>
          <span>{"});\n"}</span>
        </code>
      </div>
      <br />
    </>
  );
};
