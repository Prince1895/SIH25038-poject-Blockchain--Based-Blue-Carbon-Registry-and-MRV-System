// routes/authRoutes.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../services/emailService");

const prisma = new PrismaClient();
const router = express.Router();

/**
 * =========================
 * 1. SIGNUP (MATCHES FRONTEND)
 * =========================
 */
router.post("/signup", async (req, res) => {
  try {
    const {
      userType,
      firstName,
      lastName,
      email,
      phone,
      organization,
      designation,
      description,
      password
    } = req.body;

    if (!userType || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------- INDUSTRY ----------
    if (userType === "industry") {
      await prisma.industry.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          organization,
          designation,
          description,
          status: "PENDING_APPROVAL",
          isActive: false
        }
      });

      return res.status(201).json({
        message: "Registration successful! Await admin approval."
      });
    }

    // ---------- VERIFIER ----------
    if (userType === "verifier") {
      await prisma.verifier.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          organization,
          designation,
          description,
          status: "PENDING_APPROVAL",
          isActive: false
        }
      });

      return res.status(201).json({
        message: "Registration successful! Await admin approval."
      });
    }

    // ---------- ADMIN ----------
    if (userType === "admin") {
      await prisma.publicUser.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          organization,
          designation,
          description,
          isActive: false
        }
      });

      // OTP for admin activation
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.oTP.create({
        data: {
          email,
          code: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      await sendOtpEmail(email, otpCode, "Activate Your Account");

      return res.status(201).json({
        message: "Registration successful! Please verify OTP."
      });
    }

    return res.status(400).json({ message: "Invalid user type" });

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
});

/**
 * =========================
 * 2. ACTIVATE ACCOUNT (OTP)
 * =========================
 */
router.post("/activate", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpEntry = await prisma.oTP.findFirst({
      where: { email, code: otp, expiresAt: { gt: new Date() } }
    });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Admin / Public user activation
    await prisma.publicUser.update({
      where: { email },
      data: { isActive: true }
    });

    await prisma.oTP.delete({ where: { id: otpEntry.id } });

    res.json({ message: "Account activated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Activation failed" });
  }
});

/**
 * =========================
 * 3. LOGIN (REQUEST OTP)
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      (await prisma.industry.findUnique({ where: { email } })) ||
      (await prisma.verifier.findUnique({ where: { email } })) ||
      (await prisma.publicUser.findUnique({ where: { email } }));

    if (!user || !user.isActive || (user.status && user.status !== "APPROVED")) {
      return res.status(401).json({ message: "Account not approved or inactive" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await sendOtpEmail(email, otpCode, "Login OTP");

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

/**
 * =========================
 * 4. VERIFY LOGIN OTP
 * =========================
 */
router.post("/verify-login", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpEntry = await prisma.oTP.findFirst({
      where: { email, code: otp, expiresAt: { gt: new Date() } }
    });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user =
      (await prisma.industry.findUnique({ where: { email } })) ||
      (await prisma.verifier.findUnique({ where: { email } })) ||
      (await prisma.publicUser.findUnique({ where: { email } }));

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.oTP.delete({ where: { id: otpEntry.id } });
    delete user.password;

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
});

module.exports = router;
