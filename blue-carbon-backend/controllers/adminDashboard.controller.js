const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAdminDashboard = async (req, res) => {
  try {
    /* ================= PLATFORM STATS ================= */

    const [
      totalUsers,
      activeProjects,
      totalCreditsAgg,
      verifiedCreditsAgg,
      pendingVerifications,
      registeredNGOs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count({ where: { status: "Active" } }),
      prisma.project.aggregate({ _sum: { creditsGenerated: true } }),
      prisma.project.aggregate({
        where: { verificationStatus: "Approved" },
        _sum: { creditsGenerated: true }
      }),
      prisma.project.count({ where: { verificationStatus: "Pending" } }),
      prisma.user.count({ where: { role: "ngo" } })
    ]);

    const platformStats = {
      totalUsers,
      activeProjects,
      totalCredits: totalCreditsAgg._sum.creditsGenerated || 0,
      verifiedCredits: verifiedCreditsAgg._sum.creditsGenerated || 0,
      pendingVerifications,
      registeredNGOs,
      blockchainTransactions: await prisma.blockchainLog.count(),
      systemUptime: 99.8 // static / from monitoring later
    };

    /* ================= RECENT ACTIVITIES ================= */

    const recentProjects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 3
    });

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 2
    });

    const recentActivities = [
      ...recentUsers.map(u => ({
        type: "user_registration",
        message: `New ${u.role} registered: ${u.name}`,
        time: u.createdAt
      })),
      ...recentProjects.map(p => ({
        type: "project_approval",
        message: `Project submitted: ${p.name}`,
        time: p.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
      .map(a => ({
        ...a,
        time: new Date(a.time).toLocaleString()
      }));

    /* ================= PENDING APPROVALS ================= */

    const pendingProjects = await prisma.project.findMany({
      where: { verificationStatus: "Pending" },
      take: 3,
      orderBy: { createdAt: "desc" }
    });

    const pendingApprovals = pendingProjects.map(p => ({
      type: "Project Registration",
      item: p.name,
      category: p.location,
      submittedDate: p.createdAt.toISOString(),
      priority: "Medium"
    }));

    /* ================= RESPONSE ================= */

    res.json({
      platformStats,
      recentActivities,
      pendingApprovals
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};
