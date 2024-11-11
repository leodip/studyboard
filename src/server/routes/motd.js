// /server/routes/motd.js
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
    createMessageOfTheDay,
    getAllMessagesOfTheDay,
    deleteMessageOfTheDay,
    updateMessageOfTheDay
} from '../db/index.js';

const router = express.Router();

// Get all messages
router.get('/motd', async (req, res) => {
    try {
        const messages = await getAllMessagesOfTheDay();
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            error: 'Failed to fetch messages',
            details: error.message
        });
    }
});

// Create new message (admin only)
router.post('/motd', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { message, author, link } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const id = await createMessageOfTheDay(message, author, link);
        res.json({ id });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({
            error: 'Failed to create message',
            details: error.message
        });
    }
});

// Update message (admin only)
router.put('/motd/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { message, author, link } = req.body;
        const updates = {
            message: message,
            author: author,
            link: link
        };

        await updateMessageOfTheDay(req.params.id, updates);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            error: 'Failed to update message',
            details: error.message
        });
    }
});

// Delete message (admin only)
router.delete('/motd/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        await deleteMessageOfTheDay(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            error: 'Failed to delete message',
            details: error.message
        });
    }
});

export default router;