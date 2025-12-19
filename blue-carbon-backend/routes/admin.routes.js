const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rolemiddleware");
const adminCtrl = require("../controllers/adminDashboard.controller");

// Admin Dashboard
router.get(
  "/dashboard",
  auth,
  requireRole("admin"),
  adminCtrl.getAdminDashboard
);

module.exports = router;
