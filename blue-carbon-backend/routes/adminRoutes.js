// In routes/adminRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendOtpEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authmiddleware');
const isAdmin = require('../middleware/adminmiddleware');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/approve-user/:userId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        // Find user in either Industry or Verifier table
        let user = await prisma.industry.findUnique({ where: { id: parseInt(userId) }}) ||
                   await prisma.verifier.findUnique({ where: { id: parseInt(userId) }});
        
        if (!user) return res.status(404).json({ error: "User to approve not found." });

        // Update the correct model
        const modelName = user.hasOwnProperty('tier') ? 'industry' : 'verifier';
        const updatedUser = await prisma[modelName].update({
            where: { id: parseInt(userId) },
            data: { status: "APPROVED" }
        });

        // Send activation OTP upon approval
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.oTP.create({ data: { email: updatedUser.email, code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }});
        await sendOtpEmail(updatedUser.email, otpCode, "Your Account Has Been Approved!");

        res.status(200).json({ message: `User ${updatedUser.name} has been approved. Activation email sent.` });

    } catch (error) {
        res.status(500).json({ error: "Failed to approve user." });
    }
});

router.post('/tasks', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { industryId, verifierId, dueDate } = req.body;
        const newTask = await prisma.verificationTask.create({
            data: {
                industryId: parseInt(industryId),
                verifierId: parseInt(verifierId),
                dueDate: new Date(dueDate),
                status: "ASSIGNED",
            }
        });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: "Failed to create task." });
    }
});

module.exports = router;