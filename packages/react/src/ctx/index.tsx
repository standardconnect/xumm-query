import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import bibble from 'bibble';
import xumm

import { IContextOptions } from 'types/context';

declare global {
  interface Window {
    XummClientContext?: React.Context<QueryClient | undefined>;
  }
}

const XummContextSharing = React.createContext<boolean>(false);
const XummClientContext = createContext({} as IContextOptions);

const getXummClient = (
  context: React.Context<QueryClient | undefined> | undefined,
  contextSharing: boolean
) => {
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

interface ContextBaseProps {
  client: QueryClient;
  key: string;
  children: ReactNode;
}

type ClientContextProps = {
  context?: never;
  contextSharing: boolean;
} & ContextBaseProps;

const XummClientProvider: React.FC<ClientContextProps> = (props) => {
  useEffect(() => {
    props.client.mount(props.key);
    return () => {
      props.client.unmount(props.key);
    };
  }, [props.client]);

  return (
    <XummContextSharing.Provider value={!props.context && props.contextSharing}>
      <XummClientContext.Provider value={props.client}>{props.children}</XummClientContext.Provider>
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
