import { useEffect, useState } from 'react';
import { useXummContext } from '../ctx';
import { v4 as uuid } from 'uuid';

interface UseXummOpts {
  jwt: string;
  payload: any;
}

export const useXumm = (opts: UseXummOpts) => {
  const id = uuid();
  const XummContext = useXummContext();

  useEffect(() => {}, []);


  return [value, setValue] as const;
};
