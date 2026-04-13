// public/js/courses.js

async function loadCourses() {
  try {
    const res  = await fetch('/courses');
    const json = await res.json();
    if (!json.success) return;
    renderCourseTable(json.data);
  } catch (err) {
    console.error('Courses load error:', err);
  }
}

function renderCourseTable(list) {
  const tbody = document.getElementById('courseTableBody');
  if (!list || !list.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="big-icon">📚</div><div>No courses found</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const color = DEPT_COLORS[c.department] || '#8c9ab0';
    return `<tr>
      <td><span style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-weight:600;">${c.code}</span></td>
      <td style="font-weight:600;max-width:200px;">${c.name}</td>
      <td>${c.credits} cr</td>
      <td>${c.students}</td>
      <td style="font-size:12px;color:var(--text2);">${c.assignedTo || '—'}</td>
      <td><span class="badge" style="background:${color}20;color:${color};">${c.department}</span></td>
      <td><span class="status-pill optimal">Active</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="action-btn" onclick="deleteCourse('${c._id}','${c.code}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function saveCourse() {
  const data = {
    code:        document.getElementById('mc-code').value.trim().toUpperCase(),
    name:        document.getElementById('mc-name').value.trim(),
    credits:     parseInt(document.getElementById('mc-credits').value) || 3,
    students:    parseInt(document.getElementById('mc-students').value) || 0,
    department:  document.getElementById('mc-dept').value,
    assignedTo:  document.getElementById('mc-faculty').value,
    semester:    document.getElementById('mc-semester').value,
    type:        document.getElementById('mc-type').value,
  };

  if (!data.code || !data.name) {
    toast('Course code and name are required', 'error');
    return;
  }

  try {
    const res  = await fetch('/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.success) {
      toast('Course saved to MongoDB ✓', 'success');
      closeModal();
      loadCourses();
      loadDashboardStats();
    } else {
      toast(json.message || 'Save failed', 'error');
    }
  } catch (err) {
    toast('Server error', 'error');
  }
}

async function deleteCourse(id, code) {
  if (!confirm(`Remove course ${code}?`)) return;
  try {
    const res  = await fetch('/courses/' + id, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      toast('Course removed from MongoDB ✓', 'success');
      loadCourses();
      loadDashboardStats();
    } else {
      toast(json.message || 'Delete failed', 'error');
    }
  } catch (err) {
    toast('Server error', 'error');
  }
}
