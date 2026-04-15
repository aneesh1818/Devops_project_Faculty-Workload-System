const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Course  = require('../models/Course');
const { isAuthenticated } = require('../middleware/auth');

// GET /reports/workload-summary
router.get('/workload-summary', isAuthenticated, async (req, res) => {
  try {
    const faculty = await Faculty.find({ isActive: true });

    const summary = {
      total:       faculty.length,
      overloaded:  faculty.filter(f => f.weeklyHours > 22).length,
      underloaded: faculty.filter(f => f.weeklyHours < 12).length,
      optimal:     faculty.filter(f => f.weeklyHours >= 12 && f.weeklyHours <= 22).length,
      avgHours:    faculty.length
        ? parseFloat((faculty.reduce((s, f) => s + f.weeklyHours, 0) / faculty.length).toFixed(1))
        : 0,
      byDepartment: {}
    };

    faculty.forEach(f => {
      if (!summary.byDepartment[f.department]) {
        summary.byDepartment[f.department] = { count: 0, totalHours: 0 };
      }
      summary.byDepartment[f.department].count++;
      summary.byDepartment[f.department].totalHours += f.weeklyHours;
    });

    Object.keys(summary.byDepartment).forEach(dept => {
      const d = summary.byDepartment[dept];
      d.avgHours = parseFloat((d.totalHours / d.count).toFixed(1));
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /reports/course-stats
router.get('/course-stats', isAuthenticated, async (req, res) => {
  try {
    const stats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          totalCourses:   { $sum: 1 },
          totalStudents:  { $sum: '$students' },
          totalCredits:   { $sum: '$credits' },
          avgStudents:    { $avg: '$students' }
        }
      },
      { $sort: { totalCourses: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /reports/overloaded-faculty
router.get('/overloaded', isAuthenticated, async (req, res) => {
  try {
    const overloaded = await Faculty.find({ isActive: true, weeklyHours: { $gt: 22 } })
      .sort({ weeklyHours: -1 });
    res.json({ success: true, data: overloaded });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
