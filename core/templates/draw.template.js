/**
 * /core/templates/draw.template.js
 * Template for Draw for Two 💕 (Synchronized Couple Drawing Studio)
 */
(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const d = (data && typeof data === "object") ? data : {};
    const p1 = d.partner1 || rootData.partner1 || "Alex";
    const p2 = d.partner2 || rootData.partner2 || "Sam";
    const tag = d.tag || "Draw for Two 💕";
    const title = d.title || "Our Couple Drawing Studio";
    const desc = d.desc || "Sketch, doodle, and poke each other across the distance in our synchronized dual drawing studio.";
    const btnText = d.buttonText || "Open Fullscreen Studio ↗";

    return `
    <section class="section draw-section" id="section-draw" data-widget-id="draw">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag">${esc(tag)}</span>
          <h2 class="section-title">${esc(title)}</h2>
          <p class="section-desc">${esc(desc)}</p>
        </div>

        <div class="draw-showcase-card">
          <!-- Top Info Bar -->
          <div class="draw-showcase-top">
            <div class="draw-showcase-badge">
              <span class="draw-badge-icon">🎨</span>
              <span>Live Dual Drawing Pad</span>
            </div>
            <a href="/draw" target="_blank" class="draw-fullscreen-link" id="btnDrawFullscreenLink" title="Open Draw for Two in fullscreen">
              <span>${esc(btnText)}</span>
            </a>
          </div>

          <!-- Dual Interactive Drawing Pad Preview -->
          <div class="draw-interactive-preview" id="drawWidgetPreviewWrap">
            <!-- Pad 1: You -->
            <div class="draw-mini-pad pad-left">
              <div class="draw-mini-header">
                <span class="draw-mini-tag cute-pink">${esc(p1)}</span>
                <span class="draw-mini-status">Ready ✏️</span>
              </div>
              <div class="draw-mini-canvas-wrap">
                <canvas class="draw-mini-canvas" id="drawWidgetCanvas1" width="280" height="200"></canvas>
                <div class="draw-mini-overlay-art">
                  <span class="draw-mini-doodle doodle-heart">💖</span>
                  <span class="draw-mini-doodle doodle-flower">🌸</span>
                  <span class="draw-mini-caption">"Thinking of you"</span>
                </div>
              </div>
            </div>

            <!-- Heart Connection Connector -->
            <div class="draw-pad-connection">
              <div class="draw-heart-connector">
                <span class="pulse-heart">💕</span>
              </div>
              <span class="draw-connection-text">Synchronized</span>
            </div>

            <!-- Pad 2: Partner -->
            <div class="draw-mini-pad pad-right">
              <div class="draw-mini-header">
                <span class="draw-mini-tag cute-blue">${esc(p2)}</span>
                <span class="draw-mini-status">Ready ✏️</span>
              </div>
              <div class="draw-mini-canvas-wrap">
                <canvas class="draw-mini-canvas" id="drawWidgetCanvas2" width="280" height="200"></canvas>
                <div class="draw-mini-overlay-art">
                  <span class="draw-mini-doodle doodle-star">⭐</span>
                  <span class="draw-mini-doodle doodle-cat">🐱</span>
                  <span class="draw-mini-caption">"Forever &amp; Always"</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Choices (Photobooth/Draw Parity) -->
          <div class="draw-widget-actions-wrap">
            <div class="draw-widget-action-cards" id="drawWidgetInitialView">
              <button type="button" class="draw-menu-card card-start-room" id="btnDrawWidgetStartRoom">
                <div class="menu-card-left">
                  <span class="menu-card-icon">🎨</span>
                  <div class="menu-card-text">
                    <span class="menu-card-title">Start a Room</span>
                    <span class="menu-card-sub">Generate code &amp; invite partner</span>
                  </div>
                </div>
                <span class="menu-card-arrow">→</span>
              </button>

              <button type="button" class="draw-menu-card card-join-room" id="btnDrawWidgetJoinRoom">
                <div class="menu-card-left">
                  <span class="menu-card-icon">💌</span>
                  <div class="menu-card-text">
                    <span class="menu-card-title">Join a Room</span>
                    <span class="menu-card-sub">Enter partner's 5-letter code</span>
                  </div>
                </div>
                <span class="menu-card-arrow">→</span>
              </button>

              <button type="button" class="draw-menu-card card-solo-booth" id="btnDrawWidgetSolo">
                <div class="menu-card-left">
                  <span class="menu-card-icon">✏️</span>
                  <div class="menu-card-text">
                    <span class="menu-card-title">Solo Studio</span>
                    <span class="menu-card-sub">Doodle &amp; practice prompts alone</span>
                  </div>
                </div>
                <span class="menu-card-arrow">→</span>
              </button>
            </div>

            <!-- Inline Join Form -->
            <div class="draw-inline-join-form" id="drawWidgetInlineJoinForm" style="display: none;">
              <div class="draw-join-input-group">
                <input type="text" id="drawWidgetInputJoinCode" class="draw-join-code-input" placeholder="5-LETTER CODE" maxlength="6" autocomplete="off" spellcheck="false" />
                <button type="button" class="btn btn-primary" id="btnDrawWidgetSubmitJoin"><span>Join Studio ▷</span></button>
              </div>
            </div>

            <!-- Waiting Room View in Widget -->
            <div class="draw-widget-waiting-view" id="drawWidgetWaitingView" style="display: none;">
              <div class="draw-waiting-label">Share This Code With Your Partner:</div>
              <div class="draw-code-pill-row">
                <span id="drawWidgetRoomCode" class="draw-code-box">-----</span>
              </div>
              <div class="draw-waiting-actions">
                <button type="button" id="btnDrawWidgetCopyLink" class="btn btn-primary btn-lg">
                  <span>🔗 Copy Invite Link</span>
                </button>
                <a href="/draw" id="btnDrawWidgetLaunchFullscreen" target="_blank" class="btn btn-secondary btn-lg">
                  <span>🚀 Launch Drawing Studio</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Interactive Quick Poke Ribbon -->
          <div class="draw-widget-poke-strip">
            <span class="poke-strip-label">Send a Live Poke:</span>
            <div class="poke-strip-emojis" id="drawWidgetPokeEmojis">
              <button type="button" class="widget-poke-btn" data-emoji="👉" title="Poke">👉</button>
              <button type="button" class="widget-poke-btn" data-emoji="💖" title="Heart">💖</button>
              <button type="button" class="widget-poke-btn" data-emoji="😂" title="Laugh">😂</button>
              <button type="button" class="widget-poke-btn" data-emoji="🌀" title="Dizzy">🌀</button>
              <button type="button" class="widget-poke-btn" data-emoji="💥" title="Boom">💥</button>
              <button type="button" class="widget-poke-btn" data-emoji="⭐" title="Star">⭐</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["draw"] = renderTemplate;
  }
})();
