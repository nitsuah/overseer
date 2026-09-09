import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptApiKey, decryptApiKey } from './byok-crypto';

describe('byok-crypto', () => {
    const ORIGINAL_ENV = process.env.BYOK_ENCRYPTION_KEY;

    beforeEach(() => {
        process.env.BYOK_ENCRYPTION_KEY = 'test-secret-do-not-use-in-prod';
    });

    afterEach(() => {
        // Node stringifies `undefined` to the literal "undefined" on assignment
        // rather than removing the var, so an originally-unset key must be
        // deleted instead of reassigned back to `undefined`.
        if (ORIGINAL_ENV === undefined) {
            delete process.env.BYOK_ENCRYPTION_KEY;
        } else {
            process.env.BYOK_ENCRYPTION_KEY = ORIGINAL_ENV;
        }
    });

    it('round-trips a plaintext API key', () => {
        const plaintext = 'sk-test-1234567890abcdef';
        const encrypted = encryptApiKey(plaintext);
        expect(decryptApiKey(encrypted)).toBe(plaintext);
    });

    it('never stores the plaintext key in the encrypted output', () => {
        const plaintext = 'sk-super-secret-key-value';
        const encrypted = encryptApiKey(plaintext);
        expect(encrypted).not.toContain(plaintext);
    });

    it('produces a different ciphertext each time (random IV)', () => {
        const plaintext = 'sk-same-key-twice';
        const first = encryptApiKey(plaintext);
        const second = encryptApiKey(plaintext);
        expect(first).not.toBe(second);
        expect(decryptApiKey(first)).toBe(plaintext);
        expect(decryptApiKey(second)).toBe(plaintext);
    });

    it('throws when BYOK_ENCRYPTION_KEY is not configured', () => {
        delete process.env.BYOK_ENCRYPTION_KEY;
        expect(() => encryptApiKey('sk-anything')).toThrow(/BYOK_ENCRYPTION_KEY/);
    });

    it('throws when decrypting a malformed stored value', () => {
        expect(() => decryptApiKey('not-a-valid-stored-key')).toThrow(/Malformed/);
    });

    it('throws when decrypting with the wrong key (auth tag mismatch)', () => {
        const encrypted = encryptApiKey('sk-original-key');
        process.env.BYOK_ENCRYPTION_KEY = 'a-completely-different-secret';
        expect(() => decryptApiKey(encrypted)).toThrow();
    });
});
