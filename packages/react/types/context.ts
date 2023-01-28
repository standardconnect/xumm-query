import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Client } from '@xumm-query/core';

interface Query {
  isLoading: boolean;
  data: any;
  isFetched: boolean;
  refetch: () => void;
  isStale: boolean;
  isError: boolean;
}

export interface IContextProps {
  data: [any, Dispatch<SetStateAction<any>>];
  jwt: [string | undefined, Dispatch<SetStateAction<string | undefined>>];
  wallet: readonly [undefined | string, Dispatch<SetStateAction<undefined | string>>];
  theme: readonly [undefined | string, Dispatch<SetStateAction<undefined | string>>];
  walletInfo?: Query;
  markets?: Query;
  checks?: Query;
  xummInit?: Query;
  tokenData: [any, Dispatch<SetStateAction<any>>];
  network: [string, Dispatch<SetStateAction<string>>];
  client: [Client | undefined, Dispatch<SetStateAction<Client | undefined>>];
  connection: [boolean, Dispatch<SetStateAction<boolean>>];
  validated: [boolean, Dispatch<SetStateAction<boolean>>];
  init: (oneTimeToken: string) => void;
  signout: () => void;
}

export interface IContextOptions {
  context?: React.Context<Client>;
}
