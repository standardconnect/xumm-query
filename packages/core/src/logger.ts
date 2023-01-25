export interface Logger {
  log: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

type LogFunction = <T>(...args: T[]) => void;

export const defaultLogger: Logger = console;
