import { useEffect, useState } from 'react';
import useXummContext from '../ctx';
import { v4 as uuid } from 'uuid';

interface UseXummOpts {
  jwt: string;
  payload: any;
}

import type { PayloadFunction, PayloadKey } from '@xumm-query/core';
import { parsePayloadArgs, PayloadObserver } from '@xumm-query/core';
import type { DefinedUseQueryResult, UsePayloadOptions, UsePayloadResult } from './types';
import { useBase } from './useBase';

// HOOK

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  options: Omit<UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>, 'initialData'> & {
    initialData?: () => undefined;
  }
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  options: Omit<UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>, 'initialData'> & {
    initialData: TPayloadFnData | (() => TPayloadFnData);
  }
): DefinedUseQueryResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  options: UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  options?: Omit<
    UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
    'payloadKey' | 'initialData'
  > & { initialData?: () => undefined }
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  options?: Omit<
    UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
    'payloadKey' | 'initialData'
  > & { initialData: TPayloadFnData | (() => TPayloadFnData) }
): DefinedUseQueryResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  options?: Omit<UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>, 'payloadKey'>
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  payloadFn: PayloadFunction<TPayloadFnData, TPayloadKey>,
  options?: Omit<
    UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
    'payloadKey' | 'payloadFn' | 'initialData'
  > & { initialData?: () => undefined }
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  payloadFn: PayloadFunction<TPayloadFnData, TPayloadKey>,
  options?: Omit<
    UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
    'payloadKey' | 'payloadFn' | 'initialData'
  > & { initialData: TPayloadFnData | (() => TPayloadFnData) }
): DefinedUseQueryResult<TData, TError>;

export function useXumm<
  TPayloadFnData = unknown,
  TError = unknown,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  payloadKey: TPayloadKey,
  payloadFn: PayloadFunction<TPayloadFnData, TPayloadKey>,
  options?: Omit<
    UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
    'payloadKey' | 'payloadFn'
  >
): UsePayloadResult<TData, TError>;

export function useXumm<
  TPayloadFnData,
  TError,
  TData = TPayloadFnData,
  TPayloadKey extends PayloadKey = PayloadKey
>(
  arg1: TPayloadKey | UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
  arg2?:
    | PayloadFunction<TPayloadFnData, TPayloadKey>
    | UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>,
  arg3?: UsePayloadOptions<TPayloadFnData, TError, TData, TPayloadKey>
): UsePayloadResult<TData, TError> {
  const parsedOptions = parsePayloadArgs(arg1, arg2, arg3);
  return useBase(parsedOptions, PayloadObserver);
}
