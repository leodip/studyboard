import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import * as client from 'openid-client';
import path from 'path';
import { fileURLToPath } from 'url';
import { cors as _cors, auth, app as _app, server, frontend } from './config/index.js';
import authRouter from './routes/auth.js';
import { initializeDatabase, checkDatabaseHealth } from './db/index.js';
import motdRouter from './routes/motd.js';
import subjectsRouter from './routes/subject.js';
import activitiesRouter from './routes/activity.js';
import auditRouter from './routes/audit.js';
import { up as migration001 } from './db/migrations/001_add_audit_logs.js';

const app = express();
let discoveryConfig = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy - Essential for Nginx setup
app.set('trust proxy', 1);

// Enhanced CORS configuration
const corsOptions = {
    origin: _cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Token-Expires-In']
};

// Middleware setup
app.use(cors(corsOptions));
app.use(json());

// Determine cookie domain from frontend URL
let cookieDomain;
try {
    const frontendUrl = new URL(frontend.baseUrl);
    cookieDomain = frontendUrl.hostname === 'localhost' ? undefined : frontendUrl.hostname;
} catch (error) {
    console.error('Invalid FRONTEND_BASEURL:', error);
    cookieDomain = undefined;
}

// Session configuration with environment-aware settings
const sessionConfig = {
    secret: auth.session.secret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: 'sb.sid',
    cookie: {
        secure: _app.env === 'production',  // Only use secure in production
        httpOnly: true,
        sameSite: _app.env === 'production' ? 'none' : 'lax',
        maxAge: 604800, // 7 days
        domain: cookieDomain,
        path: '/'
    }
};

app.use(session(sessionConfig));

// Basic request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
            req.session?.user?.idTokenClaims?.email || 'anonymous'
        );
    });
    next();
});

// Security headers
if (_app.env === 'production') {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint with environment info
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: _app.env,
        cors_origin: corsOptions.origin,
        cookie_secure: sessionConfig.cookie.secure,
        cookie_samesite: sessionConfig.cookie.sameSite,
        cookie_domain: sessionConfig.cookie.domain
    });
});

// API Routes
app.use('/', authRouter);
app.use('/api', motdRouter);
app.use('/api', subjectsRouter);
app.use('/api', activitiesRouter);
app.use('/api', auditRouter);

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enhanced error handling
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: _app.env === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        user: req.session?.user?.idTokenClaims?.email
    });

    res.status(err.status || 500).json({
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
        console.log('OIDC discovery completed successfully');
    } catch (error) {
        console.error('OIDC discovery failed:', error);
        throw error;
    }
}

async function startServer() {
    try {
        // Initialize services
        await initializeOIDC();

        // Run migrations in order
        console.log('Running database migrations...');
        await migration001();  // Run migration 001

        // Initialize database (creates tables if they don't exist)
        await initializeDatabase();

        // Health checks
        const health = await checkDatabaseHealth();
        if (!health.healthy) {
            console.error('Database health check failed:', health);
            process.exit(1);
        }

        // Start server
        app.listen(server.port, server.host, () => {
            console.log('='.repeat(50));
            console.log(`Server is running in ${_app.env} mode`);
            console.log(`Local URL: http://${server.host}:${server.port}`);
            console.log(`Frontend URL: ${frontend.baseUrl}`);
            console.log(`CORS Origin: ${corsOptions.origin}`);
            console.log('Cookie Settings:', {
                secure: sessionConfig.cookie.secure,
                sameSite: sessionConfig.cookie.sameSite,
                domain: sessionConfig.cookie.domain || 'not set',
                httpOnly: sessionConfig.cookie.httpOnly
            });
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

startServer();

export default app;