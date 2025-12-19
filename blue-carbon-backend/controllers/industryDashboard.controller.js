const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// controllers/industryDashboard.controller.js
exports.getIndustryDashboard = async (req, res) => {
  try {
    const prisma = req.prisma;

    /* ================= AUTH ================= */
    const industryId = req.user.id; // JWT payload

    if (!industryId) {
      return res.status(401).json({ error: "Invalid industry user" });
    }

    /* ================= METRICS ================= */
    const [
      activeProjects,
      totalCredits,
      pendingReviews
    ] = await Promise.all([
      prisma.project.count({
        where: { industryId, status: "Active" }
      }),

      prisma.project.aggregate({
        where: { industryId },
        _sum: { creditsGenerated: true }
      }),

      prisma.project.count({
        where: { industryId, verificationStatus: "Pending" }
      })
    ]);

    /* ================= PROJECTS (LIMIT 3) ================= */
    const projects = await prisma.project.findMany({
      where: { industryId },
      orderBy: { lastMRV: "desc" }, // ✅ VALID FIELD
      take: 3,
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
        progress: true,
        creditsGenerated: true,
        lastMRV: true
      }
    });

    /* ================= RECENT ACTIVITIES ================= */
    const recentActivities = await prisma.report.findMany({
      where: { industryId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        title: true,
        status: true,
        createdAt: true
      }
    });

    /* ================= RESPONSE ================= */
   res.json({
  metrics: {
    activeProjects,
    totalCredits: totalCredits._sum.creditsGenerated || 0,
    pendingReviews,
    marketValue: (totalCredits._sum.creditsGenerated || 0) * 1500
  },

  projects: projects.map(p => ({
    id: p.id,
    name: p.name,
    location: p.location,
    status: p.status,
    progress: p.progress,
    creditsGenerated: p.creditsGenerated,
    lastUpdate: p.lastMRV
      ? p.lastMRV.toISOString().split("T")[0]
      : "N/A"
  })),

  recentActivities: recentActivities.map(r => ({
    type:
      r.status === "Approved"
        ? "verification"
        : r.status === "Pending"
        ? "alert"
        : "report",
    message: r.title,
    createdAt: r.createdAt
  }))
}) }
  catch (error) {
    console.error("Industry Dashboard Error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};



/* ======================================================
   PROJECTS DASHBOARD
====================================================== */
exports.getIndustryProjects = async (req, res) => {
  try {
    const industryId = req.user.id;

    const projects = await prisma.project.findMany({
      where: { industryId },
      include: {
        reports: true,
      },
    });

    const formattedProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
      location: p.location,
      area: `${p.areaHectares} hectares`,
      status: p.status,
      progress: p.progress,
      creditsGenerated: p.creditsGenerated,
      creditsProjected: p.creditsProjected,
      startDate: p.startDate,
      endDate: p.endDate,
      verificationStatus: p.verificationStatus,
      lastMRV: p.lastMRV || "N/A",
    }));

    const stats = {
      totalProjects: projects.length,
      totalHectares: projects.reduce((s, p) => s + p.areaHectares, 0),
      creditsGenerated: projects.reduce((s, p) => s + p.creditsGenerated, 0),
      creditsProjected: projects.reduce((s, p) => s + p.creditsProjected, 0),
    };

    res.json({ projects: formattedProjects, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load projects" });
  }
};

// controllers/industryProjects.controller.js
exports.createIndustryProject = async (req, res) => {
  try {
    const industryId = req.user?.id
    if (!industryId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const {
      name,
      location,
      areaHectares,
      startDate,
      endDate,
      creditsProjected
    } = req.body

    if (!name || !location || !areaHectares) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const project = await prisma.project.create({
      data: {
        industryId,
        name,
        location,
        area: `${areaHectares} hectares`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        creditsProjected: Number(creditsProjected),
        status: "Planning",
        progress: 0,
        creditsGenerated: 0,
        verificationStatus: "Pending"
      }
    })
    if (new Date(startDate) >= new Date(endDate)) {
  return res.status(400).json({
    message: "End date must be after start date"
  });
}
    res.status(201).json(project)
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err)
    res.status(500).json({ message: "Project creation failed" })
  }
}


/* ======================================================
   AUCTIONS DASHBOARD
====================================================== */
exports.getIndustryAuctions = async (req, res) => {
  try {
    const industryId = req.user.id;
    const now = new Date();

    const auctions = await prisma.auction.findMany({
      include: {
        project: true,
        bids: true,
      },
    });

    const liveAuctions = auctions.map(a => {
      const diff = new Date(a.endTime) - now;

      return {
        id: a.id,
        projectName: a.project.name,
        creditsAmount: a.creditsAmount,
        currentBid: a.currentBid,
        startingPrice: a.startingPrice,
        bidCount: a.bids.length,
        timeRemaining:
          diff > 0
            ? `${Math.floor(diff / 3600000)}h ${Math.floor(
                (diff % 3600000) / 60000
              )}m`
            : "Ended",
        endTime: a.endTime,
        status:
          diff <= 0 ? "ended" : a.startTime > now ? "upcoming" : "active",
        isMyListing: a.industryId === industryId,
        highestBidder: a.highestBidder || "0x---",
        myBid: a.bids.find(b => b.bidderId === industryId)?.amount,
      };
    });

    const metrics = {
      totalRevenue: auctions.reduce(
        (s, a) => s + a.currentBid * a.creditsAmount,
        0
      ),
      activeAuctions: liveAuctions.filter(a => a.status === "active").length,
      totalBids: auctions.reduce((s, a) => s + a.bids.length, 0),
      averagePrice:
        auctions.length > 0
          ? auctions.reduce((s, a) => s + a.currentBid, 0) / auctions.length
          : 0,
      successRate: 85,
    };

    res.json({ liveAuctions, auctionMetrics: metrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load auctions" });
  }
};

/* ======================================================
   BLOCKCHAIN / TOKENIZATION
====================================================== */
exports.getTokenizationRequests = async (req, res) => {
  try {
    const industryId = req.user.id;

    const requests = await prisma.tokenizationRequest.findMany({
      where: { industryId },
      include: { project: true },
    });

    res.json(
      requests.map(r => ({
        id: r.id,
        projectName: r.project.name,
        credits: r.credits,
        status: r.status,
        submittedDate: r.createdAt.toISOString().split("T")[0],
        estimatedCompletion: r.estimatedCompletion
          ? r.estimatedCompletion.toISOString().split("T")[0]
          : null,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Tokenization fetch failed" });
  }
};

/* ======================================================
   CREDIT PORTFOLIO
====================================================== */
exports.getIndustryCredits = async (req, res) => {
  try {
    const industryId = req.user.id;

    const credits = await prisma.creditLedger.findMany({
      where: { industryId },
      include: { project: true },
    });

    res.json(
      credits.map(c => ({
        project: c.project.name,
        totalCredits: c.totalCredits,
        availableCredits: c.availableCredits,
        soldCredits: c.soldCredits,
        averagePrice: c.averagePrice,
        currentValue: c.availableCredits * c.averagePrice,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Credits fetch failed" });
  }
};

/* ======================================================
   REPORTS DASHBOARD
====================================================== */
exports.getIndustryReports = async (req, res) => {
  try {
    const industryId = req.user.id;

    const reports = await prisma.report.findMany({
      where: { industryId },
      include: {
        project: true,
        verifier: true,
      },
    });

    res.json(
      reports.map(r => ({
        id: r.id,
        title: r.title,
        project: r.project?.name || "N/A",
        type: r.type,
        status: r.status,
        submissionDate: r.submissionDate
          ? r.submissionDate.toISOString().split("T")[0]
          : "Not Submitted",
        reviewDate: r.reviewDate
          ? r.reviewDate.toISOString().split("T")[0]
          : "Pending",
        verifier: r.verifier?.name || "Not Assigned",
        carbonSequestered: r.carbonSequestered
          ? `${r.carbonSequestered.toLocaleString()} tCO2`
          : "Pending",
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Reports fetch failed" });
  }
};
