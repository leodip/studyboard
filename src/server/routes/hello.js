import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/hello', requireAuth, (req, res) => {
    console.log('Hello route called');
    res.json({ message: 'Hello from the server! The time now is ' + new Date().toISOString() });
});

export default router;