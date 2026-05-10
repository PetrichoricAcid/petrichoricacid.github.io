// ── Data: all navigable items (used for search too) ────────
  const ALL_ITEMS = [
    { label:'About Me',    view:'about',    icon:'icons/users.ico', sub:'Who I am' },
    { label:'Projects',    view:'projects', icon:'icons/folder.ico', sub:'My work' },
    { label:'Skills',      view:'skills',   icon:'icons/gearFile.ico', sub:'What I know' },
    { label:'Contact',     view:'contact',  icon:'icons/NAS.ico', sub:'Get in touch' },
    { label:'My PC',       view:'mypc',     icon:'icons/mypc.ico', sub:'Check out my specs' },
  ];

  const COUNTS = {
    quickaccess:'5 items', about:'1 item', projects:'3 items',
    skills:'3 items', contact:'3 items', mypc:'5 items',
  };

  const VIEWS = ['quickaccess','about','projects','skills','contact','search','mypc'];

  // ── Navigation history ──────────────────────────────────────
  let history = ['quickaccess'];
  let histIdx  = 0;

  function navigate(e, label, view) {
    if (e) e.preventDefault();
    _showView(label, view);
    // Prune forward history if branching
    history = history.slice(0, histIdx + 1);
    history.push(view);
    histIdx = history.length - 1;
    updateNavBtns();
  }

  function goBack() {
    if (histIdx > 0) {
      histIdx--;
      const v = history[histIdx];
      const labels = { quickaccess:'Quick Access', about:'About Me', projects:'Projects', skills:'Skills', contact:'Contact' };
      _showView(labels[v] || v, v);
      updateNavBtns();
    }
  }

  function updateNavBtns() {
    document.getElementById('btn-back').disabled = histIdx <= 0;
    document.getElementById('btn-fwd').disabled  = histIdx >= history.length - 1;
  }

  function _showView(label, view) {
    // Show/hide views
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = v === view ? 'block' : 'none';
    });
    // Address bar + title
    document.getElementById('crumb').textContent = label;
    document.getElementById('title-text').textContent = label + ' — File Explorer';
    // Sidebar active
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll(`.sidebar-item[onclick*="'${view}'"]`).forEach(el => el.classList.add('active'));
    // Status bar
    document.getElementById('status-count').textContent = COUNTS[view] || '';
    document.getElementById('status-selected').textContent = '';
    // Clear search if navigating away
    if (view !== 'search') document.getElementById('search-input').value = '';
  }

  // ── Search ──────────────────────────────────────────────────
  function onSearch(q) {
    if (!q.trim()) {
      navigate(null, 'QuickAccess', 'quickaccess');
      return;
    }
    const results = ALL_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q.toLowerCase()) ||
      item.sub.toLowerCase().includes(q.toLowerCase())
    );
    const container = document.getElementById('search-results');
    container.innerHTML = results.length
      ? results.map(item => `
          <a href="#" class="folder-item" onclick="navigate(event,'${item.label}','${item.view}')">
            <div class="folder-icon"><img src="${item.icon}" width="18" height="auto"></div>
            <div class="folder-info">
              <div class="folder-name">${item.label}</div>
              <div class="folder-sub">${item.sub}</div>
            </div>
          </a>`).join('')
      : `<p style="color:var(--text-muted);font-size:12px;padding:4px">No results for "${q}"</p>`;

    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = v === 'search' ? 'block' : 'none';
    });
    document.getElementById('crumb').textContent = `Search results for "${q}"`;
    document.getElementById('status-count').textContent = results.length + ' item' + (results.length !== 1 ? 's' : '');
  }

  // ── Collapsible content sections ───────────────────────────
  function toggleSection(id, header) {
    const body = document.getElementById(id);
    body.classList.toggle('collapsed');
    const chev = header.querySelector('.chevron');
    chev.style.transform = body.classList.contains('collapsed') ? 'rotate(-90deg)' : '';
  }

  // ── Collapsible sidebar groups ──────────────────────────────
  function toggleSidebarGroup(header) {
    header.nextElementSibling.classList.toggle('collapsed');
    header.classList.toggle('collapsed');
  }

  // ── Toast Notification ──────────────────────────────────────

  let toastTimer = null;

  function showToast({ icon = '📄', title = 'Notification', message = '' } = {}) {

    let toast = document.getElementById('win-toast');

    // If already showing, reset it cleanly first

    if (toast) {

      toast.classList.remove('show');

      clearTimeout(toastTimer);

      // Small delay so the CSS transition resets before re-showing

      setTimeout(() => _displayToast(toast, icon, title, message), 80);

    } else {

      toast = _buildToast();

      document.body.appendChild(toast);

      setTimeout(() => _displayToast(toast, icon, title, message), 20);

    }

  }

  function _buildToast() {

    const t = document.createElement('div');

    t.id = 'win-toast';

    t.className = 'toast';

    t.innerHTML = `

      <div class="toast-icon" id="toast-icon"></div>

      <div class="toast-body">

        <div class="toast-app">File Explorer</div>

        <div class="toast-title" id="toast-title"></div>

        <div class="toast-msg"   id="toast-msg"></div>

      </div>

      <button class="toast-close" onclick="dismissToast()" title="Dismiss">&#x2715;</button>

      <div class="toast-bar"></div>

    `;

    return t;

  }

  function _displayToast(toast, icon, title, message) {

    document.getElementById('toast-icon').innerHTML = `<img src="${icon}" width="32" height="32">`;
    
    document.getElementById('toast-title').textContent = title;

    document.getElementById('toast-msg').textContent   = message;

    // Force reflow so animation restarts

    const bar = toast.querySelector('.toast-bar');

    bar.style.animation = 'none';

    bar.offsetHeight; // reflow

    bar.style.animation = '';

    toast.classList.add('show');

    toastTimer = setTimeout(dismissToast, 4000);

  }

  function dismissToast() {

    const toast = document.getElementById('win-toast');

    if (toast) toast.classList.remove('show');

    clearTimeout(toastTimer);

  }


  function openProperties(title, specs) {
  document.getElementById('prop-title').textContent = title + ' Properties';
  document.getElementById('prop-body').innerHTML = specs
    .map(([k, v]) => `<div class="prop-row"><span class="prop-key">${k}</span><span>${v}</span></div>`)
    .join('');
  document.getElementById('properties-overlay').style.display = 'flex';
}
function closeProperties(e) {
  if (e.target.id === 'properties-overlay')
    document.getElementById('properties-overlay').style.display = 'none';
}