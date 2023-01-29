import { Client } from './client';
import { Payload, PayloadOptions, PayloadState } from './payload';
import { PayloadKey } from './types';

export interface PayloadObserverOptions<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> extends PayloadOptions<TPayloadFnData, TError, TPayloadData, TPayloadKey> {
  /**
   * Set this to `false` to disable automatic refetching when the query mounts or changes query keys.
   * To refetch the query, use the `refetch` method returned from the `useQuery` instance.
   * Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * The time in milliseconds after data is considered stale.
   * If set to `Infinity`, the data will never be considered stale.
   */
  staleTime?: number;
  /**
   * If set to a number, the query will continuously refetch at this frequency in milliseconds.
   * If set to a function, the function will be executed with the latest data and query to compute a frequency
   * Defaults to `false`.
   */
  refetchInterval?:
    | number
    | false
    | ((
        data: TData | undefined,
        query: Payload<TPayloadFnData, TError, TPayloadData, TPayloadKey>
      ) => number | false);
  /**
   * If set to `true`, the query will continue to refetch while their tab/window is in the background.
   * Defaults to `false`.
   */
  refetchIntervalInBackground?: boolean;
  /**
   * If set to `true`, the query will refetch on window focus if the data is stale.
   * If set to `false`, the query will not refetch on window focus.
   * If set to `'always'`, the query will always refetch on window focus.
   * If set to a function, the function will be executed with the latest data and query to compute the value.
   * Defaults to `true`.
   */
  refetchOnWindowFocus?:
    | boolean
    | 'always'
    | ((query: Payload<TPayloadFnData, TError, TPayloadData, TPayloadKey>) => boolean | 'always');
  /**
   * If set to `true`, the query will refetch on reconnect if the data is stale.
   * If set to `false`, the query will not refetch on reconnect.
   * If set to `'always'`, the query will always refetch on reconnect.
   * If set to a function, the function will be executed with the latest data and query to compute the value.
   * Defaults to the value of `networkOnline` (`true`)
   */
  refetchOnReconnect?:
    | boolean
    | 'always'
    | ((query: Payload<TPayloadFnData, TError, TPayloadData, TPayloadKey>) => boolean | 'always');
  /**
   * If set to `true`, the query will refetch on mount if the data is stale.
   * If set to `false`, will disable additional instances of a query to trigger background refetches.
   * If set to `'always'`, the query will always refetch on mount.
   * If set to a function, the function will be executed with the latest data and query to compute the value
   * Defaults to `true`.
   */
  refetchOnMount?:
    | boolean
    | 'always'
    | ((query: Payload<TPayloadFnData, TError, TPayloadData, TPayloadKey>) => boolean | 'always');
  /**
   * If set to `false`, the query will not be retried on mount if it contains an error.
   * Defaults to `true`.
   */
  retryOnMount?: boolean;
  /**
   * If set, the component will only re-render if any of the listed properties change.
   * When set to `['data', 'error']`, the component will only re-render when the `data` or `error` properties change.
   * When set to `'all'`, the component will re-render whenever a query is updated.
   * By default, access to properties will be tracked, and the component will only re-render when one of the tracked properties change.
   */
  notifyOnChangeProps?: Array<keyof InfiniteQueryObserverResult> | 'all';
  /**
   * This callback will fire any time the query successfully fetches new data.
   */
  onSuccess?: (data: TData) => void;
  /**
   * This callback will fire if the query encounters an error and will be passed the error.
   */
  onError?: (err: TError) => void;
  /**
   * This callback will fire any time the query is either successfully fetched or errors and be passed either the data or error.
   */
  onSettled?: (data: TData | undefined, error: TError | null) => void;
  /**
   * Whether errors should be thrown instead of setting the `error` property.
   * If set to `true` or `suspense` is `true`, all errors will be thrown to the error boundary.
   * If set to `false` and `suspense` is `false`, errors are returned as state.
   * If set to a function, it will be passed the error and the query, and it should return a boolean indicating whether to show the error in an error boundary (`true`) or return the error as state (`false`).
   * Defaults to `false`.
   */
  useErrorBoundary?: UseErrorBoundary<TPayloadFnData, TError, TPayloadData, TPayloadKey>;
  /**
   * This option can be used to transform or select a part of the data returned by the query function.
   */
  select?: (data: TPayloadData) => TData;
  /**
   * If set to `true`, the query will suspend when `status === 'loading'`
   * and throw errors when `status === 'error'`.
   * Defaults to `false`.
   */
  suspense?: boolean;
  /**
   * Set this to `true` to keep the previous `data` when fetching based on a new query key.
   * Defaults to `false`.
   */
  keepPreviousData?: boolean;
  /**
   * If set, this value will be used as the placeholder data for this particular query observer while the query is still in the `loading` data and no initialData has been provided.
   */
  placeholderData?: TPayloadData | PlaceholderDataFunction<TPayloadData>;

  _optimisticResults?: 'optimistic' | 'isRestoring';
}

export class PayloadObserver<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
> extends Subscribable<QueryObserverListener<TData, TError>> {
  options: PayloadObserverOptions<TPayloadFnData, TError, TData, TPayloadData, TPayloadKey>;

  private client: Client;
  private currentQuery!: Payload<TPayloadFnData, TError, TPayloadData, TPayloadKey>;
  private currentQueryInitialState!: PayloadState<TPayloadData, TError>;
  private currentResult!: PayloadObserverResult<TData, TError>;
  private currentResultState?: PayloadState<TPayloadData, TError>;
  private currentResultOptions?: PayloadObserverOptions<
    TPayloadFnData,
    TError,
    TData,
    TPayloadData,
    TPayloadKey
  >;
  private previousQueryResult?: PayloadObserverResult<TData, TError>;
  private selectError: TError | null;
  private selectFn?: (data: TPayloadData) => TData;
  private selectResult?: TData;
  private staleTimeoutId?: ReturnType<typeof setTimeout>;
  private refetchIntervalId?: ReturnType<typeof setInterval>;
  private currentRefetchInterval?: number | false;
  private trackedProps!: Set<keyof PayloadObserverResult>;

  constructor(
    client: Client,
    options: PayloadObserverOptions<TPayloadFnData, TError, TData, TPayloadData, TPayloadKey>
  ) {
    super();

    this.client = client;
    this.options = options;
    this.trackedProps = new Set();
    this.selectError = null;
    this.bindMethods();
    //this.setOptions(options);
  }

  protected bindMethods(): void {
    /*     this.remove = this.remove.bind(this);
    this.refetch = this.refetch.bind(this); */
  }

  protected onSubscribe(): void {
    /*     if (this.listeners.length === 1) {
      this.currentQuery.addObserver(this);

      if (shouldFetchOnMount(this.currentQuery, this.options)) {
        this.executeFetch();
      }

      this.updateTimers();
    } */
  }
}
