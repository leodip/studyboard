// server/routes/auth.js
import express from 'express';
import * as client from 'openid-client';
import { auth, frontend } from './config/index.js';
import { createLogoutHandler } from './logout-handler.js';

export function createAuthRouter(discoveryConfig) {
    const router = express.Router();

    // Login route
    router.get('/login', async (req, res) => {
        try {
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
                scope: 'openid email profile',
                code_challenge,
                code_challenge_method,
                nonce,
                state
            };

            const url = client.buildAuthorizationUrl(discoveryConfig, parameters);
            console.log('Generated authorization URL:', url.toString());

            // Store code verifier, nonce, and state in session
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

    // Callback route
    router.get('/callback', async (req, res) => {
        try {
            console.log('In callback');

            // Check for error response from auth server
            if (req.query.error) {
                console.error('Auth server error:', {
                    error: req.query.error,
                    error_description: req.query.error_description,
                    error_uri: req.query.error_uri,
                    state: req.query.state
                });
                return res.redirect(`${frontend.baseUrl}/error?error=${encodeURIComponent(req.query.error)}&error_description=${encodeURIComponent(req.query.error_description)}`);
            }

            // Validate required parameters
            if (!req.query.code) {
                console.error('Missing authorization code in callback');
                return res.redirect(`${frontend.baseUrl}/error?error=missing_code`);
            }

            // Validate session parameters
            if (!req.session.authParams) {
                console.error('Missing auth parameters in session');
                return res.redirect(`${frontend.baseUrl}/error?error=invalid_session`);
            }

            const params = {
                ...req.query,
                url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
            };
            const currentUrl = new URL(params.url);

            try {
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

                if (tokenError.code) {
                    errorParams.append('code', tokenError.code);
                }
                if (tokenError.cause?.error) {
                    errorParams.append('error', tokenError.cause.error);
                }
                if (tokenError.cause?.error_description) {
                    errorParams.append('error_description', tokenError.cause.error_description);
                }

                const redirectUrl = `${frontend.baseUrl}/error${errorParams.toString() ? '?' + errorParams.toString() : ''}`;
                return res.redirect(redirectUrl);
            }
        } catch (error) {
            console.error('Callback processing error:', error);
            res.redirect(`${frontend.baseUrl}/error?error=callback_error`);
        }
    });

    // Logout endpoint
    router.post('/logout', createLogoutHandler());

    return router;
}