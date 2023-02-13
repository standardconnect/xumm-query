import { Logger } from './logger';
import { PayloadCache } from './cache';
import { PayloadKey } from './types';

export interface XummCache {
  stale: Number;
}

export type NetworkMode = 'online' | 'always' | 'offlineFirst';

export type PayloadFunction<T = unknown, TPayloadKey extends PayloadKey = PayloadKey> = (
  context: PayloadFunctionContext<TPayloadKey>
) => T | Promise<T>;

export interface PayloadFunctionContext<
  TPayloadKey extends PayloadKey = PayloadKey,
  TPageParam = any
> {
  queryKey: TPayloadKey;
  signal?: AbortSignal;
  pageParam?: TPageParam;
  meta: undefined;
}

export interface PayloadOptions<
  TPayloadFnData = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> {
  networkMode?: NetworkMode;
  cacheTime?: number;
  isDataEqual?: (oldData: TData | undefined, newData: TData) => boolean;
  queryFn?: PayloadFunction<TPayloadFnData, TPayloadKey>;
  payloadKey?: TPayloadKey;
  initialData?: TData;
  initialDataUpdatedAt?: number | (() => number | undefined);
}

interface PayloadConfig<TPayloadFnData, TError, TData, TQueryKey extends PayloadKey = PayloadKey> {
  cache: PayloadCache;
  payloadKey: TPayloadKey;
  queryHash: string;
  logger?: Logger;
  options?: PayloadOptions<TPayloadFnData, TData, TQueryKey>;
  defaultOptions?: PayloadOptions<TPayloadFnData, TData, TQueryKey>;
  state?: PayloadState<TData, TError>;
}

export type PayloadStatus = 'Error' | 'Success';

export interface PayloadState<TData = unknown, TError = unknown> {
  data: TData | undefined;
  dataUpdateCount: number;
  dataUpdatedAt: number;
  error: TError | null;
  errorUpdateCount: number;
  errorUpdatedAt: number;
  payloadFailureCount: number;
  payloadFailureReason: TError | null;
  payloadMeta: any;
  isInvalidated: boolean;
  status: PayloadStatus;
  payloadStatus: PayloadStatus;
}

export interface FetchOptions {
  cancelRefetch?: boolean;
  meta?: any;
}

interface FailedAction<TError> {
  type: 'failed';
  failureCount: number;
  error: TError;
}

interface FetchAction {
  type: 'fetch';
  meta?: any;
}

interface SuccessAction<TData> {
  data: TData | undefined;
  type: 'success';
  dataUpdatedAt?: number;
  manual?: boolean;
}

interface ErrorAction<TError> {
  type: 'error';
  error: TError;
}

interface InvalidateAction {
  type: 'invalidate';
}

interface PauseAction {
  type: 'pause';
}

interface ContinueAction {
  type: 'continue';
}

interface SetStateAction<TData, TError> {
  type: 'setState';
  state: PayloadState<TData, TError>;
  setStateOptions?: SetStateOptions;
}

export type Action<TData, TError> =
  | ContinueAction
  | ErrorAction<TError>
  | FailedAction<TError>
  | FetchAction
  | InvalidateAction
  | PauseAction
  | SetStateAction<TData, TError>
  | SuccessAction<TData>;

export interface SetStateOptions {
  meta?: any;
}

export class Payload<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> {
  payloadKey: TPayloadKey;
  queryHash: string;
  options!: PayloadOptions<TQueryFnData, TError, TData, TPayloadKey>;
  initialState: PayloadState<TData, TError>;
  revertState?: PayloadState<TData, TError>;
  state: PayloadState<TData, TError>;
  isFetchingOptimistic?: boolean;

  private cache: PayloadCache;
  private logger: Logger;
  private promise?: Promise<TData>;
  private observers: PayloadObserver<any, any, any, any, any>[];
  private defaultOptions?: PayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>;

  constructor(config: PayloadConfig<TPayloadFnData, TError, TData, TPayloadKey>) {
    this.abortSignalConsumed = false;
    this.defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.cache = config.cache;
    this.logger = config.logger || defaultLogger;
    this.payloadKey = config.payloadKey;
    this.queryHash = config.queryHash;
    this.initialState = config.state || getDefaultState(this.options);
    this.state = this.initialState;
  }

  main() {
    this.logger.log(this.cache, this.payloadKey, this.initialState);
  }

  get meta(): PayloadMeta | undefined {
    return this.options.meta;
  }

  private setOptions(options?: PayloadOptions<TQueryFnData, TError, TData, TPayloadKey>): void {
    this.options = { ...this.defaultOptions, ...options };

    this.updateCacheTime(this.options.cacheTime);
  }

  private updateCacheTime(_time?: number) {
    this.cache;
  }

  private listenForExpiration = async (url: string) => {
    let ws = await this.observers.client.openWebSocket(url);
    ws.onmessage = (event) => {
      let resp = JSON.parse(event.data);
      if (resp.signed) ws.close();
      if (resp.expires_in_seconds) ctx.expire[1](resp.expires_in_seconds);
    };
  };

  private listenForScan = async (url: string) => {
    console.log('listening for scan...');
    let scanned = await xumm.scannedWebSocket(url);
    if (scanned instanceof Error) return ctx.error[1](true);
    ctx.state[1]({ state: 'scanned', response: scanned });
    ctx.scanned[1](true);
  };

  private listenForSign = async (url: string, ctx: IStoreContextProps) => {
    console.log('listening for sign...');
    let signed: any = await xumm.signedWebSocket(url);
    if (signed instanceof Error) return ctx.error[1](true);

    if (!ctx.xummData[0]) return;
    const payload_meta = await xumm.getMetadata(ctx.xummData[0]);

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
