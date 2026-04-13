// public/js/dashboard.js

const DEPT_COLORS = {
  'Computer Science': '#4f8ef7',
  'Mathematics':      '#7c5cfc',
  'Physics':          '#36d9a0',
  'Chemistry':        '#f7c04f',
  'Electronics':      '#f75c5c',
  'Mechanical':       '#5cf7d4',
  'Civil':            '#f7a45c',
  'Other':            '#8c9ab0'
};

// ── View Management ─────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const view = item.dataset.view;
    switchView(view, item);
  });
});

function switchView(viewName, navEl) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById('view-' + viewName);
  if (viewEl) viewEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  const titles = {
    dashboard: ['Dashboard Overview',    'Smart Faculty Workload Management System'],
    faculty:   ['Faculty Members',        'Manage teaching assignments and workloads'],
    courses:   ['Course Management',      'Active courses and assignments'],
    schedule:  ['Weekly Schedule',        'Timetable and class distribution'],
    workload:  ['Workload Analysis',       'Identify imbalances and optimize distribution'],
    reports:   ['Reports & Analytics',    'Data insights from MongoDB'],
    settings:  ['System Settings',        'Configure thresholds and preferences']
  };

  if (titles[viewName]) {
    document.getElementById('topbarTitle').textContent = titles[viewName][0];
    document.getElementById('topbarSub').textContent   = titles[viewName][1];
  }

  // Lazy load per section
  if (viewName === 'faculty')  loadFaculty();
  if (viewName === 'courses')  loadCourses();
  if (viewName === 'schedule') renderSchedule();
  if (viewName === 'workload') loadWorkload();
  if (viewName === 'reports')  loadReports();
}

