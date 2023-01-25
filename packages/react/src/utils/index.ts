import { IStoreContextProps } from 'types/context';
import { useEffect } from 'react';

export const useXAppEffect = (ctx: IStoreContextProps) => {
  useEffect(() => {
    if (!ctx.qr[0]) return;
    listenForExpiration(ctx.qr[0].websocket, ctx);
    listenForScan(ctx.qr[0].websocket, ctx);
    listenForSign(ctx.qr[0].websocket, ctx);
  }, [ctx.qr[0]]);

  useEffect(() => {
    if (!ctx.xummData[0] || ctx.qr[0]) return;
    handlePayload(ctx);
  }, [ctx.xummData[0]]);
};

export const signout = async (ctx: IStoreContextProps) => {
  ctx.wallet[1]('');
};

export const refresh = (ctx: IStoreContextProps) => {
  ctx.error[1](false);
  ctx.scanned[1](false);
  ctx.signed[1](false);
  if (!ctx.xummData[0]) return;
  handlePayload(ctx);
};

export const init = async (_oneTimeToken: string, ctx: IStoreContextProps) => {
  const { xApp } = require('xumm-xapp-sdk');
  const xapp = new xApp();
  window.sdk = xapp;
};

export const listenForExpiration = async (url: string, ctx: IStoreContextProps) => {
  let ws = await xumm.openWebSocket(url);
  ws.onmessage = (event) => {
    let resp = JSON.parse(event.data);
    if (resp.signed) ws.close();
    if (resp.expires_in_seconds) ctx.expire[1](resp.expires_in_seconds);
  };
};

const listenForScan = async (url: string, ctx: IStoreContextProps) => {
  console.log('listening for scan...');
  let scanned = await xumm.scannedWebSocket(url);
  if (scanned instanceof Error) return ctx.error[1](true);
  ctx.state[1]({ state: 'scanned', response: scanned });
  ctx.scanned[1](true);
};

export const listenForSign = async (url: string, ctx: IStoreContextProps) => {
  console.log('listening for sign...');
  let signed: any = await xumm.signedWebSocket(url);
  if (signed instanceof Error) return ctx.error[1](true);

  if (!ctx.xummData[0]) return;
  const payload_meta = await xumm.getMetadata(ctx.xummData[0]);

  ctx.state[1]({ state: 'signed', response: payload_meta?.data.data });
  ctx.signed[1](true);
};

export const handlePayload = async (ctx: IStoreContextProps) => {
  if (!ctx.xummData[0]) return;
  let data = ctx.xummData[0];
  let jwt = await xumm.init(data);

  data.jwt = jwt ? jwt : undefined;
  data.payload = { txjson: data.request };

  const payload_data = await xumm.payload(data);
  data.uuid = payload_data ? payload_data.data.uuid : undefined;
  const payload_meta = await xumm.getMetadata(data);
  ctx.meta[1](payload_meta?.data.data);

  let qr = {
    url: payload_data ? payload_data.data.next.always : undefined,
    qrcode: payload_data ? payload_data.data.refs.qr_png : undefined,
    websocket: payload_data ? payload_data.data.refs.websocket_status : undefined,
    uuid: payload_data ? payload_data.data.uuid : undefined,
  };

  ctx.qr[1](qr);
};

export const onDemand = async (ctx: IStoreContextProps) => {
  if (!ctx.xummData[0]) return;
  let data = ctx.xummData[0];
  let jwt = await xumm.init(data);

  data.jwt = jwt ? jwt : undefined;
  data.payload = { txjson: data.request };

  const payload_data = await xumm.payload(data);
  data.uuid = payload_data ? payload_data.data.uuid : undefined;
  console.log('this is the payload data... ', data);

  const payload_meta = await xumm.getMetadata(data);
  ctx.meta[1](payload_meta?.data.data);

  let qr = {
    url: payload_data ? payload_data.data.next.always : undefined,
    qrcode: payload_data ? payload_data.data.refs.qr_png : undefined,
    websocket: payload_data ? payload_data.data.refs.websocket_status : undefined,
    uuid: payload_data ? payload_data.data.uuid : undefined,
  };

  ctx.qr[1](qr);
  ctx.xummData[1](data);
  return qr;
};
