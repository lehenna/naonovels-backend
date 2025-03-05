import CryptoJS from "crypto-js";

const CRYPTO_SECRET = process.env.CRYPTO_SECRET ?? "CRYPTO_SECRET";

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, CRYPTO_SECRET).toString();
}

export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, CRYPTO_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
