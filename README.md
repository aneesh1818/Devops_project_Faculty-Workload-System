# 🎓 FacultyIQ – Smart Faculty Workload Management System

A full-stack web application for managing faculty workloads, course assignments, and department scheduling using **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Project Structure

```
faculty-workload-system/
├── server.js                  # Main entry point
├── package.json
├── .env.example               # Environment variable template
│
├── models/
│   ├── User.js                # MongoDB User model (auth)
│   ├── Faculty.js             # MongoDB Faculty model
│   └── Course.js              # MongoDB Course model
│
├── routes/
│   ├── auth.js                # Login / Logout routes
│   ├── dashboard.js           # Dashboard stats API
│   ├── faculty.js             # Faculty CRUD API
│   ├── courses.js             # Courses CRUD API
│   └── reports.js             # Reports & analytics API
│
├── middleware/
│   └── auth.js                # Session auth middleware
│
├── views/
│   ├── login.html             # Login page
│   └── dashboard.html         # Main dashboard
│
└── public/
    ├── css/
    │   ├── main.css           # Shared styles & variables
    │   ├── login.css          # Login page styles
    │   └── dashboard.css      # Dashboard layout styles
    ├── js/
    │   ├── login.js           # Login form logic
    │   ├── dashboard.js       # Dashboard stats, charts
    │   ├── faculty.js         # Faculty CRUD operations
    │   ├── courses.js         # Course CRUD operations
    │   └── ui.js              # Modal, toast, sidebar
    └── 404.html
```

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and set your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/faculty_workload_db
SESSION_SECRET=change_this_to_a_random_string
PORT=3000
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Open in Browser
```
http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / Dean | admin@university.edu | admin123 |
| Head of Dept | hod@university.edu | hod123 |
| Faculty | faculty@university.edu | faculty123 |

> Credentials are seeded automatically on first run.

---

## 📊 Features

| Feature | Description |
|---------|-------------|
| 🔐 Login / Logout | Session-based auth with bcrypt password hashing |
| 📊 Dashboard | Live KPI stats, workload bar chart, department donut chart |
| 👩‍🏫 Faculty Management | Full CRUD — add, edit, delete faculty from MongoDB |
| 📚 Course Management | Create and assign courses to faculty members |
| 🗓️ Schedule View | Weekly timetable grid with color-coded departments |
| ⚖️ Workload Analysis | Per-faculty utilization bars with overload detection |
| 📈 Reports | Department stats, course distribution, research load |
| ⚙️ Settings | Configure workload thresholds |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: express-session + bcryptjs
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Fonts**: DM Serif Display, DM Sans, JetBrains Mono

---

## 🗄️ MongoDB Collections

- `users` — Authenticated users (admin, hod, faculty roles)
- `faculty` — Faculty member profiles and workload data
- `courses` — Course definitions and assignments
- `sessions` — Session store (auto-managed by connect-mongo)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/login` | Login page |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Destroy session |
| GET | `/dashboard` | Dashboard page |
| GET | `/dashboard/stats` | Stats JSON (faculty, courses, avg hours) |
| GET | `/faculty` | List all faculty |
| POST | `/faculty` | Create faculty (Admin/HOD only) |
| PUT | `/faculty/:id` | Update faculty |
| DELETE | `/faculty/:id` | Soft-delete faculty |
| GET | `/courses` | List all courses |
| POST | `/courses` | Create course |
| DELETE | `/courses/:id` | Remove course |
| GET | `/reports/workload-summary` | Workload analytics |
| GET | `/reports/course-stats` | Course stats by dept |

---

## 🔒 Role Permissions

| Action | Admin | HOD | Faculty |
|--------|-------|-----|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| Add/Edit/Delete Faculty | ✅ | ✅ | ❌ |
| Add/Delete Courses | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ |
| System Settings | ✅ | ❌ | ❌ |
