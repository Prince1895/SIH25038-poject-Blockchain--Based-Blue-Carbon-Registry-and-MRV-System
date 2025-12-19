// In routes/setupRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/setup/initial-admin', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ error: "Missing fields." });
        }

        // Check if any admin exists
        const adminExists = await prisma.admin.findFirst();
        if (adminExists) {
            return res.status(400).json({ error: "Admin already created." });
        }

        const hashed = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: { email, name, password: hashed, role: "ADMIN", isActive: true }
        });

        res.status(201).json({ message: "Initial admin created successfully!", admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create initial admin." });
    }
});

module.exports = router;