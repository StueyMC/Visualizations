/**
 * Simple logger class to enable logging to console and/or external listeners only if development mode is enabled
 */
export default class Logger {
  /**
   * Controls if logging to console is ignored or not
   */
  public static developmentMode: boolean = false;

  /**
   * Logs a message to the console if development mode is enabled
   * @param message The message to log to the console
   * @param args Any optional parameters to be logged
   */
  public static Log(message?: any, ...optionalParams: any[]): void {
    if (Logger.developmentMode) {
      optionalParams.length == 0
        ? console.log(message)
        : console.log(message, optionalParams);

      Logger.postToExternalListeners(
        "log",
        Array.from([message, ...optionalParams])
      );
    }
  }

  /**
   * Logs a warning message to the console if development mode is enabled
   * @param message The message to log to the console
   * @param args Any optional parameters to be logged
   */
  public static Warn(message?: any, ...optionalParams: any[]): void {
    if (Logger.developmentMode) {
      optionalParams.length == 0
        ? console.warn(message)
        : console.warn(message, optionalParams);

      Logger.postToExternalListeners(
        "warn",
        Array.from([message, ...optionalParams])
      );
    }
  }

  /**
   * Logs a error message to the console if development mode is enabled
   * @param message The message to log to the console
   * @param args Any optional parameters to be logged
   */
  public static Error(message?: any, ...optionalParams: any[]): void {
    if (Logger.developmentMode) {
      optionalParams.length == 0
        ? console.error(message)
        : console.error(message, optionalParams);

      Logger.postToExternalListeners(
        "error",
        Array.from([message, ...optionalParams])
      );
    }
  }

  /**
   * Post a message to any external listeners
   * @param type - The type of log to post
   * @param data - The data to post
   */
  private static postToExternalListeners(type: string, data: any[]) {
    //Post the message to any external listeners
    window.parent.postMessage(
      JSON.stringify({
        action: "postLoggerMessage",
        type: type,
        data: data,
      }),
      "*"
    );
  }
}
