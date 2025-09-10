import express from "express";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.get("/ngo/dashboard", authenticate, authorize(["ngo"]), (req, res) => {
  res.send("NGO Dashboard Data");
});

router.get("/admin/panel", authenticate, authorize(["admin"]), (req, res) => {
  res.send("Admin Control Panel");
});


export default router;