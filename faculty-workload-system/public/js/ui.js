// public/js/ui.js

// ── Modal System ─────────────────────────────────────────────────
function openModal(type, data = null) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');

  if (type === 'addFaculty' || type === 'editFaculty') {
    const isEdit = type === 'editFaculty' && data;
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Faculty Member' : 'Add Faculty Member';
    document.getElementById('modalSub').textContent   = isEdit
      ? 'Update record in MongoDB faculty collection'
      : 'New record will be saved to MongoDB faculty collection';

    document.getElementById('modalBody').innerHTML = `
      <div class="form-grid">
        <input type="hidden" id="mf-id" value="${isEdit ? data._id : ''}">
        <div class="field full">
          <label>Full Name</label>
          <input type="text" id="mf-name" placeholder="Dr. Full Name" value="${isEdit ? data.name : ''}">
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" id="mf-email" placeholder="faculty@university.edu" value="${isEdit ? data.email : ''}">
        </div>
        <div class="field">
          <label>Department</label>
          <select id="mf-dept">
            ${['Computer Science','Mathematics','Physics','Chemistry','Electronics','Mechanical','Civil','Other']
              .map(d => `<option ${isEdit && data.department === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Designation</label>
          <select id="mf-designation">
            ${['Professor','Associate Professor','Assistant Professor','Lecturer']
              .map(d => `<option ${isEdit && data.designation === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Weekly Hours</label>
          <input type="number" id="mf-hours" value="${isEdit ? data.weeklyHours : 18}" min="0" max="40">
        </div>
        <div class="field">
          <label>Research Load</label>
          <select id="mf-research">
            ${['Low','Medium','High'].map(l => `<option ${isEdit && data.researchLoad === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>`;

    document.getElementById('modalConfirm').textContent = isEdit ? 'Update Record' : 'Save to Database';
    document.getElementById('modalConfirm').onclick = saveFaculty;
  }

  else if (type === 'addCourse') {
    document.getElementById('modalTitle').textContent = 'Add New Course';
    document.getElementById('modalSub').textContent   = 'New record will be saved to MongoDB courses collection';

    document.getElementById('modalBody').innerHTML = `
      <div class="form-grid">
        <div class="field">
          <label>Course Code</label>
          <input type="text" id="mc-code" placeholder="CS101">
        </div>
        <div class="field">
          <label>Credits</label>
          <input type="number" id="mc-credits" value="3" min="1" max="6">
        </div>
        <div class="field full">
          <label>Course Name</label>
          <input type="text" id="mc-name" placeholder="Introduction to Programming">
        </div>
        <div class="field">
          <label>Department</label>
          <select id="mc-dept">
            ${['Computer Science','Mathematics','Physics','Chemistry','Electronics','Mechanical','Civil','Other']
              .map(d => `<option>${d}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>No. of Students</label>
          <input type="number" id="mc-students" value="40" min="0">
        </div>
        <div class="field">
          <label>Assigned Faculty</label>
          <select id="mc-faculty">
            <option value="">— Unassigned —</option>
          </select>
        </div>
        <div class="field">
          <label>Semester</label>
          <select id="mc-semester">
            <option>Spring 2025</option>
            <option>Fall 2025</option>
            <option>Spring 2026</option>
          </select>
        </div>
        <div class="field">
          <label>Type</label>
          <select id="mc-type">
            <option>Theory</option>
            <option>Lab</option>
            <option>Theory + Lab</option>
          </select>
        </div>
      </div>`;

    // Populate faculty dropdown
    fetch('/faculty').then(r => r.json()).then(json => {
      if (json.success) {
        const sel = document.getElementById('mc-faculty');
        json.data.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.name;
          opt.textContent = f.name;
          sel.appendChild(opt);
        });
      }
    });

    document.getElementById('modalConfirm').textContent = 'Save to Database';
    document.getElementById('modalConfirm').onclick = saveCourse;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// Close on overlay click
document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Toast Notifications ──────────────────────────────────────────
function toast(msg, type = 'success') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const tc  = document.getElementById('toastContainer');
  const el  = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '✓'}</span> ${msg}`;
  tc.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ── Sidebar User Info ────────────────────────────────────────────
// Fetch current user from a lightweight endpoint
(async function loadUserInfo() {
  try {
    const res  = await fetch('/dashboard/stats');
    const json = await res.json();
    if (!json.success) return;
    // Session user name is set server-side; we read it from a meta or cookie.
    // For now, display generic info — in full integration, add GET /me endpoint.
    const nameEl   = document.getElementById('sidebarName');
    const roleEl   = document.getElementById('sidebarRole');
    const avatarEl = document.getElementById('sidebarAvatar');
    if (nameEl && nameEl.textContent === 'Loading...') {
      nameEl.textContent   = 'Administrator';
      roleEl.textContent   = 'Admin / Dean';
      avatarEl.textContent = 'AD';
    }
  } catch {}
})();
