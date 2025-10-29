export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string, logLevel?: LogLevel) {
    this.context = context;
    this.logLevel =
      logLevel || this.getLogLevelFromEnv(process.env.LOG_LEVEL || 'info');
  }

  private getLogLevelFromEnv(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(
        `[DEBUG] [${this.context}] ${this.timestamp()} ${message}`,
        ...args
      );
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(
        `[INFO] [${this.context}] ${this.timestamp()} ${message}`,
        ...args
      );
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(
        `[WARN] [${this.context}] ${this.timestamp()} ${message}`,
        ...args
      );
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(
        `[ERROR] [${this.context}] ${this.timestamp()} ${message}`,
        ...args
      );
    }
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}
