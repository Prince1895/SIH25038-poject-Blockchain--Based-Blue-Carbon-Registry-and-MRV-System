
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

let otpStore = {};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, ngoId, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // status = pending until admin approves
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,          // ["ngo", "fieldworker", "admin"]
      ngoId,         // for NGO only
      phone,
      status: "pending",
      aadhaarVerified: false
    });

    await user.save();
    res.status(201).json({ message: "Registration successful. Awaiting admin approval." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if approved
    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved by admin" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Sign JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    otpStore[phone] = otp;

    
    if (phone) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your Aadhaar OTP is ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    }

    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Aadhaar OTP Verification",
        text: `Your OTP is ${otp}`
      });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (otpStore[phone] && otpStore[phone] === otp) {

      await User.findOneAndUpdate({ phone }, { aadhaarVerified: true });

      delete otpStore[phone];
      return res.status(200).json({ message: "OTP Verified Successfully" });
    }

    res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};


