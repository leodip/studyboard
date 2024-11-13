import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject
} from '../db/index.js';

const router = express.Router();

// Get all subjects
router.get('/subjects', async (req, res) => {
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

// Create new subject (authenticated users only)
router.post('/subjects', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        const id = await createSubject(name);
        res.json({ id });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            error: 'Failed to create subject',
            details: error.message
        });
    }
});

// Update subject (authenticated users only)
router.put('/subjects/:id', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        await updateSubject(req.params.id, name);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            error: 'Failed to update subject',
            details: error.message
        });
    }
});

// Delete subject (authenticated users only)
router.delete('/subjects/:id', requireAuth, async (req, res) => {
    try {
        await deleteSubject(req.params.id);
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