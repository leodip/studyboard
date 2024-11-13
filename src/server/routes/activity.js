import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    createActivity,
    getActivity,
    getActivitiesBySubject,
    updateActivity,
    deleteActivity,
} from '../db/index.js';

const router = express.Router();

// Get activities for a subject
router.get('/subjects/:subjectId/activities', requireAuth, async (req, res) => {
    try {
        const activities = await getActivitiesBySubject(req.params.subjectId);
        res.json({ activities });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            error: 'Failed to fetch activities',
            details: error.message
        });
    }
});

// Get single activity
router.get('/activities/:id', requireAuth, async (req, res) => {
    try {
        const activity = await getActivity(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json({ activity });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            error: 'Failed to fetch activity',
            details: error.message
        });
    }
});

// Create new activity (authenticated users only)
router.post('/activities', requireAuth, async (req, res) => {
    try {
        const { subjectId, description, dueDate, comments } = req.body;

        if (!subjectId || !description || !dueDate) {
            return res.status(400).json({
                error: 'Subject ID, description, and due date are required'
            });
        }

        const id = await createActivity(
            subjectId,
            description,
            dueDate,
            comments
        );

        const activity = await getActivity(id);
        res.json({ activity });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            error: 'Failed to create activity',
            details: error.message
        });
    }
});

// Update activity (authenticated users only)
router.put('/activities/:id', requireAuth, async (req, res) => {
    try {
        const { description, status, dueDate, comments } = req.body;
        const updates = {
            description,
            status,
            dueDate,
            comments
        };

        await updateActivity(req.params.id, updates);

        const activity = await getActivity(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ activity });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({
            error: 'Failed to update activity',
            details: error.message
        });
    }
});

// Delete activity (authenticated users only)
router.delete('/activities/:id', requireAuth, async (req, res) => {
    try {
        await deleteActivity(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({
            error: 'Failed to delete activity',
            details: error.message
        });
    }
});

export default router;