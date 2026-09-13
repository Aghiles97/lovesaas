/**
 * Builder Inspector Module: truce_agreement
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["truce_agreement"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.truce_agreement) state.sectionsData.truce_agreement = {};
    const ta = state.sectionsData.truce_agreement;
    const hero = state.sectionsData.hero || {};
    const p1Def = hero.partner1 || "Aghiles";
    const p2Def = hero.partner2 || hero.partnerName || "Ella";

    if (!Array.isArray(ta.terms)) {
      ta.terms = [
        "I promise to listen with an open, non-defensive heart whenever you speak.",
        "I promise immediate hugs, comfort, and soothing reassurance on demand.",
        "I promise never to let anger linger past sundown without reconciliation.",
        "I promise to prioritize our connection, empathy, and love over individual pride."
      ];
    }
    const terms = ta.terms;

    let termsHtml = "";
    terms.forEach((term, idx) => {
      termsHtml += `
        <div class="item-editor-card" data-idx="${idx}" style="margin-bottom: 8px;">
          <div class="item-editor-header">
            <span class="item-editor-title">📜 Covenant #${idx + 1}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-term="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-term="${idx}" data-dir="1" title="Move later" ${idx === terms.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-term="${idx}">🗑️</button>
            </div>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <textarea class="term-text-input" rows="2" placeholder="Enter promise or covenant...">${safeVal(term)}</textarea>
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📜 Treaty Header & Parties</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="ta_tag" value="${safeVal(ta.tag || "Diplomatic Accord 🕊️")}">
          </div>
          <div class="input-group">
            <label>Treaty Title</label>
            <input type="text" id="ta_title" value="${safeVal(ta.title || "Bilateral Peace & Truce Treaty")}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="ta_desc" rows="2">${safeVal(ta.desc || "Review the sacred covenants below. Press and hold the seal to ratify our peace accord.")}</textarea>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Party A (Sender)</label>
            <input type="text" id="ta_party1" value="${safeVal(ta.party1 || p1Def)}">
          </div>
          <div class="input-group">
            <label>Party B (Partner)</label>
            <input type="text" id="ta_party2" value="${safeVal(ta.party2 || p2Def)}">
          </div>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Hold Duration (Seconds)</label>
            <input type="number" id="ta_holdDuration" min="1" max="10" value="${ta.holdDurationSec || 3}">
          </div>
          <div class="input-group">
            <label>Download Button Label</label>
            <input type="text" id="ta_downloadBtn" value="${safeVal(ta.downloadBtnText || "📜 Download Ratified Treaty PDF")}">
          </div>
        </div>
      </div>

      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(254,249,195,0.6), rgba(255,255,255,0.9)); border: 1px dashed #eab308;">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Interactive Testing</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test treaty hold mechanic or instantly sign and seal inside live preview:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTestTruceSign" class="btn-builder-action" style="background: #eab308; color: #713f12; font-weight: 700;">✍️ Sign Instantly</button>
          <button type="button" id="btnTestTruceReset" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset Treaty</button>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚖️ Binding Covenants (${terms.length})</span>
        </div>
        <div id="truceTermsContainer">${termsHtml}</div>
        <button type="button" id="btnAddTerm" class="btn-add-item" style="margin-top: 10px;">➕ Add Covenant Promise</button>
      </div>
    `;

    const syncTaHeaders = () => {
      ta.tag = document.getElementById("ta_tag").value.trim();
      ta.title = document.getElementById("ta_title").value.trim();
      ta.desc = document.getElementById("ta_desc").value.trim();
      ta.party1 = document.getElementById("ta_party1").value.trim();
      ta.party2 = document.getElementById("ta_party2").value.trim();
      ta.holdDurationSec = parseInt(document.getElementById("ta_holdDuration").value, 10) || 3;
      ta.downloadBtnText = document.getElementById("ta_downloadBtn").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    ["ta_tag", "ta_title", "ta_desc", "ta_party1", "ta_party2", "ta_holdDuration", "ta_downloadBtn"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", syncTaHeaders);
    });

    // Terms binding
    document.querySelectorAll("#truceTermsContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      const txt = card.querySelector(".term-text-input");
      if (txt) {
        txt.oninput = (e) => {
          terms[idx] = e.target.value;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
      const rem = card.querySelector(`[data-remove-term="${idx}"]`);
      if (rem) {
        rem.onclick = () => {
          terms.splice(idx, 1);
          renderWidgetInspector("truce_agreement");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
    });

    document.querySelectorAll("[data-move-term]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveTerm, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < terms.length) {
          const [moved] = terms.splice(idx, 1);
          terms.splice(target, 0, moved);
          renderWidgetInspector("truce_agreement");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    const btnAdd = document.getElementById("btnAddTerm");
    if (btnAdd) {
      btnAdd.onclick = () => {
        terms.push("I promise to always communicate with unconditional love and empathy.");
        renderWidgetInspector("truce_agreement");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    }

    // Live testing
    const btnSign = document.getElementById("btnTestTruceSign");
    if (btnSign) {
      btnSign.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "TRUCE_SIGN_INSTANT" }, "*");
          try { previewIframe.contentWindow.truceSignInstant?.(); } catch (e) {}
        }
      };
    }

    const btnReset = document.getElementById("btnTestTruceReset");
    if (btnReset) {
      btnReset.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "TRUCE_RESET" }, "*");
          try { previewIframe.contentWindow.truceReset?.(); } catch (e) {}
        }
      };
    }
  };
})();