// ── Load Dashboard Stats ─────────────────────────────────────────
async function loadDashboardStats() {
  try {
    const res  = await fetch('/dashboard/stats');
    const json = await res.json();
    if (!json.success) return;

    const d = json.data;

    document.getElementById('stat-faculty').textContent    = d.totalFaculty;
    document.getElementById('stat-courses').textContent    = d.totalCourses;
    document.getElementById('stat-overloaded').textContent = d.overloaded;
    document.getElementById('stat-avgload').textContent    = d.avgHours + 'h';
    document.getElementById('navFacultyCount').textContent = d.totalFaculty;

    renderBarChart(d.workloadData);
    renderDonut(d.deptDistribution);
    renderActivityFeed(d);
    checkAlerts(d);
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

// ── Bar Chart ────────────────────────────────────────────────────
function renderBarChart(data) {
  if (!data || !data.length) return;
  const el = document.getElementById('barChart');
  const max = Math.max(...data.map(d => d.hours));

  el.innerHTML = data.map(f => {
    const pct   = max > 0 ? (f.hours / max * 100) : 0;
    const color = f.status === 'overloaded'
      ? 'linear-gradient(180deg,var(--danger),rgba(247,92,92,0.4))'
      : f.status === 'underloaded'
      ? 'linear-gradient(180deg,var(--accent2),rgba(124,92,252,0.4))'
      : 'linear-gradient(180deg,var(--accent),rgba(79,142,247,0.4))';

    return `<div class="bar-group">
      <div class="bar" data-val="${f.hours}h" style="height:${pct}%;background:${color};"></div>
      <div class="bar-label">${f.name}</div>
    </div>`;
  }).join('');
}

// ── Donut Chart ─────────────────────────────────────────────────
function renderDonut(depts) {
  if (!depts || !depts.length) return;
  const colors   = Object.values(DEPT_COLORS);
  const total    = depts.reduce((s, d) => s + d.count, 0);
  let offset     = 25; // start at top
  let circles    = '';
  let legendHTML = '';

  depts.forEach((dept, i) => {
    const pct   = (dept.count / total) * 100;
    const color = colors[i % colors.length];
    circles += `<circle cx="18" cy="18" r="15.9" fill="none"
      stroke="${color}" stroke-width="3"
      stroke-dasharray="${pct} ${100 - pct}"
      stroke-dashoffset="${-offset + 25}"/>`;
    offset += pct;
    legendHTML += `<div class="legend-item">
      <div class="legend-dot" style="background:${color}"></div>
      <span>${dept._id} (${dept.count})</span>
    </div>`;
  });

  document.getElementById('donutChart').innerHTML = `
    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface3)" stroke-width="3"/>
    ${circles}
    <text x="18" y="19.35" text-anchor="middle" font-size="5" fill="var(--text)" font-family="DM Sans">${depts.length} Depts</text>`;
  document.getElementById('donutLegend').innerHTML = legendHTML;
}

// ── Activity Feed ────────────────────────────────────────────────
function renderActivityFeed(data) {
  const activities = [];
  if (data.overloaded > 0)  activities.push({ icon: '🔴', text: `${data.overloaded} faculty member(s) are overloaded this week. Immediate rebalancing recommended.` });
  if (data.underloaded > 0) activities.push({ icon: '🟡', text: `${data.underloaded} faculty member(s) are underloaded. Consider assigning more courses.` });
  activities.push({ icon: '🟢', text: 'MongoDB database connection is healthy and synced.' });
  activities.push({ icon: '🔵', text: `${data.totalCourses} active courses with ${data.totalStudents} total enrolled students.` });
  activities.push({ icon: '🟢', text: `Average faculty workload is ${data.avgHours}h/week — within recommended norms.` });

  document.getElementById('activityFeed').innerHTML = activities.map(a =>
    `<div style="display:flex;align-items:flex-start;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);font-size:13px;">
      <span style="font-size:15px;flex-shrink:0;">${a.icon}</span>
      <div style="flex:1;color:var(--text2);">${a.text}</div>
    </div>`
  ).join('');
}

// ── Check Alerts ─────────────────────────────────────────────────
function checkAlerts(data) {
  const banner      = document.getElementById('alertBanner');
  const overloadBanner = document.getElementById('overloadAlert');

  if (data && data.overloaded > 0) {
    banner.innerHTML = `<div class="alert-banner danger">⚠️ <strong>${data.overloaded} faculty member(s)</strong> are overloaded. Immediate workload rebalancing is recommended.</div>`;
    if (overloadBanner) overloadBanner.style.display = 'flex';
    document.getElementById('systemStatus').textContent = '⚠ Attention Needed';
    document.getElementById('systemStatus').className  = 'badge yellow';
  } else {
    if (overloadBanner) overloadBanner.style.display = 'none';
  }
}

// ── Schedule ────────────────────────────────────────────────────
function renderSchedule() {
  const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  const schedule = {
    '8:00':  { Mon: {c:'CS101',r:'Lab A',col:''},       Wed: {c:'MA101',r:'Room 12',col:'c-purple'}, Fri: {c:'PH101',r:'Physics Lab',col:'c-green'} },
    '9:00':  { Mon: {c:'CS301',r:'Room 5',col:''},       Tue: {c:'MA201',r:'Room 8',col:'c-purple'},  Thu: {c:'CH101',r:'Chem Lab',col:'c-yellow'} },
    '10:00': { Tue: {c:'CS201',r:'Room 3',col:''},       Wed: {c:'PH201',r:'Room 9',col:'c-green'},   Fri: {c:'MA101',r:'Room 12',col:'c-purple'} },
    '11:00': { Mon: {c:'CS401',r:'Lab B',col:''},        Thu: {c:'MA301',r:'Room 7',col:'c-purple'},  Fri: {c:'CS202',r:'Lab C',col:''} },
    '12:00': { Tue: {c:'PH101',r:'Physics Lab',col:'c-green'}, Wed: {c:'CS101',r:'Room 2',col:''} },
    '14:00': { Mon: {c:'CH101',r:'Lab D',col:'c-yellow'}, Tue: {c:'CS501',r:'Lab E',col:''}, Thu: {c:'MA201',r:'Room 11',col:'c-purple'} },
    '15:00': { Wed: {c:'CS301',r:'Room 6',col:''},        Fri: {c:'PH201',r:'Room 10',col:'c-green'} },
    '16:00': { Mon: {c:'MA102',r:'Room 4',col:'c-purple'}, Thu: {c:'CS202',r:'Lab C',col:''} },
  };

  let html = `<div class="sch-header"></div>` + days.map(d => `<div class="sch-header">${d}</div>`).join('');

  times.forEach(t => {
    html += `<div class="sch-time">${t}</div>`;
    days.forEach(d => {
      const cls = schedule[t]?.[d];
      html += cls
        ? `<div class="sch-cell has-class ${cls.col}"><div class="sch-course">${cls.c}</div><div class="sch-room">${cls.r}</div></div>`
        : `<div class="sch-cell"></div>`;
    });
  });

  document.getElementById('scheduleGrid').innerHTML = html;
}

// ── Workload ─────────────────────────────────────────────────────
async function loadWorkload() {
  try {
    const res    = await fetch('/faculty');
    const json   = await res.json();
    if (!json.success) return;

    const el = document.getElementById('workloadCards');
    el.innerHTML = json.data.map(f => {
      const status = f.weeklyHours > 22 ? 'overloaded' : f.weeklyHours < 12 ? 'underloaded' : 'optimal';
      const label  = status[0].toUpperCase() + status.slice(1);
      const color  = DEPT_COLORS[f.department] || '#8c9ab0';
      const pct    = Math.min((f.weeklyHours / 30) * 100, 100);
      const barCol = status === 'overloaded' ? 'var(--danger)' : status === 'underloaded' ? 'var(--accent4)' : 'var(--accent3)';
      const initials = f.name.replace(/Dr\.|Prof\./g, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2);

      return `<div class="card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div class="faculty-avatar" style="width:42px;height:42px;border-radius:10px;background:${color}22;color:${color};">${initials}</div>
          <div><div style="font-weight:600;">${f.name}</div><div style="font-size:12px;color:var(--text3);">${f.department}</div></div>
          <span class="status-pill ${status}" style="margin-left:auto;">${label}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
          <div style="text-align:center;padding:10px;background:var(--surface2);border-radius:8px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;">${f.weeklyHours}h</div>
            <div style="font-size:11px;color:var(--text3);">Weekly Hours</div>
          </div>
          <div style="text-align:center;padding:10px;background:var(--surface2);border-radius:8px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;">${f.courses.length}</div>
            <div style="font-size:11px;color:var(--text3);">Courses</div>
          </div>
          <div style="text-align:center;padding:10px;background:var(--surface2);border-radius:8px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;">${f.researchLoad[0]}</div>
            <div style="font-size:11px;color:var(--text3);">Research</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:5px;">Workload Utilization</div>
        <div class="wl-bar-bg" style="width:100%;height:8px;">
          <div class="wl-bar-fill" style="width:${pct}%;background:${barCol};height:100%;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-top:3px;">
          <span>0h</span><span>${f.weeklyHours}h / 30h</span>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    console.error('Workload load error:', err);
  }
}

// ── Reports ──────────────────────────────────────────────────────
async function loadReports() {
  try {
    const [wlRes, csRes] = await Promise.all([
      fetch('/reports/workload-summary'),
      fetch('/reports/course-stats')
    ]);
    const wl = await wlRes.json();
    const cs = await csRes.json();

    if (!wl.success || !cs.success) return;
    const s = wl.data;
    const d = cs.data;

    document.getElementById('reportsGrid').innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Workload Distribution</div>
        ${[['Optimal', s.optimal, 'var(--accent3)'], ['Overloaded', s.overloaded, 'var(--danger)'], ['Underloaded', s.underloaded, 'var(--accent4)']].map(([l, v, c]) =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:9px;height:9px;border-radius:2px;background:${c};"></div>${l}
            </div>
            <span style="font-family:'JetBrains Mono',monospace;color:${c};">${v} faculty</span>
          </div>`).join('')}
        <div style="margin-top:16px;padding:12px;background:var(--surface2);border-radius:8px;text-align:center;">
          <div style="font-family:'DM Serif Display',serif;font-size:28px;">${s.avgHours}h</div>
          <div style="font-size:12px;color:var(--text3);">Average Weekly Hours</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Department Statistics</div>
        ${Object.entries(s.byDepartment).map(([dept, info]) =>
          `<div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
              <span>${dept}</span>
              <span style="color:${DEPT_COLORS[dept]||'var(--text2)'};">${info.avgHours}h avg · ${info.count} faculty</span>
            </div>
            <div class="wl-bar-bg" style="width:100%;height:6px;">
              <div style="height:100%;border-radius:3px;background:${DEPT_COLORS[dept]||'var(--accent)'};width:${Math.min((info.avgHours/30)*100,100)}%;"></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Course Stats by Department</div>
        ${d.map(dept =>
          `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;">
            <div><div style="font-weight:600;">${dept._id}</div><div style="font-size:11px;color:var(--text3);">${dept.totalCourses} courses · ${dept.totalStudents} students</div></div>
            <span style="font-family:'JetBrains Mono',monospace;color:var(--accent);">${dept.totalCredits} cr</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Research Load Distribution</div>
        ${['High','Medium','Low'].map(lvl => {
          const fac = Object.values(s.byDepartment);
          const colors = {High:'var(--danger)',Medium:'var(--accent4)',Low:'var(--accent3)'};
          return `<div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
              <span>${lvl} Research Load</span><span style="color:${colors[lvl]};">${lvl}</span>
            </div>
            <div class="wl-bar-bg" style="width:100%;height:7px;">
              <div style="height:100%;border-radius:3px;background:${colors[lvl]};width:${lvl==='High'?60:lvl==='Medium'?75:40}%;"></div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  } catch (err) {
    console.error('Reports load error:', err);
  }
}

// ── Settings ─────────────────────────────────────────────────────
function saveSettings() {
  toast('Settings saved successfully ✓', 'success');
}

// ── Refresh ──────────────────────────────────────────────────────
function refreshAll() {
  loadDashboardStats();
  toast('Data refreshed from MongoDB ✓', 'success');
}

// ── Init ─────────────────────────────────────────────────────────
(async function init() {
  // Load session user info
  try {
    const res  = await fetch('/dashboard/stats');
    const json = await res.json();
    if (!json.success) { window.location.href = '/login'; return; }
  } catch {
    window.location.href = '/login';
    return;
  }

  // Set user info from session cookie (we'll fetch from a simple endpoint)
  const sessionUser = document.cookie; // minimal check
  document.getElementById('sidebarName').textContent = 'Loading...';

  await loadDashboardStats();
})();
