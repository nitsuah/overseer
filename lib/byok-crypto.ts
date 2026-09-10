// lib/byok-crypto.ts
//
// Symmetric encryption for user-supplied ("bring your own key") AI provider
// API keys. Keys are only ever decrypted server-side, in-memory, for the
// duration of a single AI call — the plaintext key is never logged, returned
// to the client, or persisted.

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derives a stable 32-byte AES-256 key from BYOK_ENCRYPTION_KEY. Hashing
 * (rather than requiring the operator to generate a key in an exact byte
 * length/encoding) means any reasonably long random string works as the
 * env var value.
 */
function getKey(): Buffer {
  const secret = process.env.BYOK_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      'BYOK_ENCRYPTION_KEY is not configured on the server — cannot store or read a personal AI key.'
    );
  }
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts `plaintext` (an API key) into a single storable string:
 * `<iv>.<authTag>.<ciphertext>`, each segment base64-encoded.
 */
export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

/**
 * Reverses {@link encryptApiKey}. Throws if the stored value is malformed or
 * the auth tag doesn't verify (wrong key / tampered data).
 */
export function decryptApiKey(stored: string): string {
  const parts = stored.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed stored API key');
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
