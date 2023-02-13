import CryptoJS from 'crypto-js';
import { generateMnemonic, mnemonicToSeed } from 'bip39';

export const generateRandomMnemonic = () => {
  const mnemonic = generateMnemonic();
  return mnemonic;
};

export const generateSeedFromMnemonic = (muemonic: string) => {
  const seed = mnemonicToSeed(muemonic).then((bytes) => bytes.toString('hex'));
  return seed;
};

export const encrypt = (message: string, privateKey: string) => {
  var ciphertext = CryptoJS.AES.encrypt(message, privateKey).toString();
  return ciphertext;
};

export const decrypt = (ciphertext: string | undefined, privateKey: string) => {
  if (!ciphertext || ciphertext == '') return undefined;
  var bytes = CryptoJS.AES.decrypt(ciphertext, privateKey);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(originalText);
};
