import { config as _config } from 'dotenv';
_config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
    },
    frontend: {
        baseUrl: process.env.FRONTEND_BASEURL || 'http://localhost:5173',
    },
    auth: {
        oidc: {
            discoveryUrl: process.env.OIDC_DISCOVERY_URL,
            clientId: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
            redirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/callback',
            scope: process.env.OIDC_SCOPE || 'openid profile email',
        },
        session: {
            secret: process.env.SESSION_SECRET,
            secure: process.env.NODE_ENV === 'production',
        }
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    },
    app: {
        env: process.env.NODE_ENV || 'development'
    }
};

export const {
    server,
    frontend,
    auth,
    cors,
    app
} = config;

export default config;