import crypto from 'crypto';
import { auth, frontend } from './config/index.js';
import * as client from 'openid-client';

function aesGcmEncryption(idTokenUnencrypted, clientSecret) {
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

export function createLogoutHandler() {
    return async (req, res) => {
        try {
            console.log('Logout request:', req.session?.user);

            // Get ID token from session
            const idToken = req.session?.user?.id_token;

            // Clear the session
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Clear session cookie
            res.clearCookie('connect.sid');

            // If no ID token, just redirect to home
            if (!idToken) {
                return res.json({ redirectUrl: frontend.baseUrl });
            }

            try {
                // Fetch discovery config when needed
                const discoveryConfig = await client.discovery(
                    new URL(auth.oidc.discoveryUrl),
                    auth.oidc.clientId,
                    auth.oidc.clientSecret
                );

                console.log(idToken);
                console.log(auth.oidc.clientSecret);

                // Encrypt ID token
                const encryptedIdToken = aesGcmEncryption(idToken, auth.oidc.clientSecret);

                console.log('Discovery Config:', JSON.stringify(discoveryConfig, null, 2));

                // Build OIDC end session URL
                const logoutUrl = new URL(discoveryConfig.serverMetadata().end_session_endpoint);
                console.log('Logout URL:', logoutUrl.toString());
                const params = new URLSearchParams({
                    id_token_hint: encryptedIdToken,
                    post_logout_redirect_uri: frontend.baseUrl,
                    client_id: auth.oidc.clientId,
                    state: crypto.randomBytes(16).toString('hex')
                });

                logoutUrl.search = params.toString();

                // Return the OIDC logout URL for the frontend to redirect to
                res.json({ redirectUrl: logoutUrl.toString() });
            } catch (discoveryError) {
                console.error('OIDC Discovery failed:', discoveryError);
                // If discovery fails, just redirect to frontend
                return res.json({ redirectUrl: frontend.baseUrl });
            }
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                message: auth.app?.env === 'development' ? error.message : undefined
            });
        }
    };
}