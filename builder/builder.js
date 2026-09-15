/**
 * Couple Project Builder JS
 * 100% Customizable Widget Content Inspector, Modular Layout Reordering, & R2 Media Pipeline
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function safeVal(v) {
  return String(v == null ? '' : v).replace(/"/g, '&quot;');
}
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.safeVal = safeVal;
}

if (typeof WIDGET_REGISTRY !== 'undefined' && !WIDGET_REGISTRY.intro) {
  WIDGET_REGISTRY.intro = {
    id: "intro",
    title: "First Screen (Wax Seal)",
    icon: "✉️",
    desc: "Wax sealed letter opening screen, flower burst physics & soundtrack picker.",
    category: "special",
    required: false,
    inspector: "/builder/inspectors/intro.inspector.js"
  };
}

let state = {
  slug: '',
  authToken: null,
  userRole: 'visitor', // "visitor" | "user" | "admin"
  isPurchased: false,
  templatePreset: 'blank',
  themeId: 'theme-pink',
  layoutOrder: [],
  sectionsData: {},
  allWidgetIds: Object.keys(WIDGET_REGISTRY),
  activeInspectorWidget: null,
  mediaViewMode:
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('saas_media_view')) ||
    'grid',
  mediaSort: 'newest',
  mediaSearchQuery: '',
  mediaFilter: 'all',
  mediaSettings: {
    volume: 80,
    autoplay: true,
    loop: true,
    sfx: true,
    floatingPlayer: true,
  },
};

// DOM references
const presetGrid = document.getElementById('presetGrid');
const widgetTray = document.getElementById('widgetTray');
const previewIframe = document.getElementById('previewIframe');
const currentTenantBadge = document.getElementById('currentTenantBadge');
const btnViewLive = document.getElementById('btnViewLive');
const btnSaveConfig = document.getElementById('btnSaveConfig');
const inspectorWidgetSelect = document.getElementById('inspectorWidgetSelect');
const inspectorFormContainer = document.getElementById(
  'inspectorFormContainer',
);

function updateLiveSyncPill(status = 'live') {
  const syncPill = document.getElementById('inspectorLiveSyncPill');
  if (!syncPill) return;
  if (status === 'saving') {
    syncPill.textContent = 'Saving';
    syncPill.className = 'inspector-meta-sync saving';
    syncPill.style.color = '#ef4444';
  } else {
    syncPill.textContent = 'Live';
    syncPill.className = 'inspector-meta-sync live';
    syncPill.style.color = '#10b981';
  }
}

// Live Sync Debouncer & Real-time Iframe Communication
let liveSyncTimeout = null;
function debouncedLiveUpdate(immediate = false, modifiedWidgetId = null) {
  clearTimeout(liveSyncTimeout);
  const doUpdate = () => {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'BUILDER_LIVE_UPDATE',
          config: {
            themeId: state.themeId,
            customBgUrl: state.customBgUrl || "",
            layoutOrder: state.layoutOrder,
            sectionsData: state.sectionsData,
            activeWidgetId: modifiedWidgetId || state.activeInspectorWidget,
          },
        },
        window.location.origin,
      );
    }
    const syncPill = document.getElementById('inspectorLiveSyncPill');
    if (syncPill && !syncPill.classList.contains('saving')) {
      updateLiveSyncPill('live');
    }
  };
  if (immediate) {
    doUpdate();
  } else {
    liveSyncTimeout = setTimeout(doUpdate, 80);
  }
}

// Toast notification helper
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ️';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastFadeOut 0.25s forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Auto-save debouncer for layout order & configs
let autoSaveTimeout = null;
function getAuthHeaders(extra = {}) {
  const userToken = localStorage.getItem('lovesaas_user_token');
  const headers = { ...extra };
  if (state.authToken) headers['X-Auth-Token'] = state.authToken;
  if (userToken) {
    headers['X-User-Token'] = userToken;
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  if (state.slug) headers['X-Tenant-Slug'] = state.slug;
  return headers;
}

let _lastSavedConfigPayload = null;

function debouncedAutoSaveLayout() {
  clearTimeout(autoSaveTimeout);
  updateLiveSyncPill('saving');
  const indicator = document.getElementById('autoSaveIndicator');
  if (state.userRole === 'visitor') {
    if (indicator) {
      indicator.className = 'auto-save-indicator';
      const textEl = indicator.querySelector('.indicator-text');
      if (textEl) textEl.textContent = 'Preview Mode';
    }
    updateLiveSyncPill('live');
    return;
  }
  if (indicator) {
    indicator.className = 'auto-save-indicator saving';
    const textEl = indicator.querySelector('.indicator-text');
    if (textEl) textEl.textContent = 'Saving...';
  }

  autoSaveTimeout = setTimeout(async () => {
    try {
      const payloadStr = JSON.stringify({
        templatePreset: state.templatePreset,
        themeId: state.themeId,
        layoutOrder: state.layoutOrder,
        sectionsData: state.sectionsData,
      });
      if (payloadStr === _lastSavedConfigPayload) {
        if (indicator) {
          indicator.className = 'auto-save-indicator saved';
          const textEl = indicator.querySelector('.indicator-text');
          if (textEl) textEl.textContent = 'All changes saved';
        }
        updateLiveSyncPill('live');
        return;
      }
      _lastSavedConfigPayload = payloadStr;

      const res = await fetch(
        `/api/tenants/${encodeURIComponent(state.slug)}/config`,
        {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: payloadStr,
        },
      );
      if (indicator) {
        indicator.className = 'auto-save-indicator saved';
        const textEl = indicator.querySelector('.indicator-text');
        if (textEl) textEl.textContent = 'All changes saved';
      }
      updateLiveSyncPill('live');
    } catch (err) {
      console.warn('Auto-save layout error:', err);
      if (indicator) {
        indicator.className = 'auto-save-indicator';
        const textEl = indicator.querySelector('.indicator-text');
        if (textEl) textEl.textContent = 'Unsaved changes';
      }
      updateLiveSyncPill('live');
    }
  }, 800);
}

if (previewIframe) {
  previewIframe.addEventListener('load', () => {
    debouncedLiveUpdate(true);
  });
}

// ----------------------------------------------------
// BUILDER ACCESS GATING & INITIALIZATION
// ----------------------------------------------------
function showAccessGateModal(presetSlug = '') {
  const gateModal = document.getElementById('builderAccessGateModal');
  const slugInput = document.getElementById('gateSlugInput');
  const errorMsg = document.getElementById('gateErrorMsg');
  if (!gateModal) return;
  if (presetSlug && slugInput) slugInput.value = presetSlug;
  if (errorMsg) errorMsg.style.display = 'none';
  gateModal.classList.remove('hidden');
}

function hideAccessGateModal() {
  const gateModal = document.getElementById('builderAccessGateModal');
  if (gateModal) gateModal.classList.add('hidden');
}

function showDemoBanner(visible) {
  const banner = document.getElementById('demoBannerBar');
  if (!banner) return;
  banner.style.display = visible ? 'flex' : 'none';
}

function updateRoleUI() {
  const roleBadge = document.getElementById('roleStatusBadge');
  const roleIcon = document.getElementById('roleStatusIcon');
  const roleText = document.getElementById('roleStatusText');
  const demoBanner = document.getElementById('demoBannerBar');
  const btnSave = document.getElementById('btnSaveConfig');
  const saveText = btnSave ? btnSave.querySelector('.btn-save-text') : null;
  const saveIcon = btnSave ? btnSave.querySelector('.btn-save-icon') : null;
  const saveKbd = btnSave ? btnSave.querySelector('.kbd-shortcut') : null;

  document.body.classList.remove('role-admin', 'role-user', 'role-visitor');
  document.body.classList.add(`role-${state.userRole}`);

  const btnHeaderNew = document.getElementById('btnHeaderNewProject');
  if (btnHeaderNew) {
    btnHeaderNew.style.display = 'none';
  }

  if (state.userRole === 'admin') {
    // ADMIN: Full access, full rights, NO demo banner, NO purchase prompts
    if (roleBadge) {
      roleBadge.className = 'role-badge role-admin';
      if (roleIcon) roleIcon.textContent = '🛡️';
      if (roleText) roleText.textContent = 'Admin (Full Access)';
      roleBadge.title =
        'Master Admin: Full access & rights across all projects. Click to switch.';
    }
    showDemoBanner(false);
    if (btnSave) {
      btnSave.classList.remove('btn-visitor-cta');
      btnSave.title = 'Save changes (Ctrl+S / Cmd+S)';
      if (saveIcon) saveIcon.textContent = '💾';
      if (saveText)
        saveText.innerHTML =
          'Save<span class="btn-save-extra"> & Publish</span>';
      if (saveKbd) saveKbd.style.display = 'inline-block';
    }
    document
      .querySelectorAll('.visitor-overlay-lock, .visitor-locked-banner')
      .forEach((el) => el.remove());
  } else if (state.userRole === 'user') {
    // USER: Full access to own design if purchased, NO demo banner
    if (roleBadge) {
      roleBadge.className = 'role-badge role-user';
      if (roleIcon) roleIcon.textContent = '✨';
      if (roleText) roleText.textContent = 'User (Full Access)';
      roleBadge.title = `Project Owner (${state.slug}): Full customization rights. Click to switch.`;
    }
    showDemoBanner(false);
    if (btnSave) {
      btnSave.classList.remove('btn-visitor-cta');
      btnSave.title = 'Save changes (Ctrl+S / Cmd+S)';
      if (saveIcon) saveIcon.textContent = '💾';
      if (saveText)
        saveText.innerHTML =
          'Save<span class="btn-save-extra"> & Publish</span>';
      if (saveKbd) saveKbd.style.display = 'inline-block';
    }
    document
      .querySelectorAll('.visitor-overlay-lock, .visitor-locked-banner')
      .forEach((el) => el.remove());
  } else {
    // VISITOR: Extremely limited controls, label 'purchase now to customize'
    state.userRole = 'visitor';
    if (roleBadge) {
      roleBadge.className = 'role-badge role-visitor';
      if (roleIcon) roleIcon.textContent = '👀';
      if (roleText) roleText.textContent = 'Visitor (Demo)';
      roleBadge.title =
        'Visitor Demo: Limited controls. Click to unlock/purchase.';
    }
    showDemoBanner(true);
    const demoBannerText = document.getElementById('demoBannerText');
    if (demoBannerText)
      demoBannerText.textContent =
        '🎨 Visitor Demo Mode — Previewing sample project. Controls are extremely limited.';
    const demoBannerCta = document.getElementById('demoBannerCta');
    if (demoBannerCta)
      demoBannerCta.textContent = 'Purchase now to customize ↗';

    if (btnSave) {
      btnSave.classList.add('btn-visitor-cta');
      btnSave.title = 'Purchase now to customize and save your couple project';
      if (saveIcon) saveIcon.textContent = '🛍️';
      if (saveText) saveText.textContent = 'Purchase now to customize';
      if (saveKbd) saveKbd.style.display = 'none';
    }
  }
}

function showBuilderAuthModal() {
  document.documentElement.classList.remove('builder-gate-active');
  document.getElementById('builderDesignPickerModal')?.classList.add('hidden');
  document.getElementById('builderAuthModal')?.classList.remove('hidden');
}

function showBuilderForbiddenModal(slug) {
  document.documentElement.classList.remove('builder-gate-active');
  document.getElementById('builderDesignPickerModal')?.classList.add('hidden');
  const msg = document.getElementById('builderForbiddenMsg');
  if (msg)
    msg.textContent = `Access Denied: You do not have permission to access or edit /sites/${slug}. This design belongs to another account.`;
  document.getElementById('builderForbiddenModal')?.classList.remove('hidden');
}

async function checkBuilderAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramSlug = urlParams.get('slug');
  const paramToken = urlParams.get('token');
  const paramRole = urlParams.get('role');
  const paramCreate = urlParams.get('create');

  const localAuth = JSON.parse(localStorage.getItem('lovesaas_auth') || 'null');
  const userToken = localStorage.getItem('lovesaas_user_token');

  // Master Admin bypass check
  const isDirectMasterAdmin =
    (paramRole === 'admin' && paramToken) ||
    (localAuth && localAuth.role === 'admin' && localAuth.authToken);

  if (isDirectMasterAdmin) {
    state.userRole = 'admin';
    state.isPurchased = true;
    state.authToken = paramToken || (localAuth && localAuth.authToken) || userToken || '';

    if (paramSlug) {
      state.slug = paramSlug;
      updateRoleUI();
      updateUserMenuUI();
      fetchUserProjects();
      return true;
    }

    let adminDesigns = [];
    try {
      const tRes = await fetch('/api/tenants', {
        headers: state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        adminDesigns = (tData.tenants || []).map((t) => ({
          slug: t.slug,
          partner1: t.partner1,
          partner2: t.partner2,
          themeId: t.theme_id || t.themeId || 'romantic-rose',
          preset: t.preset || 'complete',
          plan: t.plan || 'vip',
          createdAt: t.created_at || t.createdAt,
          updatedAt: t.updated_at || t.updatedAt,
          authToken: state.authToken,
        }));
      }
    } catch (e) {}
    state.userDesigns = adminDesigns;
    showDesignPickerModal(adminDesigns);
    return false;
  }

  // Require user authentication
  if (!userToken) {
    showBuilderAuthModal();
    return false;
  }

  let user = null;
  try {
    const uRes = await fetch('/api/auth/user-me', {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'X-User-Token': userToken,
      },
    });
    if (!uRes.ok) throw new Error('Auth failed');
    const uData = await uRes.json();
    if (!uData.user) throw new Error('No user');
    user = uData.user;
  } catch (e) {
    localStorage.removeItem('lovesaas_user_token');
    showBuilderAuthModal();
    return false;
  }

  state.currentUser = user;
  document.getElementById('builderAuthModal')?.classList.add('hidden');
  document.getElementById('builderForbiddenModal')?.classList.add('hidden');

  // Account badge in header
  const userBadge = document.getElementById('builderUserBadge');
  const userNameEl = document.getElementById('builderUserName');
  const userAvatarEl = document.getElementById('builderUserAvatar');
  const displayName = user.name || user.email.split('@')[0];
  if (userNameEl) userNameEl.textContent = displayName;
  if (userAvatarEl)
    userAvatarEl.textContent = displayName
      ? displayName[0].toUpperCase()
      : '👤';
  if (userBadge) userBadge.style.display = 'none';
  updateUserMenuUI();

  const isAdmin = user.role === 'admin';

  // Admin has access to all sites
  if (isAdmin) {
    state.userRole = 'admin';
    state.isPurchased = true;
    state.authToken = userToken || '';

    if (paramSlug) {
      state.slug = paramSlug;
      updateRoleUI();
      fetchUserProjects();
      return true;
    }
    // No slug → fall through to design picker
  }

  // Non-admin user: fetch user's sites
  let userDesigns = [];
  try {
    const desRes = await fetch('/api/user/designs', {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'X-User-Token': userToken,
      },
    });
    if (desRes.ok) {
      const desData = await desRes.json();
      userDesigns = desData.designs || [];
    }
  } catch (e) {}
  state.userDesigns = userDesigns;

  // If specific slug requested, ensure user owns it
  if (paramSlug) {
    const target = userDesigns.find(
      (d) => d.slug.toLowerCase() === paramSlug.toLowerCase(),
    );
    if (!target) {
      showBuilderForbiddenModal(paramSlug);
      return false;
    }
    state.slug = target.slug;
    state.userRole = 'user';
    state.isPurchased = true;
    state.authToken = target.authToken || '';
    localStorage.setItem(
      'lovesaas_auth',
      JSON.stringify({
        slug: target.slug,
        role: 'user',
        authToken: state.authToken,
        plan: target.plan || 'vip',
      }),
    );
    updateRoleUI();
    fetchUserProjects();
    return true;
  }

  // Show design picker or directly open new project modal if requested
  if (paramCreate === '1' || urlParams.get('new') === '1') {
    document.getElementById('builderDesignPickerModal')?.classList.add('hidden');
    document.documentElement.classList.remove('builder-gate-active');
    setTimeout(() => {
      if (typeof window.openNewProjectModal === 'function') {
        window.openNewProjectModal(userDesigns.length === 0);
      }
    }, 150);
    return false;
  }

  showDesignPickerModal(userDesigns);
  return false;
}

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  populateInspectorSelect();
  renderPresetsUI();

  // Role Badge click opens Gate Modal
  const roleBadge = document.getElementById('roleStatusBadge');
  if (roleBadge) {
    roleBadge.onclick = () => showAccessGateModal(state.slug);
  }

  // Gate Modal Tab Switcher
  const gateTabs = document.querySelectorAll('.gate-role-tab');
  gateTabs.forEach((tab) => {
    tab.onclick = () => {
      const targetTab = tab.dataset.gateTab;
      gateTabs.forEach((t) => {
        t.classList.remove('active');
        t.style.background = 'transparent';
        t.style.color = '#94a3b8';
      });
      tab.classList.add('active');
      tab.style.background = targetTab === 'admin' ? '#10b981' : '#2563eb';
      tab.style.color = '#ffffff';

      document.getElementById('paneGateUser').style.display =
        targetTab === 'user' ? 'block' : 'none';
      document.getElementById('paneGateAdmin').style.display =
        targetTab === 'admin' ? 'block' : 'none';
      document.getElementById('paneGateVisitor').style.display =
        targetTab === 'visitor' ? 'block' : 'none';
    };
  });

  // User Unlock Listener
  const btnGateUnlock = document.getElementById('btnGateUnlock');
  if (btnGateUnlock) {
    btnGateUnlock.addEventListener('click', async () => {
      const slugInput = document.getElementById('gateSlugInput');
      const errorMsg = document.getElementById('gateErrorMsg');
      const slug = slugInput.value.trim().toLowerCase();

      if (!slug) {
        errorMsg.textContent = 'Please provide project slug.';
        errorMsg.style.display = 'block';
        return;
      }

      btnGateUnlock.disabled = true;
      btnGateUnlock.textContent = 'Verifying...';
      errorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/auth/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, token: state.authToken || '' }),
        });
        const data = await res.json();
        if (!res.ok || !data.authorized) {
          throw new Error(data.error || 'Invalid slug or unauthorized access');
        }

        state.slug = data.slug;
        state.authToken = data.authToken;
        state.isPurchased = data.isPurchased !== false;
        state.userRole =
          data.role ||
          (data.isAdmin ? 'admin' : state.isPurchased ? 'user' : 'visitor');

        localStorage.setItem(
          'lovesaas_auth',
          JSON.stringify({
            slug: data.slug,
            role: state.userRole,
            authToken: data.authToken,
            plan: data.plan,
          }),
        );

        hideAccessGateModal();
        updateRoleUI();
        window.history.replaceState(
          {},
          '',
          `/builder?slug=${encodeURIComponent(data.slug)}`,
        );
        await loadTenantData(state.slug);
        showToast(`Welcome! Logged in as ${state.userRole}.`, 'success');
      } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      } finally {
        btnGateUnlock.disabled = false;
        btnGateUnlock.innerHTML = `<span>Open My Design</span> <span>🔑</span>`;
      }
    });
  }

  // Admin Login Listener
  const btnGateAdminLogin = document.getElementById('btnGateAdminLogin');
  if (btnGateAdminLogin) {
    btnGateAdminLogin.addEventListener('click', async () => {
      const slugInput = document.getElementById('gateAdminSlugInput');
      const errorMsg = document.getElementById('gateErrorMsg');
      const slug = (slugInput?.value || 'demo').trim().toLowerCase() || 'demo';

      btnGateAdminLogin.disabled = true;
      btnGateAdminLogin.textContent = 'Verifying Admin...';
      errorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/auth/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, token: userToken || '' }),
        });
        const data = await res.json();
        if (!res.ok || !data.authorized || !data.isAdmin) {
          throw new Error(data.error || 'Invalid Admin credentials');
        }

        state.slug = data.slug || slug;
        state.authToken = data.authToken || userToken || '';
        state.userRole = 'admin';
        state.isPurchased = true;

        localStorage.setItem(
          'lovesaas_auth',
          JSON.stringify({
            slug: state.slug,
            role: 'admin',
            authToken: state.authToken,
            plan: 'vip',
          }),
        );

        hideAccessGateModal();
        updateRoleUI();
        window.history.replaceState(
          {},
          '',
          `/builder?slug=${encodeURIComponent(state.slug)}`,
        );
        await loadTenantData(state.slug);
        showToast('🛡️ Master Admin logged in with full rights!', 'success');
      } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      } finally {
        btnGateAdminLogin.disabled = false;
        btnGateAdminLogin.innerHTML = `<span>Login as Admin</span> <span>🛡️</span>`;
      }
    });
  }

  // Visitor Demo Listener
  const btnGateDemo = document.getElementById('btnGateDemo');
  if (btnGateDemo) {
    btnGateDemo.addEventListener('click', async () => {
      hideAccessGateModal();
      state.slug = 'demo';
      state.userRole = 'visitor';
      state.isPurchased = false;
      updateRoleUI();
      window.history.replaceState({}, '', '/builder?slug=demo');
      await loadTenantData('demo');
    });
  }

  const hasAccess = await checkBuilderAccess();
  if (hasAccess) {
    await loadTenantData(state.slug);
  }
  fetchUserProjects();

  const urlParams = new URLSearchParams(window.location.search);
  const insertParam = urlParams.get('insert');
  if (insertParam !== null) {
    const parsed = parseInt(insertParam, 10);
    setTimeout(
      () =>
        openAddSectionModal(isNaN(parsed) ? state.layoutOrder.length : parsed),
      350,
    );
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'lovesaas_user_token') {
      checkBuilderAccess().then(() => {
        loadTenantData(state.slug);
      });
    }
  });
});

async function loadTenantData(slug) {
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Could not load tenant project config');
    const data = await res.json();

    state.slug = data.slug;
    state.partner1 =
      data.partner1 ||
      (data.sectionsData &&
        data.sectionsData.hero &&
        data.sectionsData.hero.partner1) ||
      '';
    state.partner2 =
      data.partner2 ||
      (data.sectionsData &&
        data.sectionsData.hero &&
        data.sectionsData.hero.partner2) ||
      '';
    state.customerEmail = data.customerEmail || '';
    if (data.isPurchased !== undefined && state.userRole !== 'admin') {
      state.isPurchased = data.isPurchased !== false;
    }
    state.templatePreset = data.templatePreset || 'storyteller';
    state.themeId =
      data.themeId === 'romantic-rose' || !data.themeId
        ? 'theme-pink'
        : data.themeId;
    state.layoutOrder = Array.isArray(data.layoutOrder)
      ? data.layoutOrder
      : PRESETS.storyteller?.widgets || [];
    state.sectionsData = data.sectionsData || {};

    if (state.sectionsData.hero) {
      if (
        state.partner1 &&
        (!state.sectionsData.hero.partner1 ||
          state.sectionsData.hero.partner1 === 'Alex')
      ) {
        state.sectionsData.hero.partner1 = state.partner1;
      }
      if (
        state.partner2 &&
        (!state.sectionsData.hero.partner2 ||
          state.sectionsData.hero.partner2 === 'Sam')
      ) {
        state.sectionsData.hero.partner2 = state.partner2;
      }
    }

    if (state.layoutOrder && state.layoutOrder.length) {
      if (!state.layoutOrder.includes(state.activeInspectorWidget)) {
        state.activeInspectorWidget = state.layoutOrder[0];
      }
    } else {
      state.activeInspectorWidget = null;
    }

    updateNavbarUI();
    updateRoleUI();
    renderPresetsUI();
    renderWidgetTray();
    if (state.layoutOrder.length === 0 || !state.activeInspectorWidget) {
      renderInspectorEmptyState();
    } else {
      selectWidgetForInspector(state.activeInspectorWidget);
    }
    document.documentElement.classList.remove('builder-gate-active');
    document
      .getElementById('builderDesignPickerModal')
      ?.classList.add('hidden');
    reloadPreview();
  } catch (err) {
    showToast('Error loading project: ' + err.message, 'error');
  }
}

function updateNavbarUI() {
  if (currentTenantBadge) currentTenantBadge.innerText = state.slug || 'demo';
  if (btnViewLive)
    btnViewLive.href = `/sites/${encodeURIComponent(state.slug || 'demo')}`;
  const urlText = document.getElementById('previewUrlText');
  if (urlText) {
    urlText.textContent = `${window.location.host}/sites/${state.slug || 'demo'}`;
  }
  const presetBadge = document.getElementById('currentPresetNameBadge');
  if (presetBadge) {
    presetBadge.textContent =
      PRESETS[state.templatePreset]?.name || state.templatePreset;
  }
  renderProjectSwitcher();
  updateUserMenuUI();
}

// ----------------------------------------------------
// 1. TEMPLATE PRESETS
// ----------------------------------------------------
let currentWidgetFilter = 'all';
let currentWidgetSearchQuery = '';
const collapsedChapters = new Set();

function renderPresetsUI() {
  presetGrid.innerHTML = '';
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const card = document.createElement('div');
    const isActive = state.templatePreset === key;
    card.className = `preset-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="preset-card-header">
        <div class="preset-title-wrap">
          <span class="preset-indicator-dot">${isActive ? '✓' : ''}</span>
          <h4 class="preset-title">${escapeHtml(preset.name)}</h4>
        </div>
        <span class="preset-badge">${preset.widgets.length} sections</span>
      </div>
      <p class="preset-desc">${escapeHtml(preset.desc)}</p>
      ${isActive ? `<div class="preset-active-indicator">✓ Active Preset</div>` : ''}
    `;
    card.onclick = () => applyPreset(key);
    presetGrid.appendChild(card);
  });
}

function applyPreset(presetKey) {
  if (state.userRole === 'visitor') {
    showToast('🔒 Purchase now to customize template presets!', 'warning');
    window.open('/welcome#pricing', '_blank');
    return;
  }
  const preset = PRESETS[presetKey];
  if (!preset) return;
  state.templatePreset = presetKey;
  state.layoutOrder = [...preset.widgets];

  if (state.layoutOrder.length) {
    if (!state.layoutOrder.includes(state.activeInspectorWidget)) {
      state.activeInspectorWidget = state.layoutOrder[0];
    }
  } else {
    state.activeInspectorWidget = null;
  }

  const presetBadge = document.getElementById('currentPresetNameBadge');
  if (presetBadge) presetBadge.textContent = preset.name;

  const wrapper = document.getElementById('presetGridWrapper');
  if (wrapper) wrapper.classList.add('hidden');
  const toggleText = document.getElementById('btnPresetToggleText');
  if (toggleText) toggleText.textContent = '▾';
  const btnToggle = document.getElementById('btnTogglePresets');
  if (btnToggle) btnToggle.classList.remove('is-open');

  renderPresetsUI();
  renderWidgetTray();
  if (state.activeInspectorWidget) {
    selectWidgetForInspector(state.activeInspectorWidget);
  } else {
    renderInspectorEmptyState();
  }
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
  showToast(`Applied "${preset.name}" preset`, 'success');
}

// ----------------------------------------------------
// 2. MODULAR WIDGET GRID / REORDER TRAY
// ----------------------------------------------------
function renderWidgetTray() {
  widgetTray.innerHTML = '';

  const activeSet = new Set(state.layoutOrder);
  const inactiveWidgets = state.allWidgetIds.filter((id) => !activeSet.has(id) && id !== 'intro');
  const fullList = [...state.layoutOrder.filter(id => id !== 'intro'), ...inactiveWidgets];

  const query = (currentWidgetSearchQuery || '').toLowerCase().trim();
  const showIntroCard = !query || 'first screen wax sealed letter intro gate flower burst soundtrack'.includes(query);

  if (showIntroCard && currentWidgetFilter !== 'inactive') {
    const screen1Header = document.createElement('div');
    screen1Header.className = 'screen-section-banner screen-1-banner';
    screen1Header.innerHTML = `
      <div class="screen-banner-left">
        <span class="screen-banner-icon">✉️</span>
        <div class="screen-banner-text">
          <span class="screen-banner-title">Screen 1: Intro Gate</span>
          <span class="screen-banner-hint">Wax-sealed letter, music & burst trigger</span>
        </div>
      </div>
      <span class="screen-banner-badge">Intro Screen</span>
    `;
    widgetTray.appendChild(screen1Header);

    const screen1Card = document.createElement('div');
    screen1Card.className = `tray-item screen1-pinned-card active-widget ${state.activeInspectorWidget === 'intro' ? 'selected-for-edit' : ''}`;
    screen1Card.dataset.widgetId = 'intro';
    screen1Card.title = 'Customize First Screen: Wax Sealed Letter';
    screen1Card.style.cursor = 'pointer';
    screen1Card.style.marginBottom = '14px';
    screen1Card.innerHTML = `
      <div class="screen1-lead">
        <span class="screen1-icon">✉️</span>
        <div class="screen1-info">
          <div class="screen1-title-row">
            <span class="screen1-title">First Screen: Wax Sealed Letter</span>
            <span class="screen1-badge">Screen 1</span>
          </div>
          <div class="screen1-desc">Opening Gate • Flower Burst &amp; Soundtrack</div>
        </div>
      </div>
      <div class="screen1-actions">
        <button type="button" class="btn-customize-intro" title="Customize First Screen">
          <span>Customize</span>
        </button>
        <span class="screen1-chevron">›</span>
      </div>
    `;

    const openIntroCustomize = (e) => {
      if (e) e.stopPropagation();
      selectWidgetForInspector('intro');
      if (typeof window.setPreviewScreen === 'function') {
        window.setPreviewScreen('intro');
      }
      if (typeof switchToTab === 'function') switchToTab('tab-inspector', true);
    };

    screen1Card.onclick = openIntroCustomize;
    const btnCust = screen1Card.querySelector('.btn-customize-intro');
    if (btnCust) btnCust.onclick = openIntroCustomize;

    widgetTray.appendChild(screen1Card);
  }

  const countEl = document.getElementById('activeWidgetsCount');
  if (countEl)
    countEl.textContent = `${state.layoutOrder.length}/${state.allWidgetIds.length}`;
  const countAllEl = document.getElementById('filterCountAll');
  if (countAllEl) countAllEl.textContent = state.allWidgetIds.length;
  const countActiveEl = document.getElementById('filterCountActive');
  if (countActiveEl) countActiveEl.textContent = state.layoutOrder.length;
  const countInactiveEl = document.getElementById('filterCountInactive');
  if (countInactiveEl) countInactiveEl.textContent = inactiveWidgets.length;

  const tabBadge = document.getElementById('tabWidgetCountBadge');
  if (tabBadge)
    tabBadge.textContent = `${state.layoutOrder.length}/${state.allWidgetIds.length}`;

  const filteredList = fullList.filter((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return false;
    const isActive = activeSet.has(id);
    if (currentWidgetFilter === 'active' && !isActive) return false;
    if (currentWidgetFilter === 'inactive' && isActive) return false;
    if (
      currentWidgetFilter !== 'all' &&
      currentWidgetFilter !== 'active' &&
      currentWidgetFilter !== 'inactive'
    ) {
      if (meta.category !== currentWidgetFilter) return false;
    }
    if (query) {
      const matchTitle = (meta.title || '').toLowerCase().includes(query);
      const matchDesc = (meta.desc || '').toLowerCase().includes(query);
      const matchCat = (meta.category || '').toLowerCase().includes(query);
      const matchId = id.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat && !matchId) return false;
    }
    return true;
  });

  if (filteredList.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'widget-empty-state';
    emptyState.innerHTML = `
      <span class="empty-icon">🔍</span>
      <div class="empty-title">No sections found</div>
      <p class="empty-text">No section matching "<strong>${escapeHtml(currentWidgetSearchQuery)}</strong>"</p>
      <button type="button" class="btn-clear-search-pill" id="btnEmptyClearSearch">Reset Filter</button>
    `;
    widgetTray.appendChild(emptyState);
    const btnReset = document.getElementById('btnEmptyClearSearch');
    if (btnReset) {
      btnReset.onclick = () => {
        currentWidgetSearchQuery = '';
        currentWidgetFilter = 'all';
        const searchInput = document.getElementById('widgetSearchInput');
        const clearBtn = document.getElementById('btnClearWidgetSearch');
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.classList.add('hidden');
        document
          .querySelectorAll('.filter-chip')
          .forEach((c) =>
            c.classList.toggle('active', c.dataset.filter === 'all'),
          );
        renderWidgetTray();
      };
    }
    return;
  }

  // Screen 2 Header Separator
  const screen2Header = document.createElement('div');
  screen2Header.className = 'screen-section-banner screen-2-banner';
  screen2Header.innerHTML = `
    <div class="screen-banner-left">
      <span class="screen-banner-icon">🌐</span>
      <div class="screen-banner-text">
        <span class="screen-banner-title">Screen 2: Main Website</span>
        <span class="screen-banner-hint">Scrollable website after opening letter</span>
      </div>
    </div>
    <span class="screen-banner-badge">${filteredList.length} Sections</span>
  `;
  widgetTray.appendChild(screen2Header);

  const createTrayItem = (id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return null;
    const isActive = activeSet.has(id);
    const activeIndex = state.layoutOrder.indexOf(id);
    const isSelected = state.activeInspectorWidget === id;

    const item = document.createElement('div');
    item.className = `tray-item ${isActive ? 'active-widget' : 'inactive-widget'} ${isSelected ? 'selected-for-edit' : ''}`;
    item.draggable = isActive;
    item.dataset.widgetId = id;
    item.title = `Customize ${meta.title}`;

    item.innerHTML = `
      <div class="tray-lead">
        <span class="tray-handle" title="${isActive ? 'Drag to reorder' : 'Disabled'}">⋮⋮</span>
        <span class="tray-num ${isActive ? 'active' : 'inactive'}">${isActive ? activeIndex + 1 : '—'}</span>
        <span class="tray-icon">${meta.icon}</span>
      </div>
      <div class="tray-info">
        <div class="tray-title-row">
          <span class="tray-title">${escapeHtml(meta.title)}</span>
          <span class="tray-cat-tag cat-${escapeHtml(meta.category || 'modular')}">${escapeHtml(meta.category || 'modular')}</span>
          ${meta.required ? `<span class="tray-req-pill" title="Required section">Req</span>` : ''}
        </div>
      </div>
      <div class="tray-actions">
        <label class="toggle-switch" title="${meta.required ? 'Required section' : isActive ? 'Hide section' : 'Show section'}">
          <input type="checkbox" ${isActive ? 'checked' : ''} data-toggle="${id}" ${meta.required ? 'disabled' : ''}>
          <span class="slider"></span>
        </label>
        <span class="tray-chevron" title="Customize">›</span>
      </div>
    `;

    item.onclick = () => {
      selectWidgetForInspector(id);
      if (typeof window.setPreviewScreen === 'function') {
        window.setPreviewScreen('website');
      }
      switchToTab('tab-inspector');
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'SCROLL_TO_WIDGET', widgetId: id },
          window.location.origin,
        );
      }
    };

    const toggle = item.querySelector(`[data-toggle="${id}"]`);
    if (toggle) {
      toggle.onclick = (e) => e.stopPropagation();
      toggle.onchange = (e) => {
        if (typeof window.setPreviewScreen === 'function') {
          window.setPreviewScreen('website');
        }
        toggleWidgetActive(id, e.target.checked);
      };
    }

    if (isActive) setupDragEvents(item);
    return item;
  };

  const CHAPTERS = [
    { id: 'hero', name: '👑 Welcome & Hero', match: (c) => c === 'header' },
    { id: 'birthday', name: '🎂 Birthday Specials', match: (c) => c === 'birthday' },
    { id: 'story', name: '📖 Our Love Story & Gallery', match: (c) => ['story', 'gallery', 'letter'].includes(c) },
    { id: 'interactive', name: '🎮 Interactive Games & Surprises', match: (c) => ['interactive', 'games', 'valentine'].includes(c) },
    { id: 'reconciliation', name: '🕊️ Keepsakes & Celebrations', match: () => true },
  ];

  if (currentWidgetFilter === 'all' && !query) {
    const assigned = new Set();
    CHAPTERS.forEach((chap) => {
      const chapterWidgets = filteredList.filter((id) => {
        if (assigned.has(id)) return false;
        const meta = WIDGET_REGISTRY[id];
        if (!meta) return false;
        return chap.match(meta.category || '');
      });
      chapterWidgets.forEach((id) => assigned.add(id));
      if (chapterWidgets.length === 0) return;

      const activeCount = chapterWidgets.filter((id) => activeSet.has(id)).length;
      const isCollapsed = collapsedChapters.has(chap.id);

      const chapHeader = document.createElement('div');
      chapHeader.className = `chapter-group-header ${isCollapsed ? 'collapsed' : ''}`;
      chapHeader.innerHTML = `
        <div class="chapter-title-wrap">
          <span class="chapter-name">${escapeHtml(chap.name)}</span>
          <span class="chapter-count">${activeCount}/${chapterWidgets.length}</span>
        </div>
        <span class="chapter-chevron">▼</span>
      `;

      const chapBody = document.createElement('div');
      chapBody.className = `chapter-group-body ${isCollapsed ? 'collapsed' : ''}`;

      chapHeader.onclick = () => {
        const nowCollapsed = !collapsedChapters.has(chap.id);
        if (nowCollapsed) {
          collapsedChapters.add(chap.id);
          chapHeader.classList.add('collapsed');
          chapBody.classList.add('collapsed');
        } else {
          collapsedChapters.delete(chap.id);
          chapHeader.classList.remove('collapsed');
          chapBody.classList.remove('collapsed');
        }
      };

      chapterWidgets.forEach((id) => {
        const el = createTrayItem(id);
        if (el) chapBody.appendChild(el);
      });

      widgetTray.appendChild(chapHeader);
      widgetTray.appendChild(chapBody);
    });
  } else {
    filteredList.forEach((id) => {
      const el = createTrayItem(id);
      if (el) widgetTray.appendChild(el);
    });
  }
}

function moveWidgetByDelta(widgetId, delta) {
  const currentIdx = state.layoutOrder.indexOf(widgetId);
  if (currentIdx === -1) return;
  const targetIdx = currentIdx + delta;
  if (targetIdx < 0 || targetIdx >= state.layoutOrder.length) return;
  moveWidgetToPosition(widgetId, targetIdx);
}

function moveWidgetToPosition(widgetId, targetIndex) {
  if (state.userRole === 'visitor') {
    showToast('🔒 Purchase now to customize and reorder sections!', 'warning');
    window.open('/welcome#pricing', '_blank');
    return;
  }
  const currentIdx = state.layoutOrder.indexOf(widgetId);
  if (currentIdx === -1) return;
  state.layoutOrder.splice(currentIdx, 1);
  state.layoutOrder.splice(targetIndex, 0, widgetId);
  state.templatePreset = 'custom';

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
}

function toggleWidgetActive(widgetId, isEnabled) {
  if (state.userRole === 'visitor') {
    showToast(
      '🔒 Purchase now to customize sections on your website!',
      'warning',
    );
    window.open('/welcome#pricing', '_blank');
    renderWidgetTray();
    return;
  }
  if (widgetId === 'intro') {
    if (!state.sectionsData.intro) state.sectionsData.intro = {};
    state.sectionsData.intro.enabled = isEnabled;
    debouncedLiveUpdate(true);
    debouncedAutoSaveLayout();
    return;
  }
  if (isEnabled) {
    if (!state.layoutOrder.includes(widgetId)) {
      state.layoutOrder.push(widgetId);
    }
    if (!state.activeInspectorWidget) {
      selectWidgetForInspector(widgetId);
    }
  } else {
    state.layoutOrder = state.layoutOrder.filter((id) => id !== widgetId);
    if (!state.layoutOrder.length) {
      renderInspectorEmptyState();
    } else if (state.activeInspectorWidget === widgetId) {
      selectWidgetForInspector(state.layoutOrder[0]);
    }
  }
  state.templatePreset = 'custom';

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
}

function initWidgetTrayControls() {
  const searchInput = document.getElementById('widgetSearchInput');
  const clearBtn = document.getElementById('btnClearWidgetSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentWidgetSearchQuery = e.target.value;
      if (clearBtn)
        clearBtn.classList.toggle('hidden', !currentWidgetSearchQuery);
      renderWidgetTray();
    };
  }
  if (clearBtn) {
    clearBtn.onclick = () => {
      currentWidgetSearchQuery = '';
      if (searchInput) searchInput.value = '';
      clearBtn.classList.add('hidden');
      renderWidgetTray();
    };
  }

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.onclick = () => {
      document
        .querySelectorAll('.filter-chip')
        .forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentWidgetFilter = chip.dataset.filter;
      renderWidgetTray();
    };
  });

  const btnEnableAll = document.getElementById('btnEnableAllWidgets');
  if (btnEnableAll) {
    btnEnableAll.onclick = () => {
      state.layoutOrder = [...state.allWidgetIds];
      state.templatePreset = 'custom';
      if (!state.activeInspectorWidget && state.layoutOrder.length > 0) {
        selectWidgetForInspector(state.layoutOrder[0]);
      }
      renderPresetsUI();
      renderWidgetTray();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  const btnDisableAll = document.getElementById('btnDisableAllWidgets');
  if (btnDisableAll) {
    btnDisableAll.onclick = () => {
      if (!confirm('Are you sure you want to disable all optional sections? You can re-enable them at any time.')) return;
      const required = state.allWidgetIds.filter(
        (id) => WIDGET_REGISTRY[id] && WIDGET_REGISTRY[id].required,
      );
      state.layoutOrder = required.length > 0 ? required : [];
      state.templatePreset = 'custom';
      if (!state.layoutOrder.length) {
        renderInspectorEmptyState();
      } else if (state.activeInspectorWidget !== 'intro' && !state.layoutOrder.includes(state.activeInspectorWidget)) {
        selectWidgetForInspector(state.layoutOrder[0]);
      }
      renderPresetsUI();
      renderWidgetTray();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }
}

// ----------------------------------------------------
// 2.5 ADD SECTION / WIDGET PICKER MODAL
// ----------------------------------------------------
let currentAddSectionTargetIndex = null;
let addSectionCategoryFilter = 'all';
let addSectionSearchQuery = '';

async function ensureDefaultWidgetData(widgetId) {
  if (state.sectionsData && state.sectionsData[widgetId]) return;
  if (!state.sectionsData) state.sectionsData = {};
  await resetWidgetData(widgetId);
}

async function addWidgetAtPosition(widgetId, targetIndex) {
  if (state.userRole === 'visitor') {
    showToast('🔒 Purchase now to customize and add new sections!', 'warning');
    window.open('/welcome#pricing', '_blank');
    return;
  }
  if (!WIDGET_REGISTRY[widgetId]) return;

  const validIndex =
    typeof targetIndex === 'number' &&
    targetIndex >= 0 &&
    targetIndex <= state.layoutOrder.length
      ? targetIndex
      : state.layoutOrder.length;

  const existingIdx = state.layoutOrder.indexOf(widgetId);
  if (existingIdx !== -1) {
    state.layoutOrder.splice(existingIdx, 1);
  }

  let finalIndex = validIndex;
  if (existingIdx !== -1 && existingIdx < validIndex) {
    finalIndex = Math.max(0, validIndex - 1);
  }

  state.layoutOrder.splice(finalIndex, 0, widgetId);
  state.templatePreset = 'custom';

  await ensureDefaultWidgetData(widgetId);

  closeAddSectionModal();

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();

  setTimeout(() => {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'SCROLL_TO_WIDGET',
          widgetId,
        },
        window.location.origin,
      );
    }
  }, 120);

  selectWidgetForInspector(widgetId);

  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
  showToast(
    `🎉 Added "${meta.title}" at position #${finalIndex + 1}!`,
    'success',
  );
}

function removeWidgetFromLayout(widgetId) {
  if (state.userRole === 'visitor') {
    showToast('🔒 Purchase now to customize and remove sections!', 'warning');
    window.open('/welcome#pricing', '_blank');
    return;
  }
  if (!state.layoutOrder.includes(widgetId)) return;

  state.layoutOrder = state.layoutOrder.filter((id) => id !== widgetId);
  state.templatePreset = 'custom';

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();

  if (
    state.activeInspectorWidget === widgetId ||
    (state.activeInspectorWidget !== 'intro' && !state.layoutOrder.includes(state.activeInspectorWidget))
  ) {
    if (state.layoutOrder.length > 0) {
      selectWidgetForInspector(state.layoutOrder[0]);
    } else {
      renderInspectorEmptyState();
    }
  }

  const modal = document.getElementById('addSectionModal');
  if (modal && !modal.classList.contains('hidden')) {
    renderAddSectionModal();
  }

  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
  showToast(`🗑️ Removed "${meta.title}" section from website.`, 'info');
}

function renderAddSectionModal() {
  const grid = document.getElementById('addSectionWidgetsGrid');
  const subtitle = document.getElementById('addSectionModalSubtitle');
  if (!grid) return;

  const totalWidgets = state.allWidgetIds.length;
  const countAllSpan = document.getElementById('addSecCountAll');
  if (countAllSpan) countAllSpan.textContent = totalWidgets;

  if (subtitle) {
    const idx =
      typeof currentAddSectionTargetIndex === 'number'
        ? currentAddSectionTargetIndex
        : state.layoutOrder.length;
    if (state.layoutOrder.length === 0) {
      subtitle.innerHTML =
        'Inserting as the <strong>first section</strong> on your website';
    } else if (idx <= 0) {
      const nextTitle =
        WIDGET_REGISTRY[state.layoutOrder[0]]?.title || state.layoutOrder[0];
      subtitle.innerHTML = `Inserting at the <strong>top of website</strong> (before ${escapeHtml(nextTitle)})`;
    } else if (idx >= state.layoutOrder.length) {
      const prevTitle =
        WIDGET_REGISTRY[state.layoutOrder[state.layoutOrder.length - 1]]
          ?.title || state.layoutOrder[state.layoutOrder.length - 1];
      subtitle.innerHTML = `Inserting at the <strong>end of website</strong> (after ${escapeHtml(prevTitle)})`;
    } else {
      const prevTitle =
        WIDGET_REGISTRY[state.layoutOrder[idx - 1]]?.title ||
        state.layoutOrder[idx - 1];
      const nextTitle =
        WIDGET_REGISTRY[state.layoutOrder[idx]]?.title ||
        state.layoutOrder[idx];
      subtitle.innerHTML = `Inserting between <strong>${escapeHtml(prevTitle)}</strong> and <strong>${escapeHtml(nextTitle)}</strong>`;
    }
  }

  grid.innerHTML = '';

  const q = (addSectionSearchQuery || '').toLowerCase().trim();
  const cat = addSectionCategoryFilter || 'all';

  const sortedIds = [...state.allWidgetIds].sort((a, b) => {
    const aActive = state.layoutOrder.includes(a);
    const bActive = state.layoutOrder.includes(b);
    if (!aActive && bActive) return -1;
    if (aActive && !bActive) return 1;
    return 0;
  });

  const filtered = sortedIds.filter((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return false;
    if (cat !== 'all' && meta.category !== cat) return false;
    if (q) {
      const matchTitle = (meta.title || '').toLowerCase().includes(q);
      const matchDesc = (meta.desc || '').toLowerCase().includes(q);
      const matchId = id.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchId) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 36px 16px; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 8px;">🔍</p>
        <p>No widgets found matching "<strong>${escapeHtml(addSectionSearchQuery)}</strong>"</p>
      </div>
    `;
    return;
  }

  filtered.forEach((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return;
    const isActive = state.layoutOrder.includes(id);
    const activePos = state.layoutOrder.indexOf(id);

    const card = document.createElement('div');
    card.className = `add-widget-card ${isActive ? 'is-active' : ''}`;
    card.innerHTML = `
      <div class="add-widget-card-top">
        <div class="add-widget-icon">${meta.icon}</div>
        <div class="add-widget-details">
          <div class="add-widget-title-row">
            <span class="add-widget-name">${escapeHtml(meta.title)}</span>
            <span class="add-widget-cat-badge">${escapeHtml(meta.category || 'widget')}</span>
          </div>
          <p class="add-widget-desc">${escapeHtml(meta.desc || '')}</p>
        </div>
      </div>
      <div class="add-widget-card-bottom">
        <span class="add-widget-status ${isActive ? 'active' : ''}">
          ${isActive ? `✓ On project (#${activePos + 1})` : '✨ Available'}
        </span>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn-add-widget-action preview-btn" data-preview-id="${id}" title="Preview full widget">
            👁️ Preview
          </button>
          ${
            isActive
              ? `
            <button type="button" class="btn-add-widget-action remove-btn" data-remove-id="${id}" title="Remove this section from website">
              ✕ Remove
            </button>
            <button type="button" class="btn-add-widget-action move-btn" data-add-id="${id}" title="Move section to this position">
              ↕ Move
            </button>
          `
              : `
            <button type="button" class="btn-add-widget-action" data-add-id="${id}">
              + Add Section
            </button>
          `
          }
        </div>
      </div>
    `;

    const previewBtn = card.querySelector(`[data-preview-id="${id}"]`);
    if (previewBtn) {
      previewBtn.onclick = (e) => {
        e.stopPropagation();
        openWidgetPreviewModal(id);
      };
    }
    const addBtn = card.querySelector(`[data-add-id="${id}"]`);
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.stopPropagation();
        addWidgetAtPosition(id, currentAddSectionTargetIndex);
      };
    }
    const removeBtn = card.querySelector(`[data-remove-id="${id}"]`);
    if (removeBtn) {
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeWidgetFromLayout(id);
      };
    }

    grid.appendChild(card);
  });
}

function openAddSectionModal(insertIndex) {
  const modal = document.getElementById('addSectionModal');
  if (!modal) return;
  currentAddSectionTargetIndex =
    typeof insertIndex === 'number' ? insertIndex : state.layoutOrder.length;
  addSectionCategoryFilter = 'all';
  addSectionSearchQuery = '';

  const searchInput = document.getElementById('addSectionSearchInput');
  const clearBtn = document.getElementById('btnClearAddSectionSearch');
  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.classList.add('hidden');

  document.querySelectorAll('.add-sec-filter-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.cat === 'all');
  });

  renderAddSectionModal();
  modal.classList.remove('hidden');
}

function closeAddSectionModal() {
  const modal = document.getElementById('addSectionModal');
  if (modal) modal.classList.add('hidden');
  currentAddSectionTargetIndex = null;
}

let currentPreviewWidgetId = null;
function openWidgetPreviewModal(widgetId) {
  const modal = document.getElementById('widgetPreviewModal');
  if (!modal) return;
  const meta = WIDGET_REGISTRY[widgetId] || {
    title: widgetId,
    icon: '🧩',
    category: 'WIDGET',
    desc: '',
  };
  currentPreviewWidgetId = widgetId;

  const iconEl = document.getElementById('widgetPreviewIcon');
  const titleEl = document.getElementById('widgetPreviewModalTitle');
  const catEl = document.getElementById('widgetPreviewCategory');
  const descEl = document.getElementById('widgetPreviewDesc');
  const imgEl = document.getElementById('widgetPreviewImg');
  const addBtn = document.getElementById('btnAddFromPreviewBtn');

  if (iconEl) iconEl.textContent = meta.icon || '✨';
  if (titleEl) titleEl.textContent = meta.title || widgetId;
  if (catEl) catEl.textContent = (meta.category || 'widget').toUpperCase();
  if (descEl)
    descEl.textContent =
      meta.desc || 'Visual preview of this widget fully opened and visible.';

  const previewUri =
    (window.getWidgetPreviewImage && window.getWidgetPreviewImage(widgetId)) ||
    '';
  if (imgEl) {
    imgEl.src = previewUri;
    imgEl.alt = `${meta.title} Full Preview`;
  }

  const isActive = state.layoutOrder.includes(widgetId);
  if (addBtn) {
    addBtn.innerHTML = isActive ? '↕ Move Section Here' : '+ Add This Section';
    addBtn.onclick = () => {
      addWidgetAtPosition(widgetId, currentAddSectionTargetIndex);
      closeWidgetPreviewModal();
      closeAddSectionModal();
    };
  }

  modal.classList.remove('hidden');
}

function closeWidgetPreviewModal() {
  const modal = document.getElementById('widgetPreviewModal');
  if (modal) modal.classList.add('hidden');
  currentPreviewWidgetId = null;
}

function initAddSectionModalControls() {
  const modal = document.getElementById('addSectionModal');
  const btnOpen = document.getElementById('btnSidebarAddSection');
  const btnClose = document.getElementById('btnCloseAddSectionModal');
  const btnCancel = document.getElementById('btnCancelAddSectionModal');
  const searchInput = document.getElementById('addSectionSearchInput');
  const clearBtn = document.getElementById('btnClearAddSectionSearch');

  const previewModal = document.getElementById('widgetPreviewModal');
  const btnClosePreview = document.getElementById('btnCloseWidgetPreviewModal');
  const btnCancelPreview = document.getElementById('btnCancelWidgetPreview');

  if (btnClosePreview) btnClosePreview.onclick = closeWidgetPreviewModal;
  if (btnCancelPreview) btnCancelPreview.onclick = closeWidgetPreviewModal;
  if (previewModal) {
    previewModal.onclick = (e) => {
      if (e.target === previewModal) closeWidgetPreviewModal();
    };
  }

  if (btnOpen) {
    btnOpen.onclick = () => {
      if (state.userRole === 'visitor') {
        showToast(
          '🔒 Purchase now to customize and add new sections!',
          'warning',
        );
        window.open('/welcome#pricing', '_blank');
        return;
      }
      openAddSectionModal(state.layoutOrder.length);
    };
  }
  if (btnClose) {
    btnClose.onclick = closeAddSectionModal;
  }
  if (btnCancel) {
    btnCancel.onclick = closeAddSectionModal;
  }
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeAddSectionModal();
    };
  }

  if (searchInput) {
    searchInput.oninput = (e) => {
      addSectionSearchQuery = e.target.value;
      if (clearBtn) clearBtn.classList.toggle('hidden', !addSectionSearchQuery);
      renderAddSectionModal();
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      addSectionSearchQuery = '';
      if (searchInput) searchInput.value = '';
      clearBtn.classList.add('hidden');
      renderAddSectionModal();
    };
  }

  document.querySelectorAll('.add-sec-filter-chip').forEach((chip) => {
    chip.onclick = () => {
      document
        .querySelectorAll('.add-sec-filter-chip')
        .forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      addSectionCategoryFilter = chip.dataset.cat;
      renderAddSectionModal();
    };
  });
}

// Drag & drop handlers
let draggedElement = null;
function setupDragEvents(el) {
  el.addEventListener('dragstart', (e) => {
    draggedElement = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  el.addEventListener('dragend', () => {
    if (draggedElement) draggedElement.classList.remove('dragging');
    draggedElement = null;
    document
      .querySelectorAll('.tray-item')
      .forEach((i) => i.classList.remove('drag-over'));
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });

  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (!draggedElement || draggedElement === el) return;

    const sourceId = draggedElement.dataset.widgetId;
    const targetId = el.dataset.widgetId;

    const sourceActive = state.layoutOrder.includes(sourceId);
    const targetActive = state.layoutOrder.includes(targetId);

    if (sourceActive && targetActive) {
      const sourceIdx = state.layoutOrder.indexOf(sourceId);
      const targetIdx = state.layoutOrder.indexOf(targetId);
      state.layoutOrder.splice(sourceIdx, 1);
      state.layoutOrder.splice(targetIdx, 0, sourceId);
      state.templatePreset = 'custom';
      renderPresetsUI();
      renderWidgetTray();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    }
  });
}

// ----------------------------------------------------
// 3. WIDGET CONTENT INSPECTOR (ALL 13 MODULES)
// ----------------------------------------------------
const WIDGET_CATEGORIES = {
  hero: 'Core Header',
  love_meter: 'Interactive Widget',
  reasons: 'Love Lists',
  timeline: 'Story Chapters',
  map: 'Places Map',
  truth_dare: 'Couples Game',
  spinner: 'Date Spinner',
  memories: 'Photo Gallery',
  coupons: 'Love Scratchcards',
  boarding_pass: 'Romantic Trips',
  quiz: 'Trivia Challenge',
  letter: 'Love Note',
  playful: 'Mini Game',
  candle_blowout: 'Birthday Wish',
  milestone_stats: 'Life Counter',
  gift_unboxer: '3D Surprise',
  roast_toast: 'Party Game',
  guestbook: 'Wish Board',
  party_jukebox: 'Music & Beats',
  tenure_ticker: 'Precision Counter',
  star_map: 'Celestial Map',
  then_now_slider: 'Split Comparison',
  bucket_list: 'Shared Goals',
  audio_capsule: 'Voice Vault',
  milestone_odyssey: 'Journey Map',
  valentine_scratch: 'Valentine Scratchcard',
  forgiveness_meter: 'Forgiveness Meter',
  truce_agreement: 'Truce Agreement',
  reform_deck: 'Reform Deck',
  reparation_coupons: 'Reparation Coupons',
  comfort_soundboard: 'Comfort Soundboard',
};

const WIDGET_LABELS = {
  ...WIDGET_CATEGORIES,
  forgiveness_meter: 'Forgiveness Meter',
  truce_agreement: 'Truce Agreement',
  reform_deck: 'Reform Deck',
  reparation_coupons: 'Reparation Coupons',
  comfort_soundboard: 'Comfort Soundboard',
};
if (typeof window !== 'undefined') window.WIDGET_LABELS = WIDGET_LABELS;

let activeMediaPickerCallback = null;
let activePickerFilter = 'all';
let activePickerQuery = '';

async function openMediaPicker({ filter = 'all', onSelect } = {}) {
  const modal = document.getElementById('mediaPickerModal');
  const grid = document.getElementById('mediaPickerGrid');
  const searchInput = document.getElementById('mediaPickerSearchInput');
  const counter = document.getElementById('mediaPickerCounter');
  const directUpload = document.getElementById('mediaPickerDirectUpload');
  if (!modal || !grid) return;

  activeMediaPickerCallback = onSelect;
  activePickerFilter = filter;
  activePickerQuery = '';
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.picker-filter-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.pickerFilter === filter);
  });

  if (!state.mediaAssets || state.mediaAssets.length === 0) {
    await fetchTenantMediaAssets();
  }

  function renderPickerGrid() {
    const assets = state.mediaAssets || [];
    const query = (activePickerQuery || '').toLowerCase();
    const currentFilter = activePickerFilter;

    const filtered = assets.filter((a) => {
      if (currentFilter === 'image' && a.isAudio) return false;
      if (currentFilter === 'audio' && !a.isAudio) return false;
      if (
        query &&
        !a.name.toLowerCase().includes(query) &&
        !a.url.toLowerCase().includes(query)
      )
        return false;
      return true;
    });

    if (counter) {
      counter.textContent = `${filtered.length} matching asset${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 28px 10px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          <div style="font-size: 1.6rem; margin-bottom: 4px;">📂</div>
          <div style="font-weight: 600; color: var(--text);">No matching assets found</div>
          <span style="font-size: 0.72rem; color: var(--text-muted);">Use "Upload New" above or add files in the Media tab.</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((a) => {
        const sizeStr = a.size ? formatBytes(a.size) : '';
        return `
        <div class="media-picker-item" data-url="${escapeHtml(a.url)}">
          ${
            a.isAudio
              ? `<div style="height:62px; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#fff; border-radius:6px; font-size:1.4rem;">
                <span>🎵</span>
                ${sizeStr ? `<span style="font-size:0.58rem; opacity:0.8;">${escapeHtml(sizeStr)}</span>` : ''}
               </div>`
              : `<div style="position:relative; width:100%; height:62px; overflow:hidden; border-radius:6px;">
                <img src="${escapeHtml(a.url)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy" onerror="this.closest('.media-picker-item').style.display='none';">
                ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ''}
               </div>`
          }
          <span class="media-picker-item-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
        </div>
      `;
      })
      .join('');

    grid.querySelectorAll('.media-picker-item').forEach((item) => {
      item.onclick = () => {
        const url = item.getAttribute('data-url');
        if (typeof activeMediaPickerCallback === 'function') {
          activeMediaPickerCallback(url);
        }
        closeMediaPicker();
      };
    });
  }

  if (searchInput) {
    searchInput.oninput = (e) => {
      activePickerQuery = e.target.value.trim();
      renderPickerGrid();
    };
  }

  document.querySelectorAll('.picker-filter-chip').forEach((chip) => {
    chip.onclick = () => {
      document
        .querySelectorAll('.picker-filter-chip')
        .forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activePickerFilter = chip.dataset.pickerFilter || 'all';
      renderPickerGrid();
    };
  });

  if (directUpload) {
    directUpload.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        if (counter) counter.textContent = `Uploading ${file.name}...`;
        const publicUrl = await uploadFileToR2(file);
        const isAudio =
          (file.type && file.type.startsWith('audio/')) ||
          /\.(mp3|m4a|m4r|wav|ogg)$/i.test(file.name);
        if (!state.mediaAssets) state.mediaAssets = [];
        state.mediaAssets.unshift({
          key: file.name,
          name: file.name,
          url: publicUrl,
          size: file.size,
          isAudio,
          isUploaded: true,
        });
        if (typeof activeMediaPickerCallback === 'function') {
          activeMediaPickerCallback(publicUrl);
        }
        closeMediaPicker();
        renderMediaLibraryUI(true);
      } catch (err) {
        alert('Upload failed: ' + err.message);
      } finally {
        directUpload.value = '';
      }
    };
  }

  renderPickerGrid();

  const btnClose = document.getElementById('btnCloseMediaPicker');
  const btnCancel = document.getElementById('btnCancelMediaPicker');
  if (btnClose) btnClose.onclick = closeMediaPicker;
  if (btnCancel) btnCancel.onclick = closeMediaPicker;
  modal.onclick = (e) => {
    if (e.target === modal) closeMediaPicker();
  };

  modal.classList.remove('hidden');
}
window.openMediaPicker = openMediaPicker;

function closeMediaPicker() {
  const modal = document.getElementById('mediaPickerModal');
  if (modal) modal.classList.add('hidden');
  activeMediaPickerCallback = null;
}

async function resetWidgetData(widgetId) {
  try {
    const res = await fetch('/api/default-sections');
    if (res.ok) {
      const { defaults } = await res.json();
      if (defaults && defaults[widgetId]) {
        state.sectionsData[widgetId] = JSON.parse(
          JSON.stringify(defaults[widgetId]),
        );
        return true;
      }
    }
  } catch (err) {
    console.warn('resetWidgetData failed:', err);
  }
  return false;
}

function populateInspectorSelect() {
  if (!inspectorWidgetSelect) return;
  inspectorWidgetSelect.innerHTML = '';
  state.allWidgetIds.forEach((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return;
    const orderPos = state.layoutOrder.indexOf(id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = `${meta.icon} ${meta.title} (${orderPos >= 0 ? '#' + (orderPos + 1) : (id === 'intro' ? 'Screen 1' : 'Off')})`;
    inspectorWidgetSelect.appendChild(opt);
  });
  inspectorWidgetSelect.onchange = (e) => {
    selectWidgetForInspector(e.target.value);
    if (e.target.value !== 'intro' && previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        { type: 'SCROLL_TO_WIDGET', widgetId: e.target.value },
        window.location.origin,
      );
    }
  };
}

function renderInspectorEmptyState() {
  state.activeInspectorWidget = null;

  const pill = document.getElementById('tabActiveWidgetPill');
  if (pill) {
    pill.textContent = '';
    pill.style.display = 'none';
  }

  const stickyHeader = document.querySelector('.inspector-sticky-header');
  if (stickyHeader) stickyHeader.classList.add('hidden');

  if (inspectorFormContainer) {
    inspectorFormContainer.innerHTML = `
      <div class="inspector-empty-state">
        <div class="inspector-empty-icon">🧩</div>
        <h4 class="inspector-empty-title">No Sections on Website</h4>
        <p class="inspector-empty-desc">Your website currently has no active sections. Add or enable sections in the Sections tab to customize them.</p>
        <button type="button" class="btn-empty-action" id="btnInspectorGoToSections">
          <span>←</span> Go to Sections
        </button>
      </div>
    `;
    const btnGo = document.getElementById('btnInspectorGoToSections');
    if (btnGo) {
      btnGo.onclick = () => switchToTab('tab-widgets');
    }
  }

  document
    .querySelectorAll('.tray-item')
    .forEach((item) => item.classList.remove('selected-for-edit'));
}

function selectWidgetForInspector(widgetId) {
  if (!widgetId || !WIDGET_REGISTRY[widgetId]) {
    renderInspectorEmptyState();
    return;
  }

  if (widgetId === 'intro') {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        { type: 'SET_PREVIEW_SCREEN', screen: 'intro' },
        '*',
      );
    }
    const btnIntro = document.getElementById('btnPreviewScreenIntro');
    const btnCore = document.getElementById('btnPreviewScreenCore');
    if (btnIntro) btnIntro.classList.add('active');
    if (btnCore) btnCore.classList.remove('active');
  }

  const stickyHeader = document.querySelector('.inspector-sticky-header');
  if (stickyHeader) stickyHeader.classList.remove('hidden');

  state.activeInspectorWidget = widgetId;
  if (inspectorWidgetSelect) {
    inspectorWidgetSelect.value = widgetId;
    Array.from(inspectorWidgetSelect.options).forEach((opt) => {
      const id = opt.value;
      const meta = WIDGET_REGISTRY[id];
      const orderPos = state.layoutOrder.indexOf(id);
      opt.textContent = `${meta?.icon || '🧩'} ${meta?.title || id} (${orderPos >= 0 ? '#' + (orderPos + 1) : (id === 'intro' ? 'Screen 1' : 'Off')})`;
    });
  }

  const pill = document.getElementById('tabActiveWidgetPill');
  if (pill) {
    const meta = WIDGET_REGISTRY[widgetId];
    pill.textContent = meta?.title || widgetId;
    pill.style.display = '';
  }

  const isActive = widgetId === 'intro' ? (state.sectionsData.intro?.enabled !== false) : state.layoutOrder.includes(widgetId);
  const orderPos = state.layoutOrder.indexOf(widgetId);
  const orderBadge = document.getElementById('inspectorOrderBadge');
  if (orderBadge) {
    orderBadge.textContent = widgetId === 'intro' ? 'Screen 1' : (orderPos >= 0 ? `#${orderPos + 1}` : 'Off');
  }

  const moreMenu = document.getElementById('inspectorMoreMenu');
  const closeMore = () => {
    if (moreMenu) moreMenu.classList.add('hidden');
    const btnMore = document.getElementById('btnInspectorMore');
    if (btnMore) btnMore.classList.remove('active');
  };

  const btnMoveUp = document.getElementById('btnInspectorMoveUp');
  const btnMoveDown = document.getElementById('btnInspectorMoveDown');
  if (btnMoveUp) {
    btnMoveUp.disabled = widgetId === 'intro' || orderPos <= 0;
    btnMoveUp.onclick = () => {
      if (orderPos > 0) {
        moveWidgetByStep(widgetId, -1);
        selectWidgetForInspector(widgetId);
        closeMore();
      }
    };
  }
  if (btnMoveDown) {
    btnMoveDown.disabled =
      widgetId === 'intro' || orderPos < 0 || orderPos >= state.layoutOrder.length - 1;
    btnMoveDown.onclick = () => {
      if (orderPos >= 0 && orderPos < state.layoutOrder.length - 1) {
        moveWidgetByStep(widgetId, 1);
        selectWidgetForInspector(widgetId);
        closeMore();
      }
    };
  }

  const btnRemoveCur = document.getElementById('btnRemoveCurrentWidget');
  if (btnRemoveCur) {
    btnRemoveCur.disabled = widgetId === 'intro';
    btnRemoveCur.onclick = () => {
      closeMore();
      removeWidgetFromLayout(widgetId);
    };
  }

  const btnReset = document.getElementById('btnResetWidgetContent');
  if (btnReset) {
    btnReset.onclick = async () => {
      const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
      closeMore();
      if (
        confirm(
          `Reset "${meta.title}" to template default content? Custom changes in this section will be replaced.`,
        )
      ) {
        await resetWidgetData(widgetId);
        renderWidgetInspector(widgetId);
        debouncedLiveUpdate(true);
      }
    };
  }

  const activeToggle = document.getElementById('inspectorWidgetActiveToggle');
  if (activeToggle) {
    activeToggle.checked = isActive;
    activeToggle.disabled = Boolean(WIDGET_REGISTRY[widgetId]?.required);
    activeToggle.onchange = (e) => {
      toggleWidgetActive(widgetId, e.target.checked);
      selectWidgetForInspector(widgetId);
    };
  }

  const btnLocate = document.getElementById('btnLocateInPreview');
  if (btnLocate) {
    btnLocate.onclick = () => {
      closeMore();
      if (previewIframe && previewIframe.contentWindow) {
        if (widgetId === 'intro') {
          previewIframe.contentWindow.postMessage(
            { type: 'SET_PREVIEW_SCREEN', screen: 'intro' },
            window.location.origin,
          );
        } else {
          previewIframe.contentWindow.postMessage(
            { type: 'SCROLL_TO_WIDGET', widgetId },
            window.location.origin,
          );
        }
      }
    };
  }

  // Highlight tray item in Widgets tab
  document.querySelectorAll('.tray-item').forEach((item) => {
    if (item.dataset.widgetId === widgetId) {
      item.classList.add('selected-for-edit');
    } else {
      item.classList.remove('selected-for-edit');
    }
  });

  renderWidgetInspector(widgetId);
}

async function deleteAssetFromR2(urlOrKey) {
  if (!urlOrKey) return false;
  try {
    const key = String(urlOrKey).replace(/^https?:\/\/[^\/]+/, '').replace(/^\/+/, '').replace(/^uploads\//, '').replace(/^\/+/, '');
    const res = await fetch(
      `/api/tenants/${encodeURIComponent(state.slug)}/media/${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      },
    );
    return res.ok;
  } catch (err) {
    console.warn('deleteAssetFromR2 error:', err);
    return false;
  }
}

let lastInspectedWidgetId = null;

function renderWidgetInspector(widgetId, forceScrollTop = false) {
  if (!inspectorFormContainer) return;
  const tabPane = document.getElementById('tab-inspector') || inspectorFormContainer.parentElement;
  const isWidgetSwitch = lastInspectedWidgetId !== null && lastInspectedWidgetId !== widgetId;
  lastInspectedWidgetId = widgetId;
  const savedScrollTop = (forceScrollTop || isWidgetSwitch) ? 0 : (tabPane ? tabPane.scrollTop : 0);
  if (tabPane && tabPane.scrollHeight > 0 && !isWidgetSwitch) {
    tabPane.style.minHeight = tabPane.scrollHeight + 'px';
  }
  inspectorFormContainer.innerHTML = '';

  const meta = WIDGET_REGISTRY[widgetId] || {
    title: widgetId,
    icon: '🧩',
    desc: '',
  };
  const category = WIDGET_CATEGORIES[widgetId] || 'Modular Widget';

  const catEl = document.getElementById('inspectorMetaCat');
  if (catEl) catEl.textContent = category;

  const descEl = document.getElementById('inspectorMetaDesc');
  if (descEl) descEl.textContent = '';

  if (state.userRole === 'visitor') {
    const lockBanner = document.createElement('div');
    lockBanner.className = 'visitor-locked-banner';
    lockBanner.innerHTML = `
      <span>🔒 Purchase now to customize</span>
      <a href="/welcome#pricing" target="_blank" class="visitor-lock-btn">Unlock All Controls ↗</a>
    `;
    inspectorFormContainer.appendChild(lockBanner);
  }

  const formHolder = document.createElement('div');
  formHolder.className = 'inspector-form-body';
  inspectorFormContainer.appendChild(formHolder);

  const inspectorFn =
    window.WIDGET_INSPECTORS && window.WIDGET_INSPECTORS[widgetId];
  if (typeof inspectorFn === 'function') {
    inspectorFn(formHolder, state, {
      debouncedLiveUpdate,
      debouncedAutoSaveLayout,
      uploadFileToR2,
      deleteAssetFromR2,
      previewIframe,
      renderWidgetInspector,
      selectWidgetForInspector,
      openMediaPicker,
      escapeHtml,
      safeVal,
    });

    if (state.userRole === 'visitor') {
      if (widgetId === 'hero') {
        formHolder
          .querySelectorAll(
            "input:not([id*='partner']), select, button, textarea",
          )
          .forEach((el) => {
            el.disabled = true;
            el.classList.add('visitor-disabled');
          });
      } else {
        formHolder
          .querySelectorAll('input, select, button, textarea')
          .forEach((el) => {
            el.disabled = true;
            el.classList.add('visitor-disabled');
          });
        const overlay = document.createElement('div');
        overlay.className = 'visitor-overlay-lock';
        overlay.innerHTML = `
          <span class="lock-icon">🔒</span>
          <div class="lock-title">Demo Preview Mode</div>
          <div class="lock-subtitle">Controls are locked in Demo. Purchase now to customize all texts, photos, and music.</div>
          <a href="/welcome#pricing" target="_blank" class="visitor-lock-btn" style="padding: 7px 18px; font-size: 0.8rem;">
            Purchase now to customize ($19+) ↗
          </a>
        `;
        formHolder.style.position = 'relative';
        formHolder.style.minHeight = '220px';
        formHolder.appendChild(overlay);
      }
    }
  } else {
    formHolder.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No custom inspector available for ${widgetId}.</p>`;
  }

  if (tabPane) {
    tabPane.style.minHeight = '';
    const hasTargetScroll =
      (widgetId === 'timeline' && Boolean(state.targetChapterId || state.targetCityKey)) ||
      (widgetId === 'memories' && Boolean(state.targetMemoryId)) ||
      (widgetId === 'map' && Boolean(state.targetCityKey));

    if (savedScrollTop > 0 && !hasTargetScroll) {
      tabPane.scrollTop = savedScrollTop;
      requestAnimationFrame(() => {
        if (tabPane && !hasTargetScroll) {
          tabPane.scrollTop = savedScrollTop;
        }
      });
      setTimeout(() => {
        if (tabPane && !hasTargetScroll) {
          tabPane.scrollTop = savedScrollTop;
        }
      }, 50);
    }
  }
}

// ----------------------------------------------------
function reloadPreview() {
  const isEmpty =
    state.layoutOrder && state.layoutOrder.length === 0 ? '1' : '0';
  previewIframe.src = `/sites/${encodeURIComponent(state.slug)}?preview=builder&empty=${isEmpty}&t=${Date.now()}`;
}

// ----------------------------------------------------
// 5. SAVE & PUBLISH API (POSTGRESQL PERSISTENCE)
// ----------------------------------------------------
async function saveConfig() {
  if (
    state.userRole === 'visitor' ||
    (state.slug === 'demo' && state.userRole !== 'admin')
  ) {
    if (state.currentUser) {
      showToast(
        '💡 Demo preview cannot be overwritten. Create your project to publish!',
        'info',
      );
      if (typeof window.openNewProjectModal === 'function') {
        window.openNewProjectModal(false);
      }
    } else {
      showToast(
        '🛍️ Purchase now to customize and publish your couple project!',
        'info',
      );
      window.open('/welcome#pricing', '_blank');
    }
    return;
  }

  if (btnSaveConfig) {
    btnSaveConfig.disabled = true;
    const saveText = btnSaveConfig.querySelector('.btn-save-text');
    if (saveText) saveText.textContent = 'Publishing...';
    else btnSaveConfig.innerText = 'Publishing...';
  }

  const indicator = document.getElementById('autoSaveIndicator');
  if (indicator) {
    indicator.className = 'auto-save-indicator saving';
    const textEl = indicator.querySelector('.indicator-text');
    if (textEl) textEl.textContent = 'Saving...';
  }
  updateLiveSyncPill('saving');

  try {
    const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(
      `/api/tenants/${encodeURIComponent(state.slug)}/config`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          templatePreset: state.templatePreset,
          themeId: state.themeId,
          layoutOrder: state.layoutOrder,
          sectionsData: state.sectionsData,
          authToken: state.authToken,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Save failed');
    }

    if (btnSaveConfig) {
      const saveText = btnSaveConfig.querySelector('.btn-save-text');
      if (saveText) saveText.textContent = '✓ Published!';
      else btnSaveConfig.innerText = '✓ Published!';
    }
    showToast('Changes saved & synced live!', 'success');

    if (indicator) {
      indicator.className = 'auto-save-indicator saved';
      const textEl = indicator.querySelector('.indicator-text');
      if (textEl) textEl.textContent = 'All changes saved';
    }
    updateLiveSyncPill('live');

    setTimeout(() => {
      if (btnSaveConfig) {
        btnSaveConfig.disabled = false;
        const saveText = btnSaveConfig.querySelector('.btn-save-text');
        if (saveText)
          saveText.innerHTML =
            'Save<span class="btn-save-extra"> & Publish</span>';
        else btnSaveConfig.innerText = '💾 Save';
      }
    }, 1600);

    reloadPreview();
  } catch (err) {
    showToast('Save Error: ' + err.message, 'error');
    updateLiveSyncPill('live');
    if (btnSaveConfig) {
      btnSaveConfig.disabled = false;
      const saveText = btnSaveConfig.querySelector('.btn-save-text');
      if (saveText)
        saveText.innerHTML = 'Save<span class="btn-save-extra"> & Publish</span>';
      else btnSaveConfig.innerText = '💾 Save';
    }
    if (indicator) {
      indicator.className = 'auto-save-indicator';
      const textEl = indicator.querySelector('.indicator-text');
      if (textEl) textEl.textContent = 'Unsaved changes';
    }
  }
}

// ----------------------------------------------------
// 6. CLOUDFLARE R2 UPLOAD PIPELINE
// ----------------------------------------------------
async function uploadFileToR2(file) {
  if (state.userRole === 'visitor') {
    showToast(
      '🔒 Purchase now to customize and upload media files!',
      'warning',
    );
    window.open('/welcome#pricing', '_blank');
    throw new Error('Purchase now to customize and upload media files.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      'File exceeds 10 Mo limit. Please choose a file under 10 Mo.',
    );
  }
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const presignRes = await fetch(
    `/api/tenants/${encodeURIComponent(state.slug)}/upload-url`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    },
  );
  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(errData.error || 'Could not get upload destination');
  }
  const dest = await presignRes.json();

  const uploadHeaders = getAuthHeaders(file.type ? { 'Content-Type': file.type } : {});

  let uploadRes = null;
  let useFallback = dest.mode !== 'r2';
  if (dest.mode === 'r2') {
    try {
      uploadRes = await fetch(dest.uploadUrl, {
        method: 'PUT',
        headers: file.type ? { 'Content-Type': file.type } : {},
        body: file,
      });
      if (!uploadRes.ok) useFallback = true;
    } catch (err) {
      useFallback = true;
    }
  }

  if (useFallback) {
    const localUrl = (dest.mode === 'local' && dest.uploadUrl)
      ? dest.uploadUrl
      : `/api/upload?slug=${encodeURIComponent(state.slug)}&key=${encodeURIComponent(dest.key)}${state.authToken ? `&token=${encodeURIComponent(state.authToken)}` : ''}`;
    uploadRes = await fetch(localUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: file,
    });
  }

  if (!uploadRes || !uploadRes.ok) {
    const errData = uploadRes ? await uploadRes.json().catch(() => ({})) : {};
    throw new Error(errData.error || 'Upload to destination failed');
  }
  const data = await uploadRes.json().catch(() => ({}));
  return data.publicUrl || dest.publicUrl;
}

let mediaAudioPlayer = null;
const mediaAudioEqualizers = new Map();

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
const formatBytes = formatFileSize;

async function fetchTenantMediaAssets() {
  const assets = [];
  const seen = new Set();

  try {
    const res = await fetch(
      `/api/tenants/${encodeURIComponent(state.slug)}/media`,
      { headers: getAuthHeaders() },
    );
    if (res.ok) {
      const { media = [] } = await res.json();
      media.forEach((item) => {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          assets.push({ ...item, isUploaded: true, name: item.filename });
        }
      });
    }
  } catch (err) {
    console.warn('fetchTenantMediaAssets:', err);
  }

  state.mediaAssets = assets;
  return assets;
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function renderMediaLibraryUI(refresh = false) {
  const libraryGrid = document.getElementById('mediaLibraryGrid');
  if (!libraryGrid) return;

  if (!state.mediaAssets || refresh) {
    await fetchTenantMediaAssets();
  }

  const assets = state.mediaAssets || [];
  const filter = state.mediaFilter || 'all';
  const query = (state.mediaSearchQuery || '').toLowerCase();

  const countAll = document.getElementById('mediaCountAll');
  const countImages = document.getElementById('mediaCountImages');
  const countAudio = document.getElementById('mediaCountAudio');
  const tabMediaBadge = document.getElementById('tabMediaCountBadge');

  const imgCount = assets.filter((a) => !a.isAudio).length;
  const audCount = assets.filter((a) => a.isAudio).length;

  if (countAll) countAll.innerText = assets.length;
  if (countImages) countImages.innerText = imgCount;
  if (countAudio) countAudio.innerText = audCount;
  if (tabMediaBadge) tabMediaBadge.innerText = assets.length;

  const totalBytes = assets.reduce((sum, a) => sum + (a.size || 0), 0);
  const countStat = document.getElementById('mediaStorageAssetCount');
  const sizeStat = document.getElementById('mediaStorageTotalSize');
  const meterFill = document.getElementById('storageMeterFill');

  if (countStat) countStat.innerText = assets.length;
  if (sizeStat)
    sizeStat.innerText = totalBytes > 0 ? formatBytes(totalBytes) : '0 B';
  if (meterFill) {
    const pct = Math.min(
      100,
      Math.max(4, Math.round((totalBytes / (50 * 1024 * 1024)) * 100)),
    );
    meterFill.style.width = `${pct}%`;
  }

  let filtered = assets.filter((a) => {
    if (filter === 'image' && a.isAudio) return false;
    if (filter === 'audio' && !a.isAudio) return false;
    if (
      query &&
      !a.name.toLowerCase().includes(query) &&
      !a.url.toLowerCase().includes(query)
    )
      return false;
    return true;
  });

  const sortMode = state.mediaSort || 'newest';
  filtered.sort((a, b) => {
    if (sortMode === 'newest')
      return new Date(b.mtime || 0) - new Date(a.mtime || 0);
    if (sortMode === 'oldest')
      return new Date(a.mtime || 0) - new Date(b.mtime || 0);
    if (sortMode === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortMode === 'size') return (b.size || 0) - (a.size || 0);
    return 0;
  });

  const isListView = state.mediaViewMode === 'list';
  libraryGrid.classList.toggle('list-view', isListView);

  if (filtered.length === 0) {
    libraryGrid.innerHTML = `
      <div class="media-empty-state">
        <div style="font-size: 2rem; margin-bottom: 6px;">📂</div>
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--text);">No media assets found</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">
          ${query ? 'No items matching your search filter.' : "Drop photos or audio files above, or click 'Import via URL' to add media."}
        </div>
      </div>
    `;
    return;
  }

  if (isListView) {
    libraryGrid.innerHTML = filtered
      .map((a) => {
        const sizeStr = a.size ? formatBytes(a.size) : '';
        return `
        <div class="media-list-item" data-url="${escapeHtml(a.url)}">
          <div class="media-list-thumb ${a.isAudio ? 'audio-thumb' : ''} btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="${a.isAudio}">
            ${a.isAudio ? '🎵' : `<img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.name)}" loading="lazy">`}
          </div>
          <div class="media-list-info">
            <div class="media-list-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</div>
            <div class="media-list-meta">
              <span class="badge-mini" style="background:#f1f3f5; padding:1px 5px; border-radius:4px; font-weight:600;">${a.isAudio ? 'AUDIO' : 'IMAGE'}</span>
              ${sizeStr ? `<span>${escapeHtml(sizeStr)}</span> • ` : ''}
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${escapeHtml(a.url)}</span>
            </div>
          </div>
          <div class="media-list-actions">
            ${
              a.isAudio
                ? `<button type="button" class="media-item-btn btn-set-bgm" data-url="${escapeHtml(a.url)}" title="Set as Background Music">🎵 BGM</button>
                 <button type="button" class="media-item-btn btn-set-voice" data-url="${escapeHtml(a.url)}" title="Set as Voice Memo">🎙️ Voice</button>`
                : ''
            }
            <button type="button" class="media-item-btn btn-copy-media-url" data-url="${escapeHtml(a.url)}" title="Copy Link">📋</button>
            <button type="button" class="media-item-btn btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="${a.isAudio}" title="Preview">👁️</button>
            ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ''}
          </div>
        </div>
      `;
      })
      .join('');
  } else {
    libraryGrid.innerHTML = filtered
      .map((a) => {
        const sizeStr = a.size ? formatBytes(a.size) : '';
        if (a.isAudio) {
          return `
          <div class="media-item-card" data-url="${escapeHtml(a.url)}">
            <div class="media-card-thumb">
              <div class="media-audio-preview">
                <span class="media-type-badge">AUDIO</span>
                ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ''}
                <button type="button" class="media-audio-play-btn" data-url="${escapeHtml(a.url)}" title="Play / Pause">▶</button>
                <div class="media-audio-player-bar">
                  <div class="media-audio-scrubber" data-url="${escapeHtml(a.url)}">
                    <div class="media-audio-scrubber-fill"></div>
                  </div>
                  <span class="media-audio-time">0:00</span>
                </div>
                <div class="audio-equalizer-bars">
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <div class="media-item-info">
              <span class="media-item-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
              <span class="media-item-url" title="${escapeHtml(a.url)}">${escapeHtml(a.url)}</span>
            </div>
            <div style="display:flex; gap:4px;">
              <button type="button" class="media-quick-insert-btn btn-set-bgm" data-url="${escapeHtml(a.url)}" style="flex:1;">🎵 BGM</button>
              <button type="button" class="media-quick-insert-btn btn-set-voice" data-url="${escapeHtml(a.url)}" style="flex:1;">🎙️ Voice</button>
            </div>
            <div class="media-item-actions">
              <button type="button" class="media-item-btn btn-copy-media-url" data-url="${escapeHtml(a.url)}">📋 Copy</button>
              <button type="button" class="media-item-btn btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="true">👁️</button>
              ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ''}
            </div>
          </div>
        `;
        }
        return `
        <div class="media-item-card" data-url="${escapeHtml(a.url)}">
          <div class="media-card-thumb btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="false">
            <img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.name)}" loading="lazy">
            <span class="media-type-badge">IMG</span>
            ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ''}
          </div>
          <div class="media-item-info">
            <span class="media-item-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
            <span class="media-item-url" title="${escapeHtml(a.url)}">${escapeHtml(a.url)}</span>
          </div>
          <div class="media-item-actions">
            <button type="button" class="media-item-btn btn-copy-media-url" data-url="${escapeHtml(a.url)}" title="Copy Link">📋 Copy</button>
            <button type="button" class="media-item-btn btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="false">👁️</button>
            ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ''}
          </div>
        </div>
      `;
      })
      .join('');
  }

  libraryGrid.querySelectorAll('.btn-copy-media-url').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(btn.getAttribute('data-url'));
      btn.textContent = '✓ Copied!';
      setTimeout(() => (btn.textContent = '📋 Copy'), 1200);
    };
  });

  libraryGrid.querySelectorAll('.btn-set-bgm').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      if (!state.sectionsData.hero) state.sectionsData.hero = {};
      state.sectionsData.hero.musicTrackUrl = url;
      state.sectionsData.hero.customAudioUrl = url;
      btn.innerText = '✓ Set as BGM!';
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === 'hero') renderWidgetInspector('hero');
      renderMediaSettingsUI();
      renderSiteSettingsUI();
      setTimeout(() => (btn.innerText = '🎵 BGM'), 1600);
    };
  });

  libraryGrid.querySelectorAll('.btn-set-voice').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      if (!state.sectionsData.hero) state.sectionsData.hero = {};
      state.sectionsData.hero.voiceAudio = url;
      btn.innerText = '✓ Set Voice!';
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === 'hero') renderWidgetInspector('hero');
      renderMediaSettingsUI();
      renderSiteSettingsUI();
      setTimeout(() => (btn.innerText = '🎙️ Voice'), 1600);
    };
  });

  libraryGrid.querySelectorAll('.btn-preview-media').forEach((el) => {
    el.onclick = (e) => {
      e.stopPropagation();
      openMediaLightbox({
        url: el.getAttribute('data-url'),
        name: el.getAttribute('data-name'),
        isAudio: el.getAttribute('data-isaudio') === 'true',
      });
    };
  });

  libraryGrid.querySelectorAll('.media-audio-play-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleMediaAudio(btn.getAttribute('data-url'), btn);
    };
  });

  libraryGrid.querySelectorAll('.media-audio-scrubber').forEach((bar) => {
    bar.onclick = (e) => {
      e.stopPropagation();
      const url = bar.getAttribute('data-url');
      if (
        mediaAudioPlayer &&
        mediaAudioPlayer.src.endsWith(url) &&
        mediaAudioPlayer.duration
      ) {
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        mediaAudioPlayer.currentTime = ratio * mediaAudioPlayer.duration;
      }
    };
  });

  libraryGrid.querySelectorAll('.btn-delete-asset').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-key');
      if (!confirm(`Delete "${key}" from storage?`)) return;
      try {
        const res = await fetch(
          `/api/tenants/${encodeURIComponent(state.slug)}/media/${encodeURIComponent(key)}`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          },
        );
        if (!res.ok) throw new Error('Delete failed');
        await renderMediaLibraryUI(true);
      } catch (err) {
        alert(err.message);
      }
    };
  });
}

function toggleMediaAudio(url, btn) {
  if (!mediaAudioPlayer) {
    mediaAudioPlayer = new Audio();
    mediaAudioPlayer.onended = () => {
      document
        .querySelectorAll('.media-audio-play-btn')
        .forEach((b) => (b.textContent = '▶'));
      document
        .querySelectorAll('.audio-equalizer-bars')
        .forEach((eq) => eq.classList.remove('playing'));
      document
        .querySelectorAll('.media-audio-scrubber-fill')
        .forEach((f) => (f.style.width = '0%'));
      document
        .querySelectorAll('.media-audio-time')
        .forEach((t) => (t.textContent = '0:00'));
    };
    mediaAudioPlayer.ontimeupdate = () => {
      if (!mediaAudioPlayer.duration) return;
      const currentUrl = mediaAudioPlayer.src;
      document
        .querySelectorAll('.media-item-card, .media-list-item')
        .forEach((item) => {
          const itemUrl = item.getAttribute('data-url');
          if (itemUrl && currentUrl.endsWith(itemUrl)) {
            const fill = item.querySelector('.media-audio-scrubber-fill');
            const timeEl = item.querySelector('.media-audio-time');
            if (fill) {
              const pct =
                (mediaAudioPlayer.currentTime / mediaAudioPlayer.duration) *
                100;
              fill.style.width = `${pct}%`;
            }
            if (timeEl) {
              timeEl.textContent = `${formatTime(mediaAudioPlayer.currentTime)} / ${formatTime(mediaAudioPlayer.duration)}`;
            }
          }
        });
    };
  }
  const card =
    btn.closest('.media-item-card') || btn.closest('.media-list-item');
  const eq = card ? card.querySelector('.audio-equalizer-bars') : null;

  if (mediaAudioPlayer.src.endsWith(url) && !mediaAudioPlayer.paused) {
    mediaAudioPlayer.pause();
    btn.textContent = '▶';
    if (eq) eq.classList.remove('playing');
  } else {
    document
      .querySelectorAll('.media-audio-play-btn')
      .forEach((b) => (b.textContent = '▶'));
    document
      .querySelectorAll('.audio-equalizer-bars')
      .forEach((e) => e.classList.remove('playing'));
    document
      .querySelectorAll('.media-audio-scrubber-fill')
      .forEach((f) => (f.style.width = '0%'));
    mediaAudioPlayer.src = url;
    mediaAudioPlayer
      .play()
      .then(() => {
        btn.textContent = '⏸';
        if (eq) eq.classList.add('playing');
      })
      .catch(() => {
        btn.textContent = '▶';
        if (eq) eq.classList.remove('playing');
      });
  }
}

function openMediaLightbox({ url, name, isAudio }) {
  const modal = document.getElementById('mediaLightboxModal');
  if (!modal) return;
  const title = document.getElementById('lightboxTitle');
  const content = document.getElementById('lightboxContent');
  const btnOpen = document.getElementById('btnOpenLightboxUrl');
  const btnCopy = document.getElementById('btnCopyLightboxUrl');
  const urlText = document.getElementById('lightboxUrlText');
  const icon = document.getElementById('lightboxIcon');

  if (title) title.innerText = name || 'Media Preview';
  if (icon) icon.innerText = isAudio ? '🎵' : '📷';
  if (urlText) urlText.innerText = url;
  if (btnOpen) btnOpen.href = url;
  if (btnCopy) {
    btnCopy.onclick = () => {
      navigator.clipboard?.writeText(url);
      btnCopy.innerText = '✓ Copied!';
      setTimeout(() => (btnCopy.innerText = '📋 Copy Link'), 1200);
    };
  }
  if (content) {
    content.innerHTML = isAudio
      ? `<div style="padding: 32px 16px; text-align: center; width: 100%;">
          <div style="font-size: 3.5rem; margin-bottom: 12px; filter: drop-shadow(0 4px 12px rgba(255, 77, 109, 0.4));">🎵</div>
          <audio controls autoplay src="${escapeHtml(url)}" style="width: 90%; max-width: 440px;"></audio>
         </div>`
      : `<img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" style="max-width: 100%; max-height: 55vh; object-fit: contain;">`;
  }
  modal.classList.remove('hidden');
}

function closeMediaLightbox() {
  const modal = document.getElementById('mediaLightboxModal');
  if (!modal) return;
  modal.classList.add('hidden');
  const content = document.getElementById('lightboxContent');
  if (content) content.innerHTML = '';
}

async function uploadMediaFiles(files) {
  if (!files || files.length === 0) return;
  const statusEl = document.getElementById('uploadStatusText');
  const progressEl = document.getElementById('mediaUploadProgress');

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      statusEl.innerText = `⚠️ "${file.name}" exceeds 10 Mo limit`;
      return;
    }
  }

  if (progressEl) progressEl.classList.add('active');

  try {
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      statusEl.innerText = `Uploading (${i + 1}/${files.length}): ${file.name}...`;

      try {
        const publicUrl = await uploadFileToR2(file);
        const isAudio =
          (file.type && file.type.startsWith('audio/')) ||
          /\.(mp3|m4a|m4r|wav|ogg)$/i.test(file.name);

        if (!isAudio) {
          if (
            !state.sectionsData.memories ||
            typeof state.sectionsData.memories !== 'object'
          ) {
            state.sectionsData.memories = {
              tag: 'Captured Memories',
              title: 'Our Favorite Moments 📷',
              desc: 'Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨',
              addBtnText: '📷 Add Our Photo / Video Memory',
              items: [],
            };
          }
          if (!Array.isArray(state.sectionsData.memories.items)) {
            state.sectionsData.memories.items = [];
          }
          state.sectionsData.memories.items.unshift({
            id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            desc: 'Uploaded memory',
            img: publicUrl,
          });
        }
        count++;
      } catch (err) {
        statusEl.innerText = `Upload failed on "${file.name}": ${err.message}`;
        return;
      }
    }

    statusEl.innerText = `✓ ${count} file(s) uploaded successfully!`;
    setTimeout(() => {
      if (statusEl.innerText.startsWith('✓')) statusEl.innerText = '';
    }, 4000);

    await renderMediaLibraryUI(true);
    renderWidgetInspector(state.activeInspectorWidget);
    debouncedLiveUpdate();
  } finally {
    if (progressEl) progressEl.classList.remove('active');
  }
}

function initMediaTabControls() {
  const fileInput = document.getElementById('mediaUploadInput');
  const dropZone = document.getElementById('mediaDropZone');
  const btnPickPhotos = document.getElementById('btnPickPhotos');
  const btnPickAudio = document.getElementById('btnPickAudio');
  const searchInput = document.getElementById('mediaSearchInput');
  const btnClearSearch = document.getElementById('btnClearMediaSearch');
  const sortSelect = document.getElementById('mediaSortSelect');
  const btnViewGrid = document.getElementById('btnViewGrid');
  const btnViewList = document.getElementById('btnViewList');
  const btnRefresh = document.getElementById('btnRefreshMedia');
  const btnRefreshLib = document.getElementById('btnRefreshMediaLibrary');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  const btnCloseLightboxAlt = document.getElementById('btnCloseLightboxAlt');
  const lightboxModal = document.getElementById('mediaLightboxModal');

  // Subnav switching inside Media tab
  const btnSubLib = document.getElementById('btnMediaSubnavLibrary');
  const btnSubSet = document.getElementById('btnMediaSubnavSettings');
  const paneLib = document.getElementById('media-pane-library');
  const paneSet = document.getElementById('media-pane-settings');

  if (btnSubLib && btnSubSet && paneLib && paneSet) {
    btnSubLib.onclick = () => {
      btnSubLib.classList.add('active');
      btnSubSet.classList.remove('active');
      paneLib.classList.add('active');
      paneSet.classList.remove('active');
      renderMediaLibraryUI(false);
    };
    btnSubSet.onclick = () => {
      btnSubSet.classList.add('active');
      btnSubLib.classList.remove('active');
      paneSet.classList.add('active');
      paneLib.classList.remove('active');
      renderMediaSettingsUI();
    };
  }

  // URL Import Box toggle and submit
  const btnToggleUrlImport = document.getElementById('btnToggleUrlImport');
  const urlImportBox = document.getElementById('mediaUrlImportBox');
  const btnCloseUrlImport = document.getElementById('btnCloseUrlImport');
  const btnSubmitUrlImport = document.getElementById('btnSubmitUrlImport');
  const urlInput = document.getElementById('mediaImportUrlInput');
  const urlStatus = document.getElementById('mediaUrlImportStatus');

  if (btnToggleUrlImport && urlImportBox) {
    btnToggleUrlImport.onclick = () => {
      if (state.userRole === 'visitor') {
        showToast('🔒 Purchase now to customize and import media!', 'warning');
        window.open('/welcome#pricing', '_blank');
        return;
      }
      urlImportBox.classList.toggle('hidden');
    };
  }
  if (btnCloseUrlImport && urlImportBox) {
    btnCloseUrlImport.onclick = () => urlImportBox.classList.add('hidden');
  }
  if (btnSubmitUrlImport && urlInput) {
    btnSubmitUrlImport.onclick = () => {
      const u = urlInput.value.trim();
      if (!u || !/^https?:\/\/.+/i.test(u)) {
        if (urlStatus)
          urlStatus.innerHTML =
            '<span style="color:#e63946;">Please enter a valid http/https URL</span>';
        return;
      }
      const isAudio = /\.(mp3|m4a|m4r|wav|ogg|aac)(\?.*)?$/i.test(u);
      const filename =
        u.split('/').pop().split('?')[0] ||
        (isAudio ? 'custom-audio.mp3' : 'custom-photo.jpg');
      if (!state.mediaAssets) state.mediaAssets = [];
      state.mediaAssets.unshift({
        key: u,
        name: decodeURIComponent(filename),
        url: u,
        size: 0,
        isAudio,
        isUploaded: false,
      });
      urlInput.value = '';
      if (urlStatus)
        urlStatus.innerHTML =
          '<span style="color:#2a9d8f;">✓ Added to media library!</span>';
      setTimeout(() => {
        if (urlImportBox) urlImportBox.classList.add('hidden');
        if (urlStatus) urlStatus.innerHTML = '';
      }, 1200);
      renderMediaLibraryUI(false);
    };
  }

  // View Mode toggle
  if (btnViewGrid && btnViewList) {
    btnViewGrid.onclick = () => {
      state.mediaViewMode = 'grid';
      localStorage.setItem('saas_media_view', 'grid');
      btnViewGrid.classList.add('active');
      btnViewList.classList.remove('active');
      renderMediaLibraryUI(false);
    };
    btnViewList.onclick = () => {
      state.mediaViewMode = 'list';
      localStorage.setItem('saas_media_view', 'list');
      btnViewList.classList.add('active');
      btnViewGrid.classList.remove('active');
      renderMediaLibraryUI(false);
    };
    if (state.mediaViewMode === 'list') {
      btnViewList.classList.add('active');
      btnViewGrid.classList.remove('active');
    }
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.value = state.mediaSort || 'newest';
    sortSelect.onchange = (e) => {
      state.mediaSort = e.target.value;
      renderMediaLibraryUI(false);
    };
  }

  // Search input & clear
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.mediaSearchQuery = e.target.value.trim();
      if (btnClearSearch)
        btnClearSearch.classList.toggle('hidden', !state.mediaSearchQuery);
      renderMediaLibraryUI(false);
    };
  }
  if (btnClearSearch && searchInput) {
    btnClearSearch.onclick = () => {
      searchInput.value = '';
      state.mediaSearchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderMediaLibraryUI(false);
    };
  }

  // Filter buttons
  document.querySelectorAll('.media-filter-btn').forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll('.media-filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.mediaFilter = btn.getAttribute('data-filter') || 'all';
      renderMediaLibraryUI(false);
    };
  });

  if (fileInput) {
    fileInput.onchange = (e) => {
      uploadMediaFiles(Array.from(e.target.files || []));
      fileInput.value = '';
    };
  }

  if (btnPickPhotos) {
    btnPickPhotos.onclick = (e) => {
      e.stopPropagation();
      if (state.userRole === 'visitor') {
        showToast('🔒 Purchase now to customize and upload photos!', 'warning');
        window.open('/welcome#pricing', '_blank');
        return;
      }
      if (fileInput) {
        fileInput.accept = 'image/*';
        fileInput.click();
      }
    };
  }

  if (btnPickAudio) {
    btnPickAudio.onclick = (e) => {
      e.stopPropagation();
      if (state.userRole === 'visitor') {
        showToast('🔒 Purchase now to customize and upload audio!', 'warning');
        window.open('/welcome#pricing', '_blank');
        return;
      }
      if (fileInput) {
        fileInput.accept = 'audio/*';
        fileInput.click();
      }
    };
  }

  if (dropZone) {
    ['dragenter', 'dragover'].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (state.userRole === 'visitor') {
        showToast(
          '🔒 Purchase now to customize and upload media files!',
          'warning',
        );
        window.open('/welcome#pricing', '_blank');
        return;
      }
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        uploadMediaFiles(Array.from(files));
      }
    });
  }

  if (btnRefresh) btnRefresh.onclick = () => renderMediaLibraryUI(true);
  if (btnRefreshLib) btnRefreshLib.onclick = () => renderMediaLibraryUI(true);
  if (btnCloseLightbox) btnCloseLightbox.onclick = closeMediaLightbox;
  if (btnCloseLightboxAlt) btnCloseLightboxAlt.onclick = closeMediaLightbox;
  if (lightboxModal) {
    lightboxModal.onclick = (e) => {
      if (e.target === lightboxModal) closeMediaLightbox();
    };
  }
}

// ----------------------------------------------------
// MEDIA & AUDIO SETTINGS CONTROLS (SHARED TAB 3 & 4)
// ----------------------------------------------------
function getMediaSettings() {
  if (!state.sectionsData) state.sectionsData = {};
  if (
    !state.sectionsData.mediaSettings ||
    typeof state.sectionsData.mediaSettings !== 'object'
  ) {
    state.sectionsData.mediaSettings = {};
  }
  const hero = state.sectionsData.hero || {};
  const ms = state.sectionsData.mediaSettings;
  if (ms.soundtrackUrl === undefined)
    ms.soundtrackUrl = hero.musicTrackUrl || 'taylor-swift-fate-of-ophelia.m4r';
  if (ms.soundtrackTitle === undefined)
    ms.soundtrackTitle =
      hero.musicTrackTitle || 'The Fate of Ophelia • Taylor Swift ✨';
  if (ms.soundtrackPreset === undefined) {
    if (ms.soundtrackUrl.includes('taylor-swift'))
      ms.soundtrackPreset = 'taylor-swift-fate-of-ophelia.m4r';
    else if (ms.soundtrackUrl.includes('lady-gaga'))
      ms.soundtrackPreset = 'lady-gaga-always-remember-us-this-way.m4r';
    else if (ms.soundtrackUrl.includes('imagine-dragons'))
      ms.soundtrackPreset = 'imagine-dragons-i-follow-you.m4r';
    else ms.soundtrackPreset = 'custom';
  }
  if (ms.soundtrackVolume === undefined) ms.soundtrackVolume = 80;
  if (ms.soundtrackAutoplay === undefined) ms.soundtrackAutoplay = true;
  if (ms.soundtrackLoop === undefined) ms.soundtrackLoop = true;
  if (ms.floatingPlayer === undefined) ms.floatingPlayer = true;
  if (ms.romanticSfx === undefined) ms.romanticSfx = true;

  if (ms.voiceUrl === undefined)
    ms.voiceUrl = hero.voiceAudio || 'audio/myrecording-volume-adjusted.m4r';
  if (ms.voiceVolume === undefined) ms.voiceVolume = 100;
  return ms;
}

function getVolumeIcon(vol) {
  if (vol <= 0) return '🔇';
  if (vol <= 35) return '🔈';
  if (vol <= 70) return '🔉';
  return '🔊';
}

function renderMediaSettingsHTML(prefix = 'ms_') {
  const ms = getMediaSettings();

  return `
    <!-- Background Soundtrack Card -->
    <div class="media-setting-card">
      <div class="media-setting-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🎵</span>
          <span>Background Soundtrack</span>
        </div>
        <span class="media-setting-badge">Live Music</span>
      </div>

      <div class="input-group" style="margin-bottom:12px;">
        <label>Soundtrack Preset</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <select id="${prefix}soundtrack_preset" class="inspector-select" style="flex:1;">
            <option value="taylor-swift-fate-of-ophelia.m4r" data-title="The Fate of Ophelia" data-artist="Taylor Swift ✨" ${ms.soundtrackPreset === 'taylor-swift-fate-of-ophelia.m4r' ? 'selected' : ''}>🎵 Taylor Swift — The Fate of Ophelia ✨</option>
            <option value="lady-gaga-always-remember-us-this-way.m4r" data-title="Always Remember Us This Way" data-artist="Lady Gaga 🌹" ${ms.soundtrackPreset === 'lady-gaga-always-remember-us-this-way.m4r' ? 'selected' : ''}>🌹 Lady Gaga — Always Remember Us This Way 🌹</option>
            <option value="imagine-dragons-i-follow-you.m4r" data-title="Follow You" data-artist="Imagine Dragons 💫" ${ms.soundtrackPreset === 'imagine-dragons-i-follow-you.m4r' ? 'selected' : ''}>💫 Imagine Dragons — Follow You 💫</option>
            <option value="custom" ${ms.soundtrackPreset === 'custom' ? 'selected' : ''}>⚙️ Custom Music Track / Upload Your Own (Max 10 Mo)</option>
          </select>
          <button type="button" class="btn-test-track" id="${prefix}btn_test_soundtrack" title="Toggle song in preview">▶️ Test</button>
        </div>
      </div>

      <div class="input-group" style="margin-bottom:10px;">
        <label>Track Title & Display Text</label>
        <input type="text" id="${prefix}soundtrack_title" value="${escapeHtml(ms.soundtrackTitle || '')}" placeholder="Track Title • Artist">
      </div>

      <div class="input-group" style="margin-bottom:12px;">
        <label>Audio Source URL</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="${prefix}soundtrack_url" value="${escapeHtml(ms.soundtrackUrl || '')}" style="flex:1;" placeholder="audio.mp3 or URL">
          <button type="button" class="btn-pick-from-lib" id="${prefix}btn_pick_soundtrack" title="Pick from media library">📁 Library</button>
          <label class="file-upload-btn" style="cursor:pointer; display:inline-flex; align-items:center; padding: 6px 12px; background: rgba(255,255,255,0.08); border:1px solid var(--border); border-radius:6px; font-size:12px; white-space:nowrap;">
            <span>Upload</span>
            <input type="file" id="${prefix}soundtrack_file" accept="audio/*" style="display:none;">
          </label>
        </div>
        <div id="${prefix}soundtrack_upload_status" style="font-size:11px; color:var(--text-muted); margin-top:4px;"></div>
      </div>

      <div class="input-group" style="margin-bottom:8px;">
        <label>Soundtrack Master Volume</label>
        <div class="volume-slider-row">
          <span class="volume-slider-icon" id="${prefix}soundtrack_vol_icon" title="Click to mute/unmute">${getVolumeIcon(ms.soundtrackVolume)}</span>
          <input type="range" class="volume-range-input" id="${prefix}soundtrack_vol_slider" min="0" max="100" value="${ms.soundtrackVolume}" step="1">
          <span class="volume-percent-badge" id="${prefix}soundtrack_vol_badge">${ms.soundtrackVolume}%</span>
        </div>
      </div>
    </div>

    <!-- Playback Behaviors & Toggles Card -->
    <div class="media-setting-card">
      <div class="media-setting-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🎛️</span>
          <span>Playback & Experience</span>
        </div>
        <span class="media-setting-badge">Audio UX</span>
      </div>

      <div class="media-toggle-row">
        <div>
          <span class="media-toggle-label">Autoplay Soundtrack</span>
          <span class="media-toggle-desc">Automatically fade in music when envelope unseals</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="${prefix}toggle_autoplay" ${ms.soundtrackAutoplay !== false ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="media-toggle-row">
        <div>
          <span class="media-toggle-label">Loop Continuously</span>
          <span class="media-toggle-desc">Repeat soundtrack seamlessly when it reaches the end</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="${prefix}toggle_loop" ${ms.soundtrackLoop !== false ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="media-toggle-row">
        <div>
          <span class="media-toggle-label">Floating Vinyl Player</span>
          <span class="media-toggle-desc">Show rotating vinyl disc and player bar on live project</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="${prefix}toggle_floating" ${ms.floatingPlayer !== false ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="media-toggle-row">
        <div>
          <span class="media-toggle-label">Romantic Sound Effects</span>
          <span class="media-toggle-desc">Chimes, kiss pops, and sparkles on interactive widgets</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="${prefix}toggle_sfx" ${ms.romanticSfx !== false ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- Spoken Voice Note Card -->
    <div class="media-setting-card">
      <div class="media-setting-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🎙️</span>
          <span>Spoken Voice Note</span>
        </div>
        <span class="media-setting-badge">Personal Audio</span>
      </div>

      <div class="input-group" style="margin-bottom:12px;">
        <label>Voice Recording URL</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="${prefix}voice_url" value="${escapeHtml(ms.voiceUrl || '')}" style="flex:1;" placeholder="voice.mp3 or recording URL">
          <button type="button" class="btn-pick-from-lib" id="${prefix}btn_pick_voice" title="Pick from media library">📁 Library</button>
          <label class="file-upload-btn" style="cursor:pointer; display:inline-flex; align-items:center; padding: 6px 12px; background: rgba(255,255,255,0.08); border:1px solid var(--border); border-radius:6px; font-size:12px; white-space:nowrap;">
            <span>Upload</span>
            <input type="file" id="${prefix}voice_file" accept="audio/*" style="display:none;">
          </label>
        </div>
        <div id="${prefix}voice_upload_status" style="font-size:11px; color:var(--text-muted); margin-top:4px;"></div>
      </div>

      <div class="input-group" style="margin-bottom:8px;">
        <label>Voice Note Volume</label>
        <div class="volume-slider-row">
          <span class="volume-slider-icon" id="${prefix}voice_vol_icon">${getVolumeIcon(ms.voiceVolume)}</span>
          <input type="range" class="volume-range-input" id="${prefix}voice_vol_slider" min="0" max="100" value="${ms.voiceVolume}" step="1">
          <span class="volume-percent-badge" id="${prefix}voice_vol_badge">${ms.voiceVolume}%</span>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:10px;">
        <button type="button" class="btn-test-track" id="${prefix}btn_test_voice" title="Test voice player in preview">🎙️ Test Voice Note in Preview</button>
      </div>
    </div>
  `;
}

function bindMediaSettingsControls(container, prefix = 'ms_') {
  const ms = getMediaSettings();
  if (!state.sectionsData.hero) state.sectionsData.hero = {};
  const hero = state.sectionsData.hero;

  const presetEl = container.querySelector('#' + prefix + 'soundtrack_preset');
  const titleEl = container.querySelector('#' + prefix + 'soundtrack_title');
  const urlEl = container.querySelector('#' + prefix + 'soundtrack_url');
  const pickSoundtrackBtn = container.querySelector(
    '#' + prefix + 'btn_pick_soundtrack',
  );
  const fileSoundtrackEl = container.querySelector(
    '#' + prefix + 'soundtrack_file',
  );
  const statusSoundtrackEl = container.querySelector(
    '#' + prefix + 'soundtrack_upload_status',
  );
  const testSoundtrackBtn = container.querySelector(
    '#' + prefix + 'btn_test_soundtrack',
  );

  const volSlider = container.querySelector(
    '#' + prefix + 'soundtrack_vol_slider',
  );
  const volBadge = container.querySelector(
    '#' + prefix + 'soundtrack_vol_badge',
  );
  const volIcon = container.querySelector('#' + prefix + 'soundtrack_vol_icon');

  const toggleAutoplay = container.querySelector(
    '#' + prefix + 'toggle_autoplay',
  );
  const toggleLoop = container.querySelector('#' + prefix + 'toggle_loop');
  const toggleFloating = container.querySelector(
    '#' + prefix + 'toggle_floating',
  );
  const toggleSfx = container.querySelector('#' + prefix + 'toggle_sfx');

  const voiceUrlEl = container.querySelector('#' + prefix + 'voice_url');
  const pickVoiceBtn = container.querySelector('#' + prefix + 'btn_pick_voice');
  const fileVoiceEl = container.querySelector('#' + prefix + 'voice_file');
  const statusVoiceEl = container.querySelector(
    '#' + prefix + 'voice_upload_status',
  );
  const voiceVolSlider = container.querySelector(
    '#' + prefix + 'voice_vol_slider',
  );
  const voiceVolBadge = container.querySelector(
    '#' + prefix + 'voice_vol_badge',
  );
  const voiceVolIcon = container.querySelector('#' + prefix + 'voice_vol_icon');
  const testVoiceBtn = container.querySelector('#' + prefix + 'btn_test_voice');

  const postMediaSettingsUpdate = () => {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'MEDIA_SETTINGS_UPDATE',
          mediaSettings: ms,
        },
        window.location.origin,
      );
    }
  };

  const postSongToPreview = (src, title = '', artist = '') => {
    if (previewIframe && previewIframe.contentWindow && src) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'SET_SONG',
          song: {
            title: title || ms.soundtrackTitle || 'Soundtrack',
            artist: artist || ms.soundtrackArtist || 'Special Choice ✨',
            src,
          },
        },
        window.location.origin,
      );
    }
  };

  // Preset dropdown
  if (presetEl) {
    presetEl.onchange = (e) => {
      const val = e.target.value;
      ms.soundtrackPreset = val;
      if (val !== 'custom') {
        const opt = e.target.selectedOptions[0];
        const title = opt ? opt.getAttribute('data-title') : '';
        const artist = opt ? opt.getAttribute('data-artist') : '';
        ms.soundtrackUrl = val;
        hero.musicTrackUrl = val;
        if (title && artist) {
          ms.soundtrackTitle = `${title} • ${artist}`;
          hero.musicTrackTitle = ms.soundtrackTitle;
          if (titleEl) titleEl.value = ms.soundtrackTitle;
        }
        if (urlEl) urlEl.value = val;
        postSongToPreview(val, title, artist);
      }
      postMediaSettingsUpdate();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  // Title input
  if (titleEl) {
    titleEl.oninput = (e) => {
      ms.soundtrackTitle = e.target.value.trim();
      hero.musicTrackTitle = ms.soundtrackTitle;
      postSongToPreview(ms.soundtrackUrl, ms.soundtrackTitle);
      postMediaSettingsUpdate();
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  }

  // URL input
  if (urlEl) {
    urlEl.oninput = (e) => {
      const v = e.target.value.trim();
      ms.soundtrackUrl = v;
      hero.musicTrackUrl = v;
      if (presetEl) {
        if (v.includes('taylor-swift'))
          presetEl.value = 'taylor-swift-fate-of-ophelia.m4r';
        else if (v.includes('lady-gaga'))
          presetEl.value = 'lady-gaga-always-remember-us-this-way.m4r';
        else if (v.includes('imagine-dragons'))
          presetEl.value = 'imagine-dragons-i-follow-you.m4r';
        else presetEl.value = 'custom';
        ms.soundtrackPreset = presetEl.value;
      }
      postSongToPreview(v, ms.soundtrackTitle);
      postMediaSettingsUpdate();
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  }

  // Library picker for soundtrack
  if (pickSoundtrackBtn) {
    pickSoundtrackBtn.onclick = () => {
      openMediaPicker({
        filter: 'audio',
        onSelect: (url) => {
          ms.soundtrackUrl = url;
          hero.musicTrackUrl = url;
          if (urlEl) urlEl.value = url;
          if (presetEl) {
            presetEl.value = 'custom';
            ms.soundtrackPreset = 'custom';
          }
          const fname = decodeURIComponent(
            url.split('/').pop()?.split('?')[0] || 'Custom Track',
          );
          if (
            !ms.soundtrackTitle ||
            ms.soundtrackTitle.includes('Taylor Swift') ||
            ms.soundtrackTitle.includes('Lady Gaga') ||
            ms.soundtrackTitle.includes('Imagine Dragons')
          ) {
            const autoTitle = fname.replace(/\.[^/.]+$/, '') + ' 🎵';
            ms.soundtrackTitle = autoTitle;
            hero.musicTrackTitle = autoTitle;
            if (titleEl) titleEl.value = autoTitle;
          }
          postSongToPreview(url, ms.soundtrackTitle);
          postMediaSettingsUpdate();
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        },
      });
    };
  }

  // File upload for soundtrack
  if (fileSoundtrackEl) {
    fileSoundtrackEl.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        if (statusSoundtrackEl) {
          statusSoundtrackEl.textContent = `❌ Song size (${mb} MB) exceeds 10 Mo limit! Choose a file under 10 Mo.`;
          statusSoundtrackEl.style.color = '#ff4365';
        }
        fileSoundtrackEl.value = '';
        return;
      }
      if (statusSoundtrackEl) {
        statusSoundtrackEl.textContent = 'Uploading soundtrack (max 10 Mo)...';
        statusSoundtrackEl.style.color = 'var(--text-muted)';
      }
      try {
        const publicUrl = await uploadFileToR2(file);
        ms.soundtrackUrl = publicUrl;
        hero.musicTrackUrl = publicUrl;
        const customTitle = file.name.replace(/\.[^/.]+$/, '') + ' 🎵';
        ms.soundtrackTitle = customTitle;
        hero.musicTrackTitle = customTitle;
        if (titleEl) titleEl.value = customTitle;
        if (urlEl) urlEl.value = publicUrl;
        if (presetEl) presetEl.value = 'custom';
        ms.soundtrackPreset = 'custom';
        if (statusSoundtrackEl) {
          statusSoundtrackEl.textContent = `✓ Uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
          statusSoundtrackEl.style.color = '#2ed573';
        }
        postSongToPreview(publicUrl, customTitle);
        postMediaSettingsUpdate();
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
      } catch (err) {
        if (statusSoundtrackEl) {
          statusSoundtrackEl.textContent = 'Upload failed: ' + err.message;
          statusSoundtrackEl.style.color = '#ff4365';
        }
      }
    };
  }

  // Test soundtrack button
  if (testSoundtrackBtn) {
    testSoundtrackBtn.onclick = () => {
      if (ms.soundtrackUrl) {
        postSongToPreview(ms.soundtrackUrl, ms.soundtrackTitle);
      }
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: 'MUSIC_TOGGLE' }, window.location.origin);
      }
    };
  }

  // Master volume slider
  let lastSoundtrackVol = ms.soundtrackVolume || 80;
  if (volSlider) {
    volSlider.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      ms.soundtrackVolume = val;
      if (val > 0) lastSoundtrackVol = val;
      if (volBadge) volBadge.textContent = `${val}%`;
      if (volIcon) volIcon.textContent = getVolumeIcon(val);
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'SET_VOLUME', volume: val / 100 },
          window.location.origin,
        );
      }
      debouncedAutoSaveLayout();
    };
  }

  // Master volume mute toggle icon
  if (volIcon) {
    volIcon.onclick = () => {
      const current = ms.soundtrackVolume || 0;
      const target = current > 0 ? 0 : lastSoundtrackVol || 80;
      ms.soundtrackVolume = target;
      if (volSlider) volSlider.value = target;
      if (volBadge) volBadge.textContent = `${target}%`;
      volIcon.textContent = getVolumeIcon(target);
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'SET_VOLUME', volume: target / 100 },
          window.location.origin,
        );
      }
      debouncedAutoSaveLayout();
    };
  }

  // Playback toggles
  const bindToggle = (el, key) => {
    if (!el) return;
    el.onchange = () => {
      ms[key] = el.checked;
      postMediaSettingsUpdate();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  };

  bindToggle(toggleAutoplay, 'soundtrackAutoplay');
  bindToggle(toggleLoop, 'soundtrackLoop');
  bindToggle(toggleFloating, 'floatingPlayer');
  bindToggle(toggleSfx, 'romanticSfx');

  // Voice note URL
  if (voiceUrlEl) {
    voiceUrlEl.oninput = (e) => {
      const v = e.target.value.trim();
      ms.voiceUrl = v;
      hero.voiceAudio = v;
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  }

  // Voice note library picker
  if (pickVoiceBtn) {
    pickVoiceBtn.onclick = () => {
      openMediaPicker({
        filter: 'audio',
        onSelect: (url) => {
          ms.voiceUrl = url;
          hero.voiceAudio = url;
          if (voiceUrlEl) voiceUrlEl.value = url;
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        },
      });
    };
  }

  // Voice note upload
  if (fileVoiceEl) {
    fileVoiceEl.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        if (statusVoiceEl) {
          statusVoiceEl.textContent = `❌ Audio size (${mb} MB) exceeds 10 Mo limit!`;
          statusVoiceEl.style.color = '#ff4365';
        }
        fileVoiceEl.value = '';
        return;
      }
      if (statusVoiceEl) {
        statusVoiceEl.textContent = 'Uploading voice note...';
        statusVoiceEl.style.color = 'var(--text-muted)';
      }
      try {
        const publicUrl = await uploadFileToR2(file);
        ms.voiceUrl = publicUrl;
        hero.voiceAudio = publicUrl;
        if (voiceUrlEl) voiceUrlEl.value = publicUrl;
        if (statusVoiceEl) {
          statusVoiceEl.textContent = `✓ Uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
          statusVoiceEl.style.color = '#2ed573';
        }
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
      } catch (err) {
        if (statusVoiceEl) {
          statusVoiceEl.textContent = 'Upload failed: ' + err.message;
          statusVoiceEl.style.color = '#ff4365';
        }
      }
    };
  }

  // Voice volume slider
  let lastVoiceVol = ms.voiceVolume || 100;
  if (voiceVolSlider) {
    voiceVolSlider.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      ms.voiceVolume = val;
      if (val > 0) lastVoiceVol = val;
      if (voiceVolBadge) voiceVolBadge.textContent = `${val}%`;
      if (voiceVolIcon) voiceVolIcon.textContent = getVolumeIcon(val);
      debouncedAutoSaveLayout();
    };
  }

  if (voiceVolIcon) {
    voiceVolIcon.onclick = () => {
      const current = ms.voiceVolume || 0;
      const target = current > 0 ? 0 : lastVoiceVol || 100;
      ms.voiceVolume = target;
      if (voiceVolSlider) voiceVolSlider.value = target;
      if (voiceVolBadge) voiceVolBadge.textContent = `${target}%`;
      voiceVolIcon.textContent = getVolumeIcon(target);
      debouncedAutoSaveLayout();
    };
  }

  // Test voice button
  if (testVoiceBtn) {
    testVoiceBtn.onclick = () => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'HERO_VOICE_TOGGLE' },
          window.location.origin,
        );
      }
    };
  }
}

function renderMediaSettingsUI() {
  const container = document.getElementById('mediaSettingsContainer');
  if (!container) return;
  container.innerHTML = renderMediaSettingsHTML('media_tab_');
  bindMediaSettingsControls(container, 'media_tab_');
}

// ----------------------------------------------------
// SIDEBAR TABS & GLOBAL SITE SETTINGS
// ----------------------------------------------------
function initSidebarTabs() {
  document.querySelectorAll('.sidebar-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (
        tabId === 'tab-inspector' &&
        (!state.layoutOrder || !state.layoutOrder.length)
      ) {
        showToast('No active sections on website to customize.', 'info');
      }
      switchToTab(tabId);
    });
  });

  const btnBack = document.getElementById('btnBackToWidgets');
  if (btnBack) {
    btnBack.addEventListener('click', () => switchToTab('tab-widgets'));
  }

  const btnMore = document.getElementById('btnInspectorMore');
  const moreMenu = document.getElementById('inspectorMoreMenu');
  if (btnMore && moreMenu) {
    btnMore.onclick = (e) => {
      e.stopPropagation();
      const isHidden = moreMenu.classList.contains('hidden');
      moreMenu.classList.toggle('hidden', !isHidden);
      btnMore.classList.toggle('active', isHidden);
    };
    document.addEventListener('click', (e) => {
      if (!moreMenu.contains(e.target) && e.target !== btnMore) {
        moreMenu.classList.add('hidden');
        btnMore.classList.remove('active');
      }
    });
  }
}

function switchToTab(tabId, skipWidgetSelect = false) {
  if (tabId === 'tab-inspector' && !skipWidgetSelect) {
    if (state.activeInspectorWidget === 'intro') {
      selectWidgetForInspector('intro');
    } else if (!state.layoutOrder || !state.layoutOrder.length) {
      renderInspectorEmptyState();
    } else if (
      !state.activeInspectorWidget ||
      !state.layoutOrder.includes(state.activeInspectorWidget)
    ) {
      selectWidgetForInspector(state.layoutOrder[0]);
    }
  }
  document.querySelectorAll('.sidebar-tab-btn').forEach((b) => {
    const isActive = b.getAttribute('data-tab') === tabId;
    b.classList.toggle('active', isActive);
    if (isActive && window.innerWidth <= 820) {
      b.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  });
  document.querySelectorAll('.sidebar-tab-pane').forEach((p) => {
    p.classList.toggle('active', p.id === tabId);
  });
  if (tabId === 'tab-website') {
    renderSiteSettingsUI();
  } else if (tabId === 'tab-media') {
    const isSettingsActive = document
      .getElementById('btnMediaSubnavSettings')
      ?.classList.contains('active');
    if (isSettingsActive) {
      renderMediaSettingsUI();
    } else {
      renderMediaLibraryUI();
    }
  }
}
window.switchToTab = switchToTab;

function renderSiteSettingsUI() {
  const container = document.getElementById('siteSettingsContainer');
  if (!container) return;

  if (!state.sectionsData.hero) state.sectionsData.hero = {};
  const hero = state.sectionsData.hero;

  const birthdayThemes = [
    {
      id: 'theme-birthday',
      name: 'Birthday Cakes 🎂',
      desc: 'Tiered cakes, dripping icing, candles & balloons',
      color: '#ff2e93',
      bg: 'linear-gradient(135deg, #fff0f7 0%, #fffbf0 50%, #f0f7ff 100%)',
      icon: '🎂',
    },
    {
      id: 'theme-birthday-midnight',
      name: 'Midnight Gold Gala ✨',
      desc: 'Dark luxury gala, sparkler cakes & champagne',
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
      icon: '✨',
    },
    {
      id: 'theme-birthday-pastel',
      name: 'Sweet Cupcake Bakery 🧁',
      desc: 'Strawberry cream, cupcakes & macaron towers',
      color: '#ec4899',
      bg: 'linear-gradient(135deg, #fdf2f8 0%, #fef3c7 50%, #f0fdf4 100%)',
      icon: '🧁',
    },
    {
      id: 'theme-birthday-carnival',
      name: 'Carnival & Confetti 🎪',
      desc: 'Joyful bunting banners, party poppers & balloons',
      color: '#0284c7',
      bg: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #ecfeff 100%)',
      icon: '🎪',
    },
    {
      id: 'theme-birthday-emoji',
      name: '3D Emoji Party 🥳',
      desc: 'Floating 3D emoji stickers, festive confetti & vibes',
      color: '#f43f5e',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 50%, #fef08a 100%)',
      icon: '🥳',
    },
    {
      id: 'theme-birthday-pixel',
      name: '8-Bit Retro Arcade 👾',
      desc: 'Chiptune arcade pixel art, pixel cake & CRT grid',
      color: '#a855f7',
      bg: 'linear-gradient(135deg, #0d0221 0%, #19053b 50%, #26115a 100%)',
      icon: '👾',
    },
    {
      id: 'theme-birthday-neon',
      name: 'Electric Cyber Neon ⚡',
      desc: 'Glow tubes, dark club mode & vibrant neon signage',
      color: '#ff007f',
      bg: 'linear-gradient(135deg, #050508 0%, #0a0a14 50%, #12091f 100%)',
      icon: '⚡',
    },
    {
      id: 'theme-birthday-papercraft',
      name: 'Papercraft Cardstock ✂️',
      desc: 'Folded origami, layered papercut shadows & bunting',
      color: '#ea580c',
      bg: 'linear-gradient(135deg, #fffbf5 0%, #fef3c7 50%, #ffedd5 100%)',
      icon: '✂️',
    },
    {
      id: 'theme-birthday-watercolor',
      name: 'Watercolor & Foil 🎨',
      desc: 'Soft pastel washes, luxury gold foil & delicate botanicals',
      color: '#c026d3',
      bg: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #f5f3ff 100%)',
      icon: '🎨',
    },
  ];

  const artStyles = [
    {
      id: 'theme-img-watercolor-frame',
      name: 'Watercolor Romance 🎨',
      desc: 'Soft border wash, polka-dot balloons & golden arrows',
      color: '#fb7185',
      img: '/images/themes/bg-watercolor-frame.png',
    },
    {
      id: 'theme-img-pop-stickers',
      name: 'Pop Love Stickers 💋',
      desc: 'Bold lips, bubbling potion, winged hearts & lockets',
      color: '#ff007f',
      img: '/images/themes/bg-pop-stickers.png',
    },
    {
      id: 'theme-img-doodle-tapestry',
      name: 'Love Sketch Tapestry 🧸',
      desc: 'Monoline toile: teddy bears, champagne & roses',
      color: '#e11d48',
      img: '/images/themes/bg-doodle-tapestry.png',
    },
  ];

  const imageBackgroundThemes = [
    {
      id: 'theme-img-theme1',
      name: 'Theme 1 🎀',
      desc: 'Watercolor clouds & ribbons (Responsive)',
      color: '#e11d48',
      img: '/images/themes/thumb-theme1.jpg?v=2.5.0',
    },
    {
      id: 'theme-img-theme2',
      name: 'Theme 2 🎀',
      desc: 'Silk bows & pearl necklaces (Responsive)',
      color: '#e11d48',
      img: '/images/themes/thumb-theme2.jpg?v=2.5.0',
    },
    {
      id: 'theme-img-theme3',
      name: 'Theme 3 🍒',
      desc: 'Heart cherries with silk ribbons (Responsive)',
      color: '#dc2626',
      img: '/images/themes/thumb-theme3.jpg?v=2.5.0',
    },
    {
      id: 'theme-img-theme4',
      name: 'Theme 4 📝',
      desc: 'Love letter notebook paper (Responsive)',
      color: '#e11d48',
      img: '/images/themes/thumb-theme4.jpg?v=2.5.0',
    },
    {
      id: 'theme-img-gold-hearts',
      name: 'Watercolor Gold Hearts 💛',
      desc: 'Gold leaf hearts & blush wash',
      color: '#d97706',
      img: '/images/themes/bg-watercolor-gold.jpeg',
    },
    {
      id: 'theme-img-love-letter',
      name: 'Love Letter Envelope 💌',
      desc: 'Pink letter & floating hearts',
      color: '#fb7185',
      img: '/images/themes/bg-love-letter.jpg',
    },
    {
      id: 'theme-img-be-mine',
      name: 'Be Mine Sunset Sky 🌅',
      desc: 'Sunset sky & sparkling heart trail',
      color: '#f43f5e',
      img: '/images/themes/bg-be-mine-sky.jpg',
    },
    {
      id: 'theme-img-sweet-couple',
      name: 'Embracing Couple 👩‍❤️‍👨',
      desc: 'Minimalist couple hug illustration',
      color: '#0284c7',
      img: '/images/themes/bg-sweet-couple.jpg',
    },
    {
      id: 'theme-img-line-hearts',
      name: 'Minimalist Line Hearts ✍️',
      desc: 'Continuous ink doodle hearts',
      color: '#ec4899',
      img: '/images/themes/bg-line-hearts.jpg',
    },
    {
      id: 'theme-img-stitched-hearts',
      name: 'Stitched Dual Pink 💕',
      desc: 'Two-tone stitched craft paper',
      color: '#db2777',
      img: '/images/themes/bg-stitched-pink.jpeg',
    },
    {
      id: 'theme-img-heart-podiums',
      name: '3D Heart Podiums 🎁',
      desc: '3D pastel pink heart sculpture',
      color: '#ec4899',
      img: '/images/themes/bg-heart-podiums.webp',
    },
    {
      id: 'theme-img-paper-sunset',
      name: 'Sunset Paper Hearts 🌇',
      desc: 'Warm sunset & layered paper cutouts',
      color: '#f97316',
      img: '/images/themes/bg-paper-sunset.jpg',
    },
  ];

  const otherOccasions = [
    { id: 'theme-apology', name: 'Sincere Apology 🕊️', desc: 'Serene blues & heartfelt tone', color: '#3a86ff', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', icon: '🕊️', category: 'palette' },
    { id: 'theme-anniversary', name: 'Anniversary 💍', desc: 'Crimson rose & gold romance', color: '#c9184a', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', icon: '💍', category: 'palette' },
    { id: 'theme-scrapbook', name: 'Scrapbook 📖', desc: 'Craft paper & warm nostalgia', color: '#b05d3b', bg: 'linear-gradient(135deg, #fef3c7 0%, #fae8bf 100%)', icon: '📖', category: 'palette' },
  ];

  const colorThemes = [
    { id: 'theme-pink', name: 'Romantic Rose', desc: 'Vibrant pink & velvet blush', color: '#ff4d6d', bg: 'linear-gradient(135deg, #fff0f3 0%, #ffd1dc 100%)', icon: '🌹', category: 'palette' },
    { id: 'theme-midnight', name: 'Ocean Blue', desc: 'Calm twilight deep blue', color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)', icon: '🌊', category: 'palette' },
    { id: 'theme-purple', name: 'Lavender Dream', desc: 'Ethereal lilac & purple haze', color: '#9b5de5', bg: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)', icon: '🔮', category: 'palette' },
    { id: 'theme-gold', name: 'Sunset Gold', desc: 'Warm amber & golden glow', color: '#f77f00', bg: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)', icon: '🌅', category: 'palette' },
    { id: 'theme-emerald', name: 'Emerald Garden', desc: 'Fresh mint & lush forest', color: '#10b981', bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)', icon: '🌿', category: 'palette' },
    { id: 'theme-peach', name: 'Warm Peach', desc: 'Soft apricot & sunny warmth', color: '#f97316', bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', icon: '🍑', category: 'palette' },
  ];

  let currentTheme = state.themeId || 'theme-pink';
  if (currentTheme === 'romantic-rose' || !currentTheme)
    currentTheme = 'theme-pink';
  else if (currentTheme === 'theme-blue' || currentTheme === 'blue')
    currentTheme = 'theme-midnight';
  else if (
    currentTheme === 'birthday' ||
    currentTheme === 'theme-birthday-cake'
  )
    currentTheme = 'theme-birthday';
  else if (currentTheme.endsWith('-16-9') || currentTheme.endsWith('-9-16')) {
    currentTheme = currentTheme.replace(/-(16-9|9-16)$/, '');
  }

  const categoryLabels = {
    birthday: '🎂 Birthday',
    illustrated: '✨ Art Style',
    wallpaper: '🖼️ Wallpaper',
    palette: '🎨 Color Palette',
  };

  const customThemes = (state.sectionsData.customThemes || []).map((t) => ({
    ...t,
    category: 'wallpaper',
    isCustom: true,
  }));

  const allThemes = [
    ...birthdayThemes.map((t) => ({ ...t, category: 'birthday' })),
    ...artStyles.map((t) => ({ ...t, category: 'illustrated' })),
    ...customThemes,
    ...imageBackgroundThemes.map((t) => ({ ...t, category: 'wallpaper' })),
    ...otherOccasions,
    ...colorThemes,
  ];

  const activeTheme =
    allThemes.find((t) => t.id === currentTheme) || allThemes[0];

  if (typeof window._themeCatalogExpanded !== 'boolean') {
    window._themeCatalogExpanded = false;
  }
  if (!window._themeCategoryFilter) {
    window._themeCategoryFilter = 'all';
  }

  const safeDateVal = (hero.anniversaryDate || '2024-02-14').split('T')[0];
  const publicSiteUrl = `${window.location.origin}/sites/${encodeURIComponent(state.slug)}`;

  container.innerHTML = `
    ${
      state.userRole === 'visitor'
        ? `
      <div class="visitor-locked-banner">
        <span>🔒 Purchase now to customize themes, motto & identity</span>
        <a href="/welcome#pricing" target="_blank" class="visitor-lock-btn">Unlock Themes ↗</a>
      </div>
    `
        : ''
    }
    <!-- Live Website Share Card -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>🌐</span> Live Website Link</div>
      <div class="share-url-box">
        <span class="share-url-text" id="siteShareUrl">${escapeHtml(publicSiteUrl)}</span>
        <button type="button" class="btn-copy-link" id="btnCopySiteLink" title="Copy website link">📋 Copy</button>
        <a href="/sites/${encodeURIComponent(state.slug)}" target="_blank" class="btn-open-link" title="Open live project in new tab">↗ Open</a>
      </div>
    </div>

    <!-- Couple Identity Card -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>💍</span> Couple Identity</div>
      <div class="grid-2">
        <div class="input-group">
          <label>Partner 1 (Sender / Boyfriend)</label>
          <input type="text" id="site_p1" value="${escapeHtml(hero.partner1 || state.partner1 || 'Partner 1')}">
        </div>
        <div class="input-group">
          <label>Partner 2 (Recipient / Girlfriend)</label>
          <input type="text" id="site_p2" value="${escapeHtml(hero.partner2 || state.partner2 || 'Partner 2')}">
        </div>
      </div>
      <div class="input-group">
        <label>Anniversary / Start Date</label>
        <input type="date" id="site_date" value="${safeVal(safeDateVal)}">
      </div>
      <div class="input-group">
        <label>Love Subtitle / Relationship Motto</label>
        <input type="text" id="site_subtitle" value="${escapeHtml(hero.subtitle || `${hero.partner1 || state.partner1 || 'Partner 1'} & ${hero.partner2 || state.partner2 || 'Partner 2'}'s Infinite Love Story ❤️`)}">
      </div>
      <div class="input-group" style="margin-top: 10px;">
        <label>Browser Tab Title</label>
        <input type="text" id="site_page_title" value="${escapeHtml(hero.pageTitle || `${hero.partner1 || state.partner1 || 'Partner 1'} & ${hero.partner2 || state.partner2 || 'Partner 2'} | Our Love Story ❤️`)}">
      </div>
    </div>

    <!-- Visual Theme Manager Card -->
    <div class="settings-group-card theme-manager-card">
      <div class="theme-manager-header">
        <div class="settings-group-title" style="margin-bottom: 0;">
          <span>🎨</span> Website Theme & Style
        </div>
        <div class="theme-header-actions">
          <button type="button" id="btnOpenAddThemeModal" class="btn-ghost-admin" title="Create Custom Theme (Admin)">
            <span>+</span> Custom (Admin)
          </button>
          <button type="button" id="btnToggleThemeCatalog" class="btn-theme-expand ${window._themeCatalogExpanded ? 'expanded' : ''}" title="Toggle theme list">
            <span class="btn-expand-text">${window._themeCatalogExpanded ? 'Collapse ▲' : `Browse Themes (${allThemes.length}) ▾`}</span>
          </button>
        </div>
      </div>

      <!-- Active Theme Banner (Always Visible) -->
      <div class="theme-active-banner">
        <div class="theme-active-preview" id="themeActiveBannerThumb" style="${activeTheme.img ? `background-image: url('${activeTheme.img}');` : activeTheme.isCustom && (activeTheme.desktopImg || activeTheme.mobileImg) ? `background-image: url('${escapeHtml(activeTheme.desktopImg || activeTheme.mobileImg)}');` : `background: ${activeTheme.bg || activeTheme.color};`}">
          ${!activeTheme.img && (!activeTheme.isCustom || (!activeTheme.desktopImg && !activeTheme.mobileImg)) ? `<span class="theme-active-icon" id="themeActiveBannerIcon">${activeTheme.icon || '🎨'}</span>` : '<span class="theme-active-icon" id="themeActiveBannerIcon" style="display:none;"></span>'}
        </div>
        <div class="theme-active-info">
          <div class="theme-active-meta">
            <span class="theme-active-badge">ACTIVE THEME</span>
            <span class="theme-active-category" id="themeActiveBannerCat">${categoryLabels[activeTheme.category] || '🎨 Theme'}</span>
          </div>
          <div class="theme-active-name" id="themeActiveBannerName" title="${escapeHtml(activeTheme.name)}">
            <span class="theme-color-dot" id="themeActiveBannerDot" style="background: ${activeTheme.color}"></span>
            <strong id="themeActiveBannerTitle">${escapeHtml(activeTheme.name)}</strong>
          </div>
          <div class="theme-active-desc" id="themeActiveBannerDesc">${escapeHtml(activeTheme.desc || '')}</div>
        </div>
        <button type="button" id="btnQuickExpandThemes" class="theme-active-change-btn" title="Expand or collapse themes">
          <span class="change-btn-text">${window._themeCatalogExpanded ? '▲ Collapse' : '⚡ Change'}</span>
        </button>
      </div>

      <!-- Collapsible Theme Drawer -->
      <div class="theme-catalog-drawer ${window._themeCatalogExpanded ? 'expanded' : 'collapsed'}" id="themeCatalogDrawer">
        <!-- Category Filter Pills -->
        <div class="theme-category-nav">
          <button type="button" class="theme-cat-pill ${window._themeCategoryFilter === 'all' ? 'active' : ''}" data-category="all">
            <span>🌟</span> All (${allThemes.length})
          </button>
          <button type="button" class="theme-cat-pill ${window._themeCategoryFilter === 'birthday' ? 'active' : ''}" data-category="birthday">
            <span>🎂</span> Birthday (${birthdayThemes.length})
          </button>
          <button type="button" class="theme-cat-pill ${window._themeCategoryFilter === 'illustrated' ? 'active' : ''}" data-category="illustrated">
            <span>✨</span> Art Styles (${artStyles.length})
          </button>
          <button type="button" class="theme-cat-pill ${window._themeCategoryFilter === 'wallpaper' ? 'active' : ''}" data-category="wallpaper">
            <span>🖼️</span> Wallpapers (${imageBackgroundThemes.length + customThemes.length})
          </button>
          <button type="button" class="theme-cat-pill ${window._themeCategoryFilter === 'palette' ? 'active' : ''}" data-category="palette">
            <span>🎨</span> Palettes (${otherOccasions.length + colorThemes.length})
          </button>
        </div>

        <!-- Grid of Themes -->
        <div class="theme-catalog-grid" id="themeCatalogGrid">
          ${allThemes
            .map((t) => {
              const isActive = currentTheme === t.id;
              const isHidden =
                window._themeCategoryFilter !== 'all' &&
                window._themeCategoryFilter !== t.category;
              const bgStyle = t.img
                ? `background-image: url('${t.img}');`
                : t.isCustom && (t.desktopImg || t.mobileImg)
                  ? `background-image: url('${escapeHtml(t.desktopImg || t.mobileImg)}');`
                  : `background: ${t.bg || t.color};`;
              return `
            <div class="theme-card-wrapper" data-category="${t.category}" style="${isHidden ? 'display: none;' : ''}">
              <button type="button" class="theme-chip-btn ${isActive ? 'active' : ''}" data-theme="${t.id}" title="${escapeHtml(t.name)}">
                <div class="theme-card-thumb" style="${bgStyle}">
                  ${t.isCustom ? `<span class="theme-badge-custom">CUSTOM</span>` : ''}
                  ${!t.img && (!t.isCustom || (!t.desktopImg && !t.mobileImg)) ? `<span class="theme-card-icon">${t.icon || '🎨'}</span>` : ''}
                  ${isActive ? `<span class="theme-badge-active">✓ Active</span>` : ''}
                </div>
                <div class="theme-card-body">
                  <div class="theme-card-title">
                    <span class="theme-color-dot" style="background: ${t.color}"></span>
                    <span>${escapeHtml(t.name)}</span>
                  </div>
                  <span class="theme-card-desc">${escapeHtml(t.desc || '')}</span>
                </div>
              </button>
              ${t.isCustom ? `<button type="button" class="btn-delete-custom-theme" data-theme-id="${escapeHtml(t.id)}" title="Delete custom theme">🗑️</button>` : ''}
            </div>
          `;
            })
            .join('')}
        </div>

        <!-- Bottom Collapse Button -->
        <div class="theme-collapse-footer">
          <button type="button" id="btnCollapseThemeBottom" class="btn-theme-collapse-bottom">
            ▲ Collapse Theme Catalog
          </button>
        </div>
      </div>
    </div>

    <!-- Audio & Romance Soundtrack Settings -->
    ${renderMediaSettingsHTML('site_')}
  `;

  // Copy site link button with clipboard fallback
  const btnCopy = document.getElementById('btnCopySiteLink');
  if (btnCopy) {
    btnCopy.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(publicSiteUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = publicSiteUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      btnCopy.textContent = '✓ Copied!';
      setTimeout(() => (btnCopy.textContent = '📋 Copy'), 1500);
    };
  }

  // Bind unified media and audio settings controls
  bindMediaSettingsControls(container, 'site_');

  // Toggle theme catalog expand / collapse
  const toggleCatalog = (forceState) => {
    window._themeCatalogExpanded =
      typeof forceState === 'boolean'
        ? forceState
        : !window._themeCatalogExpanded;
    const drawer = document.getElementById('themeCatalogDrawer');
    const toggleBtn = document.getElementById('btnToggleThemeCatalog');
    const quickBtn = document.getElementById('btnQuickExpandThemes');

    if (drawer) {
      drawer.classList.toggle('expanded', window._themeCatalogExpanded);
      drawer.classList.toggle('collapsed', !window._themeCatalogExpanded);
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('expanded', window._themeCatalogExpanded);
      const txt = toggleBtn.querySelector('.btn-expand-text');
      if (txt)
        txt.textContent = window._themeCatalogExpanded
          ? 'Collapse ▲'
          : `Browse Themes (${allThemes.length}) ▾`;
    }
    if (quickBtn) {
      const txt = quickBtn.querySelector('.change-btn-text');
      if (txt)
        txt.textContent = window._themeCatalogExpanded
          ? '▲ Collapse'
          : '⚡ Change';
    }
  };

  const btnToggleCatalog = document.getElementById('btnToggleThemeCatalog');
  if (btnToggleCatalog) btnToggleCatalog.onclick = () => toggleCatalog();

  const btnQuickExpand = document.getElementById('btnQuickExpandThemes');
  if (btnQuickExpand) btnQuickExpand.onclick = () => toggleCatalog();

  const btnCollapseBottom = document.getElementById('btnCollapseThemeBottom');
  if (btnCollapseBottom) btnCollapseBottom.onclick = () => toggleCatalog(false);

  // Category filter pills
  container.querySelectorAll('.theme-cat-pill').forEach((pill) => {
    pill.onclick = () => {
      const cat = pill.getAttribute('data-category');
      window._themeCategoryFilter = cat;
      container
        .querySelectorAll('.theme-cat-pill')
        .forEach((p) => p.classList.toggle('active', p === pill));
      container.querySelectorAll('.theme-card-wrapper').forEach((wrapper) => {
        const itemCat = wrapper.getAttribute('data-category');
        wrapper.style.display =
          cat === 'all' || itemCat === cat ? '' : 'none';
      });
    };
  });

  // Bind theme clicks
  container.querySelectorAll('.theme-chip-btn').forEach((btn) => {
    btn.onclick = () => {
      if (state.userRole === 'visitor') {
        showToast(
          '🔒 Purchase now to customize your website theme!',
          'warning',
        );
        window.open('/welcome#pricing', '_blank');
        return;
      }
      const selectedId = btn.getAttribute('data-theme');
      state.themeId = selectedId;
      state.customBgUrl = '';

      container.querySelectorAll('.theme-card-wrapper').forEach((wrapper) => {
        const chipBtn = wrapper.querySelector('.theme-chip-btn');
        if (!chipBtn) return;
        const isSelected = chipBtn.getAttribute('data-theme') === selectedId;
        chipBtn.classList.toggle('active', isSelected);
        let badge = wrapper.querySelector('.theme-badge-active');
        if (isSelected) {
          if (!badge) {
            const thumb = wrapper.querySelector('.theme-card-thumb');
            if (thumb) {
              const span = document.createElement('span');
              span.className = 'theme-badge-active';
              span.textContent = '✓ Active';
              thumb.appendChild(span);
            }
          }
        } else if (badge) {
          badge.remove();
        }
      });

      const matched = allThemes.find((t) => t.id === selectedId);
      if (matched) {
        const bannerThumb = document.getElementById('themeActiveBannerThumb');
        const bannerIcon = document.getElementById('themeActiveBannerIcon');
        const bannerCat = document.getElementById('themeActiveBannerCat');
        const bannerDot = document.getElementById('themeActiveBannerDot');
        const bannerTitle = document.getElementById('themeActiveBannerTitle');
        const bannerDesc = document.getElementById('themeActiveBannerDesc');

        if (bannerThumb) {
          if (matched.img || (matched.isCustom && (matched.desktopImg || matched.mobileImg))) {
            bannerThumb.style.backgroundImage = `url('${matched.img || matched.desktopImg || matched.mobileImg}')`;
            bannerThumb.style.background = '';
            if (bannerIcon) bannerIcon.style.display = 'none';
          } else {
            bannerThumb.style.backgroundImage = '';
            bannerThumb.style.background = matched.bg || matched.color;
            if (bannerIcon) {
              bannerIcon.style.display = 'inline';
              bannerIcon.textContent = matched.icon || '🎨';
            }
          }
        }
        if (bannerCat)
          bannerCat.textContent = categoryLabels[matched.category] || '🎨 Theme';
        if (bannerDot) bannerDot.style.background = matched.color;
        if (bannerTitle) bannerTitle.textContent = matched.name;
        if (bannerDesc) bannerDesc.textContent = matched.desc || '';
      }

      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          {
            type: 'SET_THEME',
            themeId: state.themeId,
            customBgUrl: '',
            customThemes:
              (state.sectionsData && state.sectionsData.customThemes) || [],
          },
          window.location.origin,
        );
      }
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  });

  // Bind custom theme modal & actions
  const btnOpenAddTheme = document.getElementById('btnOpenAddThemeModal');
  const modalAddTheme = document.getElementById('addThemeModal');
  if (btnOpenAddTheme && modalAddTheme) {
    btnOpenAddTheme.onclick = () => {
      if (state.userRole === 'visitor') {
        showToast('🔒 Purchase now to customize and create themes!', 'warning');
        window.open('/welcome#pricing', '_blank');
        return;
      }
      modalAddTheme.classList.remove('hidden');
      const statusEl = document.getElementById('customThemeStatus');
      if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
      }
    };
  }

  const btnCloseThemeModal = document.getElementById('btnCloseAddThemeModal');
  const btnCancelThemeModal = document.getElementById('btnCancelAddThemeModal');
  [btnCloseThemeModal, btnCancelThemeModal].forEach((b) => {
    if (b && modalAddTheme) {
      b.onclick = () => modalAddTheme.classList.add('hidden');
    }
  });
  if (modalAddTheme) {
    modalAddTheme.onclick = (e) => {
      if (e.target === modalAddTheme) modalAddTheme.classList.add('hidden');
    };
  }

  const themeColor = document.getElementById('customThemeColor');
  const themeColorHex = document.getElementById('customThemeColorHex');
  if (themeColor && themeColorHex) {
    themeColor.oninput = (e) => {
      themeColorHex.value = e.target.value;
    };
    themeColorHex.oninput = (e) => {
      if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
        themeColor.value = e.target.value;
    };
  }

  const deskInput = document.getElementById('customThemeDesktopImg');
  const deskPreview = document.getElementById('customThemeDesktopPreview');
  const updateDeskPreview = (url) => {
    if (deskPreview) {
      deskPreview.style.backgroundImage = url ? `url('${url}')` : '';
      deskPreview.textContent = url ? '' : 'Desktop (16:9) Preview';
    }
  };
  if (deskInput)
    deskInput.oninput = (e) => updateDeskPreview(e.target.value.trim());

  const btnDeskLib = document.getElementById('btnCustomThemeDesktopLibrary');
  if (btnDeskLib) {
    btnDeskLib.onclick = () => {
      openMediaPicker({
        filter: 'image',
        onSelect: (url) => {
          if (deskInput) deskInput.value = url;
          updateDeskPreview(url);
        },
      });
    };
  }

  const fileDesk = document.getElementById('uploadCustomThemeDesktop');
  if (fileDesk) {
    fileDesk.onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const up = await uploadFileToR2(f);
        const url = typeof up === 'string' ? up : up?.url || up?.publicUrl;
        if (url) {
          if (deskInput) deskInput.value = url;
          updateDeskPreview(url);
        }
      } catch (err) {
        showToast('Upload error: ' + err.message, 'error');
      }
    };
  }

  const mobInput = document.getElementById('customThemeMobileImg');
  const mobPreview = document.getElementById('customThemeMobilePreview');
  const updateMobPreview = (url) => {
    if (mobPreview) {
      mobPreview.style.backgroundImage = url ? `url('${url}')` : '';
      mobPreview.textContent = url ? '' : 'Mobile (9:16)';
    }
  };
  if (mobInput)
    mobInput.oninput = (e) => updateMobPreview(e.target.value.trim());

  const btnMobLib = document.getElementById('btnCustomThemeMobileLibrary');
  if (btnMobLib) {
    btnMobLib.onclick = () => {
      openMediaPicker({
        filter: 'image',
        onSelect: (url) => {
          if (mobInput) mobInput.value = url;
          updateMobPreview(url);
        },
      });
    };
  }

  const fileMob = document.getElementById('uploadCustomThemeMobile');
  if (fileMob) {
    fileMob.onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const up = await uploadFileToR2(f);
        const url = typeof up === 'string' ? up : up?.url || up?.publicUrl;
        if (url) {
          if (mobInput) mobInput.value = url;
          updateMobPreview(url);
        }
      } catch (err) {
        showToast('Upload error: ' + err.message, 'error');
      }
    };
  }

  const btnSaveTheme = document.getElementById('btnSaveCustomTheme');
  if (btnSaveTheme) {
    btnSaveTheme.onclick = async () => {
      const name = (
        document.getElementById('customThemeName')?.value || ''
      ).trim();
      const desc = (
        document.getElementById('customThemeDesc')?.value || ''
      ).trim();
      const color = (
        document.getElementById('customThemeColor')?.value || '#e11d48'
      ).trim();
      const desktopImg = (
        document.getElementById('customThemeDesktopImg')?.value || ''
      ).trim();
      const mobileImg = (
        document.getElementById('customThemeMobileImg')?.value || desktopImg
      ).trim();
      const statusEl = document.getElementById('customThemeStatus');

      if (!name) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#ef4444';
          statusEl.textContent = 'Theme Name is required.';
        }
        return;
      }
      if (!desktopImg && !mobileImg) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#ef4444';
          statusEl.textContent =
            'Desktop (16:9) or Mobile (9:16) image is required.';
        }
        return;
      }

      btnSaveTheme.disabled = true;
      btnSaveTheme.textContent = 'Saving...';

      try {
        const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

        const res = await fetch(
          `/api/tenants/${encodeURIComponent(state.slug)}/custom-themes`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              name,
              desc: desc || 'Custom responsive wallpaper',
              color,
              desktopImg: desktopImg || mobileImg,
              mobileImg: mobileImg || desktopImg,
            }),
          },
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to add theme');

        if (!state.sectionsData) state.sectionsData = {};
        state.sectionsData.customThemes = result.customThemes || [];
        state.themeId = result.theme.id;
        state.customBgUrl = '';

        // Reset form inputs for next time
        const nameEl = document.getElementById('customThemeName');
        const descEl = document.getElementById('customThemeDesc');
        if (nameEl) nameEl.value = '';
        if (descEl) descEl.value = '';
        if (deskInput) deskInput.value = '';
        if (mobInput) mobInput.value = '';
        updateDeskPreview('');
        updateMobPreview('');

        if (modalAddTheme) modalAddTheme.classList.add('hidden');

        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            {
              type: 'SET_THEME',
              themeId: state.themeId,
              customBgUrl: '',
              customThemes: state.sectionsData.customThemes,
            },
            window.location.origin,
          );
        }

        renderSiteSettingsUI();
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
        showToast('✓ Custom responsive theme created and applied!', 'success');
      } catch (err) {
        alert(err.message);
      } finally {
        btnSaveTheme.disabled = false;
        btnSaveTheme.textContent = 'Save Custom Theme';
      }
    };
  }

  // Delete custom theme buttons
  container.querySelectorAll('.btn-delete-custom-theme').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (state.userRole === 'visitor') {
        showToast('🔒 Only project admins can delete custom themes!', 'warning');
        return;
      }
      const themeId = btn.getAttribute('data-theme-id');
      if (!themeId) return;
      if (!confirm('Are you sure you want to delete this custom theme?'))
        return;

      try {
        btn.disabled = true;
        const res = await fetch(
          `/api/tenants/${encodeURIComponent(state.slug)}/custom-themes/${encodeURIComponent(themeId)}`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          },
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to delete theme');

        if (!state.sectionsData) state.sectionsData = {};
        const returnedThemes = Array.isArray(result.customThemes)
          ? result.customThemes
          : state.sectionsData.customThemes || [];
        state.sectionsData.customThemes = returnedThemes.filter(
          (t) => t && t.id !== themeId,
        );
        if (state.themeId === themeId) {
          state.themeId = 'theme-img-theme1';
        }

        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            {
              type: 'SET_THEME',
              themeId: state.themeId,
              customBgUrl: '',
              customThemes: state.sectionsData.customThemes,
            },
            window.location.origin,
          );
        }

        renderSiteSettingsUI();
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
        showToast('Theme deleted.', 'info');
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    };
  });

  // Bind input listeners
  const bindInput = (id, setter) => {
    const el = document.getElementById(id);
    if (!el) return;
    const handleInput = (e) => {
      setter(e.target.value.trim());
      debouncedLiveUpdate(false, 'hero');
      debouncedAutoSaveLayout();
    };
    el.oninput = handleInput;
    el.onchange = handleInput;
  };

  bindInput('site_p1', (v) => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.partner1 = v;
  });
  bindInput('site_p2', (v) => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.partner2 = v;
  });
  bindInput('site_date', (v) => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.anniversaryDate = v;
  });
  bindInput('site_subtitle', (v) => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.subtitle = v;
  });
  bindInput('site_page_title', (v) => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.pageTitle = v;
  });

  if (state.userRole === 'visitor') {
    container
      .querySelectorAll(
        "input:not([id='site_p1']):not([id='site_p2']), select, button:not(#btnCopySiteLink):not(.btn-open-link)",
      )
      .forEach((el) => {
        el.disabled = true;
        el.classList.add('visitor-disabled');
      });
  }
}

// ----------------------------------------------------
// 7. BUILDER CONTROLS & SHORTCUTS
// ----------------------------------------------------
function initSidebarResizer() {
  const sidebar = document.getElementById('builderSidebar');
  const resizer = document.getElementById('builderResizer');
  const btnCollapse = document.getElementById('btnCollapseSidebar');
  const collapseArrow = document.getElementById('collapseArrow');
  if (!sidebar || !resizer) return;

  const getLimits = () => {
    const min = 320;
    const max = Math.max(760, Math.min(1400, window.innerWidth - 360));
    return { min, max };
  };

  const savedWidth = localStorage.getItem('builder_sidebar_width');
  if (savedWidth) {
    const w = parseInt(savedWidth, 10);
    const { min, max } = getLimits();
    if (w >= min && w <= max) {
      sidebar.style.width = `${w}px`;
      document.documentElement.style.setProperty('--sidebar-width', `${w}px`);
    }
  }

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  const onDragStart = (clientX, pointerId) => {
    isDragging = true;
    startX = clientX;
    startWidth = sidebar.offsetWidth;
    if (pointerId !== undefined && resizer.setPointerCapture) {
      try { resizer.setPointerCapture(pointerId); } catch (e) {}
    }
    resizer.classList.add('resizing');
    sidebar.classList.add('resizing');
    document.body.classList.add('is-resizing-sidebar');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    if (previewIframe) previewIframe.style.pointerEvents = 'none';
  };

  const onDragMove = (clientX) => {
    if (!isDragging) return;
    const { min, max } = getLimits();
    const delta = clientX - startX;
    const newWidth = Math.max(min, Math.min(max, startWidth + delta));
    sidebar.style.width = `${newWidth}px`;
    document.documentElement.style.setProperty(
      '--sidebar-width',
      `${newWidth}px`,
    );
    if (sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      if (collapseArrow) collapseArrow.textContent = '◀';
    }
  };

  const onDragEnd = (pointerId) => {
    if (!isDragging) return;
    isDragging = false;
    if (pointerId !== undefined && resizer.releasePointerCapture) {
      try { resizer.releasePointerCapture(pointerId); } catch (e) {}
    }
    resizer.classList.remove('resizing');
    sidebar.classList.remove('resizing');
    document.body.classList.remove('is-resizing-sidebar');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (previewIframe) previewIframe.style.pointerEvents = '';
    localStorage.setItem('builder_sidebar_width', sidebar.offsetWidth);
  };

  resizer.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    onDragStart(e.clientX, e.pointerId);
  });
  window.addEventListener('pointermove', (e) => onDragMove(e.clientX));
  window.addEventListener('pointerup', (e) => onDragEnd(e.pointerId));
  window.addEventListener('pointercancel', (e) => onDragEnd(e.pointerId));

  resizer.addEventListener('dblclick', () => {
    sidebar.style.width = '470px';
    document.documentElement.style.setProperty('--sidebar-width', '470px');
    localStorage.removeItem('builder_sidebar_width');
    showToast('Sidebar width reset to default (470px)', 'info', 1500);
  });

  if (btnCollapse) {
    btnCollapse.onclick = () => {
      sidebar.classList.add('collapsing');
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (collapseArrow) collapseArrow.textContent = isCollapsed ? '▶' : '◀';
      btnCollapse.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
      setTimeout(() => sidebar.classList.remove('collapsing'), 250);
    };
  }
}

let currentDeviceMode = 'desktop';

function initDeviceSwitcher() {
  const btnDesktop = document.getElementById('btnDeviceDesktop');
  const btnTablet = document.getElementById('btnDeviceTablet');
  const btnMobile = document.getElementById('btnDeviceMobile');
  const btnRefresh = document.getElementById('btnRefreshPreview');
  const previewChassis = document.getElementById('previewDeviceChassis');
  const zoomSelect = document.getElementById('previewZoomSelect');

  const setDevice = (mode) => {
    if (!previewChassis) return;
    currentDeviceMode = mode;
    [btnDesktop, btnTablet, btnMobile].forEach((b) =>
      b?.classList.remove('active'),
    );
    previewChassis.className = 'preview-device-chassis';

    if (mode === 'desktop') {
      btnDesktop?.classList.add('active');
    } else if (mode === 'tablet') {
      btnTablet?.classList.add('active');
      previewChassis.classList.add('tablet');
    } else if (mode === 'mobile') {
      btnMobile?.classList.add('active');
      previewChassis.classList.add('mobile');
    }

    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'SET_DEVICE_MODE',
          device: mode,
          isMobile: mode === 'mobile',
        },
        '*',
      );
    }
  };

  if (btnDesktop) btnDesktop.onclick = () => setDevice('desktop');
  if (btnTablet) btnTablet.onclick = () => setDevice('tablet');
  if (btnMobile) btnMobile.onclick = () => setDevice('mobile');
  if (previewIframe) {
    previewIframe.addEventListener('load', () => {
      try {
        if (previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            {
              type: 'SET_DEVICE_MODE',
              device: currentDeviceMode,
              isMobile: currentDeviceMode === 'mobile',
            },
            '*',
          );
        }
      } catch (err) {}
    });
  }
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      const icon = btnRefresh.querySelector('.refresh-icon');
      if (icon) icon.style.transform = 'rotate(360deg)';
      reloadPreview();
      setTimeout(() => {
        if (icon) icon.style.transform = '';
      }, 400);
    };
  }

  if (zoomSelect && previewChassis) {
    zoomSelect.onchange = (e) => {
      const scale = parseFloat(e.target.value) || 1;
      previewChassis.style.transform = scale === 1 ? '' : `scale(${scale})`;
    };
  }
}

function initScreenSwitcher() {
  const btnIntro = document.getElementById('btnPreviewScreenIntro');
  const btnCore = document.getElementById('btnPreviewScreenCore');

  const setPreviewScreen = (screen) => {
    if (screen === 'intro') {
      btnIntro?.classList.add('active');
      btnCore?.classList.remove('active');
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'SET_PREVIEW_SCREEN', screen: 'intro' },
          '*',
        );
      }
    } else {
      btnCore?.classList.add('active');
      btnIntro?.classList.remove('active');
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'SET_PREVIEW_SCREEN', screen: 'website' },
          '*',
        );
      }
    }
  };

  if (btnIntro) btnIntro.onclick = () => setPreviewScreen('intro');
  if (btnCore) btnCore.onclick = () => setPreviewScreen('website');
  window.setPreviewScreen = setPreviewScreen;
}

function initMobileWorkspaceToggle() {
  const btnEditor = document.getElementById('btnMobileShowEditor');
  const btnPreview = document.getElementById('btnMobileShowPreview');
  const btnBackEditor = document.getElementById('btnPreviewBackToEditor');
  const workspace = document.getElementById('builderWorkspace');
  if (!workspace || !btnEditor || !btnPreview) return;

  const setWorkspaceMode = (mode) => {
    if (mode === 'editor') {
      workspace.classList.add('show-editor');
      workspace.classList.remove('show-preview');
      btnEditor.classList.add('active');
      btnPreview.classList.remove('active');
    } else {
      workspace.classList.add('show-preview');
      workspace.classList.remove('show-editor');
      btnPreview.classList.add('active');
      btnEditor.classList.remove('active');
      debouncedLiveUpdate(true);
    }
  };

  btnEditor.addEventListener('click', () => setWorkspaceMode('editor'));
  btnPreview.addEventListener('click', () => setWorkspaceMode('preview'));
  if (btnBackEditor) {
    btnBackEditor.addEventListener('click', () => setWorkspaceMode('editor'));
  }
}

function updateUserMenuUI() {
  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const headerUserName = document.getElementById('headerUserName');
  const userMenuDisplayName = document.getElementById('userMenuDisplayName');
  const userMenuRoleBadge = document.getElementById('userMenuRoleBadge');
  const user = state.currentUser;

  if (user) {
    const rawName = user.name || (user.email ? user.email.split('@')[0] : 'Account');
    const shortName = rawName === 'Master Admin' ? 'Admin' : rawName;
    const initial = shortName ? shortName[0].toUpperCase() : 'A';

    if (headerUserAvatar) headerUserAvatar.textContent = initial;
    if (headerUserName) headerUserName.textContent = shortName;
    if (userMenuDisplayName) userMenuDisplayName.textContent = rawName;
    if (userMenuRoleBadge)
      userMenuRoleBadge.textContent =
        user.role === 'admin'
          ? '🛡️ Master Admin • Full Access'
          : user.email || 'User';
  } else {
    const isMasterAdmin = state.userRole === 'admin';
    if (headerUserAvatar) headerUserAvatar.textContent = isMasterAdmin ? 'A' : '👤';
    if (headerUserName) headerUserName.textContent = isMasterAdmin ? 'Admin' : 'Account';
    if (userMenuDisplayName) userMenuDisplayName.textContent = isMasterAdmin ? 'Master Admin' : 'My Account';
    if (userMenuRoleBadge)
      userMenuRoleBadge.textContent =
        isMasterAdmin ? '🛡️ Master Admin • Full Access' : state.userRole || 'Visitor';
  }
}

function renderProjectSwitcher() {
  const listEl = document.getElementById('projectDropdownList');
  const currentBadge = document.getElementById('currentTenantBadge');
  if (currentBadge) currentBadge.textContent = state.slug || 'demo';

  if (!listEl) return;
  const projects = state.userDesigns || [];

  if (projects.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 12px 14px; color: var(--text-muted); font-size: 0.78rem; text-align: center;">
        No other projects found.<br>
        <span style="font-size: 0.72rem;">Click "+ New Project" to create one!</span>
      </div>`;
    return;
  }

  listEl.innerHTML = projects.map((p) => {
    const isCurrent = p.slug === state.slug;
    const displayName = [p.partner1, p.partner2].filter(Boolean).join(' & ') || p.slug;
    return `
      <button type="button" class="project-dropdown-item ${isCurrent ? 'active' : ''}" data-slug="${escapeHtml(p.slug)}" data-token="${escapeHtml(p.authToken || '')}">
        <div class="project-item-info">
          <span class="project-item-name">${isCurrent ? '✓ ' : ''}${escapeHtml(displayName)}</span>
          <span class="project-item-slug">/sites/${escapeHtml(p.slug)}</span>
        </div>
        ${isCurrent ? '<span class="project-item-check">Current</span>' : ''}
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.project-dropdown-item').forEach((item) => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      const slug = item.dataset.slug;
      const token = item.dataset.token || '';
      document.getElementById('projectSwitcherDropdown')?.classList.add('hidden');
      document.getElementById('projectSwitcher')?.classList.remove('open');
      document.getElementById('btnProjectSwitcher')?.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);

      if (slug === state.slug) return;

      state.slug = slug;
      if (token) state.authToken = token;
      try {
        const localAuth = JSON.parse(localStorage.getItem('lovesaas_auth') || '{}');
        localAuth.slug = slug;
        if (token) localAuth.authToken = token;
        localStorage.setItem('lovesaas_auth', JSON.stringify(localAuth));
      } catch (err) {}

      window.history.pushState(
        {},
        '',
        `/builder?slug=${encodeURIComponent(slug)}${token ? `&token=${encodeURIComponent(token)}` : ''}`
      );
      await loadTenantData(slug);
      showToast(`Switched to project "${slug}"`, 'info');
      renderProjectSwitcher();
    });
  });
}

async function fetchUserProjects() {
  const userToken = localStorage.getItem('lovesaas_user_token');
  let designs = [];
  try {
    if (userToken) {
      const res = await fetch('/api/user/designs', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.designs) && data.designs.length > 0) {
          designs = data.designs;
        }
      }
    }
  } catch (e) {}

  if (designs.length === 0) {
    try {
      const tRes = await fetch('/api/tenants');
      if (tRes.ok) {
        const tData = await tRes.json();
        designs = (tData.tenants || []).map((t) => ({
          slug: t.slug,
          partner1: t.partner1_name || t.partner1,
          partner2: t.partner2_name || t.partner2,
          themeId: t.theme_id || t.themeId || 'romantic-rose',
          preset: t.preset || 'complete',
          plan: t.plan || 'vip',
          authToken: t.auth_token || '',
        }));
      }
    } catch (e) {}
  }

  // Ensure current active project is in the list
  if (state.slug && !designs.some((d) => d.slug === state.slug)) {
    designs.unshift({
      slug: state.slug,
      partner1: state.partner1 || state.slug,
      partner2: state.partner2 || '',
      themeId: state.themeId,
      preset: state.templatePreset,
      authToken: state.authToken || '',
    });
  }

  state.userDesigns = designs;
  renderProjectSwitcher();
  return designs;
}

function toggleDropdownBackdrop(show) {
  let bd = document.getElementById('headerDropdownBackdrop');
  const nav = document.querySelector('.builder-nav');
  if (nav) nav.classList.toggle('dropdown-active', Boolean(show));

  if (!bd && show) {
    bd = document.createElement('div');
    bd.id = 'headerDropdownBackdrop';
    bd.className = 'dropdown-backdrop';
    const closeAll = (e) => {
      e.stopPropagation();
      document.getElementById('projectSwitcherDropdown')?.classList.add('hidden');
      document.getElementById('projectSwitcher')?.classList.remove('open');
      document.getElementById('btnProjectSwitcher')?.setAttribute('aria-expanded', 'false');
      document.getElementById('userMenuDropdown')?.classList.add('hidden');
      document.getElementById('headerUserMenu')?.classList.remove('open');
      document.getElementById('btnUserMenuToggle')?.setAttribute('aria-expanded', 'false');
      document.querySelector('.builder-nav')?.classList.remove('dropdown-active');
      toggleDropdownBackdrop(false);
    };
    bd.addEventListener('click', closeAll);
    bd.addEventListener('touchstart', closeAll, { passive: true });
    document.body.appendChild(bd);
  } else if (bd) {
    bd.style.display = show ? 'block' : 'none';
  }
}

function initProjectSwitcher() {
  const container = document.getElementById('projectSwitcher');
  const btn = document.getElementById('btnProjectSwitcher');
  const dropdown = document.getElementById('projectSwitcherDropdown');
  const btnNew = document.getElementById('btnProjectDropdownNew');
  const btnManage = document.getElementById('btnViewAllProjects');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userMenuDropdown')?.classList.add('hidden');
    document.getElementById('headerUserMenu')?.classList.remove('open');
    document.getElementById('btnUserMenuToggle')?.setAttribute('aria-expanded', 'false');

    const isHidden = dropdown.classList.toggle('hidden');
    container?.classList.toggle('open', !isHidden);
    btn.setAttribute('aria-expanded', !isHidden ? 'true' : 'false');
    toggleDropdownBackdrop(!isHidden);

    if (!isHidden) {
      fetchUserProjects();
    }
  });

  if (btnNew) {
    btnNew.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      container?.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);
      if (typeof window.openNewProjectModal === 'function') {
        window.openNewProjectModal(false);
      }
    });
  }

  if (btnManage) {
    btnManage.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      container?.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);
      showDesignPickerModal(state.userDesigns || []);
    });
  }
}

function initHeaderUserMenu() {
  const container = document.getElementById('headerUserMenu');
  const btn = document.getElementById('btnUserMenuToggle');
  const dropdown = document.getElementById('userMenuDropdown');
  const btnSwitch = document.getElementById('btnUserMenuSwitchProject');
  const btnNew = document.getElementById('btnUserMenuNewProject');
  const btnCopy = document.getElementById('btnUserMenuCopyLink');
  const btnLogout = document.getElementById('btnBuilderLogout');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('projectSwitcherDropdown')?.classList.add('hidden');
    document.getElementById('projectSwitcher')?.classList.remove('open');
    document.getElementById('btnProjectSwitcher')?.setAttribute('aria-expanded', 'false');

    updateUserMenuUI();
    const isHidden = dropdown.classList.toggle('hidden');
    container?.classList.toggle('open', !isHidden);
    btn.setAttribute('aria-expanded', !isHidden ? 'true' : 'false');
    toggleDropdownBackdrop(!isHidden);
  });

  if (btnSwitch) {
    btnSwitch.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      container?.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);
      const switcherBtn = document.getElementById('btnProjectSwitcher');
      if (switcherBtn) switcherBtn.click();
    });
  }

  if (btnNew) {
    btnNew.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      container?.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);
      if (typeof window.openNewProjectModal === 'function') {
        window.openNewProjectModal(false);
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      container?.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      toggleDropdownBackdrop(false);
      const url = `${window.location.origin}/sites/${encodeURIComponent(state.slug || 'demo')}`;
      navigator.clipboard?.writeText(url).then(() => {
        showToast('Live project URL copied to clipboard! 📋', 'success');
      }).catch(() => {
        prompt('Copy this URL:', url);
      });
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.stopPropagation();
      toggleDropdownBackdrop(false);
      try {
        const token = localStorage.getItem('lovesaas_user_token');
        if (token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'X-User-Token': token,
            },
          });
        }
      } catch (err) {}
      localStorage.removeItem('lovesaas_user_token');
      localStorage.removeItem('lovesaas_auth');
      window.location.href = '/welcome';
    });
  }
}

function initMobileMenu() {
  const backdrop = document.getElementById('builderMobileMenuBackdrop');
  const btnClose = document.getElementById('btnCloseMobileMenu');
  if (!backdrop) return;
  const closeMenu = () => backdrop.classList.add('hidden');
  if (btnClose) btnClose.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeMenu();
  });
}

function initPresetsToggle() {
  const btnToggle = document.getElementById('btnTogglePresets');
  const wrapper = document.getElementById('presetGridWrapper');
  const toggleText = document.getElementById('btnPresetToggleText');
  if (btnToggle && wrapper) {
    btnToggle.onclick = () => {
      const isHidden = wrapper.classList.toggle('hidden');
      btnToggle.classList.toggle('is-open', !isHidden);
      if (toggleText) toggleText.textContent = isHidden ? '▾' : '▴';
    };
  }
}

function initCopyLiveLink() {
  const btnCopy = document.getElementById('btnCopyLiveLink');
  if (btnCopy) {
    btnCopy.onclick = () => {
      const url = `${window.location.origin}/sites/${encodeURIComponent(state.slug)}`;
      navigator.clipboard
        ?.writeText(url)
        .then(() => {
          showToast('Live project URL copied to clipboard! 📋', 'success');
        })
        .catch(() => {
          prompt('Copy this URL:', url);
        });
    };
  }
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveConfig();
    } else if (e.key === 'Escape') {
      document.getElementById('mediaLightboxModal')?.classList.add('hidden');
      document.getElementById('mediaPickerModal')?.classList.add('hidden');
      document.getElementById('addSectionModal')?.classList.add('hidden');
      document.getElementById('widgetPreviewModal')?.classList.add('hidden');
      document.getElementById('inspectorMoreMenu')?.classList.add('hidden');
      document.getElementById('builderMobileMenuBackdrop')?.classList.add('hidden');
      document.getElementById('projectSwitcherDropdown')?.classList.add('hidden');
      document.getElementById('projectSwitcher')?.classList.remove('open');
      document.getElementById('userMenuDropdown')?.classList.add('hidden');
      document.getElementById('headerUserMenu')?.classList.remove('open');
      document.getElementById('btnInspectorMore')?.classList.remove('active');
      toggleDropdownBackdrop(false);
    }
  });

  const handleOutsideClose = (e) => {
    const switcher = document.getElementById('projectSwitcher');
    const userMenu = document.getElementById('headerUserMenu');
    let closed = false;
    if (switcher && !switcher.contains(e.target)) {
      document.getElementById('projectSwitcherDropdown')?.classList.add('hidden');
      switcher.classList.remove('open');
      document.getElementById('btnProjectSwitcher')?.setAttribute('aria-expanded', 'false');
      closed = true;
    }
    if (userMenu && !userMenu.contains(e.target)) {
      document.getElementById('userMenuDropdown')?.classList.add('hidden');
      userMenu.classList.remove('open');
      document.getElementById('btnUserMenuToggle')?.setAttribute('aria-expanded', 'false');
      closed = true;
    }
    if (closed) {
      const swHidden = document.getElementById('projectSwitcherDropdown')?.classList.contains('hidden') ?? true;
      const usHidden = document.getElementById('userMenuDropdown')?.classList.contains('hidden') ?? true;
      if (swHidden && usHidden) toggleDropdownBackdrop(false);
    }
  };

  document.addEventListener('click', handleOutsideClose);
  document.addEventListener('touchend', (e) => {
    const switcher = document.getElementById('projectSwitcher');
    const userMenu = document.getElementById('headerUserMenu');
    if (switcher && !switcher.contains(e.target) && userMenu && !userMenu.contains(e.target)) {
      handleOutsideClose(e);
    }
  }, { passive: true });
}

// ----------------------------------------------------
// 7. EVENT LISTENERS
// ----------------------------------------------------
function setupEventListeners() {
  initSidebarTabs();
  initWidgetTrayControls();
  initAddSectionModalControls();
  initSidebarResizer();
  initDeviceSwitcher();
  initScreenSwitcher();
  initMobileWorkspaceToggle();
  initMobileMenu();
  initProjectSwitcher();
  initHeaderUserMenu();
  initPresetsToggle();
  initCopyLiveLink();
  initKeyboardShortcuts();
  setupNewProjectModal();

  if (btnSaveConfig) btnSaveConfig.onclick = saveConfig;

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'PREVIEW_SCREEN_CHANGED') {
      const btnIntro = document.getElementById('btnPreviewScreenIntro');
      const btnCore = document.getElementById('btnPreviewScreenCore');
      if (e.data.screen === 'intro') {
        btnIntro?.classList.add('active');
        btnCore?.classList.remove('active');
      } else {
        btnCore?.classList.add('active');
        btnIntro?.classList.remove('active');
      }
    }
    if (e.data.type === 'BUILDER_IFRAME_READY') {
      debouncedLiveUpdate(true);
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          {
            type: 'SET_DEVICE_MODE',
            device: currentDeviceMode,
            isMobile: currentDeviceMode === 'mobile',
          },
          '*',
        );
      }
    }
    if (e.data.type === 'MUSIC_STATE_CHANGED') {
      const btn = document.getElementById('btnTestSiteSoundtrack');
      if (btn) btn.textContent = e.data.playing ? '⏸️ Pause' : '▶️ Test';
    }
    if (e.data.type === 'OPEN_ADD_SECTION_MODAL') {
      openAddSectionModal(e.data.insertIndex);
    }
    if (e.data.type === 'REMOVE_WIDGET' && e.data.widgetId) {
      removeWidgetFromLayout(e.data.widgetId);
    }
    if (e.data.type === 'SELECT_WIDGET' && e.data.widgetId) {
      const ws = document.getElementById('builderWorkspace');
      if (ws && ws.classList.contains('show-preview')) {
        ws.classList.remove('show-preview');
        ws.classList.add('show-editor');
        const btnEd = document.getElementById('btnMobileShowEditor');
        const btnPrev = document.getElementById('btnMobileShowPreview');
        if (btnEd) btnEd.classList.add('active');
        if (btnPrev) btnPrev.classList.remove('active');
      }

      const sb = document.getElementById('builderSidebar');
      if (sb && sb.classList.contains('collapsed')) {
        sb.classList.remove('collapsed');
        const arrow = document.getElementById('sidebarCollapseArrow');
        if (arrow) arrow.textContent = '◀';
      }

      state.activeInspectorWidget = e.data.widgetId;
      if (e.data.chapterId) state.targetChapterId = e.data.chapterId;
      if (e.data.cityKey) state.targetCityKey = e.data.cityKey;
      if (e.data.memoryId) state.targetMemoryId = e.data.memoryId;

      selectWidgetForInspector(e.data.widgetId);
      if (typeof switchToTab === 'function') switchToTab('tab-inspector');
      const tabBtn = document.getElementById('btnTabInspector') || document.querySelector('.sidebar-tab-btn[data-tab="tab-inspector"]');
      if (tabBtn && !tabBtn.classList.contains('active')) {
        tabBtn.click();
      }

      if (previewIframe && previewIframe.contentWindow) {
        if (e.data.chapterId) {
          previewIframe.contentWindow.postMessage(
            { type: 'SCROLL_TO_CHAPTER', chapterId: e.data.chapterId, cityKey: e.data.cityKey },
            window.location.origin,
          );
        } else if (e.data.memoryId) {
          previewIframe.contentWindow.postMessage(
            { type: 'SCROLL_TO_MEMORY', memoryId: e.data.memoryId },
            window.location.origin,
          );
        } else if (e.data.widgetId === 'map' && e.data.cityKey) {
          // Keep preview map state uninterrupted
        } else {
          previewIframe.contentWindow.postMessage(
            { type: 'SCROLL_TO_WIDGET', widgetId: e.data.widgetId },
            window.location.origin,
          );
        }
      }
    }
    if (e.data.type === 'SYNC_REASONS' && Array.isArray(e.data.reasons)) {
      state.sectionsData.reasons = e.data.reasons;
      if (state.activeInspectorWidget === 'reasons') {
        renderWidgetInspector('reasons');
      }
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }
    if (e.data.type === 'SYNC_CHAPTER' && e.data.chapter) {
      const syncCh = e.data.chapter;
      const t = Array.isArray(state.sectionsData.timeline)
        ? state.sectionsData.timeline
        : state.sectionsData.timeline?.chapters || [];
      const found = t.find(
        (c) =>
          c.id === syncCh.id ||
          c.cityKey === syncCh.id ||
          c.id === e.data.chapterId,
      );
      if (found) {
        if (syncCh.title !== undefined) found.title = syncCh.title;
        if (syncCh.caption !== undefined) found.caption = syncCh.caption;
        if (syncCh.desc !== undefined) found.desc = syncCh.desc;
        if (syncCh.highlights && syncCh.highlights.length > 0)
          found.highlights = syncCh.highlights;
        if (Array.isArray(syncCh.images)) {
          found.images = [...syncCh.images];
          found.img = syncCh.images[0] || syncCh.img || "";
        } else if (syncCh.img) {
          found.img = syncCh.img;
        }
        if (state.activeInspectorWidget === 'timeline') {
          renderWidgetInspector('timeline');
        }
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      }
    }
    if (e.data.type === 'SYNC_MEMORIES' && Array.isArray(e.data.memories)) {
      const seen = new Set();
      const deduped = e.data.memories.filter(
        (m) => m && m.id && !seen.has(m.id) && seen.add(m.id),
      );
      if (
        state.sectionsData.memories &&
        typeof state.sectionsData.memories === 'object' &&
        !Array.isArray(state.sectionsData.memories)
      ) {
        state.sectionsData.memories.items = deduped;
      } else {
        state.sectionsData.memories = deduped;
      }
      if (state.activeInspectorWidget === 'memories') {
        renderWidgetInspector('memories');
      }
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }
  });

  // Media tab controls, dropzone & lightbox
  initMediaTabControls();

  // Builder Auth & Gate Modals
  function setupBuilderAuthModals() {
    const authModal = document.getElementById('builderAuthModal');
    const authForm = document.getElementById('builderAuthForm');
    const toggleBtn = document.getElementById('btnBuilderAuthToggleMode');
    const toggleText = document.getElementById('builderAuthToggleText');
    const titleEl = document.getElementById('builderAuthTitle');
    const nameGroup = document.getElementById('builderAuthNameGroup');
    const submitBtn = document.getElementById('btnBuilderAuthSubmit');
    const errEl = document.getElementById('builderAuthError');
    const btnLogout = document.getElementById('btnBuilderLogout');

    let isRegisterMode = false;

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        isRegisterMode = !isRegisterMode;
        if (errEl) errEl.style.display = 'none';
        if (isRegisterMode) {
          titleEl.textContent = 'Create an Account';
          nameGroup.style.display = 'block';
          submitBtn.textContent = 'Register & Open Builder';
          toggleText.textContent = 'Already have an account?';
          toggleBtn.textContent = 'Sign in';
        } else {
          titleEl.textContent = 'Sign in to Builder';
          nameGroup.style.display = 'none';
          submitBtn.textContent = 'Sign In';
          toggleText.textContent = "Don't have an account?";
          toggleBtn.textContent = 'Create one';
        }
      };
    }

    if (authForm) {
      authForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('builderAuthEmail')?.value.trim();
        const password = document.getElementById('builderAuthPassword')?.value;
        const name = document.getElementById('builderAuthName')?.value.trim();

        if (!email || !password) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
        if (errEl) errEl.style.display = 'none';

        try {
          const endpoint = isRegisterMode
            ? '/api/auth/register'
            : '/api/auth/login';
          const body = isRegisterMode
            ? { email, password, name }
            : { email, password };
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Authentication failed');

          localStorage.setItem('lovesaas_user_token', data.token);
          authModal?.classList.add('hidden');
          showToast(
            isRegisterMode ? 'Account created!' : 'Signed in successfully!',
            'success',
          );
          window.location.reload();
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message;
            errEl.style.display = 'block';
          }
          submitBtn.disabled = false;
          submitBtn.textContent = isRegisterMode
            ? 'Register & Open Builder'
            : 'Sign In';
        }
      };
    }

    if (btnLogout) {
      btnLogout.onclick = async () => {
        try {
          const token = localStorage.getItem('lovesaas_user_token');
          if (token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'X-User-Token': token,
              },
            });
          }
        } catch (e) {}
        localStorage.removeItem('lovesaas_user_token');
        localStorage.removeItem('lovesaas_auth');
        window.location.href = '/welcome';
      };
    }

    const btnForbiddenDesigns = document.getElementById(
      'btnForbiddenMyDesigns',
    );
    if (btnForbiddenDesigns) {
      btnForbiddenDesigns.onclick = () => {
        if (state.userDesigns && state.userDesigns.length > 0) {
          window.location.href = `/builder?slug=${encodeURIComponent(state.userDesigns[0].slug)}`;
        } else {
          window.location.href = '/builder';
        }
      };
    }

    const btnForbiddenSwitch = document.getElementById(
      'btnForbiddenSwitchAccount',
    );
    if (btnForbiddenSwitch) {
      btnForbiddenSwitch.onclick = () => {
        localStorage.removeItem('lovesaas_user_token');
        localStorage.removeItem('lovesaas_auth');
        window.location.reload();
      };
    }
  }
  setupBuilderAuthModals();
}

// ── Design Picker Modal ─────────────────────────────────────────
function dpRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function dpFormatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function showDesignPickerModal(designs) {
  const modal = document.getElementById('builderDesignPickerModal');
  const grid = document.getElementById('designPickerGrid');
  const subtitle = document.getElementById('designPickerSubtitle');
  if (!modal || !grid) return;

  subtitle.textContent =
    designs.length > 0
      ? `You have ${designs.length} design${designs.length > 1 ? 's' : ''}. Select one to edit, or create a new one.`
      : "You don't have any designs yet. Create your first one!";

  // Build cards
  let html = `
    <div class="design-picker-card design-picker-card--create" id="dpCardCreateNew">
      <div class="dp-create-icon">✨</div>
      <div class="dp-create-title">+ Create New Project</div>
      <div class="dp-create-sub">Start a brand new couple website</div>
    </div>`;

  designs.forEach((d) => {
    const name = [d.partner1, d.partner2].filter(Boolean).join(' & ') || d.slug;
    html += `
    <div class="design-picker-card" data-dp-slug="${escapeHtml(d.slug)}" data-dp-token="${escapeHtml(d.authToken || '')}" data-dp-plan="${escapeHtml(d.plan || 'vip')}">
      <div class="dp-card-name">💍 ${escapeHtml(name)}</div>
      <div class="dp-card-slug">/sites/${escapeHtml(d.slug)}</div>
      <div class="dp-card-badges">
        <span class="dp-badge dp-badge--theme">${escapeHtml(d.themeId || 'romantic-rose')}</span>
        <span class="dp-badge dp-badge--preset">${escapeHtml(d.preset || 'complete')}</span>
        <span class="dp-badge dp-badge--plan">⭐ ${escapeHtml((d.plan || 'vip').toUpperCase())}</span>
      </div>
      <div class="dp-card-stats">
        <div class="dp-stat"><span class="dp-stat-icon">📅</span> Created: ${dpFormatDate(d.createdAt)}</div>
        <div class="dp-stat"><span class="dp-stat-icon">✏️</span> Last modified: ${dpRelativeTime(d.updatedAt || d.createdAt)}</div>
      </div>
      <button type="button" class="dp-card-action">Open in Builder →</button>
    </div>`;
  });

  grid.innerHTML = html;
  modal.classList.remove('hidden');

  // Wire up "Create New" card
  document.getElementById('dpCardCreateNew')?.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.documentElement.classList.remove('builder-gate-active');
    if (typeof window.openNewProjectModal === 'function') {
      window.openNewProjectModal(designs.length === 0);
    }
  });

  // Wire up design cards
  grid.querySelectorAll('.design-picker-card[data-dp-slug]').forEach((card) => {
    card.addEventListener('click', () => {
      const slug = card.dataset.dpSlug;
      const token = card.dataset.dpToken || '';
      const plan = card.dataset.dpPlan || 'vip';

      state.slug = slug;
      state.userRole = 'user';
      state.isPurchased = true;
      state.authToken = token;
      localStorage.setItem(
        'lovesaas_auth',
        JSON.stringify({ slug, role: 'user', authToken: token, plan }),
      );
      window.history.replaceState(
        {},
        '',
        `/builder?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`,
      );

      document.documentElement.classList.remove('builder-gate-active');
      modal.classList.add('hidden');
      updateRoleUI();
      loadTenantData(slug);
    });
  });
}

function setupNewProjectModal() {
  const modal = document.getElementById('builderNewProjectModal');
  const btnClose = document.getElementById('btnCloseNewProjectModal');
  const cardTemplate = document.getElementById('modeCardTemplate');
  const cardScratch = document.getElementById('modeCardScratch');
  const presetWrap = document.getElementById('newProjectPresetPickerWrap');
  const presetChips = document.querySelectorAll(
    '#npPresetChips .np-preset-chip',
  );
  const inP1 = document.getElementById('npPartner1');
  const inP2 = document.getElementById('npPartner2');
  const inSlug = document.getElementById('npSlug');
  const slugFeedback = document.getElementById('npSlugFeedback');
  const errEl = document.getElementById('npErrorMsg');
  const btnSubmit = document.getElementById('btnCreateProjectSubmit');
  const subtitleEl = document.getElementById('newProjectModalSubtitle');
  const btnHeaderNew = document.getElementById('btnHeaderNewProject');
  const btnTenantCreate = document.getElementById('btnTenantModalCreateNew');
  const btnExplore = document.getElementById('btnExploreDemoPreview');

  if (!modal) return;

  let selectedMode = 'scratch';
  let selectedPreset = 'blank';
  let slugUserEdited = false;
  let slugCheckTimeout = null;

  function checkSlugAvailability(slug) {
    if (!slugFeedback) return;
    if (!slug) {
      slugFeedback.textContent = 'Enter lowercase letters, numbers, or dashes';
      slugFeedback.style.color = '#64748b';
      return;
    }
    slugFeedback.textContent = 'Checking availability...';
    slugFeedback.style.color = '#64748b';
    clearTimeout(slugCheckTimeout);
    slugCheckTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/check-slug?slug=${encodeURIComponent(slug)}`,
        );
        const data = await res.json();
        if (data.available) {
          slugFeedback.textContent = `✓ /sites/${slug} is available!`;
          slugFeedback.style.color = '#059669';
        } else {
          slugFeedback.textContent = `✕ /sites/${slug} is already taken`;
          slugFeedback.style.color = '#dc2626';
        }
      } catch (e) {
        slugFeedback.textContent = 'Could not check availability';
        slugFeedback.style.color = '#64748b';
      }
    }, 250);
  }

  function autoSuggestSlug() {
    if (slugUserEdited) return;
    const p1 = (inP1?.value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const p2 = (inP2?.value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (p1 && p2 && inSlug) {
      inSlug.value = `${p1}-and-${p2}`;
      checkSlugAvailability(inSlug.value);
    }
  }

  if (inP1) inP1.addEventListener('input', autoSuggestSlug);
  if (inP2) inP2.addEventListener('input', autoSuggestSlug);
  if (inSlug) {
    inSlug.addEventListener('input', () => {
      slugUserEdited = true;
      inSlug.value = inSlug.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      checkSlugAvailability(inSlug.value);
    });
  }

  if (cardTemplate) {
    cardTemplate.addEventListener('click', () => {
      selectedMode = 'template';
      cardTemplate.classList.add('active');
      if (cardScratch) cardScratch.classList.remove('active');
      if (presetWrap) presetWrap.style.display = 'block';
    });
  }

  if (cardScratch) {
    cardScratch.addEventListener('click', () => {
      selectedMode = 'scratch';
      cardScratch.classList.add('active');
      if (cardTemplate) cardTemplate.classList.remove('active');
      if (presetWrap) presetWrap.style.display = 'none';
    });
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      presetChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      selectedPreset = chip.dataset.preset || 'storyteller';
    });
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      // Return to design picker if no design is actively loaded
      if (!new URLSearchParams(window.location.search).get('slug')) {
        document.documentElement.classList.add('builder-gate-active');
        showDesignPickerModal(state.userDesigns || []);
      }
    });
  }

  if (btnExplore) {
    btnExplore.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      document.documentElement.classList.remove('builder-gate-active');
      window.location.href = '/builder?slug=demo';
    });
  }

  if (btnHeaderNew) {
    btnHeaderNew.addEventListener('click', () => {
      window.openNewProjectModal(false);
    });
  }

  if (btnTenantCreate) {
    btnTenantCreate.addEventListener('click', () => {
      window.openNewProjectModal(false);
    });
  }

  window.openNewProjectModal = (isFirstProject = false) => {
    selectedMode = 'scratch';
    selectedPreset = 'blank';
    slugUserEdited = false;

    if (cardScratch && cardTemplate) {
      cardScratch.classList.add('active');
      cardTemplate.classList.remove('active');
    }
    if (presetWrap) presetWrap.style.display = 'none';
    if (presetChips) {
      presetChips.forEach((c) => {
        const isB = c.dataset.preset === 'blank';
        c.classList.toggle('active', isB);
        c.style.borderColor = '';
        c.style.background = '';
        c.style.color = '';
      });
    }

    if (subtitleEl) {
      subtitleEl.textContent = isFirstProject
        ? 'Choose a template or start from a clean blank canvas:'
        : 'Create another couple website. Choose templates or start clean from scratch:';
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem('lovesaas_saved_creation_inputs') || '{}',
      );
      if (inP1 && !inP1.value)
        inP1.value =
          saved.partner1 ||
          (state.partner1 && state.partner1 !== 'Alex' ? state.partner1 : '') ||
          '';
      if (inP2 && !inP2.value)
        inP2.value =
          saved.partner2 ||
          (state.partner2 && state.partner2 !== 'Sam' ? state.partner2 : '') ||
          '';
    } catch {}

    autoSuggestSlug();
    if (errEl) {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
    modal.classList.remove('hidden');
    modal.style.display = '';
  };

  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      if (errEl) {
        errEl.style.display = 'none';
        errEl.textContent = '';
      }

      const p1 = (inP1?.value || '').trim();
      const p2 = (inP2?.value || '').trim();
      let slug = (inSlug?.value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');

      if (!p1 || !p2) {
        if (errEl) {
          errEl.textContent = 'Please enter both partner names.';
          errEl.style.display = 'block';
        }
        return;
      }
      if (!slug) {
        if (errEl) {
          errEl.textContent = 'Please enter a valid website URL slug.';
          errEl.style.display = 'block';
        }
        return;
      }

      const userToken = localStorage.getItem('lovesaas_user_token');
      const isAdmin =
        state.userRole === 'admin' ||
        (state.currentUser && state.currentUser.role === 'admin');
      const customerEmail =
        (state.currentUser && state.currentUser.email) || '';
      const chosenPreset =
        selectedMode === 'scratch' ? 'blank' : selectedPreset || 'blank';

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>Creating your website...</span> <span>⏳</span>`;

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
          headers['X-User-Token'] = userToken;
        }

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            partner1: p1,
            partner2: p2,
            slug,
            customerEmail,
            plan: isAdmin ? 'vip' : 'vip',
            preset: chosenPreset,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create website.');
        }

        try {
          localStorage.setItem(
            'lovesaas_saved_creation_inputs',
            JSON.stringify({
              partner1: p1,
              partner2: p2,
              email: customerEmail,
            }),
          );
        } catch {}

        state.slug = data.tenant.slug;
        state.partner1 = data.tenant.partner1;
        state.partner2 = data.tenant.partner2;
        state.authToken =
          data.tenant.authToken ||
          (isAdmin ? userToken || '' : '');
        state.userRole = isAdmin ? 'admin' : 'user';
        state.isPurchased = true;

        // If blank project: immediately zero out layout and blank preview iframe so old widgets never flash
        if (chosenPreset === 'blank') {
          state.layoutOrder = [];
          state.sectionsData = {};
          state.templatePreset = 'blank';
          renderPresetsUI();
          renderWidgetTray();
          if (previewIframe) previewIframe.src = 'about:blank';
        }

        localStorage.setItem(
          'lovesaas_auth',
          JSON.stringify({
            slug: data.tenant.slug,
            role: state.userRole,
            authToken: state.authToken,
            plan: data.tenant.plan || 'vip',
          }),
        );

        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.documentElement.classList.remove('builder-gate-active');
        window.history.replaceState(
          {},
          '',
          `/builder?slug=${encodeURIComponent(data.tenant.slug)}&token=${encodeURIComponent(state.authToken || '')}`,
        );
        updateRoleUI();
        await loadTenantData(data.tenant.slug);
        showToast(
          `🎉 Website "${data.tenant.slug}" created successfully!`,
          'success',
        );

        if (typeof initBuilderUserSession === 'function') {
          initBuilderUserSession();
        }
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message;
          errEl.style.display = 'block';
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>🚀 Create Website & Launch Builder</span>`;
      }
    });
  }

  const autoCreateParams = new URLSearchParams(window.location.search);
  if (autoCreateParams.get('create') === '1' || autoCreateParams.get('new') === '1') {
    setTimeout(() => {
      document.getElementById('builderDesignPickerModal')?.classList.add('hidden');
      document.documentElement.classList.remove('builder-gate-active');
      if (typeof window.openNewProjectModal === 'function') {
        window.openNewProjectModal(false);
      }
    }, 200);
  }
}
