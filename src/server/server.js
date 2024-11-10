import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import * as client from 'openid-client'
import { createAuthRouter } from './auth.js';
import { requireAuth } from './requireAuth.js';
import { cors as _cors, auth, app as _app, server } from './config/index.js';

// Create Express app
const app = express();
var discoveryConfig = null;

// Middleware setup
app.use(cors(_cors));
app.use(json());
app.use(session({
    secret: auth.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: auth.session.secure,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: _app.env === 'development' ? err.message : undefined
    });
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/hello', requireAuth, (req, res) => {
    res.json({ message: 'Hello from the server! The time now is ' + new Date().toISOString() });
});

app.get('/user-info', requireAuth, (req, res) => {
    // Return user info from the session
    const user = {
        name: req.session.user?.idTokenClaims?.name,
        email: req.session.user?.idTokenClaims?.email,
        sub: req.session.user?.idTokenClaims?.sub
    };
    console.log('User:', user);
    res.json({ user });
});

async function initializeOIDC() {
    try {
        discoveryConfig = await client.discovery(
            new URL(auth.oidc.discoveryUrl),
            auth.oidc.clientId,
            auth.oidc.clientSecret
        );
        console.log('OIDC Discovery completed');

        // Initialize auth routes after OIDC discovery
        app.use(createAuthRouter(discoveryConfig));
    } catch (error) {
        console.error('OIDC Discovery failed:', error);
    }
}

export const getDiscoveryConfig = () => {
    if (!discoveryConfig) {
        throw new Error('OIDC not initialized');
    }
    return discoveryConfig;
};

// Apply error handling middleware last
app.use(errorHandler);

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

async function startServer() {
    try {
        // Initialize critical services first
        await initializeOIDC();

        // Only start server after everything is ready
        app.listen(server.port, server.host, () => {
            console.log(`Server running at http://${server.host}:${server.port}`);
            console.log(`Environment: ${_app.env}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

startServer();

export default app;