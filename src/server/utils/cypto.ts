import { env } from "@/env.mjs";
import crypto from "crypto";

const oneWayHash = (text: string, salt: string | number) => {
  const passphrase = `${env.AUTH_SECRET}-${salt}`;
  return crypto
    .pbkdf2Sync(text, passphrase, 1000, 64, "sha512")
    .toString("hex");
};

export const hashPassword = (password: string, salt: string | number) => {
  const hash = oneWayHash(password, salt);
  return hash;
};

export const verifyPassword = (
  password: string,
  salt: string,
  hash: string | number,
) => {
  const hashVerify = oneWayHash(password, salt);
  return hash === hashVerify;
};

const getKey = (salt: string | number) => {
  const passphrase = `${env.AUTH_SECRET}-${salt}`;
  return crypto
    .createHash("sha256")
    .update(String(passphrase))
    .digest("base64")
    .substring(0, 32);
};

export const encrypt = (text: string, salt: string | number) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(salt), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
};

export const decrypt = (
  encyptedText: string,
  salt: string | number,
  iv: string,
) => {
  const ivBuffer = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    getKey(salt),
    ivBuffer,
  );
  let decrypted = decipher.update(encyptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
