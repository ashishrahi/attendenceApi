// utils/crypto.ts
import crypto from "crypto";

// 32 bytes key (256 bits) and 16 bytes IV (128 bits)
const key = Buffer.from("01234567890123456789012345678901"); 
const iv = Buffer.from("0123456789012345"); 

/**
 * Encrypts a string using AES-256-CBC
 * @param data - The plaintext string to encrypt
 * @returns Encrypted string in hex format
 */
export function encryptData(data: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypts an AES-256-CBC encrypted string
 * @param encryptedData - Encrypted data in hex format
 * @param encryptionKey - Key in hex format
 * @param encryptionIv - IV in hex format
 * @returns Decrypted plaintext string
 */
export function decryptData(
  encryptedData: string,
  encryptionKey: string,
  encryptionIv: string
): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    Buffer.from(encryptionIv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
