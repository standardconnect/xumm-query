import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';

import { IContextOptions } from '../../types/context';
import { Client } from '@xumm-query/core';

declare global {
  interface Window {
    XummClientContext?: React.Context<Client>;
  }
}

const XummContextSharing = React.createContext<boolean>(false);
const XummClientContext = createContext({} as Client);

const getXummClient = (context: React.Context<Client> | undefined, contextSharing: boolean) => {
  if (context) {
    return context;
  }
  if (contextSharing && typeof window !== 'undefined') {
    if (!window.XummClientContext) {
      window.XummClientContext = XummClientContext;
    }

    return window.XummClientContext;
  }

  return XummClientContext;
};

export interface ContextBaseProps {
  key: string;
  children: ReactNode;
}

export type ClientContextProps = {
  context?: never;
  contextSharing: boolean;
} & ContextBaseProps;

const XummClientProvider: React.FC<ClientContextProps> = (props) => {
  const key = props.key;
  const [client, _setClient] = useState<Client>(new Client({ key }));

  /*   useEffect(() => {
    setClient(new Client({ key }));
    return () => {
      if (client) client.unmount();
    };
  }, [client]); */

  return (
    <XummContextSharing.Provider value={!props.context && props.contextSharing}>
      <XummClientContext.Provider value={client}>{props.children}</XummClientContext.Provider>
    </XummContextSharing.Provider>
  );
};

export const useXummClient = ({ context }: IContextOptions = {}) => {
  const xummClient = React.useContext(getXummClient(context, React.useContext(XummContextSharing)));

  if (!xummClient) {
    throw new Error('No XummClient set, use XummClientProvider to set one');
  }

  return xummClient;
};

export default XummClientProvider;
