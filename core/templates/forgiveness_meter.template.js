(function() {
  const esc = (str) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
  const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
  const escapeHtml = (typeof window !== "undefined" && window.escapeHtml) || (typeof global !== "undefined" && global.escapeHtml) || esc;
  const safeVal = (typeof window !== "undefined" && window.safeVal) || (typeof global !== "undefined" && global.safeVal) || sv;

  const renderTemplate = (data = {}, rootData = {}) => {
    const partner = rootData.partner2 || rootData.partnerName || "Ella";
    const tag = data.tag || "Emotional Barometer 💓";
    const title = data.title || ("Forgiveness Meter for " + partner);
    const desc = data.desc || "Slide to adjust how forgiven I am today. Full forgiveness unlocks a special celebration reward!";
    const minLabel = data.sliderMinLabel || "Furious 😤";
    const midLabel = data.sliderMidLabel || "Slightly Annoyed 🙄";
    const maxLabel = data.sliderMaxLabel || "Truce 🥰";
    const rewardTitle = data.rewardTitle || "Forgiveness Granted! 🎉";
    const rewardMessage = data.rewardMessage || ("Thank you for choosing peace, " + partner + ". I love you endlessly!");
    const rewardBadge = data.rewardBadge || "🌟 Level 100 Peace";
    const rewardBtnText = data.rewardBtnText || "Claim Your Reconciliation Gift 🎁";
    const initialVal = Math.min(100, Math.max(0, Number(data.sliderVal) || 0));

    return `
    <section class="section forgiveness-meter-section" id="forgivenessMeterSection">
      <div class="container">
        <div class="forgiveness-meter-card glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="meter-mood-display">
            <div class="mood-badge" id="meterMoodBadge">
              <span class="mood-emoji" id="forgivenessMoodEmoji">😤</span>
              <span class="mood-text" id="forgivenessMoodLabel">${escapeHtml(minLabel)}</span>
            </div>
            <div class="mood-percentage" id="forgivenessPercentage">${initialVal}%</div>
          </div>

          <div class="meter-slider-container">
            <div class="slider-progress-track">
              <div class="slider-fill-bar" id="forgivenessFillBar" style="width: ${initialVal}%;"></div>
            </div>
            <input type="range" class="forgiveness-range-slider" id="forgivenessSlider" min="0" max="100" value="${initialVal}" step="1" data-min-label="${safeVal(minLabel)}" data-mid-label="${safeVal(midLabel)}" data-max-label="${safeVal(maxLabel)}" aria-label="Forgiveness meter slider">
          </div>

          <div class="meter-scale-markers">
            <div class="marker-point min" data-value="0">
              <span class="marker-pip"></span>
              <span class="marker-label">${escapeHtml(minLabel)}</span>
            </div>
            <div class="marker-point mid" data-value="50">
              <span class="marker-pip"></span>
              <span class="marker-label">${escapeHtml(midLabel)}</span>
            </div>
            <div class="marker-point max" data-value="100">
              <span class="marker-pip"></span>
              <span class="marker-label">${escapeHtml(maxLabel)}</span>
            </div>
          </div>

          <div class="forgiveness-reward-card luxury-gold-foil hidden" id="forgivenessRewardCard">
            <div class="gold-foil-sheen"></div>
            <span class="reward-card-badge">${escapeHtml(rewardBadge)}</span>
            <h3 class="reward-card-title">${escapeHtml(rewardTitle)}</h3>
            <p class="reward-card-text">${escapeHtml(rewardMessage)}</p>
            <div class="reward-card-actions">
              <button type="button" class="btn btn-primary btn-pulse" id="btnClaimForgivenessReward">
                <span>${escapeHtml(rewardBtnText)}</span>
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
    window.WIDGET_TEMPLATES["forgiveness_meter"] = renderTemplate;
  }
})();
