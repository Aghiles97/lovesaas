(function() {
  if (typeof escapeHtml !== "function") {
    const esc = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const tag = data.tag || "Our Love Timeline 🚀";
    const title = data.title || "Milestone Odyssey";
    const desc = data.desc || "Charting the monumental checkpoints of our universe from the first hello to forever.";

    const defaultMilestones = [
      { id: "mo1", date: "June 18, 2021", title: "The First Hello", location: "Little Paris Bistro", icon: "☕", desc: "A two-hour coffee date turned into a six-hour walk through the city lights.", imgUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80" },
      { id: "mo2", date: "October 12, 2021", title: "Official Day One", location: "City Park Lookout", icon: "💍", desc: "Under the autumn stars, we decided to take on the entire world together.", imgUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80" },
      { id: "mo3", date: "August 24, 2022", title: "First Big Flight", location: "Tokyo, Japan", icon: "✈️", desc: "Lost in Shibuya crossing, laughing in ramen shops, our very first international adventure.", imgUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80" },
      { id: "mo4", date: "May 15, 2023", title: "Moving In Together", location: "Our First Apartment", icon: "🔑", desc: "Unpacking endless cardboard boxes, painting the walls, and officially sharing a key.", imgUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
      { id: "mo5", date: "September 14, 2024", title: "The Proposal", location: "Tuscany Sunset Hills", icon: "💖", desc: "Kneeling on the cobblestones as golden hour washed over the vineyards. She said YES!", imgUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80" },
      { id: "mo6", date: "Present Day", title: "The Infinity Chapter", location: "Everywhere With You", icon: "♾️", desc: "Still writing our favorite adventure every single sunrise.", imgUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80" }
    ];

    const milestones = Array.isArray(data.milestones) && data.milestones.length ? data.milestones : defaultMilestones;

    const nodesHtml = milestones.map((m, idx) => `
      <div class="odyssey-node" data-idx="${idx}" data-id="${escapeHtml(m.id || '')}" data-title="${escapeHtml(m.title || '')}" data-date="${escapeHtml(m.date || '')}" data-location="${escapeHtml(m.location || '')}" data-icon="${escapeHtml(m.icon || '📍')}" data-desc="${escapeHtml(m.desc || '')}" data-img="${escapeHtml(m.imgUrl || '')}">
        <div class="odyssey-pin-wrap">
          <div class="odyssey-pin-pulse"></div>
          <div class="odyssey-pin">
            <span class="odyssey-pin-icon">${escapeHtml(m.icon || '📍')}</span>
          </div>
          <span class="odyssey-pin-step">0${idx + 1}</span>
        </div>

        <div class="odyssey-card">
          <div class="odyssey-card-meta">
            <span class="odyssey-date-tag">${escapeHtml(m.date || '')}</span>
            ${m.location ? `<span class="odyssey-loc-badge">📍 ${escapeHtml(m.location)}</span>` : ''}
          </div>
          <h3 class="odyssey-card-title">${escapeHtml(m.title || 'Milestone')}</h3>
          <p class="odyssey-card-snippet">${escapeHtml(m.desc || '')}</p>
          ${m.imgUrl ? `
            <div class="odyssey-card-thumb">
              <img src="${escapeHtml(m.imgUrl)}" alt="${escapeHtml(m.title || 'Milestone')}" loading="lazy" />
            </div>
          ` : ''}
          <div class="odyssey-card-footer">
            <span class="odyssey-card-link">View Story ✦</span>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <section class="section milestone-odyssey-section" id="milestoneOdysseySection">
        <div class="container">
          <div class="milestone-odyssey-box">
            <div class="section-heading">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="odyssey-runway-controls">
              <button type="button" class="btn-odyssey-nav" id="btnOdysseyPrev" title="Scroll Left" aria-label="Previous Milestones">←</button>
              <div class="odyssey-hint-drag">Swipe or Drag Journey ↔</div>
              <button type="button" class="btn-odyssey-nav" id="btnOdysseyNext" title="Scroll Right" aria-label="Next Milestones">→</button>
            </div>

            <div class="odyssey-runway-container" id="odysseyRunwayContainer">
              <div class="odyssey-runway-track" id="odysseyRunwayTrack">
                <svg class="odyssey-svg-canvas" id="odysseySvgCanvas">
                  <path class="odyssey-svg-path" id="odysseySvgPath" d=""></path>
                </svg>
                ${nodesHtml}
              </div>
            </div>

            <!-- Milestone Modal Details Popup -->
            <div class="odyssey-modal-backdrop" id="odysseyModalBackdrop" aria-hidden="true">
              <div class="odyssey-modal-card" id="odysseyModalCard" role="dialog" aria-modal="true">
                <button type="button" class="btn-odyssey-modal-close" id="btnOdysseyModalClose" aria-label="Close">×</button>
                <div class="odyssey-modal-media" id="odysseyModalMedia">
                  <img id="odysseyModalImg" src="" alt="Milestone Image" />
                </div>
                <div class="odyssey-modal-body">
                  <div class="odyssey-modal-header">
                    <span class="odyssey-modal-icon" id="odysseyModalIcon">📍</span>
                    <div>
                      <span class="odyssey-date-tag" id="odysseyModalDate"></span>
                      <span class="odyssey-loc-badge" id="odysseyModalLocation"></span>
                    </div>
                  </div>
                  <h3 class="odyssey-modal-title" id="odysseyModalTitle"></h3>
                  <p class="odyssey-modal-desc" id="odysseyModalDesc"></p>
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
    window.WIDGET_TEMPLATES["milestone_odyssey"] = renderTemplate;
  }
})();
