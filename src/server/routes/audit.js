import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getAuditLogs, getAuditLogsCount } from '../db/index.js';

const router = express.Router();

// Get audit logs with pagination
router.get('/audit-logs', requireAuth, async (req, res) => {
    try {
        // Parse and validate limit/offset with strict validation
        const limit = req.query.limit !== undefined ?
            parseInt(req.query.limit, 10) : 20;
        const offset = req.query.offset !== undefined ?
            parseInt(req.query.offset, 10) : 0;

        // Strict validation
        if (isNaN(limit) || limit < 0) {
            return res.status(400).json({
                error: 'Invalid limit parameter - must be a non-negative number'
            });
        }
        if (isNaN(offset) || offset < 0) {
            return res.status(400).json({
                error: 'Invalid offset parameter - must be a non-negative number'
            });
        }

        // Parse and validate entityId if provided
        let entityId = null;
        if (req.query.entityId) {
            entityId = parseInt(req.query.entityId, 10);
            if (isNaN(entityId)) {
                return res.status(400).json({
                    error: 'Invalid entityId parameter - must be a number'
                });
            }
        }

        // Get logs with validated parameters
        const logs = await getAuditLogs({
            entityType: req.query.entityType || null,
            entityId,
            userId: req.query.userId || null,
            limit,
            offset
        });

        // Get total count using the db function
        const totalCount = await getAuditLogsCount({
            entityType: req.query.entityType || null,
            entityId,
            userId: req.query.userId || null
        });

        res.json({
            logs,
            total: totalCount,
            limit,
            offset
        });
    } catch (error) {
        console.error('Route handler error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
            details: error.message
        });
    }
});

export default router;