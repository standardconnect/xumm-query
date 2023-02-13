import { Xumm } from 'xumm';
import type { Logger } from './logger';
import { defaultLogger } from './logger';

export interface ClientOpts {
  key: string;
  secret?: string;
  config?: ClientConfig;
  userAgent?: NavigatorID['userAgent'];
}

export interface DefaultOptions {
  isMounted: Boolean;
  isAuth: Boolean;
  hasJwt: Boolean;
  isJwtExpired: Boolean;
}

export interface ClientConfig {
  xumm?: Xumm;
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
  public logger: Logger;
  public mountCount: number = 0;
  public xumm?: Xumm;
  private key: string;
  private secret?: string;
  private userAgent: NavigatorID['userAgent'];
  public defaultOptions: DefaultOptions;

  constructor({ key, secret, userAgent, config = {} }: ClientOpts) {
    this.defaultOptions = config.defaultOptions || defaultOptions;
    this.key = key;
    this.secret = secret;
    this.logger = config.logger || defaultLogger;
    this.xumm = config.xumm || new Xumm(this.key, this.secret);
    this.userAgent = userAgent || navigator.userAgent;
    this.mount();
  }

  public mount() {
    this.mountCount++;
    defaultOptions.isMounted = true;
    if (this.xumm) this.setEnvironment(this.xumm);
  }

  public setEnvironment = (sdk: Xumm) => {
    if (typeof window === 'undefined') return (sdk.runtime.cli = true);
    if (this.isBrowser()) return (sdk.runtime.browser = true);
    if (this.isXApp()) {
      let params = new URL(window.location.href).searchParams;
      let xAppToken = params.get('xAppToken');
      this.logger.log(xAppToken);
      return (sdk.runtime.xapp = true);
    }
    return;
  };

  public unmount = () => {
    defaultOptions.isMounted = false;
    this.xumm = undefined;
  };

  public isAndroid = () => Boolean(this.userAgent.match(/Android/i));
  public isIos = () => Boolean(this.userAgent.match(/iPhone|iPad|iPod/i));
  public isOpera = () => Boolean(this.userAgent.match(/Opera Mini/i));
  public isWindows = () => Boolean(this.userAgent.match(/IEMobile/i));
  public isSSR = () => Boolean(this.userAgent.match(/SSR/i));
  public isXApp = () => Boolean(this.userAgent.match(/xumm/i));
  public isMobile = () =>
    Boolean(this.isAndroid() || this.isIos() || this.isOpera() || this.isWindows());
  public isDesktop = () => Boolean(!this.isMobile() && !this.isSSR());
  public isBrowser = () => Boolean(!this.isXApp() && !this.isSSR());
}
