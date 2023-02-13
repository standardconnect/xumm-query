import { Xumm } from 'xumm';
import { defaultLogger, Logger } from './logger';
import { PayloadKey } from './types';
import utils from './utils';

export interface SetStateOptions {
  meta?: any;
}

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

export class Payload {
  payloadKey: PayloadKey;
  payloadHash: string;
  client: Xumm;

  private logger: Logger;

  constructor(config) {
    this.client = config.client;
    this.logger = config.logger || defaultLogger;
    this.payloadKey = config.payloadKey;
    this.payloadHash = config.payloadHash;
  }

  main() {
    this.logger.log(this.payloadKey);
  }

  private listenForExpiration = async (url: string) => {
    let ws = await utils.openWebSocket(url);
    ws.onmessage = (event) => {
      let resp = JSON.parse(event.data);
      if (resp.signed) ws.close();
      if (resp.expires_in_seconds) ctx.expire[1](resp.expires_in_seconds);
    };
  };

  private listenForScan = async (url: string) => {
    console.log('listening for scan...');
    let scanned = await utils.scannedWebSocket(url);
    if (scanned instanceof Error) return ctx.error[1](true);
    ctx.state[1]({ state: 'scanned', response: scanned });
    ctx.scanned[1](true);
  };

  private listenForSign = async (url: string, ctx: IStoreContextProps) => {
    console.log('listening for sign...');
    let signed: any = await utils.signedWebSocket(url);
    if (signed instanceof Error) return ctx.error[1](true);

    if (!ctx.xummData[0]) return;
    const payload_meta = await utils.getMetadata(ctx.xummData[0]);

    ctx.state[1]({ state: 'signed', response: payload_meta?.data.data });
    ctx.signed[1](true);
  };

  private handlePayload = async () => {
    if (!ctx.xummData[0]) return;
    let data = ctx.xummData[0];
    let jwt = await xumm.init(data);

    data.jwt = jwt ? jwt : undefined;
    data.payload = { txjson: data.request };

    const payload_data = await xumm.payload(data);
    data.uuid = payload_data ? payload_data.data.uuid : undefined;
    const payload_meta = await xumm.getMetadata(data);
    ctx.meta[1](payload_meta?.data.data);

    let qr = {
      url: payload_data ? payload_data.data.next.always : undefined,
      qrcode: payload_data ? payload_data.data.refs.qr_png : undefined,
      websocket: payload_data ? payload_data.data.refs.websocket_status : undefined,
      uuid: payload_data ? payload_data.data.uuid : undefined,
    };

    ctx.qr[1](qr);
  };

  private onDemand = async (ctx: IStoreContextProps) => {
    if (!ctx.xummData[0]) return;
    let data = ctx.xummData[0];
    let jwt = await xumm.init(data);

    data.jwt = jwt ? jwt : undefined;
    data.payload = { txjson: data.request };

    const payload_data = await xumm.payload(data);
    data.uuid = payload_data ? payload_data.data.uuid : undefined;
    console.log('this is the payload data... ', data);

    const payload_meta = await xumm.getMetadata(data);
    ctx.meta[1](payload_meta?.data.data);

    let qr = {
      url: payload_data ? payload_data.data.next.always : undefined,
      qrcode: payload_data ? payload_data.data.refs.qr_png : undefined,
      websocket: payload_data ? payload_data.data.refs.websocket_status : undefined,
      uuid: payload_data ? payload_data.data.uuid : undefined,
    };

    ctx.qr[1](qr);
    ctx.xummData[1](data);
    return qr;
  };
}
