import { defaultLogger, Logger } from './logger';

export interface PayloadCache {
  stale: Number;
}

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

export class PayloadCache<T> {
  private cache: PayloadCache;
  private logger: Logger;
  private options: DefaultOptions;
  private mountCount: number;
  private xumm: Xumm;
  private key: string;
  private payloads: T[];
  private payloadsMap: DefaultOptions;

  constructor(config?: PayloadCacheConfig) {
    this.options = defaultPayloadOptions;
    this.logger = defaultLogger;
    this.mount();
    this.config = config || DefaultPayloadCacheConfig;
    this.payloads = [];
    this.payloadsMap = {};
  }

  public mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
  }
  public unmount() {}
}
