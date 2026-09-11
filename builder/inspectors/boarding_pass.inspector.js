/**
 * Builder Inspector Module: boarding_pass
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["boarding_pass"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!state.sectionsData.boarding_pass || typeof state.sectionsData.boarding_pass !== "object") {
        state.sectionsData.boarding_pass = {};
      }
      const bp = state.sectionsData.boarding_pass;
      if (!bp.tag) bp.tag = "✈️ Where Are We Flying Next?";
      if (!bp.title) bp.title = "Our Next Dream Adventure & Boarding Pass 🌍💍";
      if (!bp.desc) bp.desc = "Pick your dream destination below to generate your official First Class Boarding Pass!";
      if (!bp.selectorLabel) bp.selectorLabel = "Select Our Next Dream Escape:";
      if (!bp.customPlaceholder) bp.customPlaceholder = "Or type any other dream city in the world (e.g. Paris, Iceland, Turkey)...";
      if (!bp.airline) bp.airline = "INFINITE LOF AIRWAYS";
      if (!bp.flightClass) bp.flightClass = "FIRST CLASS VIP 💕";
      if (!bp.flightNumber) bp.flightNumber = "LOF-999";
      if (!bp.seat) bp.seat = "1A (Beside Me Forever)";
      if (!bp.departureCode) bp.departureCode = "ALG / CGK";
      if (!bp.departureName) bp.departureName = "Algiers & Jakarta";
      if (!bp.durationTag) bp.durationTag = "NON-STOP LOF";
      if (!bp.status) bp.status = "RESERVED FOR TWO 🎟️✨";
      if (!bp.claimBtnText) bp.claimBtnText = "✈️ Lock In & Confirm Flight Wish! 💖";
      if (!bp.downloadBtnText) bp.downloadBtnText = "📥 Save Ticket (PNG) 🎟️";
      if (!bp.whatsAppBtnText) bp.whatsAppBtnText = "📲 Send Wish on WhatsApp 💬";
      if (!bp.confirmedNotice) bp.confirmedNotice = "🎉 Trip Wish Officially Stamped! Pack your bags baby, our next adventure is waiting! ✈️💖";

      if (!Array.isArray(bp.destinations) || bp.destinations.length === 0) {
        bp.destinations = [
          { name: "Japan", code: "TYO", title: "Japan 🇯🇵 (Tokyo & Kyoto Cherry Blossom Date)", quote: "Walking under pink cherry blossoms in Kyoto & eating authentic ramen in Tokyo together!", label: "🌸 Japan (TYO)" },
          { name: "Turkey", code: "IST", title: "Turkey 🇹🇷 (Istanbul Bosphorus & Cappadocia)", quote: "Hot air balloons floating over Cappadocia at sunrise & sunset cruises across the Bosphorus in Istanbul!", label: "🇹🇷 Turkey (IST)" },
          { name: "Azerbaijan", code: "GYD", title: "Azerbaijan 🇦🇿 (Baku Caspian & Flame Towers)", quote: "Walking along the sparkling Baku Caspian boulevard, glowing Flame Towers at night, and authentic tea together!", label: "🇦🇿 Azerbaijan (GYD)" },
          { name: "Algeria", code: "ALG", title: "Algeria 🇩🇿 (Algiers Mediterranean Coast & Home Welcome)", quote: "Showing you my home country, Mediterranean beaches, and the most delicious family welcome feast!", label: "🇩🇿 Algeria (ALG)" },
          { name: "Switzerland", code: "ZRH", title: "Switzerland 🇨🇭 (Alpine Peaks & Glacier Express Train)", quote: "Cozy alpine chalets, snowy mountains, and scenic panoramic trains across the Swiss Alps!", label: "🏔️ Switzerland (ZRH)" },
          { name: "Maldives", code: "MLE", title: "Maldives 🇲🇻 (Overwater Bungalow Sunset Villa)", quote: "Clear turquoise water right beneath our private bungalow, romantic sunset dinners on the beach!", label: "🏝️ Maldives (MLE)" },
          { name: "China", code: "CAN", title: "China 🇨🇳 (Guangzhou Reunion & Canton Tower Lights)", quote: "Back to where our story started: Canton Tower night walks, shared bike sprints, and endless halal buffet!", label: "🇨🇳 China (CAN)" },
          { name: "Bali", code: "DPS", title: "Bali 🌴 (Back to Our Favorite Beaches & Sunsets)", quote: "Fresh coconuts, warm ocean breeze, and watching the golden sunset hold hands along the sand!", label: "🌴 Bali (DPS)" }
        ];
      }

      let destsHtml = "";
      bp.destinations.forEach((d, idx) => {
        destsHtml += `
          <div class="item-editor-card" data-idx="${idx}">
            <div class="item-editor-header">
              <span class="item-editor-title">✈️ Destination #${idx + 1} (${d.code || 'VIP'})</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn-subtle" data-move-dest="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
                <button type="button" class="btn-subtle" data-move-dest="${idx}" data-dir="1" title="Move later" ${idx === bp.destinations.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
                <button type="button" class="btn-remove-item" data-remove-dest="${idx}">🗑️</button>
              </div>
            </div>
            <div class="grid-3">
              <div class="input-group">
                <label>Country / Place</label>
                <input type="text" class="dest-name-input" value="${safeVal(d.name || '')}">
              </div>
              <div class="input-group">
                <label>3-Letter Code</label>
                <input type="text" class="dest-code-input" value="${safeVal(d.code || 'VIP')}">
              </div>
              <div class="input-group">
                <label>Chip Button Label</label>
                <input type="text" class="dest-label-input" value="${safeVal(d.label || '')}" placeholder="e.g. 🌸 Japan (TYO)">
              </div>
            </div>
            <div class="input-group">
              <label>Full Display Title</label>
              <input type="text" class="dest-title-input" value="${safeVal(d.title || '')}">
            </div>
            <div class="input-group">
              <label>Dream Quote / Travel Wish</label>
              <textarea class="dest-quote-input" rows="2">${safeVal(d.quote || '')}</textarea>
            </div>
          </div>
        `;
      });

      inspectorFormContainer.innerHTML = `
        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">✈️ Section Heading & Instructions</span>
          </div>
          <div class="input-group">
            <label>Section Tag</label>
            <input type="text" id="bp_tag" value="${safeVal(bp.tag)}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="bp_title" value="${safeVal(bp.title)}">
          </div>
          <div class="input-group">
            <label>Section Description</label>
            <textarea id="bp_desc" rows="2">${safeVal(bp.desc)}</textarea>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Selector Label</label>
              <input type="text" id="bp_selectorLabel" value="${safeVal(bp.selectorLabel)}">
            </div>
            <div class="input-group">
              <label>Custom Destination Placeholder</label>
              <input type="text" id="bp_customPlaceholder" value="${safeVal(bp.customPlaceholder)}">
            </div>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎫 First-Class Ticket Branding</span>
          </div>
          <div class="grid-3">
            <div class="input-group">
              <label>Airline Brand</label>
              <input type="text" id="bp_airline" value="${safeVal(bp.airline)}">
            </div>
            <div class="input-group">
              <label>Flight Class Badge</label>
              <input type="text" id="bp_flightClass" value="${safeVal(bp.flightClass)}">
            </div>
            <div class="input-group">
              <label>Flight No</label>
              <input type="text" id="bp_flight" value="${safeVal(bp.flightNumber)}">
            </div>
          </div>
          <div class="grid-3">
            <div class="input-group">
              <label>Departure Code</label>
              <input type="text" id="bp_departureCode" value="${safeVal(bp.departureCode)}">
            </div>
            <div class="input-group">
              <label>Departure Name</label>
              <input type="text" id="bp_departureName" value="${safeVal(bp.departureName)}">
            </div>
            <div class="input-group">
              <label>Duration Tag</label>
              <input type="text" id="bp_durationTag" value="${safeVal(bp.durationTag)}">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>VIP Seat</label>
              <input type="text" id="bp_seat" value="${safeVal(bp.seat)}">
            </div>
            <div class="input-group">
              <label>Status Badge</label>
              <input type="text" id="bp_status" value="${safeVal(bp.status)}">
            </div>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">💬 Action Buttons & WhatsApp</span>
          </div>
          <div class="grid-3">
            <div class="input-group">
              <label>Confirm Button</label>
              <input type="text" id="bp_claimBtnText" value="${safeVal(bp.claimBtnText)}">
            </div>
            <div class="input-group">
              <label>Download Ticket Button</label>
              <input type="text" id="bp_downloadBtnText" value="${safeVal(bp.downloadBtnText)}">
            </div>
            <div class="input-group">
              <label>WhatsApp Button</label>
              <input type="text" id="bp_whatsAppBtnText" value="${safeVal(bp.whatsAppBtnText)}">
            </div>
          </div>
          <div class="input-group">
            <label>Confirmed Stamped Notice</label>
            <input type="text" id="bp_confirmedNotice" value="${safeVal(bp.confirmedNotice)}">
          </div>
        </div>

        <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(255,240,245,0.8), rgba(255,255,255,0.9)); border: 1px dashed var(--primary);">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🛫 Live Interactive Test Controls</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test flight wish booking & ticket generation inside live preview:</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btnBpClaimWish" class="btn-subtle" style="font-size: 0.78rem;">✈️ Confirm Flight Wish</button>
            <button type="button" id="btnBpDownloadTicket" class="btn-subtle" style="font-size: 0.78rem;">📥 Save Ticket PNG</button>
            <button type="button" id="btnBpResetWish" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset Wish State</button>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🌍 Dream Destinations (${bp.destinations.length})</span>
          </div>
          <div id="bpDestsList">${destsHtml}</div>
          <button type="button" id="btnAddDest" class="btn-add-item" style="margin-top: 10px;">➕ Add Dream Destination Chip</button>
        </div>
      `;

      // Header bindings
      document.getElementById("bp_tag").oninput = (e) => { bp.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_title").oninput = (e) => { bp.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_desc").oninput = (e) => { bp.desc = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_selectorLabel").oninput = (e) => { bp.selectorLabel = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_customPlaceholder").oninput = (e) => { bp.customPlaceholder = e.target.value; debouncedLiveUpdate(); };

      // Branding bindings
      document.getElementById("bp_airline").oninput = (e) => { bp.airline = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_flightClass").oninput = (e) => { bp.flightClass = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_flight").oninput = (e) => { bp.flightNumber = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_seat").oninput = (e) => { bp.seat = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_departureCode").oninput = (e) => { bp.departureCode = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_departureName").oninput = (e) => { bp.departureName = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_durationTag").oninput = (e) => { bp.durationTag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_status").oninput = (e) => { bp.status = e.target.value; debouncedLiveUpdate(); };

      // Buttons bindings
      document.getElementById("bp_claimBtnText").oninput = (e) => { bp.claimBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_downloadBtnText").oninput = (e) => { bp.downloadBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_whatsAppBtnText").oninput = (e) => { bp.whatsAppBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("bp_confirmedNotice").oninput = (e) => { bp.confirmedNotice = e.target.value; debouncedLiveUpdate(); };

      // Live test controls
      document.getElementById("btnBpClaimWish").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "BP_CLAIM_WISH" }, "*");
        }
      };
      document.getElementById("btnBpDownloadTicket").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "BP_DOWNLOAD_TICKET" }, "*");
        }
      };
      document.getElementById("btnBpResetWish").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "BP_RESET_WISH" }, "*");
        }
      };

      // Item bindings
      document.querySelectorAll("#bpDestsList .item-editor-card").forEach(card => {
        const idx = parseInt(card.dataset.idx, 10);
        card.querySelector(".dest-name-input").oninput = (e) => { bp.destinations[idx].name = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".dest-code-input").oninput = (e) => { bp.destinations[idx].code = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".dest-label-input").oninput = (e) => { bp.destinations[idx].label = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".dest-title-input").oninput = (e) => { bp.destinations[idx].title = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".dest-quote-input").oninput = (e) => { bp.destinations[idx].quote = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(`[data-remove-dest="${idx}"]`).onclick = () => {
          bp.destinations.splice(idx, 1);
          renderWidgetInspector("boarding_pass");
          debouncedLiveUpdate();
        };
      });

      // Move controls
      document.querySelectorAll("[data-move-dest]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.moveDest, 10);
          const dir = parseInt(btn.dataset.dir, 10);
          const target = idx + dir;
          if (target >= 0 && target < bp.destinations.length) {
            const [moved] = bp.destinations.splice(idx, 1);
            bp.destinations.splice(target, 0, moved);
            renderWidgetInspector("boarding_pass");
            debouncedLiveUpdate();
          }
        };
      });

      document.getElementById("btnAddDest").onclick = () => {
        bp.destinations.push({
          name: "Paris",
          code: "CDG",
          label: "🗼 Paris (CDG)",
          title: "France 🇫🇷 (Paris Romance Date)",
          quote: "Walking under the Eiffel Tower lights and sharing warm croissants together!"
        });
        renderWidgetInspector("boarding_pass");
        debouncedLiveUpdate();
      };
  };
})();
