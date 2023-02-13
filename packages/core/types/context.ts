import { Dispatch, SetStateAction } from 'react';
import { Client } from 'xrpl';

interface Query {
  isLoading: boolean;
  data: any;
  isFetched: boolean;
  refetch: () => void;
  isStale: boolean;
  isError: boolean;
}

export interface IStoreContextProps {
  data: [any, Dispatch<SetStateAction<any>>];
  jwt: [string | undefined, Dispatch<SetStateAction<string | undefined>>];
  wallet: readonly [undefined | string, Dispatch<SetStateAction<undefined | string>>];
  theme: readonly [undefined | string, Dispatch<SetStateAction<undefined | string>>];
  tokenData: [any, Dispatch<SetStateAction<any>>];
  network: [string, Dispatch<SetStateAction<string>>];
  validated: [boolean, Dispatch<SetStateAction<boolean>>];
  init: (oneTimeToken: string) => void;
  signout: () => void;
}
