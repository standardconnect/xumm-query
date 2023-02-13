import * as React from 'react';

import type { PayloadKey, PayloadObserver } from '@xumm-query/core';
import { useXummClient } from '../ctx/index';
import type { UseBasePayloadOptions } from './types';
import { ensureStaleTime, shouldSuspend, fetchOptimistic } from './suspense';

export function useBase<TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(
  options: UseBasePayloadOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
  Observer: typeof PayloadObserver
) {
  const queryClient = useXummClient({ context: options.context });
  const isRestoring = useIsRestoring();
  const defaultedOptions = queryClient.defaultPayloadOptions(options);

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions._optimisticResults = isRestoring ? 'isRestoring' : 'optimistic';

  // Include callbacks in batch renders
  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  ensureStaleTime(defaultedOptions);

  const [observer] = React.useState(
    () =>
      new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
        queryClient,
        defaultedOptions
      )
  );

  const result = observer.getOptimisticResult(defaultedOptions);

  React.useEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions(defaultedOptions, { listeners: false });
  }, [defaultedOptions, observer]);

  // Handle suspense
  if (shouldSuspend(defaultedOptions, result, isRestoring)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }

  // Handle error boundary
  if (
    getHasError({
      result,
      errorResetBoundary,
      useErrorBoundary: defaultedOptions.useErrorBoundary,
      query: observer.getCurrentQuery(),
    })
  ) {
    throw result.error;
  }

  // Handle result property usage tracking
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
