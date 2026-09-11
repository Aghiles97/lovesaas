/**
 * Couple Site Builder Studio JS
 * 100% Customizable Widget Content Inspector, Modular Layout Reordering, & R2 Media Pipeline
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function safeVal(v) {
  return String(v == null ? "" : v).replace(/"/g, "&quot;");
}
if (typeof window !== "undefined") {
  window.escapeHtml = escapeHtml;
  window.safeVal = safeVal;
}

let state = {
  slug: "demo",
  adminPin: "1234",
  templatePreset: "storyteller",
  themeId: "theme-pink",
  layoutOrder: ["hero", "map", "timeline", "memories", "letter"],
  sectionsData: {},
  allWidgetIds: Object.keys(WIDGET_REGISTRY),
  activeInspectorWidget: null,
  mediaViewMode: (typeof localStorage !== "undefined" && localStorage.getItem("saas_media_view")) || "grid",
  mediaSort: "newest",
  mediaSearchQuery: "",
  mediaFilter: "all",
  mediaSettings: {
    volume: 80,
    autoplay: true,
    loop: true,
    sfx: true,
    floatingPlayer: true
  }
};

// DOM references
const presetGrid = document.getElementById("presetGrid");
const widgetTray = document.getElementById("widgetTray");
const previewIframe = document.getElementById("previewIframe");
const currentTenantBadge = document.getElementById("currentTenantBadge");
const btnViewLive = document.getElementById("btnViewLive");
const btnSaveConfig = document.getElementById("btnSaveConfig");
const inspectorWidgetSelect = document.getElementById("inspectorWidgetSelect");
const inspectorFormContainer = document.getElementById("inspectorFormContainer");

// Live Sync Debouncer & Real-time Iframe Communication
let liveSyncTimeout = null;
function debouncedLiveUpdate(immediate = false) {
  clearTimeout(liveSyncTimeout);
  const doUpdate = () => {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage({
        type: "STUDIO_LIVE_UPDATE",
        config: {
          themeId: state.themeId,
          layoutOrder: state.layoutOrder,
          sectionsData: state.sectionsData
        }
      }, "*");
    }
    const syncPill = document.getElementById("inspectorLiveSyncPill");
    if (syncPill) {
      syncPill.textContent = "⚡ Live Synced";
      syncPill.style.borderColor = "#20c997";
      syncPill.style.color = "#0ca678";
      setTimeout(() => {
        if (syncPill) {
          syncPill.style.borderColor = "";
          syncPill.style.color = "";
        }
      }, 600);
    }
  };
  if (immediate) {
    doUpdate();
  } else {
    liveSyncTimeout = setTimeout(doUpdate, 80);
  }
}

// Toast notification helper
function showToast(msg, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ️";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastFadeOut 0.25s forwards";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Auto-save debouncer for layout order & configs
let autoSaveTimeout = null;
function debouncedAutoSaveLayout() {
  clearTimeout(autoSaveTimeout);
  const indicator = document.getElementById("autoSaveIndicator");
  if (indicator) {
    indicator.className = "auto-save-indicator saving";
    const textEl = indicator.querySelector(".indicator-text");
    if (textEl) textEl.textContent = "Saving...";
  }

  autoSaveTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Pin": state.adminPin
        },
        body: JSON.stringify({
          templatePreset: state.templatePreset,
          themeId: state.themeId,
          layoutOrder: state.layoutOrder,
          sectionsData: state.sectionsData
        })
      });
      if (indicator) {
        indicator.className = "auto-save-indicator saved";
        const textEl = indicator.querySelector(".indicator-text");
        if (textEl) textEl.textContent = "All changes saved";
      }
    } catch (err) {
      console.warn("Auto-save layout error:", err);
      if (indicator) {
        indicator.className = "auto-save-indicator";
        const textEl = indicator.querySelector(".indicator-text");
        if (textEl) textEl.textContent = "Unsaved changes";
      }
    }
  }, 450);
}

if (previewIframe) {
  previewIframe.addEventListener("load", () => {
    debouncedLiveUpdate(true);
  });
}

// ----------------------------------------------------
// BUILDER ACCESS GATING & INITIALIZATION
// ----------------------------------------------------
function showAccessGateModal(presetSlug = "") {
  const gateModal = document.getElementById("builderAccessGateModal");
  const slugInput = document.getElementById("gateSlugInput");
  const errorMsg = document.getElementById("gateErrorMsg");
  if (!gateModal) return;
  if (presetSlug && slugInput) slugInput.value = presetSlug;
  if (errorMsg) errorMsg.style.display = "none";
  gateModal.classList.remove("hidden");
}

function hideAccessGateModal() {
  const gateModal = document.getElementById("builderAccessGateModal");
  if (gateModal) gateModal.classList.add("hidden");
}

function showDemoBanner(visible) {
  const banner = document.getElementById("demoBannerBar");
  if (banner) banner.style.display = visible ? "flex" : "none";
}

async function checkBuilderAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramSlug = urlParams.get("slug");
  const paramToken = urlParams.get("token");
  const paramPin = urlParams.get("pin");

  let localAuth = null;
  try {
    const raw = localStorage.getItem("lovesaas_auth");
    if (raw) localAuth = JSON.parse(raw);
  } catch (e) {}

  let targetSlug = paramSlug;
  if (!targetSlug && localAuth && localAuth.slug) {
    targetSlug = localAuth.slug;
  }

  if (!targetSlug) {
    targetSlug = "demo";
  }

  if (targetSlug === "demo") {
    state.slug = "demo";
    showDemoBanner(true);
    return true;
  }

  const tokenToTest = paramToken || (localAuth && localAuth.slug === targetSlug ? localAuth.authToken : null);
  const pinToTest = paramPin || (localAuth && localAuth.slug === targetSlug ? localAuth.adminPin : null);

  if (tokenToTest || pinToTest) {
    try {
      const res = await fetch("/api/auth/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: targetSlug, token: tokenToTest, pin: pinToTest })
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        state.slug = targetSlug;
        if (pinToTest) state.adminPin = pinToTest;
        localStorage.setItem("lovesaas_auth", JSON.stringify({
          slug: targetSlug,
          authToken: data.authToken,
          adminPin: pinToTest || "",
          plan: data.plan
        }));
        showDemoBanner(false);
        return true;
      }
    } catch (e) {}
  }

  showAccessGateModal(targetSlug);
  return false;
}

document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  populateInspectorSelect();
  renderPresetsUI();

  // Gate Modal Listeners
  const btnGateUnlock = document.getElementById("btnGateUnlock");
  if (btnGateUnlock) {
    btnGateUnlock.addEventListener("click", async () => {
      const slugInput = document.getElementById("gateSlugInput");
      const pinInput = document.getElementById("gatePinInput");
      const errorMsg = document.getElementById("gateErrorMsg");
      const slug = slugInput.value.trim().toLowerCase();
      const pin = pinInput.value.trim();

      if (!slug || !pin) {
        errorMsg.textContent = "Please provide both slug and Admin PIN.";
        errorMsg.style.display = "block";
        return;
      }

      btnGateUnlock.disabled = true;
      btnGateUnlock.textContent = "Verifying...";
      errorMsg.style.display = "none";

      try {
        const res = await fetch("/api/auth/verify-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, pin })
        });
        const data = await res.json();
        if (!res.ok || !data.authorized) {
          throw new Error(data.error || "Invalid slug or Admin PIN");
        }

        localStorage.setItem("lovesaas_auth", JSON.stringify({
          slug: data.slug,
          authToken: data.authToken,
          adminPin: pin,
          plan: data.plan
        }));

        state.slug = data.slug;
        state.adminPin = pin;
        hideAccessGateModal();
        showDemoBanner(false);
        window.history.replaceState({}, "", `/builder?slug=${encodeURIComponent(data.slug)}`);
        await loadTenantData(state.slug);
      } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = "block";
      } finally {
        btnGateUnlock.disabled = false;
        btnGateUnlock.innerHTML = `<span>Unlock My Studio</span> <span>🚀</span>`;
      }
    });
  }

  const btnGateDemo = document.getElementById("btnGateDemo");
  if (btnGateDemo) {
    btnGateDemo.addEventListener("click", async () => {
      hideAccessGateModal();
      state.slug = "demo";
      state.adminPin = "1234";
      showDemoBanner(true);
      window.history.replaceState({}, "", "/builder?slug=demo");
      await loadTenantData("demo");
    });
  }

  const hasAccess = await checkBuilderAccess();
  if (hasAccess) {
    await loadTenantData(state.slug);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const insertParam = urlParams.get("insert");
  if (insertParam !== null) {
    const parsed = parseInt(insertParam, 10);
    setTimeout(() => openAddSectionModal(isNaN(parsed) ? state.layoutOrder.length : parsed), 350);
  }
});

async function loadTenantData(slug) {
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error("Could not load tenant site config");
    const data = await res.json();

    state.slug = data.slug;
    state.adminPin = data.adminPin || "1234";
    state.templatePreset = data.templatePreset || "storyteller";
    state.themeId = (data.themeId === "romantic-rose" || !data.themeId) ? "theme-pink" : data.themeId;
    state.layoutOrder = data.layoutOrder || PRESETS.storyteller.widgets;
    state.sectionsData = data.sectionsData || {};

    if (state.layoutOrder && state.layoutOrder.length) {
      if (!state.layoutOrder.includes(state.activeInspectorWidget)) {
        state.activeInspectorWidget = state.layoutOrder[0];
      }
    } else {
      state.activeInspectorWidget = null;
    }

    updateNavbarUI();
    renderPresetsUI();
    renderWidgetTray();
    if (state.activeInspectorWidget) {
      selectWidgetForInspector(state.activeInspectorWidget);
    } else {
      renderInspectorEmptyState();
    }
    reloadPreview();
  } catch (err) {
    showToast("Error loading site: " + err.message, "error");
  }
}

function updateNavbarUI() {
  currentTenantBadge.innerText = state.slug;
  btnViewLive.href = `/sites/${state.slug}`;
  const urlText = document.getElementById("previewUrlText");
  if (urlText) {
    urlText.textContent = `${window.location.host}/sites/${state.slug}`;
  }
  const presetBadge = document.getElementById("currentPresetNameBadge");
  if (presetBadge) {
    presetBadge.textContent = PRESETS[state.templatePreset]?.name || state.templatePreset;
  }
}

// ----------------------------------------------------
// 1. TEMPLATE PRESETS
// ----------------------------------------------------
let currentWidgetFilter = "all";
let currentWidgetSearchQuery = "";

function renderPresetsUI() {
  presetGrid.innerHTML = "";
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const card = document.createElement("div");
    const isActive = state.templatePreset === key;
    card.className = `preset-card ${isActive ? "active" : ""}`;
    card.innerHTML = `
      <div class="preset-card-header">
        <div class="preset-title-wrap">
          <span class="preset-indicator-dot">${isActive ? "✓" : ""}</span>
          <h4 class="preset-title">${escapeHtml(preset.name)}</h4>
        </div>
        <span class="preset-badge">${preset.widgets.length} sections</span>
      </div>
      <p class="preset-desc">${escapeHtml(preset.desc)}</p>
      ${isActive ? `<div class="preset-active-indicator">✓ Active Preset</div>` : ""}
    `;
    card.onclick = () => applyPreset(key);
    presetGrid.appendChild(card);
  });
}

function applyPreset(presetKey) {
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

  const presetBadge = document.getElementById("currentPresetNameBadge");
  if (presetBadge) presetBadge.textContent = preset.name;

  const wrapper = document.getElementById("presetGridWrapper");
  if (wrapper) wrapper.classList.add("hidden");
  const toggleText = document.getElementById("btnPresetToggleText");
  if (toggleText) toggleText.textContent = "▾";
  const btnToggle = document.getElementById("btnTogglePresets");
  if (btnToggle) btnToggle.classList.remove("is-open");

  renderPresetsUI();
  renderWidgetTray();
  if (state.activeInspectorWidget) {
    selectWidgetForInspector(state.activeInspectorWidget);
  } else {
    renderInspectorEmptyState();
  }
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
  showToast(`Applied "${preset.name}" preset`, "success");
}

// ----------------------------------------------------
// 2. MODULAR WIDGET GRID / REORDER TRAY
// ----------------------------------------------------
function renderWidgetTray() {
  widgetTray.innerHTML = "";

  const activeSet = new Set(state.layoutOrder);
  const inactiveWidgets = state.allWidgetIds.filter(id => !activeSet.has(id));
  const fullList = [...state.layoutOrder, ...inactiveWidgets];

  const countEl = document.getElementById("activeWidgetsCount");
  if (countEl) countEl.textContent = `${state.layoutOrder.length}/${state.allWidgetIds.length}`;
  const countAllEl = document.getElementById("filterCountAll");
  if (countAllEl) countAllEl.textContent = state.allWidgetIds.length;
  const countActiveEl = document.getElementById("filterCountActive");
  if (countActiveEl) countActiveEl.textContent = state.layoutOrder.length;
  const countInactiveEl = document.getElementById("filterCountInactive");
  if (countInactiveEl) countInactiveEl.textContent = inactiveWidgets.length;

  const tabBadge = document.getElementById("tabWidgetCountBadge");
  if (tabBadge) tabBadge.textContent = `${state.layoutOrder.length}/${state.allWidgetIds.length}`;

  const query = (currentWidgetSearchQuery || "").toLowerCase().trim();
  const filteredList = fullList.filter(id => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return false;
    const isActive = activeSet.has(id);
    if (currentWidgetFilter === "active" && !isActive) return false;
    if (currentWidgetFilter === "inactive" && isActive) return false;
    if (query) {
      const matchTitle = (meta.title || "").toLowerCase().includes(query);
      const matchDesc = (meta.desc || "").toLowerCase().includes(query);
      const matchCat = (meta.category || "").toLowerCase().includes(query);
      const matchId = id.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat && !matchId) return false;
    }
    return true;
  });

  if (filteredList.length === 0) {
    widgetTray.innerHTML = `
      <div class="widget-empty-state">
        <span class="empty-icon">🔍</span>
        <div class="empty-title">No sections found</div>
        <p class="empty-text">No section matching "<strong>${escapeHtml(currentWidgetSearchQuery)}</strong>"</p>
        <button type="button" class="btn-clear-search-pill" id="btnEmptyClearSearch">Reset Filter</button>
      </div>
    `;
    const btnReset = document.getElementById("btnEmptyClearSearch");
    if (btnReset) {
      btnReset.onclick = () => {
        currentWidgetSearchQuery = "";
        currentWidgetFilter = "all";
        const searchInput = document.getElementById("widgetSearchInput");
        const clearBtn = document.getElementById("btnClearWidgetSearch");
        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.classList.add("hidden");
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.toggle("active", c.dataset.filter === "all"));
        renderWidgetTray();
      };
    }
    return;
  }

  filteredList.forEach((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return;
    const isActive = activeSet.has(id);
    const activeIndex = state.layoutOrder.indexOf(id);
    const isSelected = state.activeInspectorWidget === id;

    const item = document.createElement("div");
    item.className = `tray-item ${isActive ? "active-widget" : "inactive-widget"} ${isSelected ? "selected-for-edit" : ""}`;
    item.draggable = isActive;
    item.dataset.widgetId = id;
    item.title = `Customize ${meta.title}`;

    const maxPositions = state.layoutOrder.length;

    item.innerHTML = `
      <div class="tray-lead">
        <span class="tray-handle" title="${isActive ? "Drag to reorder" : "Disabled"}">⋮⋮</span>
        <span class="tray-num ${isActive ? "active" : "inactive"}">${isActive ? activeIndex + 1 : "—"}</span>
        <span class="tray-icon">${meta.icon}</span>
      </div>
      <div class="tray-info">
        <div class="tray-title-row">
          <span class="tray-title">${escapeHtml(meta.title)}</span>
          ${meta.required ? `<span class="tray-req-pill" title="Required section">Req</span>` : ""}
        </div>
        <div class="tray-sub-row">
          <span class="tray-cat-tag cat-${escapeHtml(meta.category || "modular")}">${escapeHtml(meta.category || "modular")}</span>
          <span class="tray-desc">${escapeHtml(meta.desc)}</span>
        </div>
      </div>
      <div class="tray-actions">
        ${isActive ? `
          <div class="tray-reorder-arrows">
            <button type="button" class="btn-arrow-move" data-move-widget="${id}" data-dir="-1" ${activeIndex === 0 ? "disabled" : ""} title="Move up">▲</button>
            <button type="button" class="btn-arrow-move" data-move-widget="${id}" data-dir="1" ${activeIndex === maxPositions - 1 ? "disabled" : ""} title="Move down">▼</button>
          </div>
          <button type="button" class="btn-tray-remove" data-remove-tray="${id}" title="Remove section from website">✕</button>
        ` : ""}
        <label class="toggle-switch" title="${meta.required ? "Required section" : (isActive ? "Hide section" : "Show section")}">
          <input type="checkbox" ${isActive ? "checked" : ""} data-toggle="${id}" ${meta.required ? "disabled" : ""}>
          <span class="slider"></span>
        </label>
        <span class="tray-chevron" title="Customize">›</span>
      </div>
    `;

    item.onclick = () => {
      selectWidgetForInspector(id);
      switchToTab("tab-inspector");
    };

    const removeBtn = item.querySelector(`[data-remove-tray="${id}"]`);
    if (removeBtn) {
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeWidgetFromLayout(id);
      };
    }

    item.querySelectorAll(".btn-arrow-move").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const dir = parseInt(btn.dataset.dir, 10);
        moveWidgetByDelta(id, dir);
      };
    });

    const toggle = item.querySelector(`[data-toggle="${id}"]`);
    if (toggle) {
      toggle.onclick = (e) => e.stopPropagation();
      toggle.onchange = (e) => toggleWidgetActive(id, e.target.checked);
    }

    if (isActive) setupDragEvents(item);
    widgetTray.appendChild(item);
  });
}

function moveWidgetByDelta(widgetId, delta) {
  const currentIdx = state.layoutOrder.indexOf(widgetId);
  if (currentIdx === -1) return;
  const targetIdx = currentIdx + delta;
  if (targetIdx < 0 || targetIdx >= state.layoutOrder.length) return;
  moveWidgetToPosition(widgetId, targetIdx);
}

function moveWidgetToPosition(widgetId, targetIndex) {
  const currentIdx = state.layoutOrder.indexOf(widgetId);
  if (currentIdx === -1) return;
  state.layoutOrder.splice(currentIdx, 1);
  state.layoutOrder.splice(targetIndex, 0, widgetId);
  state.templatePreset = "custom";

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
}

function toggleWidgetActive(widgetId, isEnabled) {
  if (isEnabled) {
    if (!state.layoutOrder.includes(widgetId)) {
      state.layoutOrder.push(widgetId);
    }
    if (!state.activeInspectorWidget) {
      selectWidgetForInspector(widgetId);
    }
  } else {
    state.layoutOrder = state.layoutOrder.filter(id => id !== widgetId);
    if (!state.layoutOrder.length) {
      renderInspectorEmptyState();
    } else if (state.activeInspectorWidget === widgetId) {
      selectWidgetForInspector(state.layoutOrder[0]);
    }
  }
  state.templatePreset = "custom";

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();
}

function initWidgetTrayControls() {
  const searchInput = document.getElementById("widgetSearchInput");
  const clearBtn = document.getElementById("btnClearWidgetSearch");
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentWidgetSearchQuery = e.target.value;
      if (clearBtn) clearBtn.classList.toggle("hidden", !currentWidgetSearchQuery);
      renderWidgetTray();
    };
  }
  if (clearBtn) {
    clearBtn.onclick = () => {
      currentWidgetSearchQuery = "";
      if (searchInput) searchInput.value = "";
      clearBtn.classList.add("hidden");
      renderWidgetTray();
    };
  }

  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentWidgetFilter = chip.dataset.filter;
      renderWidgetTray();
    };
  });

  const btnEnableAll = document.getElementById("btnEnableAllWidgets");
  if (btnEnableAll) {
    btnEnableAll.onclick = () => {
      state.layoutOrder = [...state.allWidgetIds];
      state.templatePreset = "custom";
      if (!state.activeInspectorWidget && state.layoutOrder.length > 0) {
        selectWidgetForInspector(state.layoutOrder[0]);
      }
      renderPresetsUI();
      renderWidgetTray();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  const btnDisableAll = document.getElementById("btnDisableAllWidgets");
  if (btnDisableAll) {
    btnDisableAll.onclick = () => {
      const required = state.allWidgetIds.filter(id => WIDGET_REGISTRY[id] && WIDGET_REGISTRY[id].required);
      state.layoutOrder = required.length > 0 ? required : [];
      state.templatePreset = "custom";
      if (!state.layoutOrder.length) {
        renderInspectorEmptyState();
      } else if (!state.layoutOrder.includes(state.activeInspectorWidget)) {
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
let addSectionCategoryFilter = "all";
let addSectionSearchQuery = "";

async function ensureDefaultWidgetData(widgetId) {
  if (state.sectionsData && state.sectionsData[widgetId]) return;
  if (!state.sectionsData) state.sectionsData = {};
  await resetWidgetData(widgetId);
}

async function addWidgetAtPosition(widgetId, targetIndex) {
  if (!WIDGET_REGISTRY[widgetId]) return;

  const validIndex = (typeof targetIndex === "number" && targetIndex >= 0 && targetIndex <= state.layoutOrder.length)
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
  state.templatePreset = "custom";

  await ensureDefaultWidgetData(widgetId);

  closeAddSectionModal();

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();

  setTimeout(() => {
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage({
        type: "SCROLL_TO_WIDGET",
        widgetId
      }, "*");
    }
  }, 120);

  selectWidgetForInspector(widgetId);

  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
  showToast(`🎉 Added "${meta.title}" at position #${finalIndex + 1}!`, "success");
}

function removeWidgetFromLayout(widgetId) {
  if (!state.layoutOrder.includes(widgetId)) return;

  state.layoutOrder = state.layoutOrder.filter(id => id !== widgetId);
  state.templatePreset = "custom";

  renderPresetsUI();
  renderWidgetTray();
  debouncedLiveUpdate(true);
  debouncedAutoSaveLayout();

  if (state.activeInspectorWidget === widgetId || !state.layoutOrder.includes(state.activeInspectorWidget)) {
    if (state.layoutOrder.length > 0) {
      selectWidgetForInspector(state.layoutOrder[0]);
    } else {
      renderInspectorEmptyState();
    }
  }

  const modal = document.getElementById("addSectionModal");
  if (modal && !modal.classList.contains("hidden")) {
    renderAddSectionModal();
  }

  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
  showToast(`🗑️ Removed "${meta.title}" section from website.`, "info");
}

function renderAddSectionModal() {
  const grid = document.getElementById("addSectionWidgetsGrid");
  const subtitle = document.getElementById("addSectionModalSubtitle");
  if (!grid) return;

  const totalWidgets = state.allWidgetIds.length;
  const countAllSpan = document.getElementById("addSecCountAll");
  if (countAllSpan) countAllSpan.textContent = totalWidgets;

  if (subtitle) {
    const idx = (typeof currentAddSectionTargetIndex === "number") ? currentAddSectionTargetIndex : state.layoutOrder.length;
    if (state.layoutOrder.length === 0) {
      subtitle.innerHTML = "Inserting as the <strong>first section</strong> on your website";
    } else if (idx <= 0) {
      const nextTitle = WIDGET_REGISTRY[state.layoutOrder[0]]?.title || state.layoutOrder[0];
      subtitle.innerHTML = `Inserting at the <strong>top of website</strong> (before ${escapeHtml(nextTitle)})`;
    } else if (idx >= state.layoutOrder.length) {
      const prevTitle = WIDGET_REGISTRY[state.layoutOrder[state.layoutOrder.length - 1]]?.title || state.layoutOrder[state.layoutOrder.length - 1];
      subtitle.innerHTML = `Inserting at the <strong>end of website</strong> (after ${escapeHtml(prevTitle)})`;
    } else {
      const prevTitle = WIDGET_REGISTRY[state.layoutOrder[idx - 1]]?.title || state.layoutOrder[idx - 1];
      const nextTitle = WIDGET_REGISTRY[state.layoutOrder[idx]]?.title || state.layoutOrder[idx];
      subtitle.innerHTML = `Inserting between <strong>${escapeHtml(prevTitle)}</strong> and <strong>${escapeHtml(nextTitle)}</strong>`;
    }
  }

  grid.innerHTML = "";

  const q = (addSectionSearchQuery || "").toLowerCase().trim();
  const cat = addSectionCategoryFilter || "all";

  const sortedIds = [...state.allWidgetIds].sort((a, b) => {
    const aActive = state.layoutOrder.includes(a);
    const bActive = state.layoutOrder.includes(b);
    if (!aActive && bActive) return -1;
    if (aActive && !bActive) return 1;
    return 0;
  });

  const filtered = sortedIds.filter(id => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return false;
    if (cat !== "all" && meta.category !== cat) return false;
    if (q) {
      const matchTitle = (meta.title || "").toLowerCase().includes(q);
      const matchDesc = (meta.desc || "").toLowerCase().includes(q);
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

  filtered.forEach(id => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return;
    const isActive = state.layoutOrder.includes(id);
    const activePos = state.layoutOrder.indexOf(id);

    const card = document.createElement("div");
    card.className = `add-widget-card ${isActive ? "is-active" : ""}`;
    card.innerHTML = `
      <div class="add-widget-card-top">
        <div class="add-widget-icon">${meta.icon}</div>
        <div class="add-widget-details">
          <div class="add-widget-title-row">
            <span class="add-widget-name">${escapeHtml(meta.title)}</span>
            <span class="add-widget-cat-badge">${escapeHtml(meta.category || "widget")}</span>
          </div>
          <p class="add-widget-desc">${escapeHtml(meta.desc || "")}</p>
        </div>
      </div>
      <div class="add-widget-card-bottom">
        <span class="add-widget-status ${isActive ? "active" : ""}">
          ${isActive ? `✓ On site (#${activePos + 1})` : "✨ Available"}
        </span>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn-add-widget-action preview-btn" data-preview-id="${id}" title="Preview full widget">
            👁️ Preview
          </button>
          ${isActive ? `
            <button type="button" class="btn-add-widget-action remove-btn" data-remove-id="${id}" title="Remove this section from website">
              ✕ Remove
            </button>
            <button type="button" class="btn-add-widget-action move-btn" data-add-id="${id}" title="Move section to this position">
              ↕ Move
            </button>
          ` : `
            <button type="button" class="btn-add-widget-action" data-add-id="${id}">
              + Add Section
            </button>
          `}
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
  const modal = document.getElementById("addSectionModal");
  if (!modal) return;
  currentAddSectionTargetIndex = (typeof insertIndex === "number") ? insertIndex : state.layoutOrder.length;
  addSectionCategoryFilter = "all";
  addSectionSearchQuery = "";

  const searchInput = document.getElementById("addSectionSearchInput");
  const clearBtn = document.getElementById("btnClearAddSectionSearch");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");

  document.querySelectorAll(".add-sec-filter-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.cat === "all");
  });

  renderAddSectionModal();
  modal.classList.remove("hidden");
}

function closeAddSectionModal() {
  const modal = document.getElementById("addSectionModal");
  if (modal) modal.classList.add("hidden");
  currentAddSectionTargetIndex = null;
}

let currentPreviewWidgetId = null;
function openWidgetPreviewModal(widgetId) {
  const modal = document.getElementById("widgetPreviewModal");
  if (!modal) return;
  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId, icon: "🧩", category: "WIDGET", desc: "" };
  currentPreviewWidgetId = widgetId;

  const iconEl = document.getElementById("widgetPreviewIcon");
  const titleEl = document.getElementById("widgetPreviewModalTitle");
  const catEl = document.getElementById("widgetPreviewCategory");
  const descEl = document.getElementById("widgetPreviewDesc");
  const imgEl = document.getElementById("widgetPreviewImg");
  const addBtn = document.getElementById("btnAddFromPreviewBtn");

  if (iconEl) iconEl.textContent = meta.icon || "✨";
  if (titleEl) titleEl.textContent = meta.title || widgetId;
  if (catEl) catEl.textContent = (meta.category || "widget").toUpperCase();
  if (descEl) descEl.textContent = meta.desc || "Visual preview of this widget fully opened and visible.";

  const previewUri = (window.getWidgetPreviewImage && window.getWidgetPreviewImage(widgetId)) || "";
  if (imgEl) {
    imgEl.src = previewUri;
    imgEl.alt = `${meta.title} Full Preview`;
  }

  const isActive = state.layoutOrder.includes(widgetId);
  if (addBtn) {
    addBtn.innerHTML = isActive ? "↕ Move Section Here" : "+ Add This Section";
    addBtn.onclick = () => {
      addWidgetAtPosition(widgetId, currentAddSectionTargetIndex);
      closeWidgetPreviewModal();
      closeAddSectionModal();
    };
  }

  modal.classList.remove("hidden");
}

function closeWidgetPreviewModal() {
  const modal = document.getElementById("widgetPreviewModal");
  if (modal) modal.classList.add("hidden");
  currentPreviewWidgetId = null;
}

function initAddSectionModalControls() {
  const modal = document.getElementById("addSectionModal");
  const btnOpen = document.getElementById("btnSidebarAddSection");
  const btnClose = document.getElementById("btnCloseAddSectionModal");
  const btnCancel = document.getElementById("btnCancelAddSectionModal");
  const searchInput = document.getElementById("addSectionSearchInput");
  const clearBtn = document.getElementById("btnClearAddSectionSearch");

  const previewModal = document.getElementById("widgetPreviewModal");
  const btnClosePreview = document.getElementById("btnCloseWidgetPreviewModal");
  const btnCancelPreview = document.getElementById("btnCancelWidgetPreview");

  if (btnClosePreview) btnClosePreview.onclick = closeWidgetPreviewModal;
  if (btnCancelPreview) btnCancelPreview.onclick = closeWidgetPreviewModal;
  if (previewModal) {
    previewModal.onclick = (e) => {
      if (e.target === previewModal) closeWidgetPreviewModal();
    };
  }

  if (btnOpen) {
    btnOpen.onclick = () => openAddSectionModal(state.layoutOrder.length);
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
      if (clearBtn) clearBtn.classList.toggle("hidden", !addSectionSearchQuery);
      renderAddSectionModal();
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      addSectionSearchQuery = "";
      if (searchInput) searchInput.value = "";
      clearBtn.classList.add("hidden");
      renderAddSectionModal();
    };
  }

  document.querySelectorAll(".add-sec-filter-chip").forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll(".add-sec-filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      addSectionCategoryFilter = chip.dataset.cat;
      renderAddSectionModal();
    };
  });
}

// Drag & drop handlers
let draggedElement = null;
function setupDragEvents(el) {
  el.addEventListener("dragstart", (e) => {
    draggedElement = el;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  el.addEventListener("dragend", () => {
    if (draggedElement) draggedElement.classList.remove("dragging");
    draggedElement = null;
    document.querySelectorAll(".tray-item").forEach(i => i.classList.remove("drag-over"));
  });

  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    el.classList.add("drag-over");
  });

  el.addEventListener("dragleave", () => {
    el.classList.remove("drag-over");
  });

  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
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
      state.templatePreset = "custom";
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
  hero: "Core Header",
  love_meter: "Interactive Widget",
  reasons: "Love Lists",
  timeline: "Story Chapters",
  map: "Places Map",
  truth_dare: "Couples Game",
  spinner: "Date Spinner",
  memories: "Photo Gallery",
  coupons: "Love Scratchcards",
  boarding_pass: "Romantic Trips",
  quiz: "Trivia Challenge",
  letter: "Love Note",
  playful: "Mini Game"
};

let activeMediaPickerCallback = null;
let activePickerFilter = "all";
let activePickerQuery = "";

async function openMediaPicker({ filter = "all", onSelect } = {}) {
  const modal = document.getElementById("mediaPickerModal");
  const grid = document.getElementById("mediaPickerGrid");
  const searchInput = document.getElementById("mediaPickerSearchInput");
  const counter = document.getElementById("mediaPickerCounter");
  const directUpload = document.getElementById("mediaPickerDirectUpload");
  if (!modal || !grid) return;

  activeMediaPickerCallback = onSelect;
  activePickerFilter = filter;
  activePickerQuery = "";
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".picker-filter-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.pickerFilter === filter);
  });

  if (!state.mediaAssets || state.mediaAssets.length === 0) {
    await fetchTenantMediaAssets();
  }

  function renderPickerGrid() {
    const assets = state.mediaAssets || [];
    const query = (activePickerQuery || "").toLowerCase();
    const currentFilter = activePickerFilter;

    const filtered = assets.filter(a => {
      if (currentFilter === "image" && a.isAudio) return false;
      if (currentFilter === "audio" && !a.isAudio) return false;
      if (query && !a.name.toLowerCase().includes(query) && !a.url.toLowerCase().includes(query)) return false;
      return true;
    });

    if (counter) {
      counter.textContent = `${filtered.length} matching asset${filtered.length === 1 ? "" : "s"}`;
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

    grid.innerHTML = filtered.map(a => {
      const sizeStr = a.size ? formatBytes(a.size) : "";
      return `
        <div class="media-picker-item" data-url="${escapeHtml(a.url)}">
          ${a.isAudio
            ? `<div style="height:62px; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#fff; border-radius:6px; font-size:1.4rem;">
                <span>🎵</span>
                ${sizeStr ? `<span style="font-size:0.58rem; opacity:0.8;">${escapeHtml(sizeStr)}</span>` : ""}
               </div>`
            : `<div style="position:relative; width:100%; height:62px; overflow:hidden; border-radius:6px;">
                <img src="${escapeHtml(a.url)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ""}
               </div>`
          }
          <span class="media-picker-item-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".media-picker-item").forEach(item => {
      item.onclick = () => {
        const url = item.getAttribute("data-url");
        if (typeof activeMediaPickerCallback === "function") {
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

  document.querySelectorAll(".picker-filter-chip").forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll(".picker-filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activePickerFilter = chip.dataset.pickerFilter || "all";
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
        const isAudio = (file.type && file.type.startsWith("audio/")) || /\.(mp3|m4a|m4r|wav|ogg)$/i.test(file.name);
        if (!state.mediaAssets) state.mediaAssets = [];
        state.mediaAssets.unshift({
          key: file.name,
          name: file.name,
          url: publicUrl,
          size: file.size,
          isAudio,
          isUploaded: true
        });
        if (typeof activeMediaPickerCallback === "function") {
          activeMediaPickerCallback(publicUrl);
        }
        closeMediaPicker();
        renderMediaLibraryUI(true);
      } catch (err) {
        alert("Upload failed: " + err.message);
      } finally {
        directUpload.value = "";
      }
    };
  }

  renderPickerGrid();

  const btnClose = document.getElementById("btnCloseMediaPicker");
  const btnCancel = document.getElementById("btnCancelMediaPicker");
  if (btnClose) btnClose.onclick = closeMediaPicker;
  if (btnCancel) btnCancel.onclick = closeMediaPicker;
  modal.onclick = (e) => { if (e.target === modal) closeMediaPicker(); };

  modal.classList.remove("hidden");
}

function closeMediaPicker() {
  const modal = document.getElementById("mediaPickerModal");
  if (modal) modal.classList.add("hidden");
  activeMediaPickerCallback = null;
}

async function resetWidgetData(widgetId) {
  try {
    const res = await fetch("/api/default-sections");
    if (res.ok) {
      const { defaults } = await res.json();
      if (defaults && defaults[widgetId]) {
        state.sectionsData[widgetId] = JSON.parse(JSON.stringify(defaults[widgetId]));
        return true;
      }
    }
  } catch (err) {
    console.warn("resetWidgetData failed:", err);
  }
  return false;
}

function populateInspectorSelect() {
  if (!inspectorWidgetSelect) return;
  inspectorWidgetSelect.innerHTML = "";
  state.allWidgetIds.forEach((id) => {
    const meta = WIDGET_REGISTRY[id];
    if (!meta) return;
    const orderPos = state.layoutOrder.indexOf(id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${meta.icon} ${meta.title} (${orderPos >= 0 ? '#' + (orderPos + 1) : 'Off'})`;
    inspectorWidgetSelect.appendChild(opt);
  });
  inspectorWidgetSelect.onchange = (e) => selectWidgetForInspector(e.target.value);
}

function renderInspectorEmptyState() {
  state.activeInspectorWidget = null;

  const pill = document.getElementById("tabActiveWidgetPill");
  if (pill) {
    pill.textContent = "";
    pill.style.display = "none";
  }

  const stickyHeader = document.querySelector(".inspector-sticky-header");
  if (stickyHeader) stickyHeader.classList.add("hidden");

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
    const btnGo = document.getElementById("btnInspectorGoToSections");
    if (btnGo) {
      btnGo.onclick = () => switchToTab("tab-widgets");
    }
  }

  document.querySelectorAll(".tray-item").forEach(item => item.classList.remove("selected-for-edit"));
}

function selectWidgetForInspector(widgetId) {
  if (!widgetId || !WIDGET_REGISTRY[widgetId]) {
    renderInspectorEmptyState();
    return;
  }

  const stickyHeader = document.querySelector(".inspector-sticky-header");
  if (stickyHeader) stickyHeader.classList.remove("hidden");

  state.activeInspectorWidget = widgetId;
  if (inspectorWidgetSelect) {
    inspectorWidgetSelect.value = widgetId;
    Array.from(inspectorWidgetSelect.options).forEach(opt => {
      const id = opt.value;
      const meta = WIDGET_REGISTRY[id];
      const orderPos = state.layoutOrder.indexOf(id);
      opt.textContent = `${meta?.icon || "🧩"} ${meta?.title || id} (${orderPos >= 0 ? '#' + (orderPos + 1) : 'Off'})`;
    });
  }

  const pill = document.getElementById("tabActiveWidgetPill");
  if (pill) {
    const meta = WIDGET_REGISTRY[widgetId];
    pill.textContent = meta?.title || widgetId;
    pill.style.display = "";
  }

  const isActive = state.layoutOrder.includes(widgetId);
  const orderPos = state.layoutOrder.indexOf(widgetId);
  const orderBadge = document.getElementById("inspectorOrderBadge");
  if (orderBadge) {
    orderBadge.textContent = orderPos >= 0 ? `#${orderPos + 1}` : "Off";
  }

  const moreMenu = document.getElementById("inspectorMoreMenu");
  const closeMore = () => {
    if (moreMenu) moreMenu.classList.add("hidden");
    const btnMore = document.getElementById("btnInspectorMore");
    if (btnMore) btnMore.classList.remove("active");
  };

  const btnMoveUp = document.getElementById("btnInspectorMoveUp");
  const btnMoveDown = document.getElementById("btnInspectorMoveDown");
  if (btnMoveUp) {
    btnMoveUp.disabled = orderPos <= 0;
    btnMoveUp.onclick = () => {
      if (orderPos > 0) {
        moveWidgetByStep(widgetId, -1);
        selectWidgetForInspector(widgetId);
        closeMore();
      }
    };
  }
  if (btnMoveDown) {
    btnMoveDown.disabled = orderPos < 0 || orderPos >= state.layoutOrder.length - 1;
    btnMoveDown.onclick = () => {
      if (orderPos >= 0 && orderPos < state.layoutOrder.length - 1) {
        moveWidgetByStep(widgetId, 1);
        selectWidgetForInspector(widgetId);
        closeMore();
      }
    };
  }

  const btnRemoveCur = document.getElementById("btnRemoveCurrentWidget");
  if (btnRemoveCur) {
    btnRemoveCur.onclick = () => {
      closeMore();
      removeWidgetFromLayout(widgetId);
    };
  }

  const btnReset = document.getElementById("btnResetWidgetContent");
  if (btnReset) {
    btnReset.onclick = async () => {
      const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId };
      closeMore();
      if (confirm(`Reset "${meta.title}" to template default content? Custom changes in this section will be replaced.`)) {
        await resetWidgetData(widgetId);
        renderWidgetInspector(widgetId);
        debouncedLiveUpdate(true);
      }
    };
  }

  const activeToggle = document.getElementById("inspectorWidgetActiveToggle");
  if (activeToggle) {
    activeToggle.checked = isActive;
    activeToggle.disabled = Boolean(WIDGET_REGISTRY[widgetId]?.required);
    activeToggle.onchange = (e) => {
      toggleWidgetActive(widgetId, e.target.checked);
      selectWidgetForInspector(widgetId);
    };
  }

  const btnLocate = document.getElementById("btnLocateInPreview");
  if (btnLocate) {
    btnLocate.onclick = () => {
      closeMore();
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SCROLL_TO_WIDGET", widgetId }, "*");
      }
    };
  }

  // Highlight tray item in Widgets tab
  document.querySelectorAll(".tray-item").forEach(item => {
    if (item.dataset.widgetId === widgetId) {
      item.classList.add("selected-for-edit");
    } else {
      item.classList.remove("selected-for-edit");
    }
  });

  renderWidgetInspector(widgetId);
}

function renderWidgetInspector(widgetId) {
  if (!inspectorFormContainer) return;
  inspectorFormContainer.innerHTML = "";

  const meta = WIDGET_REGISTRY[widgetId] || { title: widgetId, icon: "🧩", desc: "" };
  const category = WIDGET_CATEGORIES[widgetId] || "Modular Widget";

  const catEl = document.getElementById("inspectorMetaCat");
  if (catEl) catEl.textContent = category;

  const descEl = document.getElementById("inspectorMetaDesc");
  if (descEl) descEl.textContent = meta.desc;

  const formHolder = document.createElement("div");
  formHolder.className = "inspector-form-body";
  inspectorFormContainer.appendChild(formHolder);

  const inspectorFn = window.WIDGET_INSPECTORS && window.WIDGET_INSPECTORS[widgetId];
  if (typeof inspectorFn === "function") {
    inspectorFn(formHolder, state, {
      debouncedLiveUpdate,
      debouncedAutoSaveLayout,
      uploadFileToR2,
      previewIframe,
      renderWidgetInspector,
      selectWidgetForInspector,
      openMediaPicker,
      escapeHtml,
      safeVal
    });
  } else {
    formHolder.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No custom inspector available for ${widgetId}.</p>`;
  }
}

// ----------------------------------------------------
function reloadPreview() {
  previewIframe.src = `/sites/${state.slug}?preview=builder&t=${Date.now()}`;
}

// ----------------------------------------------------
// 5. SAVE & PUBLISH API (POSTGRESQL PERSISTENCE)
// ----------------------------------------------------
async function saveConfig() {
  btnSaveConfig.disabled = true;
  const saveText = btnSaveConfig.querySelector(".btn-save-text");
  if (saveText) saveText.textContent = "Publishing...";
  else btnSaveConfig.innerText = "Publishing...";

  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Pin": state.adminPin
      },
      body: JSON.stringify({
        templatePreset: state.templatePreset,
        themeId: state.themeId,
        layoutOrder: state.layoutOrder,
        sectionsData: state.sectionsData
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Save failed");
    }

    if (saveText) saveText.textContent = "✓ Published!";
    else btnSaveConfig.innerText = "✓ Published!";
    showToast("Changes saved & published live!", "success");

    const indicator = document.getElementById("autoSaveIndicator");
    if (indicator) {
      indicator.className = "auto-save-indicator saved";
      const textEl = indicator.querySelector(".indicator-text");
      if (textEl) textEl.textContent = "All changes saved";
    }

    setTimeout(() => {
      btnSaveConfig.disabled = false;
      if (saveText) saveText.textContent = "Save & Publish";
      else btnSaveConfig.innerText = "💾 Save & Publish";
    }, 1600);

    reloadPreview();
  } catch (err) {
    showToast("Save Error: " + err.message, "error");
    btnSaveConfig.disabled = false;
    if (saveText) saveText.textContent = "Save & Publish";
    else btnSaveConfig.innerText = "💾 Save & Publish";
  }
}

// ----------------------------------------------------
// 6. CLOUDFLARE R2 UPLOAD PIPELINE
// ----------------------------------------------------
async function uploadFileToR2(file) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds 10 Mo limit. Please choose a file under 10 Mo.");
  }
  const presignRes = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type })
  });
  if (!presignRes.ok) throw new Error("Could not get upload destination");
  const dest = await presignRes.json();

  let uploadRes;
  if (dest.mode === "r2") {
    try {
      uploadRes = await fetch(dest.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
    } catch (err) {
      uploadRes = await fetch(`/api/upload/local?key=${encodeURIComponent(dest.key)}`, {
        method: "POST",
        body: file
      });
    }
  } else {
    uploadRes = await fetch(dest.uploadUrl, {
      method: "POST",
      body: file
    });
  }

  if (!uploadRes.ok) throw new Error("Upload to destination failed");
  const data = await uploadRes.json().catch(() => ({}));
  return data.publicUrl || dest.publicUrl;
}

let mediaAudioPlayer = null;

function formatBytes(bytes) {
  if (!bytes) return "";
  const k = 1024, sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function fetchTenantMediaAssets() {
  const assets = [];
  const seen = new Set();

  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/media`);
    if (res.ok) {
      const { media = [] } = await res.json();
      media.forEach(item => {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          assets.push({ ...item, isUploaded: true, name: item.filename });
        }
      });
    }
  } catch (err) {
    console.warn("fetchTenantMediaAssets:", err);
  }

  const hero = state.sectionsData.hero || {};
  [hero.musicTrackUrl, hero.customAudioUrl].filter(Boolean).forEach(url => {
    if (!seen.has(url)) {
      seen.add(url);
      assets.push({ key: url, name: url.split("/").pop(), url, isAudio: true, isUploaded: false });
    }
  });

  const memItems = state.sectionsData.memories?.items;
  if (Array.isArray(memItems)) {
    memItems.forEach(m => {
      if (m?.img && !seen.has(m.img)) {
        seen.add(m.img);
        assets.push({ key: m.id || m.img, name: m.title || m.img.split("/").pop(), url: m.img, isAudio: false, isUploaded: false });
      }
    });
  }

  const tlEvents = state.sectionsData.timeline?.events;
  if (Array.isArray(tlEvents)) {
    tlEvents.forEach(ev => {
      if (ev?.img && !seen.has(ev.img)) {
        seen.add(ev.img);
        assets.push({ key: ev.title || ev.img, name: ev.title || ev.img.split("/").pop(), url: ev.img, isAudio: false, isUploaded: false });
      }
    });
  }

  state.mediaAssets = assets;
  return assets;
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

async function renderMediaLibraryUI(refresh = false) {
  const libraryGrid = document.getElementById("mediaLibraryGrid");
  if (!libraryGrid) return;

  if (!state.mediaAssets || refresh) {
    await fetchTenantMediaAssets();
  }

  const assets = state.mediaAssets || [];
  const filter = state.mediaFilter || "all";
  const query = (state.mediaSearchQuery || "").toLowerCase();

  const countAll = document.getElementById("mediaCountAll");
  const countImages = document.getElementById("mediaCountImages");
  const countAudio = document.getElementById("mediaCountAudio");
  const tabMediaBadge = document.getElementById("tabMediaCountBadge");

  const imgCount = assets.filter(a => !a.isAudio).length;
  const audCount = assets.filter(a => a.isAudio).length;

  if (countAll) countAll.innerText = assets.length;
  if (countImages) countImages.innerText = imgCount;
  if (countAudio) countAudio.innerText = audCount;
  if (tabMediaBadge) tabMediaBadge.innerText = assets.length;

  const totalBytes = assets.reduce((sum, a) => sum + (a.size || 0), 0);
  const countStat = document.getElementById("mediaStorageAssetCount");
  const sizeStat = document.getElementById("mediaStorageTotalSize");
  const meterFill = document.getElementById("storageMeterFill");

  if (countStat) countStat.innerText = assets.length;
  if (sizeStat) sizeStat.innerText = totalBytes > 0 ? formatBytes(totalBytes) : "0 B";
  if (meterFill) {
    const pct = Math.min(100, Math.max(4, Math.round((totalBytes / (50 * 1024 * 1024)) * 100)));
    meterFill.style.width = `${pct}%`;
  }

  let filtered = assets.filter(a => {
    if (filter === "image" && a.isAudio) return false;
    if (filter === "audio" && !a.isAudio) return false;
    if (query && !a.name.toLowerCase().includes(query) && !a.url.toLowerCase().includes(query)) return false;
    return true;
  });

  const sortMode = state.mediaSort || "newest";
  filtered.sort((a, b) => {
    if (sortMode === "newest") return new Date(b.mtime || 0) - new Date(a.mtime || 0);
    if (sortMode === "oldest") return new Date(a.mtime || 0) - new Date(b.mtime || 0);
    if (sortMode === "name") return (a.name || "").localeCompare(b.name || "");
    if (sortMode === "size") return (b.size || 0) - (a.size || 0);
    return 0;
  });

  const isListView = state.mediaViewMode === "list";
  libraryGrid.classList.toggle("list-view", isListView);

  if (filtered.length === 0) {
    libraryGrid.innerHTML = `
      <div class="media-empty-state">
        <div style="font-size: 2rem; margin-bottom: 6px;">📂</div>
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--text);">No media assets found</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">
          ${query ? "No items matching your search filter." : "Drop photos or audio files above, or click 'Import via URL' to add media."}
        </div>
      </div>
    `;
    return;
  }

  if (isListView) {
    libraryGrid.innerHTML = filtered.map(a => {
      const sizeStr = a.size ? formatBytes(a.size) : "";
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
            ${a.isAudio
              ? `<button type="button" class="media-item-btn btn-set-bgm" data-url="${escapeHtml(a.url)}" title="Set as Background Music">🎵 BGM</button>
                 <button type="button" class="media-item-btn btn-set-voice" data-url="${escapeHtml(a.url)}" title="Set as Voice Memo">🎙️ Voice</button>`
              : `<button type="button" class="media-item-btn btn-add-to-memories" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" title="Add to Memories">📷 Mem</button>
                 <button type="button" class="media-item-btn btn-add-to-timeline" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" title="Add to Timeline">🗓️ Time</button>`
            }
            <button type="button" class="media-item-btn btn-copy-media-url" data-url="${escapeHtml(a.url)}" title="Copy Link">📋</button>
            <button type="button" class="media-item-btn btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="${a.isAudio}" title="Preview">👁️</button>
            ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ""}
          </div>
        </div>
      `;
    }).join("");
  } else {
    libraryGrid.innerHTML = filtered.map(a => {
      const sizeStr = a.size ? formatBytes(a.size) : "";
      if (a.isAudio) {
        return `
          <div class="media-item-card" data-url="${escapeHtml(a.url)}">
            <div class="media-card-thumb">
              <div class="media-audio-preview">
                <span class="media-type-badge">AUDIO</span>
                ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ""}
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
              ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ""}
            </div>
          </div>
        `;
      }
      return `
        <div class="media-item-card" data-url="${escapeHtml(a.url)}">
          <div class="media-card-thumb btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="false">
            <img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.name)}" loading="lazy">
            <span class="media-type-badge">IMG</span>
            ${sizeStr ? `<span class="media-size-badge">${escapeHtml(sizeStr)}</span>` : ""}
          </div>
          <div class="media-item-info">
            <span class="media-item-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
            <span class="media-item-url" title="${escapeHtml(a.url)}">${escapeHtml(a.url)}</span>
          </div>
          <div style="display:flex; gap:4px;">
            <button type="button" class="media-quick-insert-btn btn-add-to-memories" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" style="flex:1;">📷 Memories</button>
            <button type="button" class="media-quick-insert-btn btn-add-to-timeline" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" style="flex:1;">🗓️ Timeline</button>
          </div>
          <div class="media-item-actions">
            <button type="button" class="media-item-btn btn-copy-media-url" data-url="${escapeHtml(a.url)}">📋 Copy</button>
            <button type="button" class="media-item-btn btn-preview-media" data-url="${escapeHtml(a.url)}" data-name="${escapeHtml(a.name)}" data-isaudio="false">👁️</button>
            ${a.isUploaded ? `<button type="button" class="media-item-btn btn-delete-asset" data-key="${escapeHtml(a.filename || a.name)}" title="Delete file">🗑️</button>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  libraryGrid.querySelectorAll(".btn-copy-media-url").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(btn.getAttribute("data-url"));
      btn.textContent = "✓ Copied!";
      setTimeout(() => btn.textContent = "📋 Copy", 1200);
    };
  });

  libraryGrid.querySelectorAll(".btn-set-bgm").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute("data-url");
      if (!state.sectionsData.hero) state.sectionsData.hero = {};
      state.sectionsData.hero.musicTrackUrl = url;
      state.sectionsData.hero.customAudioUrl = url;
      btn.innerText = "✓ Set as BGM!";
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === "hero") renderWidgetInspector("hero");
      renderMediaSettingsUI();
      renderSiteSettingsUI();
      setTimeout(() => btn.innerText = "🎵 BGM", 1600);
    };
  });

  libraryGrid.querySelectorAll(".btn-set-voice").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute("data-url");
      if (!state.sectionsData.hero) state.sectionsData.hero = {};
      state.sectionsData.hero.voiceAudio = url;
      btn.innerText = "✓ Set Voice!";
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === "hero") renderWidgetInspector("hero");
      renderMediaSettingsUI();
      renderSiteSettingsUI();
      setTimeout(() => btn.innerText = "🎙️ Voice", 1600);
    };
  });

  libraryGrid.querySelectorAll(".btn-add-to-memories").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute("data-url");
      const name = btn.getAttribute("data-name") || "Memory";
      if (!state.sectionsData.memories || typeof state.sectionsData.memories !== "object") {
        state.sectionsData.memories = { items: [] };
      }
      if (!Array.isArray(state.sectionsData.memories.items)) {
        state.sectionsData.memories.items = [];
      }
      state.sectionsData.memories.items.unshift({
        id: `mem-${Date.now()}`,
        title: name.replace(/\.[^/.]+$/, ""),
        desc: "Captured romance ❤️",
        img: url
      });
      btn.innerText = "✓ Added!";
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === "memories") renderWidgetInspector("memories");
      setTimeout(() => btn.innerText = "📷 Memories", 1600);
    };
  });

  libraryGrid.querySelectorAll(".btn-add-to-timeline").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const url = btn.getAttribute("data-url");
      const name = btn.getAttribute("data-name") || "Special Date";
      if (!state.sectionsData.timeline || typeof state.sectionsData.timeline !== "object") {
        state.sectionsData.timeline = { events: [] };
      }
      if (!Array.isArray(state.sectionsData.timeline.events)) {
        state.sectionsData.timeline.events = [];
      }
      state.sectionsData.timeline.events.unshift({
        id: `tl-${Date.now()}`,
        date: "Special Date",
        title: name.replace(/\.[^/.]+$/, ""),
        desc: "Our unforgettable moment together ❤️",
        img: url
      });
      btn.innerText = "✓ Added!";
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
      if (state.activeInspectorWidget === "timeline") renderWidgetInspector("timeline");
      setTimeout(() => btn.innerText = "🗓️ Timeline", 1600);
    };
  });

  libraryGrid.querySelectorAll(".btn-preview-media").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      openMediaLightbox({
        url: el.getAttribute("data-url"),
        name: el.getAttribute("data-name"),
        isAudio: el.getAttribute("data-isaudio") === "true"
      });
    };
  });

  libraryGrid.querySelectorAll(".media-audio-play-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleMediaAudio(btn.getAttribute("data-url"), btn);
    };
  });

  libraryGrid.querySelectorAll(".media-audio-scrubber").forEach(bar => {
    bar.onclick = (e) => {
      e.stopPropagation();
      const url = bar.getAttribute("data-url");
      if (mediaAudioPlayer && mediaAudioPlayer.src.endsWith(url) && mediaAudioPlayer.duration) {
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        mediaAudioPlayer.currentTime = ratio * mediaAudioPlayer.duration;
      }
    };
  });

  libraryGrid.querySelectorAll(".btn-delete-asset").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute("data-key");
      if (!confirm(`Delete "${key}" from storage?`)) return;
      try {
        const res = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/media/${encodeURIComponent(key)}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Delete failed");
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
      document.querySelectorAll(".media-audio-play-btn").forEach(b => b.textContent = "▶");
      document.querySelectorAll(".audio-equalizer-bars").forEach(eq => eq.classList.remove("playing"));
      document.querySelectorAll(".media-audio-scrubber-fill").forEach(f => f.style.width = "0%");
      document.querySelectorAll(".media-audio-time").forEach(t => t.textContent = "0:00");
    };
    mediaAudioPlayer.ontimeupdate = () => {
      if (!mediaAudioPlayer.duration) return;
      const currentUrl = mediaAudioPlayer.src;
      document.querySelectorAll(".media-item-card, .media-list-item").forEach(item => {
        const itemUrl = item.getAttribute("data-url");
        if (itemUrl && currentUrl.endsWith(itemUrl)) {
          const fill = item.querySelector(".media-audio-scrubber-fill");
          const timeEl = item.querySelector(".media-audio-time");
          if (fill) {
            const pct = (mediaAudioPlayer.currentTime / mediaAudioPlayer.duration) * 100;
            fill.style.width = `${pct}%`;
          }
          if (timeEl) {
            timeEl.textContent = `${formatTime(mediaAudioPlayer.currentTime)} / ${formatTime(mediaAudioPlayer.duration)}`;
          }
        }
      });
    };
  }
  const card = btn.closest(".media-item-card") || btn.closest(".media-list-item");
  const eq = card ? card.querySelector(".audio-equalizer-bars") : null;

  if (mediaAudioPlayer.src.endsWith(url) && !mediaAudioPlayer.paused) {
    mediaAudioPlayer.pause();
    btn.textContent = "▶";
    if (eq) eq.classList.remove("playing");
  } else {
    document.querySelectorAll(".media-audio-play-btn").forEach(b => b.textContent = "▶");
    document.querySelectorAll(".audio-equalizer-bars").forEach(e => e.classList.remove("playing"));
    document.querySelectorAll(".media-audio-scrubber-fill").forEach(f => f.style.width = "0%");
    mediaAudioPlayer.src = url;
    mediaAudioPlayer.play().then(() => {
      btn.textContent = "⏸";
      if (eq) eq.classList.add("playing");
    }).catch(() => {
      btn.textContent = "▶";
      if (eq) eq.classList.remove("playing");
    });
  }
}

function openMediaLightbox({ url, name, isAudio }) {
  const modal = document.getElementById("mediaLightboxModal");
  if (!modal) return;
  const title = document.getElementById("lightboxTitle");
  const content = document.getElementById("lightboxContent");
  const btnOpen = document.getElementById("btnOpenLightboxUrl");
  const btnCopy = document.getElementById("btnCopyLightboxUrl");
  const urlText = document.getElementById("lightboxUrlText");
  const icon = document.getElementById("lightboxIcon");

  if (title) title.innerText = name || "Media Preview";
  if (icon) icon.innerText = isAudio ? "🎵" : "📷";
  if (urlText) urlText.innerText = url;
  if (btnOpen) btnOpen.href = url;
  if (btnCopy) {
    btnCopy.onclick = () => {
      navigator.clipboard?.writeText(url);
      btnCopy.innerText = "✓ Copied!";
      setTimeout(() => btnCopy.innerText = "📋 Copy Link", 1200);
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
  modal.classList.remove("hidden");
}

function closeMediaLightbox() {
  const modal = document.getElementById("mediaLightboxModal");
  if (!modal) return;
  modal.classList.add("hidden");
  const content = document.getElementById("lightboxContent");
  if (content) content.innerHTML = "";
}

async function uploadMediaFiles(files) {
  if (!files || files.length === 0) return;
  const statusEl = document.getElementById("uploadStatusText");
  const progressEl = document.getElementById("mediaUploadProgress");

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      statusEl.innerText = `⚠️ "${file.name}" exceeds 10 Mo limit`;
      return;
    }
  }

  if (progressEl) progressEl.classList.add("active");

  try {
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      statusEl.innerText = `Uploading (${i + 1}/${files.length}): ${file.name}...`;

      try {
        const publicUrl = await uploadFileToR2(file);
        const isAudio = (file.type && file.type.startsWith("audio/")) || /\.(mp3|m4a|m4r|wav|ogg)$/i.test(file.name);

        if (!isAudio) {
          if (!state.sectionsData.memories || typeof state.sectionsData.memories !== "object") {
            state.sectionsData.memories = {
              tag: "Captured Memories",
              title: "Our Favorite Moments 📷",
              desc: "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨",
              addBtnText: "📷 Add Our Photo / Video Memory",
              items: []
            };
          }
          if (!Array.isArray(state.sectionsData.memories.items)) {
            state.sectionsData.memories.items = [];
          }
          state.sectionsData.memories.items.unshift({
            id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: file.name.replace(/\.[^/.]+$/, ""),
            desc: "Uploaded memory",
            img: publicUrl
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
      if (statusEl.innerText.startsWith("✓")) statusEl.innerText = "";
    }, 4000);

    await renderMediaLibraryUI(true);
    renderWidgetInspector(state.activeInspectorWidget);
    debouncedLiveUpdate();
  } finally {
    if (progressEl) progressEl.classList.remove("active");
  }
}

function initMediaTabControls() {
  const fileInput = document.getElementById("mediaUploadInput");
  const dropZone = document.getElementById("mediaDropZone");
  const btnPickPhotos = document.getElementById("btnPickPhotos");
  const btnPickAudio = document.getElementById("btnPickAudio");
  const searchInput = document.getElementById("mediaSearchInput");
  const btnClearSearch = document.getElementById("btnClearMediaSearch");
  const sortSelect = document.getElementById("mediaSortSelect");
  const btnViewGrid = document.getElementById("btnViewGrid");
  const btnViewList = document.getElementById("btnViewList");
  const btnRefresh = document.getElementById("btnRefreshMedia");
  const btnRefreshLib = document.getElementById("btnRefreshMediaLibrary");
  const btnCloseLightbox = document.getElementById("btnCloseLightbox");
  const btnCloseLightboxAlt = document.getElementById("btnCloseLightboxAlt");
  const lightboxModal = document.getElementById("mediaLightboxModal");

  // Subnav switching inside Media tab
  const btnSubLib = document.getElementById("btnMediaSubnavLibrary");
  const btnSubSet = document.getElementById("btnMediaSubnavSettings");
  const paneLib = document.getElementById("media-pane-library");
  const paneSet = document.getElementById("media-pane-settings");

  if (btnSubLib && btnSubSet && paneLib && paneSet) {
    btnSubLib.onclick = () => {
      btnSubLib.classList.add("active");
      btnSubSet.classList.remove("active");
      paneLib.classList.add("active");
      paneSet.classList.remove("active");
      renderMediaLibraryUI(false);
    };
    btnSubSet.onclick = () => {
      btnSubSet.classList.add("active");
      btnSubLib.classList.remove("active");
      paneSet.classList.add("active");
      paneLib.classList.remove("active");
      renderMediaSettingsUI();
    };
  }

  // URL Import Box toggle and submit
  const btnToggleUrlImport = document.getElementById("btnToggleUrlImport");
  const urlImportBox = document.getElementById("mediaUrlImportBox");
  const btnCloseUrlImport = document.getElementById("btnCloseUrlImport");
  const btnSubmitUrlImport = document.getElementById("btnSubmitUrlImport");
  const urlInput = document.getElementById("mediaImportUrlInput");
  const urlStatus = document.getElementById("mediaUrlImportStatus");

  if (btnToggleUrlImport && urlImportBox) {
    btnToggleUrlImport.onclick = () => urlImportBox.classList.toggle("hidden");
  }
  if (btnCloseUrlImport && urlImportBox) {
    btnCloseUrlImport.onclick = () => urlImportBox.classList.add("hidden");
  }
  if (btnSubmitUrlImport && urlInput) {
    btnSubmitUrlImport.onclick = () => {
      const u = urlInput.value.trim();
      if (!u || !/^https?:\/\/.+/i.test(u)) {
        if (urlStatus) urlStatus.innerHTML = '<span style="color:#e63946;">Please enter a valid http/https URL</span>';
        return;
      }
      const isAudio = /\.(mp3|m4a|m4r|wav|ogg|aac)(\?.*)?$/i.test(u);
      const filename = u.split("/").pop().split("?")[0] || (isAudio ? "custom-audio.mp3" : "custom-photo.jpg");
      if (!state.mediaAssets) state.mediaAssets = [];
      state.mediaAssets.unshift({
        key: u,
        name: decodeURIComponent(filename),
        url: u,
        size: 0,
        isAudio,
        isUploaded: false
      });
      urlInput.value = "";
      if (urlStatus) urlStatus.innerHTML = '<span style="color:#2a9d8f;">✓ Added to media library!</span>';
      setTimeout(() => {
        if (urlImportBox) urlImportBox.classList.add("hidden");
        if (urlStatus) urlStatus.innerHTML = "";
      }, 1200);
      renderMediaLibraryUI(false);
    };
  }

  // View Mode toggle
  if (btnViewGrid && btnViewList) {
    btnViewGrid.onclick = () => {
      state.mediaViewMode = "grid";
      localStorage.setItem("saas_media_view", "grid");
      btnViewGrid.classList.add("active");
      btnViewList.classList.remove("active");
      renderMediaLibraryUI(false);
    };
    btnViewList.onclick = () => {
      state.mediaViewMode = "list";
      localStorage.setItem("saas_media_view", "list");
      btnViewList.classList.add("active");
      btnViewGrid.classList.remove("active");
      renderMediaLibraryUI(false);
    };
    if (state.mediaViewMode === "list") {
      btnViewList.classList.add("active");
      btnViewGrid.classList.remove("active");
    }
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.value = state.mediaSort || "newest";
    sortSelect.onchange = (e) => {
      state.mediaSort = e.target.value;
      renderMediaLibraryUI(false);
    };
  }

  // Search input & clear
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.mediaSearchQuery = e.target.value.trim();
      if (btnClearSearch) btnClearSearch.classList.toggle("hidden", !state.mediaSearchQuery);
      renderMediaLibraryUI(false);
    };
  }
  if (btnClearSearch && searchInput) {
    btnClearSearch.onclick = () => {
      searchInput.value = "";
      state.mediaSearchQuery = "";
      btnClearSearch.classList.add("hidden");
      renderMediaLibraryUI(false);
    };
  }

  // Filter buttons
  document.querySelectorAll(".media-filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".media-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.mediaFilter = btn.getAttribute("data-filter") || "all";
      renderMediaLibraryUI(false);
    };
  });

  if (fileInput) {
    fileInput.onchange = (e) => {
      uploadMediaFiles(Array.from(e.target.files || []));
      fileInput.value = "";
    };
  }

  if (btnPickPhotos) {
    btnPickPhotos.onclick = (e) => {
      e.stopPropagation();
      if (fileInput) {
        fileInput.accept = "image/*";
        fileInput.click();
      }
    };
  }

  if (btnPickAudio) {
    btnPickAudio.onclick = (e) => {
      e.stopPropagation();
      if (fileInput) {
        fileInput.accept = "audio/*";
        fileInput.click();
      }
    };
  }

  if (dropZone) {
    ["dragenter", "dragover"].forEach(evt => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(evt => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
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
  if (!state.sectionsData.mediaSettings || typeof state.sectionsData.mediaSettings !== "object") {
    state.sectionsData.mediaSettings = {};
  }
  const hero = state.sectionsData.hero || {};
  const ms = state.sectionsData.mediaSettings;
  if (ms.soundtrackUrl === undefined) ms.soundtrackUrl = hero.musicTrackUrl || "taylor-swift-fate-of-ophelia.m4r";
  if (ms.soundtrackTitle === undefined) ms.soundtrackTitle = hero.musicTrackTitle || "The Fate of Ophelia • Taylor Swift ✨";
  if (ms.soundtrackPreset === undefined) {
    if (ms.soundtrackUrl.includes("taylor-swift")) ms.soundtrackPreset = "taylor-swift-fate-of-ophelia.m4r";
    else if (ms.soundtrackUrl.includes("lady-gaga")) ms.soundtrackPreset = "lady-gaga-always-remember-us-this-way.m4r";
    else if (ms.soundtrackUrl.includes("imagine-dragons")) ms.soundtrackPreset = "imagine-dragons-i-follow-you.m4r";
    else ms.soundtrackPreset = "custom";
  }
  if (ms.soundtrackVolume === undefined) ms.soundtrackVolume = 80;
  if (ms.soundtrackAutoplay === undefined) ms.soundtrackAutoplay = true;
  if (ms.soundtrackLoop === undefined) ms.soundtrackLoop = true;
  if (ms.floatingPlayer === undefined) ms.floatingPlayer = true;
  if (ms.romanticSfx === undefined) ms.romanticSfx = true;

  if (ms.voiceUrl === undefined) ms.voiceUrl = hero.voiceAudio || "audio/myrecording-volume-adjusted.m4r";
  if (ms.voiceVolume === undefined) ms.voiceVolume = 100;
  return ms;
}

function getVolumeIcon(vol) {
  if (vol <= 0) return "🔇";
  if (vol <= 35) return "🔈";
  if (vol <= 70) return "🔉";
  return "🔊";
}

function renderMediaSettingsHTML(prefix = "ms_") {
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
          <span class="media-toggle-desc">Show rotating vinyl disc and player bar on live site</span>
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

function bindMediaSettingsControls(container, prefix = "ms_") {
  const ms = getMediaSettings();
  if (!state.sectionsData.hero) state.sectionsData.hero = {};
  const hero = state.sectionsData.hero;

  const presetEl = container.querySelector("#" + prefix + "soundtrack_preset");
  const titleEl = container.querySelector("#" + prefix + "soundtrack_title");
  const urlEl = container.querySelector("#" + prefix + "soundtrack_url");
  const pickSoundtrackBtn = container.querySelector("#" + prefix + "btn_pick_soundtrack");
  const fileSoundtrackEl = container.querySelector("#" + prefix + "soundtrack_file");
  const statusSoundtrackEl = container.querySelector("#" + prefix + "soundtrack_upload_status");
  const testSoundtrackBtn = container.querySelector("#" + prefix + "btn_test_soundtrack");

  const volSlider = container.querySelector("#" + prefix + "soundtrack_vol_slider");
  const volBadge = container.querySelector("#" + prefix + "soundtrack_vol_badge");
  const volIcon = container.querySelector("#" + prefix + "soundtrack_vol_icon");

  const toggleAutoplay = container.querySelector("#" + prefix + "toggle_autoplay");
  const toggleLoop = container.querySelector("#" + prefix + "toggle_loop");
  const toggleFloating = container.querySelector("#" + prefix + "toggle_floating");
  const toggleSfx = container.querySelector("#" + prefix + "toggle_sfx");

  const voiceUrlEl = container.querySelector("#" + prefix + "voice_url");
  const pickVoiceBtn = container.querySelector("#" + prefix + "btn_pick_voice");
  const fileVoiceEl = container.querySelector("#" + prefix + "voice_file");
  const statusVoiceEl = container.querySelector("#" + prefix + "voice_upload_status");
  const voiceVolSlider = container.querySelector("#" + prefix + "voice_vol_slider");
  const voiceVolBadge = container.querySelector("#" + prefix + "voice_vol_badge");
  const voiceVolIcon = container.querySelector("#" + prefix + "voice_vol_icon");
  const testVoiceBtn = container.querySelector("#" + prefix + "btn_test_voice");

  // Preset dropdown
  if (presetEl) {
    presetEl.onchange = (e) => {
      const val = e.target.value;
      ms.soundtrackPreset = val;
      if (val !== "custom") {
        const opt = e.target.selectedOptions[0];
        const title = opt ? opt.getAttribute("data-title") : "";
        const artist = opt ? opt.getAttribute("data-artist") : "";
        ms.soundtrackUrl = val;
        hero.musicTrackUrl = val;
        if (title && artist) {
          ms.soundtrackTitle = `${title} • ${artist}`;
          hero.musicTrackTitle = ms.soundtrackTitle;
          if (titleEl) titleEl.value = ms.soundtrackTitle;
        }
        if (urlEl) urlEl.value = val;
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({
            type: "SET_SONG",
            song: { title, artist, src: val }
          }, "*");
        }
      }
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  // Title input
  if (titleEl) {
    titleEl.oninput = (e) => {
      ms.soundtrackTitle = e.target.value.trim();
      hero.musicTrackTitle = ms.soundtrackTitle;
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
        if (v.includes("taylor-swift")) presetEl.value = "taylor-swift-fate-of-ophelia.m4r";
        else if (v.includes("lady-gaga")) presetEl.value = "lady-gaga-always-remember-us-this-way.m4r";
        else if (v.includes("imagine-dragons")) presetEl.value = "imagine-dragons-i-follow-you.m4r";
        else presetEl.value = "custom";
        ms.soundtrackPreset = presetEl.value;
      }
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  }

  // Library picker for soundtrack
  if (pickSoundtrackBtn) {
    pickSoundtrackBtn.onclick = () => {
      openMediaPicker({
        filter: "audio",
        onSelect: (url) => {
          ms.soundtrackUrl = url;
          hero.musicTrackUrl = url;
          if (urlEl) urlEl.value = url;
          if (presetEl) {
            presetEl.value = "custom";
            ms.soundtrackPreset = "custom";
          }
          const fname = decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Custom Track");
          if (!ms.soundtrackTitle || ms.soundtrackTitle.includes("Taylor Swift") || ms.soundtrackTitle.includes("Lady Gaga") || ms.soundtrackTitle.includes("Imagine Dragons")) {
            const autoTitle = fname.replace(/\.[^/.]+$/, "") + " 🎵";
            ms.soundtrackTitle = autoTitle;
            hero.musicTrackTitle = autoTitle;
            if (titleEl) titleEl.value = autoTitle;
          }
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        }
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
          statusSoundtrackEl.style.color = "#ff4365";
        }
        fileSoundtrackEl.value = "";
        return;
      }
      if (statusSoundtrackEl) {
        statusSoundtrackEl.textContent = "Uploading soundtrack (max 10 Mo)...";
        statusSoundtrackEl.style.color = "var(--text-muted)";
      }
      try {
        const publicUrl = await uploadFileToR2(file);
        ms.soundtrackUrl = publicUrl;
        hero.musicTrackUrl = publicUrl;
        const customTitle = file.name.replace(/\.[^/.]+$/, "") + " 🎵";
        ms.soundtrackTitle = customTitle;
        hero.musicTrackTitle = customTitle;
        if (titleEl) titleEl.value = customTitle;
        if (urlEl) urlEl.value = publicUrl;
        if (presetEl) presetEl.value = "custom";
        ms.soundtrackPreset = "custom";
        if (statusSoundtrackEl) {
          statusSoundtrackEl.textContent = `✓ Uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
          statusSoundtrackEl.style.color = "#2ed573";
        }
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
      } catch (err) {
        if (statusSoundtrackEl) {
          statusSoundtrackEl.textContent = "Upload failed: " + err.message;
          statusSoundtrackEl.style.color = "#ff4365";
        }
      }
    };
  }

  // Test soundtrack button
  if (testSoundtrackBtn) {
    testSoundtrackBtn.onclick = () => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "MUSIC_TOGGLE" }, "*");
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
        previewIframe.contentWindow.postMessage({ type: "SET_VOLUME", volume: val / 100 }, "*");
      }
      debouncedAutoSaveLayout();
    };
  }

  // Master volume mute toggle icon
  if (volIcon) {
    volIcon.onclick = () => {
      const current = ms.soundtrackVolume || 0;
      const target = current > 0 ? 0 : (lastSoundtrackVol || 80);
      ms.soundtrackVolume = target;
      if (volSlider) volSlider.value = target;
      if (volBadge) volBadge.textContent = `${target}%`;
      volIcon.textContent = getVolumeIcon(target);
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SET_VOLUME", volume: target / 100 }, "*");
      }
      debouncedAutoSaveLayout();
    };
  }

  // Playback toggles
  const bindToggle = (el, key) => {
    if (!el) return;
    el.onchange = () => {
      ms[key] = el.checked;
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({
          type: "MEDIA_SETTINGS_UPDATE",
          mediaSettings: ms
        }, "*");
      }
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  };

  bindToggle(toggleAutoplay, "soundtrackAutoplay");
  bindToggle(toggleLoop, "soundtrackLoop");
  bindToggle(toggleFloating, "floatingPlayer");
  bindToggle(toggleSfx, "romanticSfx");

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
        filter: "audio",
        onSelect: (url) => {
          ms.voiceUrl = url;
          hero.voiceAudio = url;
          if (voiceUrlEl) voiceUrlEl.value = url;
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        }
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
          statusVoiceEl.style.color = "#ff4365";
        }
        fileVoiceEl.value = "";
        return;
      }
      if (statusVoiceEl) {
        statusVoiceEl.textContent = "Uploading voice note...";
        statusVoiceEl.style.color = "var(--text-muted)";
      }
      try {
        const publicUrl = await uploadFileToR2(file);
        ms.voiceUrl = publicUrl;
        hero.voiceAudio = publicUrl;
        if (voiceUrlEl) voiceUrlEl.value = publicUrl;
        if (statusVoiceEl) {
          statusVoiceEl.textContent = `✓ Uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
          statusVoiceEl.style.color = "#2ed573";
        }
        debouncedLiveUpdate(true);
        debouncedAutoSaveLayout();
      } catch (err) {
        if (statusVoiceEl) {
          statusVoiceEl.textContent = "Upload failed: " + err.message;
          statusVoiceEl.style.color = "#ff4365";
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
      const target = current > 0 ? 0 : (lastVoiceVol || 100);
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
        previewIframe.contentWindow.postMessage({ type: "HERO_VOICE_TOGGLE" }, "*");
      }
    };
  }
}

function renderMediaSettingsUI() {
  const container = document.getElementById("mediaSettingsContainer");
  if (!container) return;
  container.innerHTML = renderMediaSettingsHTML("media_tab_");
  bindMediaSettingsControls(container, "media_tab_");
}

// ----------------------------------------------------
// SIDEBAR TABS & GLOBAL SITE SETTINGS
// ----------------------------------------------------
function initSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId === "tab-inspector" && (!state.layoutOrder || !state.layoutOrder.length)) {
        showToast("No active sections on website to customize.", "info");
      }
      switchToTab(tabId);
    });
  });

  const btnBack = document.getElementById("btnBackToWidgets");
  if (btnBack) {
    btnBack.addEventListener("click", () => switchToTab("tab-widgets"));
  }

  const btnMore = document.getElementById("btnInspectorMore");
  const moreMenu = document.getElementById("inspectorMoreMenu");
  if (btnMore && moreMenu) {
    btnMore.onclick = (e) => {
      e.stopPropagation();
      const isHidden = moreMenu.classList.contains("hidden");
      moreMenu.classList.toggle("hidden", !isHidden);
      btnMore.classList.toggle("active", isHidden);
    };
    document.addEventListener("click", (e) => {
      if (!moreMenu.contains(e.target) && e.target !== btnMore) {
        moreMenu.classList.add("hidden");
        btnMore.classList.remove("active");
      }
    });
  }
}

function switchToTab(tabId) {
  if (tabId === "tab-inspector") {
    if (!state.layoutOrder || !state.layoutOrder.length) {
      renderInspectorEmptyState();
    } else if (!state.activeInspectorWidget || !state.layoutOrder.includes(state.activeInspectorWidget)) {
      selectWidgetForInspector(state.layoutOrder[0]);
    }
  }
  document.querySelectorAll(".sidebar-tab-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll(".sidebar-tab-pane").forEach(p => {
    p.classList.toggle("active", p.id === tabId);
  });
  if (tabId === "tab-website") {
    renderSiteSettingsUI();
  } else if (tabId === "tab-media") {
    const isSettingsActive = document.getElementById("btnMediaSubnavSettings")?.classList.contains("active");
    if (isSettingsActive) {
      renderMediaSettingsUI();
    } else {
      renderMediaLibraryUI();
    }
  }
}
window.switchToTab = switchToTab;

function renderSiteSettingsUI() {
  const container = document.getElementById("siteSettingsContainer");
  if (!container) return;

  if (!state.sectionsData.hero) state.sectionsData.hero = {};
  const hero = state.sectionsData.hero;

  const birthdayThemes = [
    { id: "theme-birthday", name: "Birthday Cakes 🎂", desc: "Tiered cakes, dripping icing, candles & balloons", color: "#ff2e93" },
    { id: "theme-birthday-midnight", name: "Midnight Gold Gala ✨", desc: "Dark luxury gala, sparkler cakes & champagne", color: "#f59e0b" },
    { id: "theme-birthday-pastel", name: "Sweet Cupcake Bakery 🧁", desc: "Strawberry cream, cupcakes & macaron towers", color: "#ec4899" },
    { id: "theme-birthday-carnival", name: "Carnival & Confetti 🎪", desc: "Joyful bunting banners, party poppers & balloons", color: "#0284c7" },
    { id: "theme-birthday-emoji", name: "3D Emoji Party 🥳", desc: "Floating 3D emoji stickers, festive confetti & vibes", color: "#f43f5e" },
    { id: "theme-birthday-pixel", name: "8-Bit Retro Arcade 👾", desc: "Chiptune arcade pixel art, pixel cake & CRT grid", color: "#a855f7" },
    { id: "theme-birthday-neon", name: "Electric Cyber Neon ⚡", desc: "Glow tubes, dark club mode & vibrant neon signage", color: "#ff007f" },
    { id: "theme-birthday-papercraft", name: "Papercraft Cardstock ✂️", desc: "Folded origami, layered papercut shadows & bunting", color: "#ea580c" },
    { id: "theme-birthday-watercolor", name: "Watercolor & Foil 🎨", desc: "Soft pastel washes, luxury gold foil & delicate botanicals", color: "#c026d3" }
  ];

  const artStyles = [
    { id: "theme-watercolor-frame", name: "Watercolor Romance 🎨", desc: "Soft border wash, polka-dot balloons & golden arrows (Ref 1)", color: "#fb7185" },
    { id: "theme-pop-stickers", name: "Pop Love Stickers 💋", desc: "Bold lips, bubbling potion, winged hearts & lockets (Ref 2)", color: "#ff007f" },
    { id: "theme-doodle-tapestry", name: "Love Sketch Tapestry 🧸", desc: "Monoline toile: teddy bears, champagne & roses (Ref 3)", color: "#e11d48" }
  ];

  const imageBackgroundThemes = [
    { id: "theme-img-theme1", name: "Theme 1 (Adaptive) 🎀", desc: "Watercolor clouds & ribbons (Auto 16:9 / 9:16)", color: "#e11d48", img: "/images/themes/theme1-16-9.PNG" },
    { id: "theme-img-theme1-16-9", name: "Theme 1 (16:9) 🖼️", desc: "Watercolor clouds & ribbons (Landscape 16:9)", color: "#e11d48", img: "/images/themes/theme1-16-9.PNG" },
    { id: "theme-img-theme1-9-16", name: "Theme 1 (9:16) 📱", desc: "Watercolor clouds & ribbons (Portrait 9:16)", color: "#e11d48", img: "/images/themes/theme1-9-16.PNG" },
    { id: "theme-img-gold-hearts", name: "Watercolor Gold Hearts 💛", desc: "Gold leaf hearts & blush wash", color: "#d97706", img: "/images/themes/bg-watercolor-gold.jpeg" },
    { id: "theme-img-love-letter", name: "Love Letter Envelope 💌", desc: "Pink letter & floating hearts", color: "#fb7185", img: "/images/themes/bg-love-letter.jpg" },
    { id: "theme-img-be-mine", name: "Be Mine Sunset Sky 🌅", desc: "Sunset sky & sparkling heart trail", color: "#f43f5e", img: "/images/themes/bg-be-mine-sky.jpg" },
    { id: "theme-img-sweet-couple", name: "Embracing Couple 👩‍❤️‍👨", desc: "Minimalist couple hug illustration", color: "#0284c7", img: "/images/themes/bg-sweet-couple.jpg" },
    { id: "theme-img-line-hearts", name: "Minimalist Line Hearts ✍️", desc: "Continuous ink doodle hearts", color: "#ec4899", img: "/images/themes/bg-line-hearts.jpg" },
    { id: "theme-img-stitched-hearts", name: "Stitched Dual Pink 💕", desc: "Two-tone stitched craft paper", color: "#db2777", img: "/images/themes/bg-stitched-pink.jpeg" },
    { id: "theme-img-heart-podiums", name: "3D Heart Podiums 🎁", desc: "Studio 3D pastel pink heart sculpture", color: "#ec4899", img: "/images/themes/bg-heart-podiums.webp" },
    { id: "theme-img-paper-sunset", name: "Sunset Paper Hearts 🌇", desc: "Warm sunset & layered paper cutouts", color: "#f97316", img: "/images/themes/bg-paper-sunset.jpg" },
    { id: "theme-img-watercolor-frame", name: "Watercolor Frame 🖼️", desc: "Pastel frame with balloons & arrows", color: "#fb7185", img: "/images/themes/bg-watercolor-frame.png" },
    { id: "theme-img-pop-stickers", name: "Pop Love Stickers 💋", desc: "Sticker pattern: lips, potions & wings", color: "#ff007f", img: "/images/themes/bg-pop-stickers.png" },
    { id: "theme-img-doodle-tapestry", name: "Love Sketch Tapestry 🧸", desc: "Monoline crimson sketch toile", color: "#e11d48", img: "/images/themes/bg-doodle-tapestry.png" }
  ];

  const otherOccasions = [
    { id: "theme-apology", name: "Sincere Apology 🕊️", color: "#3a86ff" },
    { id: "theme-anniversary", name: "Anniversary 💍", color: "#c9184a" },
    { id: "theme-scrapbook", name: "Scrapbook 📖", color: "#b05d3b" }
  ];

  const colorThemes = [
    { id: "theme-pink", name: "Romantic Rose", color: "#ff4d6d" },
    { id: "theme-midnight", name: "Ocean Blue", color: "#3b82f6" },
    { id: "theme-purple", name: "Lavender Dream", color: "#9b5de5" },
    { id: "theme-gold", name: "Sunset Gold", color: "#f77f00" },
    { id: "theme-emerald", name: "Emerald Garden", color: "#10b981" },
    { id: "theme-peach", name: "Warm Peach", color: "#f97316" }
  ];

  const currentTheme = (state.themeId === "romantic-rose" || !state.themeId) ? "theme-pink" : (state.themeId === "theme-blue" || state.themeId === "blue") ? "theme-midnight" : (state.themeId === "birthday" ? "theme-birthday" : (state.themeId === "theme-birthday-cake" ? "theme-birthday" : state.themeId));
  const safeDateVal = (hero.anniversaryDate || '2024-02-14').split('T')[0];
  const publicSiteUrl = `${window.location.origin}/sites/${encodeURIComponent(state.slug)}`;

  container.innerHTML = `
    <!-- Live Website Share Card -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>🌐</span> Live Website Link</div>
      <div class="share-url-box">
        <span class="share-url-text" id="siteShareUrl">${escapeHtml(publicSiteUrl)}</span>
        <button type="button" class="btn-copy-link" id="btnCopySiteLink" title="Copy website link">📋 Copy</button>
        <a href="/sites/${encodeURIComponent(state.slug)}" target="_blank" class="btn-open-link" title="Open live site in new tab">↗ Open</a>
      </div>
    </div>

    <!-- Couple Identity Card -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>💍</span> Couple Identity</div>
      <div class="grid-2">
        <div class="input-group">
          <label>Partner 1 (Sender / Boyfriend)</label>
          <input type="text" id="site_p1" value="${escapeHtml(hero.partner1 || 'Aghiles')}">
        </div>
        <div class="input-group">
          <label>Partner 2 (Recipient / Girlfriend)</label>
          <input type="text" id="site_p2" value="${escapeHtml(hero.partner2 || 'Ella')}">
        </div>
      </div>
      <div class="input-group">
        <label>Anniversary / Start Date</label>
        <input type="date" id="site_date" value="${safeVal(safeDateVal)}">
      </div>
      <div class="input-group">
        <label>Love Subtitle / Relationship Motto</label>
        <input type="text" id="site_subtitle" value="${escapeHtml(hero.subtitle || 'Our Infinite Love Story ❤️')}">
      </div>
      <div class="input-group" style="margin-top: 10px;">
        <label>Browser Tab Title</label>
        <input type="text" id="site_page_title" value="${escapeHtml(hero.pageTitle || `${hero.partner1 || 'Aghiles'} & ${hero.partner2 || 'Ella'} | Our Love Story ❤️`)}">
      </div>
    </div>

    <!-- Visual Theme Card -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>🎂</span> Birthday Theme & Background Variations</div>
      <div style="font-size: 11px; color: var(--text-muted, #64748b); margin-bottom: 10px;">Select from 9 unique birthday designs & illustrated background art:</div>
      <div class="theme-chips-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 16px;">
        ${birthdayThemes.map(t => `
          <button type="button" class="theme-chip-btn ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}" style="padding: 10px 10px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; width: 100%;">
              <span class="theme-color-dot" style="background: ${t.color}"></span>
              <span style="font-weight: 700; font-size: 0.82rem;">${t.name}</span>
            </div>
            <span style="font-size: 10px; color: var(--text-muted, #64748b); font-weight: normal; line-height: 1.25;">${t.desc}</span>
          </button>
        `).join("")}
      </div>

      <div class="settings-group-title" style="font-size: 12px; opacity: 0.9; margin-top: 6px;"><span>✨</span> Illustrated Romance & Art Styles (Reference Designs)</div>
      <div style="font-size: 11px; color: var(--text-muted, #64748b); margin-bottom: 10px;">Select from 3 illustrated aesthetics (Watercolor Frame, Pop Stickers, Sketch Tapestry):</div>
      <div class="theme-chips-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 16px;">
        ${artStyles.map(t => `
          <button type="button" class="theme-chip-btn ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}" style="padding: 10px 10px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; width: 100%;">
              <span class="theme-color-dot" style="background: ${t.color}"></span>
              <span style="font-weight: 700; font-size: 0.82rem;">${t.name}</span>
            </div>
            <span style="font-size: 10px; color: var(--text-muted, #64748b); font-weight: normal; line-height: 1.25;">${t.desc}</span>
          </button>
        `).join("")}
      </div>

      <div class="settings-group-title" style="font-size: 13px; font-weight: 700; margin-top: 14px;"><span>🖼️</span> Background Wallpaper & Imagery</div>
      <div style="font-size: 11px; color: var(--text-muted, #64748b); margin-bottom: 10px;">Select an illustrated wallpaper preset or upload your own romantic background:</div>

      <div class="custom-bg-picker-card" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 12px;">Custom Background Wallpaper</strong>
          ${state.customBgUrl ? `<button type="button" id="btnClearCustomBg" style="background:none; border:1px solid rgba(239,68,68,0.4); color:#ef4444; font-size:11px; padding:2px 8px; border-radius:4px; cursor:pointer;">✕ Reset to Preset</button>` : ''}
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="site_customBgUrl" placeholder="Image URL or upload..." value="${escapeHtml(state.customBgUrl || '')}" style="flex: 1; font-size: 12px; padding: 6px 10px;">
          <button type="button" id="btnPickBgFromLibrary" class="btn-sm btn-secondary" style="white-space: nowrap; padding: 6px 12px; font-size: 12px; cursor: pointer;">📁 Library</button>
          <label class="file-upload-btn" style="cursor: pointer; display: inline-flex; align-items: center; padding: 6px 12px; background: var(--primary); color: #fff; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap;">
            <span>⬆️ Upload</span>
            <input type="file" id="uploadCustomBgFile" accept="image/*" style="display: none;">
          </label>
        </div>
        ${state.customBgUrl ? `
          <div style="margin-top: 10px; width: 100%; height: 95px; background: url('${escapeHtml(state.customBgUrl)}') center/cover no-repeat; border-radius: 8px; border: 2px solid var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
        ` : ''}
      </div>

      <div style="font-size: 11px; font-weight: 600; color: var(--text-muted, #64748b); margin-bottom: 8px;">Wallpaper Presets (Click to apply):</div>
      <div class="theme-chips-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
        ${imageBackgroundThemes.map(t => `
          <button type="button" class="theme-chip-btn ${(!state.customBgUrl && currentTheme === t.id) ? 'active' : ''}" data-theme="${t.id}" style="padding: 8px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 6px; border-radius: 10px; overflow: hidden;">
            <div style="width: 100%; height: 75px; background: url('${t.img}') center/cover no-repeat; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1);"></div>
            <div style="display: flex; align-items: center; gap: 6px; width: 100%;">
              <span class="theme-color-dot" style="background: ${t.color}"></span>
              <span style="font-weight: 700; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
            </div>
            <span style="font-size: 10px; color: var(--text-muted, #64748b); font-weight: normal; line-height: 1.2;">${t.desc}</span>
          </button>
        `).join("")}
      </div>

      <div class="settings-group-title" style="font-size: 12px; opacity: 0.9; margin-top: 6px;"><span>💌</span> Other Occasions</div>
      <div class="theme-chips-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 14px;">
        ${otherOccasions.map(t => `
          <button type="button" class="theme-chip-btn ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}">
            <span class="theme-color-dot" style="background: ${t.color}"></span>
            <span>${t.name}</span>
          </button>
        `).join("")}
      </div>

      <div class="settings-group-title" style="font-size: 12px; opacity: 0.9; margin-top: 6px;"><span>🎨</span> Classic Color Palettes</div>
      <div class="theme-chips-grid">
        ${colorThemes.map(t => `
          <button type="button" class="theme-chip-btn ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}">
            <span class="theme-color-dot" style="background: ${t.color}"></span>
            <span>${t.name}</span>
          </button>
        `).join("")}
      </div>
    </div>

    <!-- Audio & Romance Soundtrack Settings -->
    ${renderMediaSettingsHTML("site_")}

    <!-- Security & Account PIN -->
    <div class="settings-group-card">
      <div class="settings-group-title"><span>🔒</span> Security & Passcode</div>
      <div class="input-group">
        <label>Couple Admin PIN (for saving & editing)</label>
        <div class="pin-input-wrap" style="display:flex; gap:8px;">
          <input type="password" id="site_admin_pin" value="${escapeHtml(state.adminPin || '1234')}" maxlength="8" style="flex:1;">
          <button type="button" class="btn-toggle-pin" id="btnTogglePinVisibility">👁️ Show</button>
          <button type="button" id="btnUpdateAdminPin" style="padding:6px 14px; background:var(--primary); color:#fff; border:none; border-radius:6px; font-weight:600; font-size:12px; cursor:pointer;">Update PIN</button>
        </div>
        <div id="site_pinStatus" style="font-size:11px; margin-top:4px;"></div>
      </div>
    </div>
  `;

  // Copy site link button with clipboard fallback
  const btnCopy = document.getElementById("btnCopySiteLink");
  if (btnCopy) {
    btnCopy.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(publicSiteUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = publicSiteUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btnCopy.textContent = "✓ Copied!";
      setTimeout(() => btnCopy.textContent = "📋 Copy", 1500);
    };
  }

  // Toggle PIN visibility button
  const btnTogglePin = document.getElementById("btnTogglePinVisibility");
  const pinInput = document.getElementById("site_admin_pin");
  if (btnTogglePin && pinInput) {
    btnTogglePin.onclick = () => {
      const isPwd = pinInput.type === "password";
      pinInput.type = isPwd ? "text" : "password";
      btnTogglePin.textContent = isPwd ? "🙈 Hide" : "👁️ Show";
    };
  }

  // Explicit Update PIN button
  const btnUpdatePin = document.getElementById("btnUpdateAdminPin");
  const pinStatus = document.getElementById("site_pinStatus");
  if (btnUpdatePin && pinInput) {
    btnUpdatePin.onclick = async () => {
      const newPin = pinInput.value.trim();
      if (!newPin || newPin.length < 4) {
        if (pinStatus) {
          pinStatus.textContent = "❌ PIN must be at least 4 digits.";
          pinStatus.style.color = "#ff4365";
        }
        return;
      }
      try {
        btnUpdatePin.disabled = true;
        btnUpdatePin.textContent = "Updating...";
        const res = await fetch(`/api/tenants/${encodeURIComponent(state.slug)}/config`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Pin": state.adminPin
          },
          body: JSON.stringify({
            templatePreset: state.templatePreset,
            themeId: state.themeId,
            layoutOrder: state.layoutOrder,
            sectionsData: state.sectionsData,
            newAdminPin: newPin
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Update failed");
        }
        state.adminPin = newPin;
        if (pinStatus) {
          pinStatus.textContent = "✓ Admin PIN updated successfully!";
          pinStatus.style.color = "#2ed573";
        }
        showToast("Admin PIN updated successfully!", "success");
      } catch (err) {
        if (pinStatus) {
          pinStatus.textContent = "Update failed: " + err.message;
          pinStatus.style.color = "#ff4365";
        }
        showToast("PIN Error: " + err.message, "error");
      } finally {
        btnUpdatePin.disabled = false;
        btnUpdatePin.textContent = "Update PIN";
      }
    };
  }

  // Bind unified media and audio settings controls
  bindMediaSettingsControls(container, "site_");

  // Bind custom background wallpaper controls
  const btnPickBg = document.getElementById("btnPickBgFromLibrary");
  if (btnPickBg) {
    btnPickBg.onclick = () => {
      openMediaPicker({
        filter: "image",
        onSelect: (url) => {
          state.customBgUrl = url;
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
          }
          renderSiteSettingsUI();
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        }
      });
    };
  }

  const bgUploadInput = document.getElementById("uploadCustomBgFile");
  if (bgUploadInput) {
    bgUploadInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const uploaded = await uploadFileToR2(file, file.name);
        if (uploaded && uploaded.url) {
          state.customBgUrl = uploaded.url;
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
          }
          renderSiteSettingsUI();
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        }
      } catch (err) {
        alert("Failed to upload background image: " + err.message);
      }
    };
  }

  const btnClearBg = document.getElementById("btnClearCustomBg");
  if (btnClearBg) {
    btnClearBg.onclick = () => {
      state.customBgUrl = "";
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: "" }, "*");
      }
      renderSiteSettingsUI();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  const inputCustomBg = document.getElementById("site_customBgUrl");
  if (inputCustomBg) {
    inputCustomBg.onchange = (e) => {
      state.customBgUrl = e.target.value.trim();
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
      }
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  }

  // Bind theme clicks
  container.querySelectorAll(".theme-chip-btn").forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll(".theme-chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.themeId = btn.getAttribute("data-theme");
      state.customBgUrl = "";
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: "" }, "*");
      }
      renderSiteSettingsUI();
      debouncedLiveUpdate(true);
      debouncedAutoSaveLayout();
    };
  });

  // Bind input listeners
  const bindInput = (id, setter) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.oninput = (e) => {
      setter(e.target.value.trim());
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  };

  bindInput("site_p1", v => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.partner1 = v;
  });
  bindInput("site_p2", v => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.partner2 = v;
  });
  bindInput("site_date", v => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.anniversaryDate = v;
  });
  bindInput("site_subtitle", v => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.subtitle = v;
  });
  bindInput("site_page_title", v => {
    if (!state.sectionsData.hero) state.sectionsData.hero = {};
    state.sectionsData.hero.pageTitle = v;
  });
}

// ----------------------------------------------------
// 7. BUILDER CONTROLS & SHORTCUTS
// ----------------------------------------------------
function initSidebarResizer() {
  const sidebar = document.getElementById("builderSidebar");
  const resizer = document.getElementById("builderResizer");
  const btnCollapse = document.getElementById("btnCollapseSidebar");
  const collapseArrow = document.getElementById("collapseArrow");
  if (!sidebar || !resizer) return;

  const savedWidth = localStorage.getItem("builder_sidebar_width");
  if (savedWidth) {
    const w = parseInt(savedWidth, 10);
    if (w >= 360 && w <= 760) {
      sidebar.style.width = `${w}px`;
      document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
    }
  }

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  const onMouseDown = (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    resizer.classList.add("resizing");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    if (previewIframe) previewIframe.style.pointerEvents = "none";
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    let newWidth = startWidth + delta;
    if (newWidth < 360) newWidth = 360;
    if (newWidth > 760) newWidth = 760;
    sidebar.style.width = `${newWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
    if (sidebar.classList.contains("collapsed")) {
      sidebar.classList.remove("collapsed");
      if (collapseArrow) collapseArrow.textContent = "◀";
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove("resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (previewIframe) previewIframe.style.pointerEvents = "";
      localStorage.setItem("builder_sidebar_width", sidebar.offsetWidth);
    }
  };

  resizer.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  resizer.addEventListener("dblclick", () => {
    sidebar.style.width = "470px";
    document.documentElement.style.setProperty("--sidebar-width", "470px");
    localStorage.removeItem("builder_sidebar_width");
    showToast("Sidebar width reset to default", "info", 1500);
  });

  if (btnCollapse) {
    btnCollapse.onclick = () => {
      const isCollapsed = sidebar.classList.toggle("collapsed");
      if (collapseArrow) collapseArrow.textContent = isCollapsed ? "▶" : "◀";
      btnCollapse.title = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
    };
  }
}

function initDeviceSwitcher() {
  const btnDesktop = document.getElementById("btnDeviceDesktop");
  const btnTablet = document.getElementById("btnDeviceTablet");
  const btnMobile = document.getElementById("btnDeviceMobile");
  const btnRefresh = document.getElementById("btnRefreshPreview");
  const previewChassis = document.getElementById("previewDeviceChassis");
  const zoomSelect = document.getElementById("previewZoomSelect");

  const setDevice = (mode) => {
    if (!previewChassis) return;
    [btnDesktop, btnTablet, btnMobile].forEach(b => b?.classList.remove("active"));
    previewChassis.className = "preview-device-chassis";

    if (mode === "desktop") {
      btnDesktop?.classList.add("active");
    } else if (mode === "tablet") {
      btnTablet?.classList.add("active");
      previewChassis.classList.add("tablet");
    } else if (mode === "mobile") {
      btnMobile?.classList.add("active");
      previewChassis.classList.add("mobile");
    }
  };

  if (btnDesktop) btnDesktop.onclick = () => setDevice("desktop");
  if (btnTablet) btnTablet.onclick = () => setDevice("tablet");
  if (btnMobile) btnMobile.onclick = () => setDevice("mobile");
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      const icon = btnRefresh.querySelector(".refresh-icon");
      if (icon) icon.style.transform = "rotate(360deg)";
      reloadPreview();
      setTimeout(() => { if (icon) icon.style.transform = ""; }, 400);
    };
  }

  if (zoomSelect && previewChassis) {
    zoomSelect.onchange = (e) => {
      const scale = parseFloat(e.target.value) || 1;
      previewChassis.style.transform = scale === 1 ? "" : `scale(${scale})`;
    };
  }
}

function initMobileWorkspaceToggle() {
  const btnEditor = document.getElementById("btnMobileShowEditor");
  const btnPreview = document.getElementById("btnMobileShowPreview");
  const workspace = document.getElementById("builderWorkspace");
  if (!workspace || !btnEditor || !btnPreview) return;

  const setWorkspaceMode = (mode) => {
    if (mode === "editor") {
      workspace.classList.add("show-editor");
      workspace.classList.remove("show-preview");
      btnEditor.classList.add("active");
      btnPreview.classList.remove("active");
    } else {
      workspace.classList.add("show-preview");
      workspace.classList.remove("show-editor");
      btnPreview.classList.add("active");
      btnEditor.classList.remove("active");
    }
  };

  btnEditor.addEventListener("click", () => setWorkspaceMode("editor"));
  btnPreview.addEventListener("click", () => setWorkspaceMode("preview"));
}

function initPresetsToggle() {
  const btnToggle = document.getElementById("btnTogglePresets");
  const wrapper = document.getElementById("presetGridWrapper");
  const toggleText = document.getElementById("btnPresetToggleText");
  if (btnToggle && wrapper) {
    btnToggle.onclick = () => {
      const isHidden = wrapper.classList.toggle("hidden");
      btnToggle.classList.toggle("is-open", !isHidden);
      if (toggleText) toggleText.textContent = isHidden ? "▾" : "▴";
    };
  }
}

function initCopyLiveLink() {
  const btnCopy = document.getElementById("btnCopyLiveLink");
  if (btnCopy) {
    btnCopy.onclick = () => {
      const url = `${window.location.origin}/sites/${encodeURIComponent(state.slug)}`;
      navigator.clipboard?.writeText(url).then(() => {
        showToast("Live site URL copied to clipboard! 📋", "success");
      }).catch(() => {
        prompt("Copy this URL:", url);
      });
    };
  }
}

function initKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveConfig();
    } else if (e.key === "Escape") {
      document.getElementById("tenantModal")?.classList.add("hidden");
      document.getElementById("mediaLightboxModal")?.classList.add("hidden");
      document.getElementById("mediaPickerModal")?.classList.add("hidden");
      document.getElementById("addSectionModal")?.classList.add("hidden");
      document.getElementById("widgetPreviewModal")?.classList.add("hidden");
      document.getElementById("inspectorMoreMenu")?.classList.add("hidden");
      document.getElementById("btnInspectorMore")?.classList.remove("active");
    }
  });
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
  initMobileWorkspaceToggle();
  initPresetsToggle();
  initCopyLiveLink();
  initKeyboardShortcuts();

  btnSaveConfig.onclick = saveConfig;

  window.addEventListener("message", (e) => {
    if (!e.data) return;
    if (e.data.type === "STUDIO_IFRAME_READY") {
      debouncedLiveUpdate(true);
    }
    if (e.data.type === "MUSIC_STATE_CHANGED") {
      const btn = document.getElementById("btnTestSiteSoundtrack");
      if (btn) btn.textContent = e.data.playing ? "⏸️ Pause" : "▶️ Test";
    }
    if (e.data.type === "OPEN_ADD_SECTION_MODAL") {
      openAddSectionModal(e.data.insertIndex);
    }
    if (e.data.type === "REMOVE_WIDGET" && e.data.widgetId) {
      removeWidgetFromLayout(e.data.widgetId);
    }
    if (e.data.type === "SELECT_WIDGET" && e.data.widgetId) {
      if (typeof switchToTab === "function") switchToTab("tab-inspector");
      if (e.data.chapterId) state.targetChapterId = e.data.chapterId;
      selectWidgetForInspector(e.data.widgetId);
    }
    if (e.data.type === "SYNC_REASONS" && Array.isArray(e.data.reasons)) {
      state.sectionsData.reasons = e.data.reasons;
      if (state.activeInspectorWidget === "reasons") {
        renderWidgetInspector("reasons");
      }
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }
    if (e.data.type === "SYNC_CHAPTER" && e.data.chapter) {
      const syncCh = e.data.chapter;
      const t = Array.isArray(state.sectionsData.timeline)
        ? state.sectionsData.timeline
        : (state.sectionsData.timeline?.chapters || []);
      const found = t.find(c => c.id === syncCh.id || c.cityKey === syncCh.id || c.id === e.data.chapterId);
      if (found) {
        if (syncCh.title !== undefined) found.title = syncCh.title;
        if (syncCh.caption !== undefined) found.caption = syncCh.caption;
        if (syncCh.desc !== undefined) found.desc = syncCh.desc;
        if (syncCh.highlights && syncCh.highlights.length > 0) found.highlights = syncCh.highlights;
        if (syncCh.images && syncCh.images.length > 0) {
          found.images = syncCh.images;
          found.img = syncCh.images[0];
        } else if (syncCh.img) {
          found.img = syncCh.img;
        }
        if (state.activeInspectorWidget === "timeline") {
          renderWidgetInspector("timeline");
        }
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      }
    }
    if (e.data.type === "SYNC_MEMORIES" && Array.isArray(e.data.memories)) {
      const seen = new Set();
      const deduped = e.data.memories.filter(m => m && m.id && !seen.has(m.id) && seen.add(m.id));
      if (state.sectionsData.memories && typeof state.sectionsData.memories === "object" && !Array.isArray(state.sectionsData.memories)) {
        state.sectionsData.memories.items = deduped;
      } else {
        state.sectionsData.memories = deduped;
      }
      if (state.activeInspectorWidget === "memories") {
        renderWidgetInspector("memories");
      }
      debouncedLiveUpdate();
    }
  });

  // Media tab controls, dropzone & lightbox
  initMediaTabControls();

  // Tenant switch modal
  const modal = document.getElementById("tenantModal");
  document.getElementById("btnSwitchTenant").onclick = () => modal.classList.remove("hidden");
  document.getElementById("btnModalCancel").onclick = () => modal.classList.add("hidden");

  document.getElementById("btnModalSubmit").onclick = async () => {
    const slug = document.getElementById("modalSlug").value.trim().toLowerCase();
    const pin = document.getElementById("modalPin").value.trim();
    const p1 = document.getElementById("modalP1").value.trim();
    const p2 = document.getElementById("modalP2").value.trim();

    if (!slug || !pin) return showToast("Slug and PIN required", "error");

    try {
      const check = await fetch(`/api/tenants/${encodeURIComponent(slug)}`);
      if (check.ok) {
        state.slug = slug;
        state.adminPin = pin;
        modal.classList.add("hidden");
        await loadTenantData(slug);
        showToast(`Loaded site "${slug}"`, "success");
      } else {
        const create = await fetch("/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, adminPin: pin, partner1: p1 || "Partner 1", partner2: p2 || "Partner 2" })
        });
        if (!create.ok) throw new Error("Could not create site");
        state.slug = slug;
        state.adminPin = pin;
        modal.classList.add("hidden");
        await loadTenantData(slug);
        showToast(`Created new site "${slug}"!`, "success");
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };
}
