import { defaultLogger, Logger } from './logger';
import { Payload } from './payload';

export interface PayloadCacheConfig {
  onError?: (error: unknown, payload: Payload<unknown, unknown, unknown>) => void;
  onSuccess?: (data: unknown, payload: Payload<unknown, unknown, unknown>) => void;
}

export const DefaultPayloadCacheConfig: PayloadCacheConfig = {
  onError: (error: unknown, payload: Payload<unknown, unknown, unknown>) => {},
  onSuccess: (error: unknown, payload: Payload<unknown, unknown, unknown>) => {},
};

export interface DefaultOptions {}
export const defaultPayloadOptions = {};

export class PayloadCache {
  private logger: Logger;
  private options: DefaultOptions;
  private mountCount: number;
  private payloads: [];
  private payloadsMap: DefaultOptions;
  private config: PayloadCacheConfig;

  constructor(config?: PayloadCacheConfig) {
    this.options = defaultPayloadOptions;
    this.logger = defaultLogger;
    this.config = config || DefaultPayloadCacheConfig;
    this.payloads = [];
    this.payloadsMap = {};

    this.mount();
  }

  public mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
  }
  public unmount() {}
}
