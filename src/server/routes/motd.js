import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    createMessageOfTheDay,
    getAllMessagesOfTheDay,
    deleteMessageOfTheDay,
    updateMessageOfTheDay,
    getMessageOfTheDay,
    createAuditLog
} from '../db/index.js';

const router = express.Router();

// Get all messages (no audit needed for reads)
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

// Create new message
router.post('/motd', requireAuth, async (req, res) => {
    try {
        const { message, author, link } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const id = await createMessageOfTheDay(message, author, link);

        // Create audit log for new message
        try {
            await createAuditLog(req, {
                action: 'CREATE',
                entityType: 'message_of_the_day',
                entityId: id,
                oldValues: null,
                newValues: { message, author, link }
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ id });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({
            error: 'Failed to create message',
            details: error.message
        });
    }
});

// Update message
router.put('/motd/:id', requireAuth, async (req, res) => {
    try {
        const { message, author, link } = req.body;

        // Get old state for audit
        const oldMessage = await getMessageOfTheDay(req.params.id);
        if (!oldMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const updates = {
            message: message,
            author: author,
            link: link
        };

        await updateMessageOfTheDay(req.params.id, updates);

        // Create audit log for update
        try {
            await createAuditLog(req, {
                action: 'UPDATE',
                entityType: 'message_of_the_day',
                entityId: req.params.id,
                oldValues: {
                    message: oldMessage.message,
                    author: oldMessage.author,
                    link: oldMessage.link
                },
                newValues: updates
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            error: 'Failed to update message',
            details: error.message
        });
    }
});

// Delete message
router.delete('/motd/:id', requireAuth, async (req, res) => {
    try {
        // Get old state for audit
        const oldMessage = await getMessageOfTheDay(req.params.id);
        if (!oldMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await deleteMessageOfTheDay(req.params.id);

        // Create audit log for deletion
        try {
            await createAuditLog(req, {
                action: 'DELETE',
                entityType: 'message_of_the_day',
                entityId: req.params.id,
                oldValues: {
                    message: oldMessage.message,
                    author: oldMessage.author,
                    link: oldMessage.link
                },
                newValues: null
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

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