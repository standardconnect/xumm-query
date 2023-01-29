import { throws } from 'assert';
import { Logger } from './logger';
import { PayloadCache } from './payloadCache';
import { PayloadKey } from './types';

export interface XummCache {
  stale: Number;
}

export type NetworkMode = 'online' | 'always' | 'offlineFirst';

export type PayloadFunction<T = unknown, TPayloadKey extends PayloadKey = PayloadKey> = (
  context: PayloadFunctionContext<TPayloadKey>
) => T | Promise<T>;

export interface QueryFunctionContext<
  TPayloadKey extends PayloadKey = PayloadKey,
  TPageParam = any
> {
  queryKey: TPayloadKey;
  signal?: AbortSignal;
  pageParam?: TPageParam;
  meta: PayloadMeta | undefined;
}

export interface PayloadOptions<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> {
  /**
   * If `false`, failed queries will not retry by default.
   * If `true`, failed queries will retry infinitely., failureCount: num
   * If set to an integer number, e.g. 3, failed queries will retry until the failed query count meets that number.
   * If set to a function `(failureCount, error) => boolean` failed queries will retry until the function returns false.
   */
  retry?: RetryValue<TError>;
  retryDelay?: RetryDelayValue<TError>;
  networkMode?: NetworkMode;
  cacheTime?: number;
  isDataEqual?: (oldData: TData | undefined, newData: TData) => boolean;
  queryFn?: PayloadFunction<TPayloadFnData, TPayloadKey>;
  queryHash?: string;
  payloadKey?: TPayloadKey;
  queryKeyHashFn?: PayloadKeyHashFunction<TPayloadKey>;
  initialData?: TData | InitialDataFunction<TData>;
  initialDataUpdatedAt?: number | (() => number | undefined);
  behavior?: PayloadBehavior<TPayloadFnData, TError, TData>;
  /**
   * Set this to `false` to disable structural sharing between query results.
   * Set this to a function which accepts the old and new data and returns resolved data of the same type to implement custom structural sharing logic.
   * Defaults to `true`.
   */
  structuralSharing?: boolean | ((oldData: TData | undefined, newData: TData) => TData);
  /**
   * This function can be set to automatically get the previous cursor for infinite queries.
   * The result will also be used to determine the value of `hasPreviousPage`.
   */
  getPreviousPageParam?: GetPreviousPageParamFunction<TQueryFnData>;
  /**
   * This function can be set to automatically get the next cursor for infinite queries.
   * The result will also be used to determine the value of `hasNextPage`.
   */
  getNextPageParam?: GetNextPageParamFunction<TQueryFnData>;
  _defaulted?: boolean;
  /**
   * Additional payload to be stored on each query.
   * Use this property to pass information that can be used in other places.
   */
  meta?: QueryMeta;
}

interface PayloadConfig<TPayloadFnData, TError, TData, TQueryKey extends PayloadKey = PayloadKey> {
  cache: PayloadCache;
  payloadKey: TPayloadKey;
  queryHash: string;
  logger?: Logger;
  options?: PayloadOptions<TPayloadFnData, TError, TData, TQueryKey>;
  defaultOptions?: PayloadOptions<TPayloadFnData, TError, TData, TQueryKey>;
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
  private abortSignalConsumed: boolean;

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
}
