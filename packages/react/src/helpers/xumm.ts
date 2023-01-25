import PKCE from 'js-pkce';
import axios from 'axios';

const xummOauth = 'https://oauth2.xumm.app';

export const pkce = async ({ url, key, state }: { url: string; key: string; state?: any }) => {
  const storage = window.localStorage;
  const instance = new PKCE({
    client_id: key,
    redirect_uri: `${url}/auth`,
    authorization_endpoint: `${xummOauth}/auth`,
    token_endpoint: `${xummOauth}/token`,
    requested_scopes: '*',
    storage: storage,
  });

  const redirect = instance.authorizeUrl({ state: state ? JSON.stringify(state) : null });
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const width = 400;
  const height = 700;
  window.open(
    redirect,
    'popup',
    `location=no,width=${width},height=${height},top=${(screenHeight - height) / 2},left=${
      (screenWidth - width) / 2
    },resizable=no`
  );
  return window;
};

export const userData = async (jwt: string) => {
  let data = await axios.get(`${xummOauth}/userinfo`, {
    headers: {
      Authorization: 'Bearer ' + jwt,
    },
  });
  return data;
};

const init = async ({ baseUrl, route, key }: { baseUrl: string; route: string; key: string }) => {
  try {
    let url = new URL(`${route}/xumm/init`, baseUrl);
    const auth = await axios.get(url.href, { headers: { 'x-api-key': key } });
    let jwt = auth.data;
    return jwt;
  } catch (e) {
    if (e === '') throw { msg: 'closed', error: false };
    throw e;
  }
};

export const xummHeaders = ({ jwt, key }: { jwt: boolean | string; key: string }) => {
  return { headers: { Authorization: jwt, 'x-api-key': key } };
};

const payload = async ({
  payload,
  jwt,
  key,
  baseUrl,
  route,
}: {
  payload?: any;
  jwt?: string | undefined;
  key: string;
  baseUrl: string;
  route: string;
}) => {
  try {
    let url = new URL(`${route}/xumm/payload`, baseUrl);
    if (!payload || !jwt) return;
    const res = await axios.post(url.href, payload, xummHeaders({ jwt: jwt, key: key }));
    return res;
  } catch (e) {
    if (e === '') throw { msg: 'closed', error: false };
    throw e;
  }
};

const getMetadata = async ({
  uuid,
  key,
  baseUrl,
  route,
}: {
  uuid?: string;
  key: string;
  baseUrl: string;
  route: string;
}) => {
  try {
    let url = new URL(`${route}/xumm/meta/${uuid}`, baseUrl);
    if (!uuid) return;
    const res = await axios.get(url.href, { headers: { 'x-api-key': key } });
    return res;
  } catch (e) {
    if (e === '') throw { msg: 'closed', error: false };
    throw e;
  }
};

const openWebSocket = (url: string) => {
  const ws = new WebSocket(url);
  return ws;
};

const scannedWebSocket = async (url: string) => {
  let ws = openWebSocket(url);
  return new Promise((resolve, _reject) => {
    ws.onmessage = function (event) {
      const resp = JSON.parse(event.data);
      if (resp.signed == false) {
        ws.close();
        resolve(new Error('Sign rejected, try again :P'));
      } else if (Object.keys(resp).indexOf('opened') > -1) {
        ws.close();
        resolve({ message: 'QR Code scanned, waiting for your approval :P' });
      }
    };
  });
};

const signedWebSocket = async (url: string) => {
  let ws = openWebSocket(url);
  return new Promise((resolve, _reject) => {
    ws.onmessage = function (event) {
      const resp = JSON.parse(event.data);
      if (resp.signed == false) {
        ws.close();
        resolve(new Error('Sign rejected, try again :P'));
      } else if (resp.signed == true) {
        const data = {
          type: 'signed',
          response: resp,
          uuidPayload: resp.payload_uuidv4,
          uuidCall: resp.reference_call_uuidv4,
        };
        ws.close();
        resolve({ message: 'Sign fulfilled :P', data: data });
      }
    };
  });
};

export default {
  payload,
  getMetadata,
  init,
  openWebSocket,
  scannedWebSocket,
  signedWebSocket,
};
