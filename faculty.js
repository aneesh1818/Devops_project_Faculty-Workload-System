const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { isAuthenticated, isAdminOrHOD } = require('../middleware/auth');

// GET /faculty — list all
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { dept, status, search } = req.query;
    let query = { isActive: true };

    if (dept)   query.department = dept;
    if (search) query.name = { $regex: search, $options: 'i' };

    let faculty = await Faculty.find(query).sort({ name: 1 });

    if (status === 'overloaded')  faculty = faculty.filter(f => f.weeklyHours > 22);
    if (status === 'underloaded') faculty = faculty.filter(f => f.weeklyHours < 12);
    if (status === 'optimal')     faculty = faculty.filter(f => f.weeklyHours >= 12 && f.weeklyHours <= 22);

    res.json({ success: true, data: faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /faculty/:id
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, data: faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /faculty — create
router.post('/', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json({ success: true, data: faculty, message: 'Faculty added successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /faculty/:id — update
router.put('/:id', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, data: faculty, message: 'Faculty updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /faculty/:id — soft delete
router.delete('/:id', isAuthenticated, isAdminOrHOD, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, message: 'Faculty removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
