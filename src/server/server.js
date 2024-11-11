import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import * as client from 'openid-client';
import { cors as _cors, auth, app as _app, server } from './config/index.js';
import authRouter from './routes/auth.js';
import { initializeDatabase, checkDatabaseHealth } from './db/index.js';
import motdRouter from './routes/motd.js';

const app = express();
let discoveryConfig = null;

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
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/', authRouter);
app.use('/api', motdRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: _app.env === 'development' ? err.message : undefined
    });
});

export const getDiscoveryConfig = () => {
    if (!discoveryConfig) {
        throw new Error('OIDC discovery was not initialized');
    }
    return discoveryConfig;
};

async function initializeOIDC() {
    try {
        discoveryConfig = await client.discovery(
            new URL(auth.oidc.discoveryUrl),
            auth.oidc.clientId,
            auth.oidc.clientSecret
        );
        console.log('OIDC discovery is completed');
    } catch (error) {
        console.error('OIDC discovery has failed:', error);
        throw error;
    }
}

async function startServer() {
    try {
        await initializeOIDC();

        await initializeDatabase();
        const health = await checkDatabaseHealth();
        if (!health.healthy) {
            console.error('Database health check failed:', health);
            process.exit(1);
        }

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