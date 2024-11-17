import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    getSubject,
    createAuditLog
} from '../db/index.js';

const router = express.Router();

// Get all subjects (no audit needed for reads)
router.get('/subjects', requireAuth, async (req, res) => {
    try {
        const subjects = await getAllSubjects();
        res.json({ subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            error: 'Failed to fetch subjects',
            details: error.message
        });
    }
});

// Create new subject
router.post('/subjects', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        const id = await createSubject(name);

        // Create audit log for new subject
        try {
            await createAuditLog(req, {
                action: 'CREATE',
                entityType: 'subject',
                entityId: id,
                oldValues: null,
                newValues: { name }
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ id });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            error: 'Failed to create subject',
            details: error.message
        });
    }
});

// Update subject
router.put('/subjects/:id', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        // Get old state for audit
        const oldSubject = await getSubject(req.params.id);
        if (!oldSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        await updateSubject(req.params.id, name);

        // Create audit log for update
        try {
            await createAuditLog(req, {
                action: 'UPDATE',
                entityType: 'subject',
                entityId: req.params.id,
                oldValues: { name: oldSubject.name },
                newValues: { name }
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            error: 'Failed to update subject',
            details: error.message
        });
    }
});

// Delete subject
router.delete('/subjects/:id', requireAuth, async (req, res) => {
    try {
        // Get old state for audit
        const oldSubject = await getSubject(req.params.id);
        if (!oldSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        await deleteSubject(req.params.id);

        // Create audit log for deletion
        try {
            await createAuditLog(req, {
                action: 'DELETE',
                entityType: 'subject',
                entityId: req.params.id,
                oldValues: { name: oldSubject.name },
                newValues: null
            });
        } catch (auditError) {
            console.error('Audit log creation failed:', auditError);
            // Continue despite audit failure
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            error: 'Failed to delete subject',
            details: error.message
        });
    }
});

export default router;