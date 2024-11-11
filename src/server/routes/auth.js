import express from 'express';
import * as client from 'openid-client';
import { auth, frontend } from '../config/index.js';
import { aesGcmEncryption } from '../utils/crypto.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDiscoveryConfig } from '../server.js';
import crypto from 'crypto';

const router = express.Router();

// Login route handler
router.get('/login', async (req, res) => {
    try {
        const discoveryConfig = getDiscoveryConfig();
        if (!discoveryConfig) {
            throw new Error('OIDC not initialized');
        }

        const code_challenge_method = 'S256';
        const code_verifier = client.randomPKCECodeVerifier();
        const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
        const nonce = client.randomNonce();
        const state = client.randomState();

        const parameters = {
            redirect_uri: auth.oidc.redirectUri,
            scope: 'openid email profile groups',
            code_challenge,
            code_challenge_method,
            nonce,
            state
        };

        const url = client.buildAuthorizationUrl(discoveryConfig, parameters);

        req.session.authParams = {
            code_verifier,
            nonce,
            state
        };

        res.json({ loginUrl: url });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to generate login URL.' + error });
    }
});

// Callback route handler
router.get('/callback', async (req, res) => {
    try {

        if (req.query.error) {
            console.error('Auth server error:', {
                error: req.query.error,
                error_description: req.query.error_description,
                error_uri: req.query.error_uri,
                state: req.query.state
            });
            return res.redirect(`${frontend.baseUrl}/error?error=${encodeURIComponent(req.query.error)}&error_description=${encodeURIComponent(req.query.error_description)}`);
        }

        if (!req.query.code || !req.session.authParams) {
            console.error('Missing authorization code or auth parameters');
            return res.redirect(`${frontend.baseUrl}/error?error=invalid_request`);
        }

        const params = {
            ...req.query,
            url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
        };
        const currentUrl = new URL(params.url);

        try {
            const discoveryConfig = getDiscoveryConfig();
            const tokens = await client.authorizationCodeGrant(
                discoveryConfig,
                currentUrl,
                {
                    pkceCodeVerifier: req.session.authParams.code_verifier,
                    expectedState: req.session.authParams.state,
                    expectedNonce: req.session.authParams.nonce
                },
            );

            const idTokenClaims = tokens.claims();
            console.log('ID Token Claims:', idTokenClaims);

            req.session.user = {
                id_token: tokens.id_token,
                idTokenClaims: idTokenClaims,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token
            };

            res.redirect(frontend.baseUrl);
        } catch (tokenError) {
            console.error('Token error:', tokenError);
            const errorParams = new URLSearchParams();
            if (tokenError.code) errorParams.append('code', tokenError.code);
            if (tokenError.cause?.error) errorParams.append('error', tokenError.cause.error);
            if (tokenError.cause?.error_description) errorParams.append('error_description', tokenError.cause.error_description);

            const redirectUrl = `${frontend.baseUrl}/error${errorParams.toString() ? '?' + errorParams.toString() : ''}`;
            return res.redirect(redirectUrl);
        }
    } catch (error) {
        console.error('Callback processing error:', error);
        res.redirect(`${frontend.baseUrl}/error?error=callback_error`);
    }
});

// User info route handler
router.get('/user-info', requireAuth, (req, res) => {
    const user = {
        name: req.session.user?.idTokenClaims?.name,
        email: req.session.user?.idTokenClaims?.email,
        sub: req.session.user?.idTokenClaims?.sub,
        groups: req.session.user?.idTokenClaims?.groups || []
    };
    console.log('/user-info called. User:', user);
    res.json({ user });
});

// Logout route handler
router.post('/logout', async (req, res) => {
    try {
        const idToken = req.session?.user?.id_token;

        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.clearCookie('connect.sid');

        if (!idToken) {
            return res.json({ redirectUrl: frontend.baseUrl });
        }

        try {
            const discoveryConfig = getDiscoveryConfig();
            const encryptedIdToken = aesGcmEncryption(idToken, auth.oidc.clientSecret);

            const logoutUrl = new URL(discoveryConfig.serverMetadata().end_session_endpoint);
            const params = new URLSearchParams({
                id_token_hint: encryptedIdToken,
                post_logout_redirect_uri: frontend.baseUrl,
                client_id: auth.oidc.clientId,
                state: crypto.randomBytes(16).toString('hex')
            });

            logoutUrl.search = params.toString();
            res.json({ redirectUrl: logoutUrl.toString() });
        } catch (discoveryError) {
            console.error('OIDC Discovery failed:', discoveryError);
            return res.json({ redirectUrl: frontend.baseUrl });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: auth.app?.env === 'development' ? error.message : undefined
        });
    }
});

export default router;