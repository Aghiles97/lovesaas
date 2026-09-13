(function() {
  const esc = (str) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
  const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
  const escapeHtml = (typeof window !== "undefined" && window.escapeHtml) || (typeof global !== "undefined" && global.escapeHtml) || esc;
  const safeVal = (typeof window !== "undefined" && window.safeVal) || (typeof global !== "undefined" && global.safeVal) || sv;

  const renderTemplate = (data = {}, rootData = {}) => {
    const p1 = data.party1 || rootData.partner1 || "Aghiles";
    const p2 = data.party2 || rootData.partner2 || rootData.partnerName || "Ella";
    const tag = data.tag || "Diplomatic Accord 🕊️";
    const title = data.title || "Bilateral Peace & Truce Treaty";
    const desc = data.desc || "Review the sacred covenants below. Press and hold the seal to ratify our peace accord.";
    const holdDuration = Math.max(1, Number(data.holdDurationSec) || 3);
    const downloadBtn = data.downloadBtnText || "📜 Download Ratified Treaty PDF";
    const signedDate = data.signedDate || "September 13, 2026";
    const terms = Array.isArray(data.terms) && data.terms.length > 0 ? data.terms : [
      "I promise to listen with an open, non-defensive heart whenever you speak.",
      "I promise immediate hugs, comfort, and soothing reassurance on demand.",
      "I promise never to let anger linger past sundown without reconciliation.",
      "I promise to prioritize our connection, empathy, and love over individual pride."
    ];

    let termsHtml = "";
    for (let i = 0; i < terms.length; i++) {
      termsHtml += `
        <li class="treaty-term-item">
          <label class="term-label">
            <input type="checkbox" class="term-checkbox" checked disabled>
            <span class="term-check-icon">✓</span>
            <span class="term-text">${escapeHtml(terms[i])}</span>
          </label>
        </li>`;
    }

    return `
    <section class="section truce-agreement-section" id="truceAgreementSection">
      <div class="container">
        <div class="truce-treaty-parchment">
          <div class="treaty-ornament-corner top-left">❦</div>
          <div class="treaty-ornament-corner top-right">❦</div>
          <div class="treaty-ornament-corner bottom-left">❦</div>
          <div class="treaty-ornament-corner bottom-right">❦</div>

          <div class="treaty-header">
            <span class="treaty-seal-tag">${escapeHtml(tag)}</span>
            <h2 class="treaty-title">${escapeHtml(title)}</h2>
            <p class="treaty-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="treaty-parties-row">
            <div class="party-box">
              <span class="party-role">Party A</span>
              <strong class="party-name" id="truceParty1">${escapeHtml(p1)}</strong>
            </div>
            <div class="party-seal-symbol">🕊️</div>
            <div class="party-box">
              <span class="party-role">Party B</span>
              <strong class="party-name" id="truceParty2">${escapeHtml(p2)}</strong>
            </div>
          </div>

          <div class="treaty-body">
            <h4 class="treaty-terms-heading">Binding Covenants</h4>
            <ul class="treaty-terms-list" id="truceTermsList">
              ${termsHtml}
            </ul>
          </div>

          <div class="treaty-signature-stage" id="truceSignatureStage">
            <div class="hold-button-wrapper">
              <svg class="hold-progress-ring" viewBox="0 0 120 120" width="120" height="120">
                <circle class="ring-track" cx="60" cy="60" r="52"></circle>
                <circle class="ring-fill" id="truceHoldRingFill" cx="60" cy="60" r="52"></circle>
              </svg>
              <button type="button" class="btn-hold-seal" id="btnHoldToSign" data-hold-sec="${holdDuration}">
                <span class="seal-icon">📜</span>
                <span class="seal-label">Hold to Sign</span>
                <span class="seal-timer">(${holdDuration}s)</span>
              </button>
            </div>

            <div class="treaty-svg-container" id="truceHandshakeContainer">
              <svg class="treaty-handshake-svg" viewBox="0 0 100 80" width="90" height="72">
                <path class="hand-left" d="M10 40 Q30 30 50 40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                <path class="hand-right" d="M90 40 Q70 30 50 40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                <path class="heart-pulse" d="M50 24 C46 16 38 16 38 24 C38 32 50 40 50 40 C50 40 62 32 62 24 C62 16 54 16 50 24 Z" fill="#ff5470"/>
              </svg>
            </div>
          </div>

          <div class="treaty-ratified-state hidden" id="truceCertificateState">
            <div class="ratified-wax-seal">
              <span class="wax-ribbon">⚜️</span>
              <span class="wax-text">RATIFIED & SEALED</span>
              <span class="wax-date" id="truceSignedDate">${escapeHtml(signedDate)}</span>
            </div>
            <div class="treaty-actions">
              <button type="button" class="btn btn-primary" id="btnDownloadTreaty">
                <span>${escapeHtml(downloadBtn)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["truce_agreement"] = renderTemplate;
  }
})();
