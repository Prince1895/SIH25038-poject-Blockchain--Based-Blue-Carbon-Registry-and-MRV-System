const router = require("express").Router();
const auth = require("../middleware/authMiddleware.js");
const ctrl = require("../controllers/industryDashboard.controller");


router.get("/industry/dashboard", auth, ctrl.getIndustryDashboard);
router.post("/industry/projects", auth,ctrl.createIndustryProject)
router.get("/projects", auth, ctrl.getIndustryProjects);
router.get("/auctions", auth, ctrl.getIndustryAuctions);
router.get("/tokenization", auth, ctrl.getTokenizationRequests);
router.get("/credits", auth, ctrl.getIndustryCredits);
router.get("/reports", auth, ctrl.getIndustryReports);

module.exports = router;
