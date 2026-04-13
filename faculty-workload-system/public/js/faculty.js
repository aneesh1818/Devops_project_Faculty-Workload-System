// public/js/faculty.js

async function loadFaculty() {
  const search = document.getElementById('facultySearch')?.value || '';
  const dept   = document.getElementById('deptFilter')?.value || '';
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (dept)   params.append('dept', dept);

  try {
    const res  = await fetch('/faculty?' + params.toString());
    const json = await res.json();
    if (!json.success) return;
    renderFacultyTable(json.data);
  } catch (err) {
    console.error('Faculty load error:', err);
  }
}

function renderFacultyTable(list) {
  const tbody = document.getElementById('facultyTableBody');
  if (!list || !list.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="big-icon">🔍</div><div>No faculty records found</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(f => {
    const status  = f.weeklyHours > 22 ? 'overloaded' : f.weeklyHours < 12 ? 'underloaded' : 'optimal';
    const label   = status[0].toUpperCase() + status.slice(1);
    const color   = DEPT_COLORS[f.department] || '#8c9ab0';
    const pct     = Math.min((f.weeklyHours / 30) * 100, 100);
    const barCol  = status === 'overloaded' ? 'var(--danger)' : status === 'underloaded' ? 'var(--accent4)' : 'var(--accent3)';
    const initials = f.name.replace(/Dr\.|Prof\./g, '').trim().split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return `<tr>
      <td>
        <div class="faculty-cell">
          <div class="faculty-avatar" style="background:${color}22;color:${color};">${initials}</div>
          <div>
            <div class="faculty-name">${f.name}</div>
            <div class="faculty-email">${f.email}</div>
          </div>
        </div>
      </td>
      <td><span class="badge" style="background:${color}20;color:${color};">${f.department}</span></td>
      <td><span style="font-family:'JetBrains Mono',monospace;">${f.courses.length}</span></td>
      <td>
        <div class="wl-bar-bg"><div class="wl-bar-fill" style="width:${pct}%;background:${barCol};"></div></div>
        <div class="wl-val">${f.weeklyHours}h / 30h</div>
      </td>
      <td><span class="badge ${f.researchLoad === 'High' ? 'red' : f.researchLoad === 'Medium' ? 'yellow' : 'green'}">${f.researchLoad}</span></td>
      <td><span class="status-pill ${status}">${label}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="action-btn" onclick="openEditFaculty('${f._id}')">✏️ Edit</button>
          <button class="action-btn danger" onclick="deleteFaculty('${f._id}', '${f.name.replace(/'/g,"\\'")}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function openEditFaculty(id) {
  try {
    const res  = await fetch('/faculty/' + id);
    const json = await res.json();
    if (!json.success) return;
    const f = json.data;

    openModal('editFaculty', f);
  } catch (err) {
    toast('Failed to load faculty data', 'error');
  }
}

async function deleteFaculty(id, name) {
  if (!confirm(`Remove ${name} from the system?`)) return;
  try {
    const res  = await fetch('/faculty/' + id, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      toast('Faculty removed from MongoDB ✓', 'success');
      loadFaculty();
      loadDashboardStats();
    } else {
      toast(json.message || 'Delete failed', 'error');
    }
  } catch (err) {
    toast('Server error', 'error');
  }
}

async function saveFaculty() {
  const id   = document.getElementById('mf-id')?.value;
  const data = {
    name:         document.getElementById('mf-name').value.trim(),
    email:        document.getElementById('mf-email').value.trim(),
    department:   document.getElementById('mf-dept').value,
    weeklyHours:  parseInt(document.getElementById('mf-hours').value) || 0,
    researchLoad: document.getElementById('mf-research').value,
    designation:  document.getElementById('mf-designation').value,
  };

  if (!data.name || !data.email) {
    toast('Name and email are required', 'error');
    return;
  }

  try {
    const url    = id ? '/faculty/' + id : '/faculty';
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.success) {
      toast(id ? 'Faculty updated in MongoDB ✓' : 'Faculty saved to MongoDB ✓', 'success');
      closeModal();
      loadFaculty();
      loadDashboardStats();
    } else {
      toast(json.message || 'Save failed', 'error');
    }
  } catch (err) {
    toast('Server error', 'error');
  }
}
