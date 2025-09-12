import express from "express";
// ✅ ADDED: Imports for controllers and middleware
import {
  register,
  login,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp); // ✅ CORRECTED: Casing
router.post("/resend-otp", resendOtp); // ✅ CORRECTED: Route name and function

router.get("/ngo/dashboard", authenticate, authorize(["ngo"]), (req, res) => {
  res.send("NGO Dashboard Data");
});

router.get("/admin/panel", authenticate, authorize(["admin"]), (req, res) => {
  res.send("Admin Control Panel");
});

export default router;