/**
 * Builder Inspector Module: spinner
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["spinner"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!state.sectionsData.spinner) state.sectionsData.spinner = {};
      const sp = state.sectionsData.spinner;
      const hero = state.sectionsData.hero || {};
      const p1Def = hero.partner1 || state.partner1 || "Partner 1";

      const defaultFoods = [
        "🍕 Cheesy Local Pizza & Fries Night",
        "🍜 Cozy Indomie / Ramen Battle with Custom Toppings",
        "🌮 Favorite Local Fast Food (Algerian Tacos / Indo Street Eats)",
        "🍝 Cook the Same Pasta Recipe Live on Video",
        "🍔 Late-Night Comfort Burger & Soda",
        "🍳 Breakfast-for-Dinner Video Call (Time-Zone Match)"
      ];
      const defaultActs = [
        "🎬 Synced Movie Night (Teleparty / Discord) & FaceTime Sleep Call",
        "✈️ Planning Our Next Flight Reunion & Hotel Wishlist",
        "🎮 Cozy Online Gaming (Roblox / Plato / Sky / 8 Ball Pool)",
        "🎨 Virtual Drawing / Skribbl.io Doodle Duel",
        "🌌 Late-Night FaceTime Call with Spotify Jam & Lofi",
        "🗺️ Virtual Google Earth Tour of Spots We Want to Visit"
      ];
      const defaultDesserts = [
        "🥞 Warm Crepes or Waffles with Nutella",
        "🍦 Ice Cream Sundae or Local Gelato Treat",
        "🍫 Favorite Chocolate Bar & Hot Cocoa",
        "🍰 Local Patisserie Treat (Cake Slice or Millefeuille)",
        "☕ Fresh Mint Tea / Warm Coffee & Biscuits",
        "🍓 Fresh Fruit Bowl with Melted Chocolate"
      ];

      const foodsStr = (Array.isArray(sp.foods) && sp.foods.length ? sp.foods : defaultFoods).join("\n");
      const actsStr = (Array.isArray(sp.activities) && sp.activities.length ? sp.activities : defaultActs).join("\n");
      const desStr = (Array.isArray(sp.desserts) && sp.desserts.length ? sp.desserts : defaultDesserts).join("\n");

      const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

      inspectorFormContainer.innerHTML = `
        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">📝 Section Header & Subtitle</span>
          </div>
          <div class="input-group">
            <label>Tag / Category Badge</label>
            <input type="text" id="sp_tag" value="${safeVal(sp.tag || "Long Distance & Virtual Dates")}">
          </div>
          <div class="input-group">
            <label>Title</label>
            <input type="text" id="sp_title" value="${safeVal(sp.title || "Long-Distance Date Night Spinner 🎡")}">
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea id="sp_desc" rows="2">${safeVal(sp.desc || "Spin the reels to pick our next virtual date night—bridging our worlds with lof!")}</textarea>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎰 Reels Columns & Labels</span>
          </div>
          <div class="grid-3">
            <div class="input-group">
              <label>Reel #1 Header</label>
              <input type="text" id="sp_reel1Label" value="${safeVal(sp.reel1Label || "🍽️ Virtual Dinner / Food")}">
            </div>
            <div class="input-group">
              <label>Reel #2 Header</label>
              <input type="text" id="sp_reel2Label" value="${safeVal(sp.reel2Label || "🎮 Long-Distance Activity")}">
            </div>
            <div class="input-group">
              <label>Reel #3 Header</label>
              <input type="text" id="sp_reel3Label" value="${safeVal(sp.reel3Label || "🍨 Sweet Treat")}">
            </div>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🍽️ Food Options (one per line)</span>
          </div>
          <div class="input-group">
            <textarea id="sp_foods" rows="5">${foodsStr}</textarea>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎮 Activities (one per line)</span>
          </div>
          <div class="input-group">
            <textarea id="sp_acts" rows="5">${actsStr}</textarea>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🍨 Desserts & Treats (one per line)</span>
          </div>
          <div class="input-group">
            <textarea id="sp_desserts" rows="5">${desStr}</textarea>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">💬 WhatsApp Sharing & Buttons</span>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Partner WhatsApp Number (Digits only)</label>
              <input type="text" id="sp_phone" value="${safeVal(sp.phone || "")}" placeholder="e.g. 213555123456">
            </div>
            <div class="input-group">
              <label>Spin Button Text</label>
              <input type="text" id="sp_spinBtnText" value="${safeVal(sp.spinBtnText || "Spin Date Idea! 🎲")}">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Lock In Button Text</label>
              <input type="text" id="sp_lockBtnText" value="${safeVal(sp.lockBtnText || "Lock In Date & Claim Pass 🎟️")}">
            </div>
            <div class="input-group">
              <label>Share WhatsApp Button Label</label>
              <input type="text" id="sp_shareWhatsAppBtnText" value="${safeVal(sp.shareWhatsAppBtnText || `📲 Send Date to ${p1Def} on WhatsApp 💬`)}">
            </div>
          </div>
          <div class="input-group">
            <label>Date Locked Toast Message</label>
            <input type="text" id="sp_lockAlertText" value="${safeVal(sp.lockAlertText || "It's a date! Screenshot this and send it to me! 💕")}">
          </div>
        </div>

        <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(255,240,245,0.8), rgba(255,255,255,0.9)); border: 1px dashed var(--primary);">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎲 Live Interactive Test Controls</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test spinning reels and locking selection inside live preview window:</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btnSpinnerTestSpin" class="btn-subtle" style="font-size: 0.78rem;">🎰 Spin Reels</button>
            <button type="button" id="btnSpinnerTestLock" class="btn-subtle" style="font-size: 0.78rem;">🎟️ Lock Date & Show WhatsApp</button>
          </div>
        </div>
      `;

      // Header bindings
      document.getElementById("sp_tag").oninput = (e) => { sp.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_title").oninput = (e) => { sp.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_desc").oninput = (e) => { sp.desc = e.target.value; debouncedLiveUpdate(); };

      // Reel label bindings
      document.getElementById("sp_reel1Label").oninput = (e) => { sp.reel1Label = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_reel2Label").oninput = (e) => { sp.reel2Label = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_reel3Label").oninput = (e) => { sp.reel3Label = e.target.value; debouncedLiveUpdate(); };

      // Options list bindings
      document.getElementById("sp_foods").oninput = (e) => {
        sp.foods = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
        debouncedLiveUpdate();
      };
      document.getElementById("sp_acts").oninput = (e) => {
        sp.activities = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
        debouncedLiveUpdate();
      };
      document.getElementById("sp_desserts").oninput = (e) => {
        sp.desserts = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
        debouncedLiveUpdate();
      };

      // WhatsApp and button bindings
      document.getElementById("sp_phone").oninput = (e) => { sp.phone = e.target.value.trim(); debouncedLiveUpdate(); };
      document.getElementById("sp_spinBtnText").oninput = (e) => { sp.spinBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_lockBtnText").oninput = (e) => { sp.lockBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_shareWhatsAppBtnText").oninput = (e) => { sp.shareWhatsAppBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("sp_lockAlertText").oninput = (e) => { sp.lockAlertText = e.target.value; debouncedLiveUpdate(); };

      // Interactive Test Triggers
      const sendSpinnerMsg = (payload) => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(payload, window.location.origin);
        }
      };

      document.getElementById("btnSpinnerTestSpin").onclick = () => sendSpinnerMsg({ type: "SPINNER_SPIN" });
      document.getElementById("btnSpinnerTestLock").onclick = () => sendSpinnerMsg({ type: "SPINNER_LOCK" });
  };
})();
