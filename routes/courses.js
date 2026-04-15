const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { isAuthenticated, isAdminOrHOD } = require('../middleware/auth');

// GET /courses
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { dept, semester, search } = req.query;
    let query = { isActive: true };

    if (dept)     query.department = dept;
    if (semester) query.semester = semester;
    if (search)   query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];

    const courses = await Course.find(query).sort({ code: 1 });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /courses/:id
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /courses
router.post('/', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, data: course, message: 'Course created successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /courses/:id
router.put('/:id', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /courses/:id
router.delete('/:id', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
