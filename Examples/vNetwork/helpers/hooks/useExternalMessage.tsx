import { useEffect, useState } from "react";

type InUseMessages =
  | ""
  | "dataChanged"
  | "errorOccurred"
  | "hasAction"
  | "inputChanged"
  | "navigate"
  | "performAction"
  | "ready"
  | "updateOutput"
  | "updateSize"
  | "updateState"
  | "postLoggerMessage";

/**
 * Hooks window.postMessage and window.message listening
 *  to conform to MooDBA expected data to not cause errors
 * @param action - The message to listen to
 * @param targetOrigin - The target origin of the postMessage
 */
export function useExternalMessage<
  TExpectedDataType,
  TMessageAction extends string
>(
  action: TMessageAction extends InUseMessages ? never : TMessageAction,
  targetOrigin: string = "*"
): [
  /**
   * The last data returned from the external message
   */
  data: TExpectedDataType | undefined,
  /**
   * Post a message externally to any listeners in a format
   *  that does not cause MooDBA to error
   * @param message - The data to post externally
   */
  post: (message?: any) => void,
  /**
   * Add a raw callback to the listeners of this external message
   * @param callback - The callback to listen to
   */
  rawOn: (callback: (action: TMessageAction, data: any) => void) => void,
  /**
   * Remove a raw callback from this external message
   * @param callback - The callback to remove
   */
  rawOff: (callback: (action: TMessageAction, data: any) => void) => void
] {
  const [data, setData] = useState<TExpectedDataType>();
  const [callbacks, setCallbacks] = useState<
    Set<(action: string, data: any) => void>
  >(new Set());

  useEffect(() => {
    const messageListener = (ev: MessageEvent<string>) => {
      let parsedMessage: {
        action: string;
        data: any;
      };

      try {
        parsedMessage = JSON.parse(ev.data);
      } catch (error) {
        return;
      }

      if (parsedMessage.action != action) return;

      setData(parsedMessage.data);
      // Execute any callback listeners with the received data
      callbacks.forEach((callback) => callback(action, parsedMessage.data));
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [callbacks, setData, action]);

  function on(callback: (action: TMessageAction, data: any) => void) {
    const newCallbacks = new Set(callbacks);
    newCallbacks.add(callback as (action: string, data: any) => void);
    setCallbacks(newCallbacks);
  }

  function off(callback: (action: TMessageAction, data: any) => void) {
    const newCallbacks = new Set(callbacks);
    newCallbacks.delete(callback as (action: string, data: any) => void);
    setCallbacks(newCallbacks);
  }

  function post(message?: any) {
    window?.parent?.postMessage(
      JSON.stringify({
        action,
        data: message,
      }),
      targetOrigin
    );
  }

  return [data, post, on, off];
}
