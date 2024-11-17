import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    createActivity,
    getActivity,
    getActivitiesBySubject,
    updateActivity,
    deleteActivity,
    createAuditLog
} from '../db/index.js';

const router = express.Router();

// Get activities for a subject (no audit needed for reads)
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

// Get single activity (no audit needed for reads)
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

// Create new activity
router.post('/activities', requireAuth, async (req, res) => {
    try {
        const { subjectId, description, dueDate, status, comments } = req.body;

        if (!subjectId || !description || !status || !dueDate) {
            return res.status(400).json({
                error: 'Subject ID, description, status and due date are required'
            });
        }

        const id = await createActivity(
            subjectId,
            description,
            dueDate,
            status,
            comments
        );

        const activity = await getActivity(id);

        // Create audit log for new activity
        try {
            await createAuditLog(req, {
                action: 'CREATE',
                entityType: 'activity',
                entityId: id,
                oldValues: null,
                newValues: {
                    subjectId,
                    description,
                    dueDate,
                    status,
                    comments
                }
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ activity });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            error: 'Failed to create activity',
            details: error.message
        });
    }
});

// Update activity
router.put('/activities/:id', requireAuth, async (req, res) => {
    try {
        const activityId = req.params.id;
        const { description, status, dueDate, comments } = req.body;

        // Get the old state for audit
        const oldActivity = await getActivity(activityId);
        if (!oldActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const updates = {
            description,
            status,
            dueDate,
            comments
        };

        await updateActivity(activityId, updates);

        const updatedActivity = await getActivity(activityId);

        // Create audit log for update
        try {
            await createAuditLog(req, {
                action: 'UPDATE',
                entityType: 'activity',
                entityId: activityId,
                oldValues: {
                    description: oldActivity.description,
                    status: oldActivity.status,
                    dueDate: oldActivity.dueDate,
                    comments: oldActivity.comments
                },
                newValues: {
                    description: updatedActivity.description,
                    status: updatedActivity.status,
                    dueDate: updatedActivity.dueDate,
                    comments: updatedActivity.comments
                }
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ activity: updatedActivity });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({
            error: 'Failed to update activity',
            details: error.message
        });
    }
});

// Delete activity
router.delete('/activities/:id', requireAuth, async (req, res) => {
    try {
        const activityId = req.params.id;

        // Get the activity before deletion for audit
        const oldActivity = await getActivity(activityId);
        if (!oldActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        await deleteActivity(activityId);

        // Create audit log for deletion
        try {
            await createAuditLog(req, {
                action: 'DELETE',
                entityType: 'activity',
                entityId: activityId,
                oldValues: {
                    description: oldActivity.description,
                    status: oldActivity.status,
                    dueDate: oldActivity.dueDate,
                    comments: oldActivity.comments
                },
                newValues: null
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

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