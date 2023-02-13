import { defaultLogger, Logger } from './logger';
import { Payload } from './payload';

export interface PayloadCacheConfig {
  onError?: (error: unknown, payload: Payload<unknown, unknown, unknown>) => void;
  onSuccess?: (data: unknown, payload: Payload<unknown, unknown, unknown>) => void;
}

export const DefaultPayloadCacheConfig: PayloadCacheConfig = {
  onError: (error: unknown, payload: Payload<unknown, unknown, unknown>) => {
    defaultLogger.error(error, payload);
  },
  onSuccess: (_error: unknown, payload: Payload<unknown, unknown, unknown>) => {
    defaultLogger.log(payload);
  },
};

export interface DefaultOptions {}
export const defaultPayloadOptions = {};

export class PayloadCache {
  public logger: Logger;
  public options: DefaultOptions;
  private mountCount: number;
  public payloads: [];
  public payloadsMap: DefaultOptions;
  public config: PayloadCacheConfig;

  constructor(config?: PayloadCacheConfig) {
    this.options = defaultPayloadOptions;
    this.logger = defaultLogger;
    this.config = config || DefaultPayloadCacheConfig;
    this.payloads = [];
    this.payloadsMap = {};
    this.mountCount = 0;

    this.mount();
  }

  public mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
  }
  public unmount() {}
}
