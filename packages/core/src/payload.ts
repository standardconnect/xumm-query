import { Logger } from './logger';
import { PayloadCache } from './payloadCache';
import { PayloadKey } from './types';

export interface XummCache {
  stale: Number;
}

interface PayloadConfig<TQueryFnData, TError, TData, TQueryKey extends QueryKey = QueryKey> {
  cache: PayloadCache;
  queryKey: TQueryKey;
  queryHash: string;
  logger?: Logger;
  options?: QueryOptions<TQueryFnData, TError, TData, TQueryKey>;
  defaultOptions?: QueryOptions<TQueryFnData, TError, TData, TQueryKey>;
  state?: QueryState<TData, TError>;
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
export class Payload<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> {
  queryKey: TPayloadKey;
  queryHash: string;
  options!: QueryOptions<TQueryFnData, TError, TData, TPayloadKey>;
  initialState: PayloadState<TData, TError>;
  revertState?: PayloadState<TData, TError>;
  state: PayloadState<TData, TError>;
  isFetchingOptimistic?: boolean;

  private cache: PayloadCache;
  private logger: Logger;
  private promise?: Promise<TData>;
  private observers: QueryObserver<any, any, any, any, any>[];
  private defaultOptions?: QueryOptions<TQueryFnData, TError, TData, TPayloadKey>;
  private abortSignalConsumed: boolean;

  constructor(config?: PayloadConfig) {
    this.defaultOptions = config.defaultOptions || defaultOptions;
  }
}
