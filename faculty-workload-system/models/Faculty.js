const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Electronics', 'Mechanical', 'Civil', 'Other']
  },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
    default: 'Assistant Professor'
  },
  weeklyHours: {
    type: Number,
    default: 0,
    min: 0,
    max: 40
  },
  researchLoad: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  courses: {
    type: [String],
    default: []
  },
  phone: {
    type: String,
    default: null
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qualifications: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Virtual: workload status
facultySchema.virtual('workloadStatus').get(function () {
  if (this.weeklyHours > 22) return 'overloaded';
  if (this.weeklyHours < 12) return 'underloaded';
  return 'optimal';
});

facultySchema.set('toJSON', { virtuals: true });
facultySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Faculty', facultySchema);
