const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const path = require('path');

// GET /dashboard
router.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// GET /dashboard/stats (API)
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const totalFaculty = await Faculty.countDocuments({ isActive: true });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const allFaculty   = await Faculty.find({ isActive: true });

    const overloaded   = allFaculty.filter(f => f.weeklyHours > 22).length;
    const underloaded  = allFaculty.filter(f => f.weeklyHours < 12).length;
    const avgHours     = allFaculty.length
      ? (allFaculty.reduce((s, f) => s + f.weeklyHours, 0) / allFaculty.length).toFixed(1)
      : 0;

    const totalStudents = await Course.aggregate([
      { $group: { _id: null, total: { $sum: '$students' } } }
    ]);

    const deptDist = await Faculty.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalFaculty, totalCourses, overloaded, underloaded,
        avgHours: parseFloat(avgHours),
        totalStudents: totalStudents[0]?.total || 0,
        deptDistribution: deptDist,
        workloadData: allFaculty.map(f => ({
          name: f.name.split(' ').slice(-1)[0],
          fullName: f.name,
          hours: f.weeklyHours,
          status: f.workloadStatus,
          dept: f.department
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
