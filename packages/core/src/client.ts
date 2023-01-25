import { Xumm } from 'xumm';
import type { Logger } from './logger';
import { defaultLogger } from './logger';

import { XummCache } from './xummCache';

export interface ClientOpts {
  key: string;
  secret?: string;
  config?: ClientConfig;
}

export interface DefaultOptions {
  isMounted: Boolean;
  isAuth: Boolean;
  hasJwt: Boolean;
  isJwtExpired: Boolean;
}

export interface ClientConfig {
  xumm?: Xumm;
  cache?: XummCache;
  logger?: Logger;
  defaultOptions?: DefaultOptions;
}

export const defaultOptions: DefaultOptions = {
  isMounted: false,
  isAuth: false,
  hasJwt: false,
  isJwtExpired: false,
};

export class Client {
  private cache: XummCache;
  private logger: Logger;
  private mountCount: number;
  private xumm: Xumm;
  private key: string;
  private secret?: string;
  private defaultOptions: DefaultOptions;

  constructor({ key, secret, config = {} }: ClientOpts) {
    this.defaultOptions = config.defaultOptions || defaultOptions;
    this.key = key;
    this.secret = secret;
    this.logger = config.logger || defaultLogger;
    this.cache = config.cache || new XummCache();
    this.xumm = config.xumm || new Xumm(this.key, this.secret);
    this.mount();
  }

  public mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
  }
  public unmount() {}
}
