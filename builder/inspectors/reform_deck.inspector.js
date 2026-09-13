/**
 * Builder Inspector Module: reform_deck
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["reform_deck"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.reform_deck) state.sectionsData.reform_deck = {};
    const rd = state.sectionsData.reform_deck;

    if (!Array.isArray(rd.cards)) {
      rd.cards = [
        {
          frontTitle: "Listening Without Defensiveness",
          icon: "👂",
          apology: "I am truly sorry for reacting defensively when you were expressing vulnerability.",
          accountability: "I acknowledge that making it about my feelings dismissed your valid experience.",
          commitment: "I commit to breathing, listening completely, and validating you before speaking."
        },
        {
          frontTitle: "Consistent Communication",
          icon: "💬",
          apology: "I apologize for going quiet or taking too long to communicate when overwhelmed.",
          accountability: "I understand that emotional distance creates anxiety and hurts our closeness.",
          commitment: "I promise to stay transparent, give gentle updates, and never shut you out."
        },
        {
          frontTitle: "Patience & Gentle Tone",
          icon: "🕊️",
          apology: "I am deeply sorry for any sharpness, frustration, or impatience in my tone.",
          accountability: "You deserve softness, gentleness, and respect in every single interaction.",
          commitment: "I will maintain gentleness and speak from love, especially during tough talks."
        },
        {
          frontTitle: "Presence & Undivided Attention",
          icon: "✨",
          apology: "I apologize for moments where distractions robbed us of our quality moments.",
          accountability: "Your time is precious and you deserve my undivided presence and gaze.",
          commitment: "No phones or distractions during our dates and heart-to-heart talks."
        }
      ];
    }
    const cards = rd.cards;

    let cardsHtml = "";
    cards.forEach((c, idx) => {
      cardsHtml += `
        <div class="item-editor-card" data-idx="${idx}" style="margin-bottom: 12px;">
          <div class="item-editor-header">
            <span class="item-editor-title">🃏 Card #${idx + 1}: ${safeVal(c.frontTitle || 'Pledge')}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-card="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-card="${idx}" data-dir="1" title="Move later" ${idx === cards.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-card="${idx}">🗑️</button>
            </div>
          </div>
          <div class="grid-2" style="margin-top: 6px;">
            <div class="input-group">
              <label>Icon</label>
              <input type="text" class="card-icon-input" value="${safeVal(c.icon || '💌')}">
            </div>
            <div class="input-group">
              <label>Front Topic Title</label>
              <input type="text" class="card-title-input" value="${safeVal(c.frontTitle || '')}">
            </div>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>The Apology</label>
            <textarea class="card-apology-input" rows="2" placeholder="I am truly sorry for...">${safeVal(c.apology || '')}</textarea>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Accountability & Ownership</label>
            <textarea class="card-accountability-input" rows="2" placeholder="I acknowledge that...">${safeVal(c.accountability || '')}</textarea>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Future Commitment</label>
            <textarea class="card-commitment-input" rows="2" placeholder="I promise to...">${safeVal(c.commitment || '')}</textarea>
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🃏 Reform Deck Settings</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="rd_tag" value="${safeVal(rd.tag || "Accountability & Reform 🃏")}">
          </div>
          <div class="input-group">
            <label>Deck Title</label>
            <input type="text" id="rd_title" value="${safeVal(rd.title || "The Honest Reform Deck")}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="rd_desc" rows="2">${safeVal(rd.desc || "Words alone are not enough. Flip each card to inspect the apology, true accountability, and actionable promise.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(243,232,255,0.6), rgba(255,255,255,0.9)); border: 1px dashed #a855f7;">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Interactive 3D Flip Testing</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Trigger 3D card deck flips and sound effects in the live preview:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTestFlipAll" class="btn-builder-action" style="background: #9333ea; color: white;">🔄 Flip All Cards</button>
          <button type="button" id="btnTestResetFlips" class="btn-subtle" style="font-size: 0.78rem;">↩️ Reset to Front</button>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎴 Reform Cards (${cards.length})</span>
        </div>
        <div id="reformCardsContainer">${cardsHtml}</div>
        <button type="button" id="btnAddReformCard" class="btn-add-item" style="margin-top: 10px;">➕ Add Reform Card</button>
      </div>
    `;

    const syncRdHeaders = () => {
      rd.tag = document.getElementById("rd_tag").value.trim();
      rd.title = document.getElementById("rd_title").value.trim();
      rd.desc = document.getElementById("rd_desc").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    ["rd_tag", "rd_title", "rd_desc"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", syncRdHeaders);
    });

    document.querySelectorAll("#reformCardsContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      const iconInp = card.querySelector(".card-icon-input");
      const titleInp = card.querySelector(".card-title-input");
      const apologyInp = card.querySelector(".card-apology-input");
      const accInp = card.querySelector(".card-accountability-input");
      const comInp = card.querySelector(".card-commitment-input");

      const updateCard = () => {
        cards[idx].icon = iconInp.value;
        cards[idx].frontTitle = titleInp.value;
        cards[idx].apology = apologyInp.value;
        cards[idx].accountability = accInp.value;
        cards[idx].commitment = comInp.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };

      [iconInp, titleInp, apologyInp, accInp, comInp].forEach(inp => {
        if (inp) inp.addEventListener("input", updateCard);
      });

      const remBtn = card.querySelector(`[data-remove-card="${idx}"]`);
      if (remBtn) {
        remBtn.onclick = () => {
          cards.splice(idx, 1);
          renderWidgetInspector("reform_deck");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
    });

    document.querySelectorAll("[data-move-card]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveCard, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < cards.length) {
          const [moved] = cards.splice(idx, 1);
          cards.splice(target, 0, moved);
          renderWidgetInspector("reform_deck");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    const btnAddCard = document.getElementById("btnAddReformCard");
    if (btnAddCard) {
      btnAddCard.onclick = () => {
        cards.push({
          frontTitle: "New Growth Commitment",
          icon: "🌱",
          apology: "I apologize for any moments of insensitivity.",
          accountability: "I take full responsibility and learn from every mistake.",
          commitment: "I commit to proactive care and gentle understanding always."
        });
        renderWidgetInspector("reform_deck");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    }

    // Testing triggers
    const btnFlipAll = document.getElementById("btnTestFlipAll");
    if (btnFlipAll) {
      btnFlipAll.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "REFORM_FLIP_ALL" }, "*");
          try { previewIframe.contentWindow.reformFlipAll?.(); } catch (e) {}
        }
      };
    }

    const btnResetFlips = document.getElementById("btnTestResetFlips");
    if (btnResetFlips) {
      btnResetFlips.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "REFORM_RESET_FLIPS" }, "*");
          try { previewIframe.contentWindow.reformResetFlips?.(); } catch (e) {}
        }
      };
    }
  };
})();
