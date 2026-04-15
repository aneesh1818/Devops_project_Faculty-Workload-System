const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    default: 3
  },
  students: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedTo: {
    type: String,
    default: null
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Electronics', 'Mechanical', 'Civil', 'Other']
  },
  semester: {
    type: String,
    default: 'Spring 2025'
  },
  hoursPerWeek: {
    type: Number,
    default: 3
  },
  type: {
    type: String,
    enum: ['Theory', 'Lab', 'Theory + Lab'],
    default: 'Theory'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
