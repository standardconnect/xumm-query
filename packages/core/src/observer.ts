import { defaultLogger, Logger } from './logger';
import type { Client } from './client';

export interface SetStateOptions {
  meta?: any;
}

export interface DefaultConfig {
  client: Client;
  userAgent?: NavigatorID['userAgent'];
  logger: Logger;
}

export class PayloadObserver {
  private client: Client;
  private logger: Logger;

  constructor(config: DefaultConfig) {
    this.logger = config.logger || defaultLogger;
    this.client = config.client;
    this.main();
  }

  main = () => {
    this.logger.log(this.client);
  };
}
