import * as client from 'openid-client';
import { getDiscoveryConfig } from './server.js';

// Utility to check token expiration
const isTokenExpired = (claims) => {
    if (!claims?.exp) return true;
    const expirationTime = claims.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const remainingTimeMs = expirationTime - currentTime;
    const remainingSeconds = Math.floor(remainingTimeMs / 1000);

    if (remainingSeconds > 0) {
        console.log(`Token will expire in ${remainingSeconds} seconds`);
    } else {
        console.log('Token has expired');
    }

    return currentTime >= expirationTime;
};

// Utility to get remaining token time in seconds
const getTokenRemainingTime = (claims) => {
    if (!claims?.exp) return 0;
    const expirationTime = claims.exp * 1000;
    return Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
};

export const requireAuth = async (req, res, next) => {

    console.log('requireAuth');

    // Step 1: Check if there's a user in the session
    if (!req.session.user) {
        console.log('no user in session');
        return res.status(401).json({
            error: 'Not authenticated',
            requiresLogin: true
        });
    }

    // Step 2: Validate ID token claims
    const claims = req.session.user.idTokenClaims;
    if (!claims) {
        req.session.destroy(() => { });
        return res.status(401).json({
            error: 'Invalid session state',
            requiresLogin: true
        });
    }

    console.log('got claims. checking if token is expired');

    // Step 3: Check token expiration
    if (isTokenExpired(claims)) {
        console.log('token is expired');
        // Step 4: Check for refresh token
        if (req.session.user.refresh_token) {
            try {
                console.log('trying to refresh token');
                // Step 5: Attempt automatic refresh
                const discoveryConfig = getDiscoveryConfig();
                if (!discoveryConfig) {
                    throw new Error('OIDC not initialized');
                }

                const tokens = await client.refreshTokenGrant(
                    discoveryConfig,
                    req.session.user.refresh_token
                );

                console.log('token refreshed. updating session');

                // Step 6: Update session with new tokens
                const idTokenClaims = tokens.claims();
                console.log(idTokenClaims);
                req.session.user = {
                    id_token: tokens.id_token,
                    idTokenClaims,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                };

                // Add remaining time to response headers
                const remainingTime = getTokenRemainingTime(idTokenClaims);
                console.log('remaining time:', remainingTime);
                res.set('X-Token-Expires-In', remainingTime.toString());

                // Continue with the request
                return next();
            } catch (error) {
                console.error('Token refresh failed:', error);
                // Clear session on refresh failure
                req.session.destroy(() => { });
                return res.status(401).json({
                    error: 'Authentication expired',
                    requiresLogin: true
                });
            }
        } else {
            // No refresh token available
            req.session.destroy(() => { });
            return res.status(401).json({
                error: 'Session expired',
                requiresLogin: true
            });
        }
    }

    // Token is valid - add remaining time to headers
    const remainingTime = getTokenRemainingTime(claims);
    res.set('X-Token-Expires-In', remainingTime.toString());

    // Continue with the request
    next();
};