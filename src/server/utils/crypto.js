import crypto from 'crypto';

export function aesGcmEncryption(idTokenUnencrypted, clientSecret) {
    const key = Buffer.alloc(32);

    // Use the first 32 bytes of the client secret as the key
    const keyBytes = Buffer.from(clientSecret, 'utf-8');
    keyBytes.copy(key, 0, 0, Math.min(keyBytes.length, key.length));

    // Random nonce
    const nonce = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
    let cipherText = cipher.update(idTokenUnencrypted, 'utf-8', 'base64');
    cipherText += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Concatenate nonce (12 bytes) + ciphertext (? bytes) + tag (16 bytes)
    const encrypted = Buffer.concat([nonce, Buffer.from(cipherText, 'base64'), tag]);

    return encrypted.toString('base64');
}