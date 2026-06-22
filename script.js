// ── ADMIN DASHBOARD: PAGE NAVIGATION ─────────────────────
const pageTitles = {
  dashboard:     ['Dashboard',     'Welcome back. Here\'s what\'s happening today.'],
  applications:  ['Applications',  'Review and manage all room booking requests.'],
  rooms:         ['Rooms',         'Manage room types, availability and pricing.'],
  residents:     ['Residents',     'View and manage all current hostel residents.'],
  messages:      ['Messages',      'Read and reply to contact form submissions.'],
  announcements: ['Announcements', 'Post and manage notices to all residents.'],
  maintenance:   ['Maintenance',   'View and manage student maintenance requests.'],
  payments:      ['Payments',      'Track all room fee payments and outstanding balances.'],
  settings:      ['Settings',      'Update hostel information and admin account.'],
};

function showPage(page, linkEl) {
  // hide all pages
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  // show target
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  // update title
  if (pageTitles[page]) {
    document.getElementById('page-title').textContent = pageTitles[page][0];
    document.getElementById('page-sub').textContent   = pageTitles[page][1];
  }
  // update sidebar active link
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  // close sidebar on mobile
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.classList.remove('open');
  return false;
}

// ── MOBILE SIDEBAR ────────────────────────────────────────
function toggleSidebar() {
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger-btn');
  if (!sidebar || !hamburger) return;
  if (window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// Optional hamburger toggle button, if present on the page
const sidebarToggleBtn = document.getElementById('sidebarToggle');
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', () => {
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) sidebarEl.classList.toggle('open');
  });
}
