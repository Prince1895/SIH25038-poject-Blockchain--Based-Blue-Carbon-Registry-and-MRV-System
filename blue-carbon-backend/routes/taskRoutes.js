// In routes/taskRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authmiddleware');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @notice GET /api/tasks/my-tasks
 * @dev    PROTECTED: Verifier only. Fetches tasks assigned to the logged-in verifier.
 */
router.get('/my-tasks', authMiddleware, async (req, res) => {
    try {
        // We get the verifier's ID from the JWT token, not the URL.
        const verifierId = req.user.userId;

        const tasks = await prisma.verificationTask.findMany({
            where: { verifierId: verifierId },
            include: { industry: { select: { name: true } } }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks." });
    }
});

/**
 * @notice POST /api/tasks/:taskId/submit
 * @dev    PROTECTED: Verifier only. Submits a report for an assigned task.
 */
router.post('/:taskId/submit', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { evidenceLinks } = req.body;
        const verifierId = req.user.userId;

        // Security Check: Ensure the logged-in user is the one assigned to this task
        const task = await prisma.verificationTask.findUnique({
            where: { id: parseInt(taskId) }
        });

        if (!task || task.verifierId !== verifierId) {
            return res.status(403).json({ error: "Forbidden: You are not assigned to this task." });
        }

        const updatedTask = await prisma.verificationTask.update({
            where: { id: parseInt(taskId) },
            data: {
                status: "COMPLETED",
                evidenceLinks: evidenceLinks,
            }
        });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: "Failed to submit report." });
    }
});

module.exports = router;