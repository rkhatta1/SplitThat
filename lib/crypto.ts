import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    console.error("TOKEN_ENCRYPTION_KEY is not set. Available env vars:", Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('KEY')));
    throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not set");
  }
  // Derive a 32-byte key from the secret using scrypt
  return scryptSync(secret, "salt", 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns a base64-encoded string containing: iv + authTag + ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + ciphertext and encode as base64
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, "hex"),
  ]);

  return combined.toString("base64");
}

/**
 * Decrypts an encrypted token string
 * Expects base64-encoded string containing: iv + authTag + ciphertext
 */
export function decryptToken(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, "base64");

  // Extract iv, authTag, and ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Generates a cryptographically secure random state parameter
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}
