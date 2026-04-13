require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty_workload_db';

// ── Connect to MongoDB ──────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB:', MONGODB_URI);
    seedDatabase();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ─────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'facultyiq_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ── View Engine ─────────────────────────────────────────────────
app.set('view engine', 'html');
app.engine('html', require('fs').readFile.bind(require('fs')));
app.set('views', path.join(__dirname, 'views'));

// ── Routes ──────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const dashRoutes     = require('./routes/dashboard');
const facultyRoutes  = require('./routes/faculty');
const courseRoutes   = require('./routes/courses');
const reportRoutes   = require('./routes/reports');

app.use('/', authRoutes);
app.use('/dashboard', dashRoutes);
app.use('/faculty', facultyRoutes);
app.use('/courses', courseRoutes);
app.use('/reports', reportRoutes);

// ── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ── Start Server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 FacultyIQ Server running at http://localhost:${PORT}`);
});

// ── Seed Database ───────────────────────────────────────────────
async function seedDatabase() {
  const User    = require('./models/User');
  const Faculty = require('./models/Faculty');
  const Course  = require('./models/Course');

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const bcrypt = require('bcryptjs');
    await User.insertMany([
      { name: 'Administrator',    email: 'admin@university.edu',   password: await bcrypt.hash('admin123', 10),   role: 'admin' },
      { name: 'Dr. Priya Nair',   email: 'hod@university.edu',     password: await bcrypt.hash('hod123', 10),     role: 'hod' },
      { name: 'Dr. Ramesh Kumar', email: 'faculty@university.edu', password: await bcrypt.hash('faculty123', 10), role: 'faculty' },
    ]);
    console.log('✅ Users seeded');
  }

  const facCount = await Faculty.countDocuments();
  if (facCount === 0) {
    await Faculty.insertMany([
      { name: 'Dr. Ananya Sharma',  department: 'Computer Science', email: 'a.sharma@uni.edu',  weeklyHours: 24, researchLoad: 'High',   courses: ['CS101','CS301','CS401'] },
      { name: 'Prof. Ramesh Kumar', department: 'Computer Science', email: 'r.kumar@uni.edu',   weeklyHours: 14, researchLoad: 'Medium', courses: ['CS201','CS202'] },
      { name: 'Dr. Meena Iyer',     department: 'Mathematics',      email: 'm.iyer@uni.edu',    weeklyHours: 18, researchLoad: 'Low',    courses: ['MA101','MA201','MA301'] },
      { name: 'Prof. Suresh Pillai',department: 'Mathematics',      email: 's.pillai@uni.edu',  weeklyHours: 12, researchLoad: 'Medium', courses: ['MA102','MA401'] },
      { name: 'Dr. Lakshmi Nair',   department: 'Physics',          email: 'l.nair@uni.edu',    weeklyHours: 26, researchLoad: 'High',   courses: ['PH101','PH201','PH301','PH401'] },
      { name: 'Prof. Vijay Mohan',  department: 'Physics',          email: 'v.mohan@uni.edu',   weeklyHours: 13, researchLoad: 'Low',    courses: ['PH102','PH202'] },
      { name: 'Dr. Kavya Reddy',    department: 'Chemistry',        email: 'k.reddy@uni.edu',   weeklyHours: 20, researchLoad: 'Medium', courses: ['CH101','CH201','CH301'] },
      { name: 'Prof. Arjun Das',    department: 'Computer Science', email: 'a.das@uni.edu',     weeklyHours: 16, researchLoad: 'High',   courses: ['CS501','CS502'] },
    ]);
    console.log('✅ Faculty seeded');
  }

  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    await Course.insertMany([
      { code: 'CS101', name: 'Introduction to Programming', credits: 4, students: 65, assignedTo: 'Dr. Ananya Sharma',  department: 'Computer Science', semester: 'Spring 2025' },
      { code: 'CS201', name: 'Data Structures',             credits: 4, students: 58, assignedTo: 'Prof. Ramesh Kumar', department: 'Computer Science', semester: 'Spring 2025' },
      { code: 'CS301', name: 'Algorithms',                  credits: 3, students: 45, assignedTo: 'Dr. Ananya Sharma',  department: 'Computer Science', semester: 'Spring 2025' },
      { code: 'CS401', name: 'Machine Learning',            credits: 4, students: 42, assignedTo: 'Dr. Ananya Sharma',  department: 'Computer Science', semester: 'Spring 2025' },
      { code: 'MA101', name: 'Calculus I',                  credits: 4, students: 80, assignedTo: 'Dr. Meena Iyer',     department: 'Mathematics',      semester: 'Spring 2025' },
      { code: 'MA201', name: 'Linear Algebra',              credits: 3, students: 55, assignedTo: 'Dr. Meena Iyer',     department: 'Mathematics',      semester: 'Spring 2025' },
      { code: 'PH101', name: 'Classical Mechanics',         credits: 4, students: 70, assignedTo: 'Dr. Lakshmi Nair',   department: 'Physics',          semester: 'Spring 2025' },
      { code: 'CH101', name: 'Organic Chemistry',           credits: 4, students: 60, assignedTo: 'Dr. Kavya Reddy',    department: 'Chemistry',        semester: 'Spring 2025' },
      { code: 'CS202', name: 'Database Systems',            credits: 3, students: 48, assignedTo: 'Prof. Ramesh Kumar', department: 'Computer Science', semester: 'Spring 2025' },
      { code: 'PH201', name: 'Electromagnetism',            credits: 4, students: 52, assignedTo: 'Dr. Lakshmi Nair',   department: 'Physics',          semester: 'Spring 2025' },
    ]);
    console.log('✅ Courses seeded');
  }
}
