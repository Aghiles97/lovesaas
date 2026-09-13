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
    const tag = data.tag || "Sanctuary of Peace 🎧";
    const title = data.title || "Comfort & Calming Soundboard";
    const desc = data.desc || ("A dedicated quiet space for " + partner + " to unwind, listen to calming soundscapes, and flip through serene memories.");
    const defaultSounds = [
      { id: "rain", name: "Soft Rainfall", icon: "🌧️", volume: 65 },
      { id: "fireplace", name: "Warm Hearth", icon: "🔥", volume: 50 },
      { id: "waves", name: "Ocean Shoreline", icon: "🌊", volume: 45 },
      { id: "breeze", name: "Night Breeze", icon: "🍃", volume: 35 },
      { id: "coffee", name: "Cozy Cafe", icon: "☕", volume: 30 }
    ];
    const defaultPhotos = [
      {
        url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
        caption: "Golden sunlight drifting through gentle forest leaves 🍃"
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Tidal waves carrying every single worry away into the sea 🌊"
      },
      {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
        caption: "Infinite quiet stars watching over our eternal bond ✨"
      }
    ];

    const sounds = Array.isArray(data.sounds) && data.sounds.length > 0 ? data.sounds : defaultSounds;
    const photos = Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : defaultPhotos;

    let soundsHtml = "";
    for (let i = 0; i < sounds.length; i++) {
      const s = sounds[i] || {};
      const sId = s.id || `snd_${i + 1}`;
      const sName = s.name || `Sound Channel ${i + 1}`;
      const sIcon = s.icon || "🎵";
      const sVol = s.volume != null ? Math.max(0, Math.min(100, Number(s.volume))) : 50;

      soundsHtml += `
        <div class="sound-rack-channel" data-sound-id="${safeVal(sId)}">
          <div class="channel-header">
            <span class="channel-icon">${sIcon}</span>
            <span class="channel-title">${escapeHtml(sName)}</span>
            <button type="button" class="btn-channel-mute" data-sound-id="${safeVal(sId)}" title="Toggle Sound">
              <span class="mute-icon">🔊</span>
            </button>
          </div>
          <div class="channel-controls">
            <input type="range" class="sound-volume-slider" data-sound-id="${safeVal(sId)}" min="0" max="100" value="${sVol}" aria-label="${safeVal(sName)} volume">
            <span class="channel-volume-val">${sVol}%</span>
          </div>
        </div>`;
    }

    let slidesHtml = "";
    let dotsHtml = "";
    for (let j = 0; j < photos.length; j++) {
      const p = photos[j] || {};
      const pUrl = p.url || "";
      const pCap = p.caption || "Peaceful memory";

      slidesHtml += `
        <div class="carousel-slide ${j === 0 ? 'active' : ''}" data-index="${j}">
          <img src="${safeVal(pUrl)}" alt="${safeVal(pCap)}" class="carousel-image" loading="lazy">
          <div class="carousel-caption-bar">
            <p class="carousel-caption-text">${escapeHtml(pCap)}</p>
          </div>
        </div>`;

      dotsHtml += `
        <button type="button" class="carousel-dot ${j === 0 ? 'active' : ''}" data-index="${j}" aria-label="Slide ${j + 1}"></button>`;
    }

    return `
    <section class="section comfort-soundboard-section" id="comfortSoundboardSection">
      <div class="container">
        <div class="soundboard-container glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="soundboard-master-deck">
            <div class="master-playback-cluster">
              <button type="button" class="btn btn-primary soundboard-master-play" id="btnSoundboardMasterPlay">
                <span class="master-play-icon">▶</span>
                <span class="master-play-text">Play Calming Ambience</span>
              </button>
              <button type="button" class="btn btn-outline btn-sm soundboard-master-mute" id="btnSoundboardMasterMute">
                <span>🔇 Mute All</span>
              </button>
            </div>

            <div class="soundboard-visualizer-wrap" id="soundboardEqualizer" aria-hidden="true">
              <span class="eq-bar b1"></span>
              <span class="eq-bar b2"></span>
              <span class="eq-bar b3"></span>
              <span class="eq-bar b4"></span>
              <span class="eq-bar b5"></span>
              <span class="eq-bar b6"></span>
              <span class="eq-bar b7"></span>
            </div>
          </div>

          <div class="soundboard-mixer-rack" id="soundboardMixerRack">
            ${soundsHtml}
          </div>

          <div class="calming-photo-stream">
            <div class="photo-stream-header">
              <span class="stream-title">Serene Memories & Peace 🌿</span>
            </div>
            <div class="stream-carousel-wrapper" id="calmingCarouselWrap">
              <div class="stream-carousel-track" id="calmingCarouselTrack">
                ${slidesHtml}
              </div>
              <button type="button" class="carousel-arrow prev" id="btnCarouselPrev" aria-label="Previous">‹</button>
              <button type="button" class="carousel-arrow next" id="btnCarouselNext" aria-label="Next">›</button>
              <div class="carousel-dots-row" id="calmingCarouselDots">
                ${dotsHtml}
              </div>
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
    window.WIDGET_TEMPLATES["comfort_soundboard"] = renderTemplate;
  }
})();
