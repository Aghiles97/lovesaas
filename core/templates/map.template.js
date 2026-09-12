/**
 * Template Renderer: map
 * Modular Decomposed Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    if (typeof window !== "undefined") {
      window.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    } else {
      global.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    }
  }
  if (typeof safeVal !== "function") {
    if (typeof window !== "undefined") {
      window.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    } else {
      global.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    }
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const tag = data.tag || "Our Real World Travels & Cities";
    const title = data.title || "Interactive Story Roadmap & World Map 🗺️";
    const desc = data.desc || "From our 17h Vietnam transit to Bali beaches, Jakarta home days, and all our China city expeditions!";
    const totalKm = data.totalKm || "80,750+ km";
    const totalCountries = data.totalCountries || "3 Countries";
    const totalCities = data.totalCities || "15 Global Cities Visited";
    const earthLaps = data.earthLaps || "2× Around Earth";
    const VEHICLE_MAP = {
      airplane: "✈️",
      flight: "✈️",
      car: "🚗",
      train: "🚆",
      bike: "🚲",
      boat: "🚢",
      walk: "🥾",
      hike: "🥾"
    };

    const renderCustomPins = (region) => {
      if (!Array.isArray(data.destinations)) return "";
      return data.destinations
        .filter(d => d.isCustom && d.region === region && typeof d.x === "number" && typeof d.y === "number")
        .map(d => `
          <g class="map-pin-group custom-map-pin" data-city="${escapeHtml(d.key)}" transform="translate(${d.x}, ${d.y})" cursor="pointer">
            <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
            <circle r="22" fill="rgba(255, 67, 101, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
            <circle r="12" fill="#ff4365" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
            <text y="4" text-anchor="middle" font-size="12" pointer-events="none">${escapeHtml(d.flag || '📍')}</text>
            <text y="24" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">${escapeHtml(d.label)}</text>
          </g>
        `).join("");
    };

    let chipsHtml = "";
    if (Array.isArray(data.destinations) && data.destinations.length > 0) {
      const regionCounters = {};
      chipsHtml = data.destinations.map((d, i) => {
        const vIcon = VEHICLE_MAP[d.vehicle] || d.vehicle || "✈️";
        const journey = d.region || "china";
        const isGlobal = journey === "global";
        const hiddenClass = isGlobal ? "" : "hidden-chip";
        const activeClass = (isGlobal && i === 0) ? "active" : "";
        regionCounters[journey] = (regionCounters[journey] || 0) + 1;
        const stopNum = regionCounters[journey];
        return `<button type="button" class="map-chip-btn ${hiddenClass} ${activeClass}" data-city="${escapeHtml(d.key)}" data-journey="${escapeHtml(journey)}" data-stop="${stopNum}" data-vehicle="${escapeHtml(d.vehicle || 'airplane')}"><span class="chip-vehicle-tag">${vIcon}</span> ${escapeHtml(d.flag || '📍')} ${escapeHtml(d.label)}</button>`;
      }).join("\n              ");
    } else {
      chipsHtml = `
              <!-- Global Stops -->
              <button type="button" class="map-chip-btn active" data-city="algeria" data-journey="global" data-stop="1" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🇩🇿 Algeria</button>
              <button type="button" class="map-chip-btn" data-city="china-base" data-journey="global" data-stop="2" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🇨🇳 1. China</button>
              <button type="button" class="map-chip-btn" data-city="vietnam" data-journey="global" data-stop="3" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🇻🇳 2. Vietnam</button>
              <button type="button" class="map-chip-btn" data-city="indonesia" data-journey="global" data-stop="4" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🇮🇩 3. Indonesia</button>
              <!-- China Stops (Exact 19-Stop Itinerary Order) -->
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="1" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> ⭐ 1. Guangzhou</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="2" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> 🎁 2. Guangzhou</button>
              <button type="button" class="map-chip-btn" data-city="shenzhen" data-journey="china" data-stop="3" data-vehicle="train"><span class="chip-vehicle-tag">🚆</span> 🌆 3. Shenzhen</button>
              <button type="button" class="map-chip-btn" data-city="chongqing" data-journey="china" data-stop="4" data-vehicle="train"><span class="chip-vehicle-tag">🚆</span> 🌶️ 4. Chongqing</button>
              <button type="button" class="map-chip-btn" data-city="chengdu" data-journey="china" data-stop="5" data-vehicle="train"><span class="chip-vehicle-tag">🚆</span> 🐼 5. Chengdu</button>
              <button type="button" class="map-chip-btn" data-city="bipenggou" data-journey="china" data-stop="6" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> ❄️ 6. Bipenggou</button>
              <button type="button" class="map-chip-btn" data-city="dagu" data-journey="china" data-stop="7" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> ❄️ 7. Dagu Glacier</button>
              <button type="button" class="map-chip-btn" data-city="jiuzhaigou" data-journey="china" data-stop="8" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> 🏔️ 8. Jiuzhaigou</button>
              <button type="button" class="map-chip-btn" data-city="huanglong" data-journey="china" data-stop="9" data-vehicle="walk"><span class="chip-vehicle-tag">🥾</span> 🏞️ 9. Huanglong</button>
              <button type="button" class="map-chip-btn" data-city="chengdu" data-journey="china" data-stop="10" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> 🚗 10. Chengdu</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="11" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> ⭐ 11. Guangzhou</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="12" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> ☕ 12. Guangzhou</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="13" data-vehicle="bike"><span class="chip-vehicle-tag">🚲</span> 💍 13. Canton Tower</button>
              <button type="button" class="map-chip-btn" data-city="nansha" data-journey="china" data-stop="14" data-vehicle="car"><span class="chip-vehicle-tag">🚗</span> 🚗 14. Nansha Port</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="15" data-vehicle="walk"><span class="chip-vehicle-tag">🥾</span> 🌸 15. Baiyun Mountain</button>
              <button type="button" class="map-chip-btn" data-city="wuhan" data-journey="china" data-stop="16" data-vehicle="bike"><span class="chip-vehicle-tag">🚲</span> 🌸 16. Wuhan</button>
              <button type="button" class="map-chip-btn" data-city="nanjing" data-journey="china" data-stop="17" data-vehicle="train"><span class="chip-vehicle-tag">🚆</span> 🛕 17. Nanjing</button>
              <button type="button" class="map-chip-btn" data-city="shanghai" data-journey="china" data-stop="18" data-vehicle="train"><span class="chip-vehicle-tag">🚆</span> 🌃 18. Shanghai</button>
              <button type="button" class="map-chip-btn" data-city="guangzhou" data-journey="china" data-stop="19" data-vehicle="airplane" title="Guangzhou (Farewell & Flight Back to Algeria 🇩🇿)"><span class="chip-vehicle-tag">✈️</span> ⭐ 19. Guangzhou (Algeria 🇩🇿)</button>
              <!-- Indonesia Stops -->
              <button type="button" class="map-chip-btn hidden-chip" data-city="bali" data-journey="indonesia" data-stop="1" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🌴 1. Bali</button>
              <button type="button" class="map-chip-btn hidden-chip" data-city="jakarta" data-journey="indonesia" data-stop="2" data-vehicle="airplane"><span class="chip-vehicle-tag">✈️</span> 🏡 2. Jakarta</button>`;
    }

    return `
    <section class="section map-section" id="ldrMapSection">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${tag}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>
        <div class="world-journey-board glass-panel">
          <!-- Simplified & Intuitive Journey Switcher -->
          <div class="map-view-switcher-dual map-view-switcher-tri">
            <button id="mapTabGlobal" class="map-segmented-btn active" type="button">
              <span class="btn-icon">🌍</span>
              <div class="btn-text-wrap">
                <strong>Flight Route</strong>
                <span class="tab-badge">4&nbsp;stops</span>
              </div>
            </button>
            <button id="mapTabChina" class="map-segmented-btn" type="button">
              <span class="btn-icon">🇨🇳</span>
              <div class="btn-text-wrap">
                <strong>China Journey</strong>
                <span class="tab-badge">19&nbsp;stops</span>
              </div>
            </button>
            <button id="mapTabIndonesia" class="map-segmented-btn" type="button">
              <span class="btn-icon">🇮🇩</span>
              <div class="btn-text-wrap">
                <strong>Indonesia</strong>
                <span class="tab-badge">2&nbsp;cities</span>
              </div>
            </button>
          </div>

          <!-- Map Tour Action & Hint Bar -->
          <div class="map-action-sub-bar">
            <span class="map-interactive-hint">✨ Tap any stop or map pin to open memories</span>
            <button id="autoTourBtn" class="btn btn-sm btn-auto-tour" type="button">
              <span>▶️ Auto Tour</span>
            </button>
          </div>

          <!-- Destination Quick-Selection Bar -->
          <div class="map-dest-quick-bar" id="mapQuickBar">
            <div class="quick-chips-scroll" id="quickChipsScroll">
              ${chipsHtml}
            </div>
          </div>

          <!-- Interactive Illustrated Cartoony Map View -->
          <div class="interactive-map-frame" id="mapFrame">
            <!-- 1. Global Flight Map SVG -->
            <div id="viewGlobalMap" class="map-view active">
              <div class="china-love-stats-bar global-love-stats-bar">
                <div class="love-stat-pill clickable-pill" id="globalFlightKmPill" style="cursor: pointer;" title="Click to view total distance breakdown across all our trips!">
                  <span class="stat-icon">✈️</span> <strong>${totalKm}</strong> Total Flown &amp; Traveled
                </div>
                <div class="love-stat-pill"><span class="stat-icon">🌍</span> <strong>${totalCountries}</strong> Hand-in-Hand</div>
                <div class="love-stat-pill global-cities-counter-pill"><span class="stat-icon">🏙️</span> <strong>${totalCities}</strong></div>
                <div class="love-stat-pill" title="Earth's circumference is ~40,075 km — our love has traveled more than twice that distance!"><span class="stat-icon">💫</span> <strong>${earthLaps}</strong> For Love</div>
              </div>
              <div class="cartoony-map-canvas global-svg-canvas">
                <div class="map-overlay-stat-badge left" id="globalKmOverlayBadge" style="cursor: pointer;" title="Click to see full breakdown of our journeys!">
                  <span class="stat-icon">✈️</span>
                  <div class="badge-content">
                    <span class="badge-num">${totalKm} Total Traveled</span>
                    <span class="badge-sub">${earthLaps} For Love 🌍</span>
                  </div>
                </div>
                <div class="map-overlay-stat-badge right" id="globalCitiesOverlayBadge">
                  <span class="stat-icon">🏙️</span>
                  <div class="badge-content">
                    <span class="badge-num">${totalCities}</span>
                    <span class="badge-sub">${totalCountries} • Hand-in-Hand</span>
                  </div>
                </div>
                <svg id="svgGlobalMap" viewBox="0 0 900 480" class="svg-map-art" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#eaf6ff"/>
                      <stop offset="100%" stop-color="#d4ecff"/>
                    </linearGradient>
                    <linearGradient id="flightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#ff758c"/>
                      <stop offset="50%" stop-color="#ff4365"/>
                      <stop offset="100%" stop-color="#ff9a8b"/>
                    </linearGradient>
                  </defs>

                  <!-- Ocean Background -->
                  <rect width="900" height="480" rx="20" fill="url(#oceanGrad)"/>
                  
                  <!-- Cute Clouds in Sky -->
                  <g opacity="0.6" fill="#ffffff">
                    <circle cx="280" cy="70" r="22"/>
                    <circle cx="310" cy="65" r="28"/>
                    <circle cx="340" cy="70" r="20"/>

                    <circle cx="780" cy="120" r="24"/>
                    <circle cx="810" cy="115" r="30"/>
                    <circle cx="840" cy="120" r="22"/>
                  </g>

                  <!-- Cute Continents Silhouettes -->
                  <!-- Africa / Mediterranean -->
                  <path d="M 80,110 Q 140,90 190,130 Q 230,190 200,280 Q 150,330 110,270 Q 70,200 80,110 Z" fill="#ffe9c7" opacity="0.9" stroke="#f1c40f" stroke-width="2.5"/>
                  <!-- Asia & China Mainland -->
                  <path d="M 440,90 Q 560,70 690,100 Q 740,160 710,240 Q 640,260 550,230 Q 470,180 440,90 Z" fill="#ffe2e8" opacity="0.95" stroke="#ff758c" stroke-width="2.5"/>
                  <!-- SE Asia / Vietnam Peninsula -->
                  <path d="M 610,230 Q 640,240 650,290 Q 630,330 610,310 Q 600,270 610,230 Z" fill="#e8f8f5" opacity="0.95" stroke="#2ecc71" stroke-width="2.5"/>
                  <!-- Indonesian Archipelago (Bali & Jakarta) -->
                  <path d="M 570,360 Q 660,350 750,370 Q 780,390 730,400 Q 640,390 570,360 Z" fill="#fcf3cf" opacity="0.95" stroke="#f39c12" stroke-width="2.5"/>

                  <!-- Flight Route Curves -->
                  <!-- Algiers to China -->
                  <path id="routeAlgToChina" d="M 160,150 Q 360,40 590,180" class="flight-path-curve" stroke="url(#flightGrad)" stroke-width="3.5" stroke-dasharray="8 6" fill="none"/>
                  <!-- China to Vietnam (17h Layover) -->
                  <path id="routeChinaToViet" d="M 590,180 Q 620,230 630,280" class="flight-path-curve" stroke="#e67e22" stroke-width="4" stroke-dasharray="6 4" fill="none"/>
                  <!-- Vietnam to Indonesia -->
                  <path id="routeVietToIndo" d="M 630,280 Q 645,330 660,370" class="flight-path-curve" stroke="#27ae60" stroke-width="4" stroke-dasharray="6 4" fill="none"/>

                  <!-- Complete Glide Motion Path for Airplane -->
                  <path id="fullGlobalGlidePath" d="M 160,150 Q 360,40 590,180 Q 620,230 630,280 Q 645,330 660,370" fill="none" stroke="transparent"/>
                  <g class="animated-map-airplane" pointer-events="none">
                    <text font-size="20" y="6" text-anchor="middle">✈️</text>
                    <animateMotion id="globalFlightAnim" dur="18s" repeatCount="indefinite" rotate="auto">
                      <mpath href="#fullGlobalGlidePath"/>
                    </animateMotion>
                  </g>

                  <!-- Mini Landmark Art -->
                  <text x="135" y="130" font-size="16" pointer-events="none">🌴</text>
                  <text x="615" y="160" font-size="16" pointer-events="none">⭐</text>
                  <text x="655" y="270" font-size="16" pointer-events="none">☕</text>
                  <text x="695" y="375" font-size="16" pointer-events="none">🌴</text>
                  <text x="610" y="375" font-size="16" pointer-events="none">🏡</text>

                  <!-- Interactive Pins with Generous Click Targets -->
                  <!-- Algeria -->
                  <g class="map-pin-group" data-city="algeria" transform="translate(160, 150)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(255, 84, 112, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#ff4365" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="12" pointer-events="none">🇩🇿</text>
                    <text y="28" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="12.5" font-weight="bold" fill="#222222" pointer-events="none">Algeria</text>
                    <text y="42" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#e11d48" pointer-events="none">Boy's Origin</text>
                  </g>

                  <!-- China (Main Base) -->
                  <g class="map-pin-group" data-city="china-base" transform="translate(590, 180)" cursor="pointer">
                    <rect x="-55" y="-45" width="110" height="95" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(255, 84, 112, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="14" fill="#ff2d55" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🇨🇳</text>
                    <text y="28" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="12.5" font-weight="bold" fill="#ff2d55" pointer-events="none">China</text>
                    <text y="42" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#e11d48" pointer-events="none">Where We Met</text>
                  </g>

                  <!-- Vietnam (17h Transit Date) -->
                  <g class="map-pin-group" data-city="vietnam" transform="translate(630, 280)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(230, 126, 34, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#e67e22" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="12" pointer-events="none">🇻🇳</text>
                    <text y="30" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="13" font-weight="bold" fill="#222222" pointer-events="none">Vietnam</text>
                  </g>

                  <!-- Indonesia (Bali & Jakarta) -->
                  <g class="map-pin-group" data-city="indonesia" transform="translate(660, 370)" cursor="pointer">
                    <rect x="-55" y="-50" width="110" height="100" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(231, 76, 60, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="14" fill="#e74c3c" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🇮🇩</text>
                    <text y="28" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="12.5" font-weight="bold" fill="#222222" pointer-events="none">Indonesia</text>
                    <text y="42" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#e11d48" pointer-events="none">Girl's Origin</text>
                  </g>
                  ${renderCustomPins('global')}
                </svg>
              </div>
            </div>

            <!-- 2. China Cities & High Alpine Expeditions SVG Map -->
            <div id="viewChinaMap" class="map-view hidden">
              <!-- Love Traveled Together Stats Bar -->
              <div class="china-love-stats-bar">
                <div class="love-stat-pill"><span class="stat-icon">🚄</span> <strong>3,850+ km</strong> Traveled Hand-in-Hand</div>
                <div class="love-stat-pill"><span class="stat-icon">🗻</span> <strong>5,000m</strong> Summit Touched</div>
                <div class="love-stat-pill"><span class="stat-icon">🏙️</span> <strong>12 Cities</strong> Explored Together</div>
                <div class="love-stat-pill"><span class="stat-icon">💋</span> <strong>Infinite</strong> Kisses & Memories</div>
              </div>
              <div class="cartoony-map-canvas china-svg-canvas">
                <svg id="svgChinaMap" viewBox="0 0 900 500" class="svg-map-art" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <!-- Ocean & Land Romantic Gradients -->
                    <linearGradient id="chinaOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#f0f7ff"/>
                      <stop offset="50%" stop-color="#e3f0fc"/>
                      <stop offset="100%" stop-color="#d6e8f8"/>
                    </linearGradient>

                    <linearGradient id="chinaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fffafb"/>
                      <stop offset="35%" stop-color="#fff0f3"/>
                      <stop offset="100%" stop-color="#ffe3ea"/>
                    </linearGradient>

                    <!-- Alpine Glacier Region Gradient (West Sichuan) -->
                    <radialGradient id="glacierRegionGrad" cx="35%" cy="35%" r="60%">
                      <stop offset="0%" stop-color="#d0f4f7" stop-opacity="0.9"/>
                      <stop offset="55%" stop-color="#b2ebf2" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#b2ebf2" stop-opacity="0"/>
                    </radialGradient>

                    <!-- Sichuan Basin Gentle Jade Gradient -->
                    <radialGradient id="sichuanBasinGrad" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stop-color="#d4edda" stop-opacity="0.6"/>
                      <stop offset="60%" stop-color="#e8f8f5" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#ffeef2" stop-opacity="0"/>
                    </radialGradient>

                    <!-- Land Drop Shadow -->
                    <filter id="chinaLandShadow" x="-3%" y="-3%" width="108%" height="108%">
                      <feDropShadow dx="2" dy="6" stdDeviation="8" flood-color="#ff758c" flood-opacity="0.18"/>
                    </filter>
                  </defs>

                  <!-- 1. Soft Ocean Canvas -->
                  <rect width="900" height="500" rx="20" fill="url(#chinaOceanGrad)"/>

                  <!-- Decorative Ocean Waves & Marine Labels -->
                  <g class="map-ocean-details" opacity="0.65" pointer-events="none">
                    <path d="M 760,280 Q 775,274 790,280 T 820,280" fill="none" stroke="#90caf9" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 780,310 Q 795,304 810,310 T 840,310" fill="none" stroke="#90caf9" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 640,442 Q 655,436 670,442 T 700,442" fill="none" stroke="#90caf9" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 720,465 Q 735,459 750,465 T 780,465" fill="none" stroke="#90caf9" stroke-width="1.6" stroke-linecap="round"/>
                    <text x="790" y="355" font-size="10" font-family="'Outfit', sans-serif" font-weight="700" fill="#78909c" letter-spacing="2">EAST CHINA SEA</text>
                    <text x="610" y="475" font-size="10" font-family="'Outfit', sans-serif" font-weight="700" fill="#78909c" letter-spacing="2">SOUTH CHINA SEA</text>
                    <text x="680" y="152" font-size="9" font-family="'Outfit', sans-serif" font-weight="700" fill="#90a4ae" letter-spacing="1">BOHAI BAY</text>
                  </g>

                  <!-- 2. Authentic Recognizable China Mainland Outline (The Rooster) -->
                  <path class="china-mainland-shape" filter="url(#chinaLandShadow)" fill="url(#chinaLandGrad)" stroke="#ffb0c0" stroke-width="2.2" d="
                    M 730,42
                    C 760,30 800,45 825,65
                    C 845,85 840,115 820,135
                    C 800,150 780,145 765,160
                    C 750,170 735,160 720,165
                    C 700,170 690,160 670,160
                    C 660,160 650,150 645,140
                    C 655,135 675,135 690,145
                    C 710,160 725,175 720,185
                    C 710,200 690,200 680,215
                    C 675,225 695,235 725,238
                    C 740,240 740,252 730,260
                    C 720,270 710,265 705,285
                    C 700,305 685,325 675,345
                    C 665,360 645,370 635,385
                    C 620,400 595,420 575,428
                    C 555,432 540,430 525,445
                    C 515,455 500,450 490,440
                    C 475,430 450,430 435,420
                    C 415,410 395,420 375,415
                    C 350,410 330,395 315,385
                    C 295,370 285,350 275,340
                    C 255,335 230,335 205,330
                    C 180,320 150,305 130,285
                    C 105,260 85,240 75,220
                    C 70,200 90,175 110,155
                    C 130,135 155,120 180,105
                    C 205,95 230,95 255,100
                    C 275,105 295,125 315,130
                    C 345,135 375,135 405,145
                    C 435,155 465,140 495,125
                    C 525,115 555,110 585,105
                    C 615,100 645,95 675,85
                    C 700,75 715,55 730,42
                    Z
                  "/>

                  <!-- Iconic Islands -->
                  <!-- Hainan Island -->
                  <path class="china-island" d="M 505,458 C 522,455 532,468 528,482 C 522,492 505,490 495,478 C 490,468 498,460 505,458 Z" fill="url(#chinaLandGrad)" stroke="#ffb0c0" stroke-width="1.8"/>
                  <text x="512" y="475" font-size="8" font-family="'Outfit', sans-serif" font-weight="bold" fill="#e84393" text-anchor="middle" pointer-events="none">Hainan</text>

                  <!-- Taiwan Island -->
                  <path class="china-island" d="M 728,318 C 738,312 748,328 745,348 C 742,365 732,375 722,368 C 715,358 720,330 728,318 Z" fill="url(#chinaLandGrad)" stroke="#ffb0c0" stroke-width="1.8"/>
                  <text x="733" y="347" font-size="8" font-family="'Outfit', sans-serif" font-weight="bold" fill="#e84393" text-anchor="middle" pointer-events="none">Taiwan</text>

                  <!-- 3. Regional Character Atmosphere -->
                  <!-- Alpine Glacier Shading (Western Sichuan & Dagu) -->
                  <ellipse cx="295" cy="195" rx="100" ry="80" fill="url(#glacierRegionGrad)" pointer-events="none"/>
                  <!-- Sichuan Basin Gentle Jade Shading (Chengdu & Chongqing) -->
                  <ellipse cx="385" cy="280" rx="65" ry="45" fill="url(#sichuanBasinGrad)" pointer-events="none"/>



                  <!-- 5. Alpine Snow Peaks & Mountain Crests in West Sichuan -->
                  <g class="map-mountain-peaks" opacity="0.85" pointer-events="none">
                    <polygon points="175,290 195,250 215,290" fill="#e1f5fe" stroke="#81d4fa" stroke-width="1.2"/>
                    <polygon points="190,250 195,250 200,260 190,260" fill="#ffffff"/>

                    <polygon points="215,310 235,265 255,310" fill="#e1f5fe" stroke="#81d4fa" stroke-width="1.2"/>
                    <polygon points="230,265 235,265 240,275 230,275" fill="#ffffff"/>

                    <!-- Dagu Glacier Summit Mountain -->
                    <polygon points="235,215 260,170 285,215" fill="#e0f7fa" stroke="#00b4d8" stroke-width="1.8"/>
                    <polygon points="252,170 260,170 268,185 252,185" fill="#ffffff"/>

                    <!-- Huanglong Mountain Crest -->
                    <polygon points="290,180 310,140 330,180" fill="#e0f7fa" stroke="#16a085" stroke-width="1.5"/>
                    <polygon points="304,140 310,140 316,152 304,152" fill="#ffffff"/>

                    <!-- Jiuzhaigou Snow Peaks -->
                    <polygon points="325,145 345,105 365,145" fill="#e0f7fa" stroke="#0077b6" stroke-width="1.8"/>
                    <polygon points="339,105 345,105 351,118 339,118" fill="#ffffff"/>
                  </g>

                  <!-- 6. Interconnecting Rail Sleepers & Overland Trails -->
                  <g class="crh-rail-sleepers" opacity="0.32" stroke="#999999" stroke-width="6" stroke-dasharray="2 4">
                    <line x1="560" y1="360" x2="625" y2="385"/>
                    <line x1="625" y1="385" x2="420" y2="290"/>
                    <line x1="420" y1="290" x2="350" y2="270"/>
                    <line x1="350" y1="270" x2="305" y2="235"/>
                    <line x1="305" y1="235" x2="260" y2="200"/>
                    <line x1="260" y1="200" x2="340" y2="130"/>
                    <line x1="340" y1="130" x2="310" y2="165"/>
                    <line x1="310" y1="165" x2="350" y2="270"/>
                    <path d="M 350,270 Q 440,395 560,360" fill="none"/>
                    <line x1="560" y1="360" x2="575" y2="415"/>
                    <line x1="560" y1="360" x2="580" y2="280"/>
                    <line x1="580" y1="280" x2="640" y2="235"/>
                    <line x1="640" y1="235" x2="720" y2="240"/>
                    <line x1="720" y1="240" x2="560" y2="360"/>
                  </g>

                  <!-- 7. Glowing Animated Tracks (Exact Sequence) -->
                  <line x1="560" y1="360" x2="625" y2="385" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5"/>
                  <line x1="625" y1="385" x2="420" y2="290" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="3.5" stroke-dasharray="8 5"/>
                  <line x1="420" y1="290" x2="350" y2="270" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5"/>
                  <line x1="350" y1="270" x2="305" y2="235" class="map-route-line alpine-track-route" stroke="#00b4d8" stroke-width="4.5" stroke-dasharray="8 4"/>
                  <line x1="305" y1="235" x2="260" y2="200" class="map-route-line alpine-track-route" stroke="#00b4d8" stroke-width="4.5" stroke-dasharray="8 4"/>
                  <line x1="260" y1="200" x2="340" y2="130" class="map-route-line alpine-track-route" stroke="#00b4d8" stroke-width="4.5" stroke-dasharray="8 4"/>
                  <line x1="340" y1="130" x2="310" y2="165" class="map-route-line alpine-track-route" stroke="#00b4d8" stroke-width="4.5" stroke-dasharray="8 4"/>
                  <line x1="310" y1="165" x2="350" y2="270" class="map-route-line alpine-track-route" stroke="#00b4d8" stroke-width="4.5" stroke-dasharray="8 4"/>
                  <path d="M 350,270 Q 440,395 560,360" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="3.5" stroke-dasharray="8 5" fill="none"/>
                  <line x1="560" y1="360" x2="575" y2="415" class="map-route-line road-trip-route" stroke="#e67e22" stroke-width="4" stroke-dasharray="6 4"/>
                  <line x1="560" y1="360" x2="580" y2="280" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5"/>
                  <line x1="580" y1="280" x2="640" y2="235" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5"/>
                  <line x1="640" y1="235" x2="720" y2="240" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5"/>
                  <line x1="720" y1="240" x2="560" y2="360" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="3.5" stroke-dasharray="8 5"/>

                  <!-- Realism Separation & Reunion Flight Routes -->
                  <!-- Baby flies Chongqing -> Guangzhou by plane -->
                  <path id="cqToGzFlightRoute" d="M 420,290 Q 515,310 560,360" class="map-route-line flight-path-curve" stroke="#ff758c" stroke-width="2.5" stroke-dasharray="6 4" fill="none" opacity="0.85"/>
                  <!-- Baby flies Guangzhou -> Chengdu by plane -->
                  <path id="gzToCdFlightRoute" d="M 560,360 Q 440,380 350,270" class="map-route-line flight-path-curve" stroke="#ff758c" stroke-width="2.5" stroke-dasharray="6 4" fill="none" opacity="0.85"/>

                  <!-- 8. China Love Journey Glider — Animated Couple & Destination-Synced Vehicle -->
                  <path id="chinaTrailHeartPath" d="M 560,360 L 625,385 L 420,290 L 350,270 L 305,235 L 260,200 L 340,130 L 310,165 L 350,270 Q 440,395 560,360 L 575,415 L 560,360 L 580,280 L 640,235 L 720,240 L 560,360 Z" fill="none" stroke="transparent"/>
                  
                  <!-- Together Glider (Guangzhou, Shenzhen, & Post-Chengdu Adventures) -->
                  <g id="chinaTravelersGlider" class="animated-china-travelers" pointer-events="none" transform="translate(560, 360)">
                    <rect x="-24" y="-18" width="48" height="36" rx="18" fill="rgba(255, 255, 255, 0.96)" stroke="#ff4365" stroke-width="2" filter="drop-shadow(0 4px 10px rgba(255, 67, 101, 0.45))"/>
                    <text font-size="13" x="-7" y="-2" text-anchor="middle">👦🏻</text>
                    <text font-size="13" x="7" y="-2" text-anchor="middle">👧🏻</text>
                    <g class="glider-floating-heart">
                      <text font-size="11" x="0" y="-13" text-anchor="middle">💖</text>
                    </g>
                    <text id="chinaTravelerVehicleIcon" font-size="12" x="0" y="12" text-anchor="middle">✈️</text>
                  </g>

                  <!-- Individual Gliders (When Separated at Chongqing -> Guangzhou / Chengdu) -->
                  <!-- Boy (Stays in Chongqing, then train to Chengdu) -->
                  <g id="chinaBoyGlider" class="animated-china-travelers" pointer-events="none" style="display: none;" transform="translate(420, 290)">
                    <rect x="-18" y="-18" width="36" height="36" rx="18" fill="rgba(255, 255, 255, 0.96)" stroke="#00b4d8" stroke-width="2" filter="drop-shadow(0 4px 10px rgba(0, 180, 216, 0.45))"/>
                    <text font-size="13" x="0" y="-2" text-anchor="middle">👦🏻</text>
                    <text id="chinaBoyVehicleIcon" font-size="12" x="0" y="12" text-anchor="middle">⛰️</text>
                  </g>

                  <!-- Girl / Baby (Flies back to Guangzhou, then flies to Chengdu) -->
                  <g id="chinaGirlGlider" class="animated-china-travelers" pointer-events="none" style="display: none;" transform="translate(420, 290)">
                    <rect x="-18" y="-18" width="36" height="36" rx="18" fill="rgba(255, 255, 255, 0.96)" stroke="#ff4365" stroke-width="2" filter="drop-shadow(0 4px 10px rgba(255, 67, 101, 0.45))"/>
                    <text font-size="13" x="0" y="-2" text-anchor="middle">👧🏻</text>
                    <text id="chinaGirlVehicleIcon" font-size="12" x="0" y="12" text-anchor="middle">✈️</text>
                  </g>


                  <!-- 10. Decorative Compass Rose -->
                  <g transform="translate(840, 440)" opacity="0.85" pointer-events="none">
                    <circle r="20" fill="#ffffff" stroke="#ffb6c1" stroke-width="1.5" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <polygon points="0,-15 3.5,-3 0,0 -3.5,-3" fill="#ff4365"/>
                    <polygon points="0,15 3.5,3 0,0 -3.5,3" fill="#ff9ebb"/>
                    <polygon points="-15,0 -3,-3.5 0,0 -3,3.5" fill="#ffb6c1"/>
                    <polygon points="15,0 3,-3.5 0,0 3,3.5" fill="#ffb6c1"/>
                    <circle r="2.5" fill="#ffffff"/>
                    <text y="-17" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" font-weight="bold" fill="#ff2d55">N</text>
                  </g>



                  <!-- 12. City Pins with Large Hitboxes & Glow Rings -->
                  <!-- 1. Guangzhou -->
                  <g class="china-city-pin" data-city="guangzhou" transform="translate(560, 360)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="25" fill="rgba(255, 67, 101, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="14" fill="#ff4365" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">⭐</text>
                    <text x="-18" y="5" text-anchor="end" font-family="'Outfit', sans-serif" font-size="12" font-weight="bold" fill="#ff2d55" pointer-events="none">Guangzhou</text>
                  </g>

                  <!-- 2. Nansha Port -->
                  <g class="china-city-pin" data-city="nansha" transform="translate(575, 415)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="20" fill="rgba(230, 126, 34, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="11" fill="#e67e22" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="11" pointer-events="none">🚗</text>
                    <text y="24" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Nansha Port</text>
                  </g>

                  <!-- 3. Shenzhen -->
                  <g class="china-city-pin" data-city="shenzhen" transform="translate(625, 385)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="20" fill="rgba(52, 152, 219, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="11" fill="#3498db" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="11" pointer-events="none">🌆</text>
                    <text x="18" y="5" text-anchor="start" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Shenzhen</text>
                  </g>

                  <!-- 4. Chongqing -->
                  <g class="china-city-pin" data-city="chongqing" transform="translate(420, 290)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="20" fill="rgba(231, 76, 60, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="11" fill="#e74c3c" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="11" pointer-events="none">🌶️</text>
                    <text y="24" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Chongqing</text>
                  </g>

                  <!-- 5. Shanghai -->
                  <g class="china-city-pin" data-city="shanghai" transform="translate(720, 240)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="20" fill="rgba(155, 89, 182, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="11" fill="#9b59b6" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="11" pointer-events="none">🌃</text>
                    <text x="18" y="5" text-anchor="start" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Shanghai</text>
                  </g>

                  <!-- 6. Wuhan -->
                  <g class="china-city-pin" data-city="wuhan" transform="translate(580, 280)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(255, 107, 129, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#ff6b81" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="12" pointer-events="none">🌸</text>
                    <text x="-16" y="16" text-anchor="end" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Wuhan</text>
                  </g>

                  <!-- 7. Nanjing -->
                  <g class="china-city-pin" data-city="nanjing" transform="translate(640, 235)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(241, 196, 15, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#f39c12" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="12" pointer-events="none">🛕</text>
                    <text x="-16" y="-6" text-anchor="end" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Nanjing</text>
                  </g>

                  <!-- 8. Chengdu -->
                  <g class="china-city-pin" data-city="chengdu" transform="translate(350, 270)" cursor="pointer">
                    <rect x="-40" y="-40" width="80" height="80" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(46, 204, 113, 0.3)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#2ecc71" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="12" pointer-events="none">🐼</text>
                    <text y="25" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#222222" pointer-events="none">Chengdu</text>
                  </g>

                  <!-- Bipenggou -->
                  <g class="china-city-pin" data-city="bipenggou" transform="translate(305, 235)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="22" fill="rgba(0, 180, 216, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#00b4d8" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="4" text-anchor="middle" font-size="12" pointer-events="none">❄️</text>
                    <text x="16" y="14" text-anchor="start" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#0077b6" pointer-events="none">Bipenggou</text>
                  </g>

                  <!-- 9. Dagu Glacier -->
                  <g class="china-city-pin" data-city="dagu" transform="translate(260, 200)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(0, 180, 216, 0.4)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="13" fill="#0077b6" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🗻</text>
                    <text x="-18" y="5" text-anchor="end" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#0077b6" pointer-events="none">Dagu Glacier</text>
                  </g>

                  <!-- 10. Huanglong -->
                  <g class="china-city-pin" data-city="huanglong" transform="translate(310, 165)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="24" fill="rgba(26, 188, 156, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="12" fill="#16a085" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🏞️</text>
                    <text x="18" y="5" text-anchor="start" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#16a085" pointer-events="none">Huanglong</text>
                  </g>

                  <!-- 11. Jiuzhaigou -->
                  <g class="china-city-pin" data-city="jiuzhaigou" transform="translate(340, 130)" cursor="pointer">
                    <rect x="-45" y="-45" width="90" height="90" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(0, 180, 216, 0.4)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="13" fill="#00b4d8" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">❄️</text>
                    <text x="18" y="-3" text-anchor="start" font-family="'Outfit', sans-serif" font-size="11" font-weight="bold" fill="#0077b6" pointer-events="none">Jiuzhaigou</text>
                  </g>
                  ${renderCustomPins('china')}
                </svg>
              </div>
            </div>

            <!-- 3. Indonesia Archipelago (Bali & Jakarta) SVG Map -->
            <div id="viewIndonesiaMap" class="map-view hidden">
              <!-- Indonesia Love Stats Bar -->
              <div class="china-love-stats-bar indonesia-love-stats-bar">
                <div class="love-stat-pill clickable-pill" id="indoFlightKmPill" style="cursor: pointer;" title="Bali to Jakarta Flight: ~980 km direct flight across Indonesian islands">
                  <span class="stat-icon">✈️</span> <strong>980+ km</strong> Bali ➔ Jakarta Flight
                </div>
                <div class="love-stat-pill"><span class="stat-icon">🌴</span> <strong>Tropical Paradise</strong> Bali &amp; Jakarta</div>
                <div class="love-stat-pill"><span class="stat-icon">🛵</span> <strong>Muddy ATV &amp; Waves</strong> Jungle &amp; Waterbom</div>
                <div class="love-stat-pill"><span class="stat-icon">🏡</span> <strong>Family Home</strong> Meeting Lili &amp; Ayung</div>
                <div class="love-stat-pill"><span class="stat-icon">🥊</span> <strong>PS5 Tekken</strong> Infinite Kisses &amp; Cuddles</div>
              </div>
              <div class="cartoony-map-canvas indonesia-svg-canvas">
                <div class="map-overlay-stat-badge right" id="indoKmOverlayBadge" style="cursor: pointer;" title="Bali to Jakarta: 980+ km flight hand-in-hand">
                  <span class="stat-icon">✈️</span>
                  <div class="badge-content">
                    <span class="badge-num">980+ km Island Flight</span>
                    <span class="badge-sub">Bali (DPS) ➔ Jakarta (CGK)</span>
                  </div>
                </div>
                <svg id="svgIndonesiaMap" viewBox="0 0 900 500" class="svg-map-art" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="indoOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#e3f2fd"/>
                      <stop offset="50%" stop-color="#bbdefb"/>
                      <stop offset="100%" stop-color="#90caf9"/>
                    </linearGradient>
                    <linearGradient id="indoLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fffde7"/>
                      <stop offset="50%" stop-color="#fff9c4"/>
                      <stop offset="100%" stop-color="#ffecb3"/>
                    </linearGradient>
                    <linearGradient id="indoJavaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fff3e0"/>
                      <stop offset="50%" stop-color="#ffe0b2"/>
                      <stop offset="100%" stop-color="#ffcc80"/>
                    </linearGradient>
                    <linearGradient id="indoBaliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#e8f5e9"/>
                      <stop offset="50%" stop-color="#c8e6c9"/>
                      <stop offset="100%" stop-color="#a5d6a7"/>
                    </linearGradient>
                    <filter id="indoLandShadow" x="-3%" y="-3%" width="108%" height="108%">
                      <feDropShadow dx="2" dy="5" stdDeviation="6" flood-color="#f39c12" flood-opacity="0.18"/>
                    </filter>
                  </defs>

                  <!-- Ocean Canvas -->
                  <rect width="900" height="500" rx="20" fill="url(#indoOceanGrad)"/>

                  <!-- Sea Waves & Marine Labels -->
                  <g class="map-ocean-details" opacity="0.65" pointer-events="none">
                    <path d="M 220,170 Q 235,164 250,170 T 280,170" fill="none" stroke="#64b5f6" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 460,150 Q 475,144 490,150 T 520,150" fill="none" stroke="#64b5f6" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 320,440 Q 335,434 350,440 T 380,440" fill="none" stroke="#64b5f6" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 680,440 Q 695,434 710,440 T 740,440" fill="none" stroke="#64b5f6" stroke-width="1.6" stroke-linecap="round"/>
                    <text x="450" y="210" font-size="11" font-family="'Outfit', sans-serif" font-weight="700" fill="#5c6bc0" letter-spacing="3" text-anchor="middle">JAVA SEA</text>
                    <text x="450" y="470" font-size="11" font-family="'Outfit', sans-serif" font-weight="700" fill="#0288d1" letter-spacing="3" text-anchor="middle">INDIAN OCEAN</text>
                    <text x="120" y="70" font-size="10" font-family="'Outfit', sans-serif" font-weight="700" fill="#78909c" letter-spacing="2">SUMATRA</text>
                    <text x="480" y="75" font-size="10" font-family="'Outfit', sans-serif" font-weight="700" fill="#78909c" letter-spacing="2">KALIMANTAN</text>
                    <text x="800" y="140" font-size="10" font-family="'Outfit', sans-serif" font-weight="700" fill="#78909c" letter-spacing="2">SULAWESI</text>
                  </g>

                  <!-- Background Archipelago Silhouettes -->
                  <!-- Sumatra (South-Eastern tip) -->
                  <path d="M 20,40 Q 110,80 150,180 Q 170,230 165,260 Q 140,250 110,210 Q 70,160 20,120 Z" fill="url(#indoLandGrad)" opacity="0.6" stroke="#e0e0e0" stroke-width="1.5"/>
                  <!-- Kalimantan / Borneo (Southern Coast) -->
                  <path d="M 380,50 Q 480,40 590,70 Q 610,120 580,150 Q 510,165 430,155 Q 370,130 380,50 Z" fill="url(#indoLandGrad)" opacity="0.6" stroke="#e0e0e0" stroke-width="1.5"/>
                  <!-- Sulawesi Silhouette -->
                  <path d="M 770,110 Q 820,120 835,165 Q 810,210 770,200 Q 780,240 760,260 Q 740,220 755,180 Z" fill="url(#indoLandGrad)" opacity="0.5" stroke="#e0e0e0" stroke-width="1.5"/>
                  <!-- Lombok & Sumbawa -->
                  <path d="M 770,335 Q 810,325 850,335 Q 840,360 800,355 Q 765,355 770,335 Z" fill="url(#indoLandGrad)" opacity="0.75" stroke="#ffb74d" stroke-width="1.5"/>
                  <text x="810" y="375" font-size="9" font-family="'Outfit', sans-serif" font-weight="bold" fill="#f57c00" text-anchor="middle" pointer-events="none">Lombok</text>

                  <!-- Java Island (Authentic curved landmass) -->
                  <path id="javaIslandPath" filter="url(#indoLandShadow)" fill="url(#indoJavaGrad)" stroke="#ffa726" stroke-width="2.5" d="
                    M 180,270
                    C 210,265 240,270 270,275
                    C 320,285 360,285 410,290
                    C 460,290 510,295 560,305
                    C 600,310 650,315 680,325
                    C 685,340 665,355 640,350
                    C 590,345 540,340 490,335
                    C 440,335 390,330 340,325
                    C 290,325 240,320 200,310
                    C 175,305 165,285 180,270
                    Z
                  "/>

                  <!-- Bali Island (Highlighted tropical jewel) -->
                  <path id="baliIslandPath" filter="url(#indoLandShadow)" fill="url(#indoBaliGrad)" stroke="#66bb6a" stroke-width="2.5" d="
                    M 700,315
                    C 725,305 750,312 755,330
                    C 760,345 745,360 725,365
                    C 710,368 695,355 690,340
                    C 688,328 692,318 700,315
                    Z
                  "/>
                  <!-- Bali Mount Agung / Batur Peak -->
                  <polygon points="720,328 726,318 732,328" fill="#81c784" stroke="#43a047" stroke-width="1.2" pointer-events="none"/>
                  <polygon points="724,318 726,318 728,322 724,322" fill="#ffffff" pointer-events="none"/>

                  <!-- Tropical Island Landmark Icons -->
                  <text x="690" y="305" font-size="20" pointer-events="none">🌴</text>
                  <text x="748" y="365" font-size="16" pointer-events="none">🌊</text>
                  <text x="715" y="380" font-size="14" pointer-events="none">🏄‍♂️</text>
                  <text x="210" y="255" font-size="20" pointer-events="none">🏡</text>
                  <text x="265" y="260" font-size="15" pointer-events="none">🎮</text>
                  <text x="235" y="335" font-size="15" pointer-events="none">🍜</text>

                  <!-- Small Jet Ski Icon near Bali -->
                  <g class="map-jetski-icon" transform="translate(765, 405)" cursor="pointer" title="Jet Skiing across Bali waves with baby! 🚤🌊">
                    <rect x="-18" y="-14" width="46" height="28" fill="transparent"/>
                    <text font-size="16" text-anchor="middle" y="0">🚤</text>
                    <text x="12" y="-1" font-size="10">💦</text>
                    <text y="13" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" fill="#0277bd" letter-spacing="0.3">Jet Ski</text>
                  </g>

                  <!-- Flight Route Curve connecting Bali to Jakarta (Starts at Bali) -->
                  <path id="indoFlightRouteTrack" d="M 720,335 Q 470,210 240,285" class="map-route-line crh-track-route" stroke="#ff4365" stroke-width="4" stroke-dasharray="8 5" fill="none"/>
                  <path d="M 720,335 Q 470,210 240,285" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 6" fill="none" opacity="0.8"/>
                  <g transform="translate(470, 235)" pointer-events="none">
                    <rect x="-44" y="-11" width="88" height="22" rx="11" fill="rgba(255, 255, 255, 0.94)" stroke="#ff4365" stroke-width="1.2" filter="drop-shadow(0 2px 4px rgba(255,67,101,0.25))"/>
                    <text y="4" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="800" fill="#d81b60">✈️ 980 km</text>
                  </g>

                  <!-- Animated Couple Travelers Glider starting from Bali to Jakarta -->
                  <g id="indoTravelersGlider" class="animated-indo-travelers" pointer-events="none" transform="translate(720, 335)">
                    <rect x="-24" y="-18" width="48" height="36" rx="18" fill="rgba(255, 255, 255, 0.96)" stroke="#ff4365" stroke-width="2" filter="drop-shadow(0 4px 10px rgba(255, 67, 101, 0.45))"/>
                    <text font-size="13" x="-7" y="-2" text-anchor="middle">👦🏻</text>
                    <text font-size="13" x="7" y="-2" text-anchor="middle">👧🏻</text>
                    <g class="glider-floating-heart">
                      <text font-size="11" x="0" y="-13" text-anchor="middle">💖</text>
                    </g>
                    <text id="indoTravelerVehicleIcon" font-size="12" x="0" y="12" text-anchor="middle">🌴</text>
                  </g>

                  <!-- Interactive Pins with Generous Hitboxes -->
                  <!-- 1. Jakarta -->
                  <g class="indo-city-pin" data-city="jakarta" transform="translate(240, 285)" cursor="pointer">
                    <rect x="-50" y="-50" width="100" height="100" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(255, 67, 101, 0.35)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="14" fill="#ff4365" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🏡</text>
                    <text y="32" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="13" font-weight="bold" fill="#d81b60" pointer-events="none">Jakarta</text>
                    <text y="45" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="600" fill="#555555" pointer-events="none">Meeting Lili & Ayung • PS5 Tekken</text>
                  </g>

                  <!-- 2. Bali -->
                  <g class="indo-city-pin" data-city="bali" transform="translate(720, 335)" cursor="pointer">
                    <rect x="-50" y="-50" width="100" height="100" fill="transparent" pointer-events="all"/>
                    <circle r="26" fill="rgba(46, 204, 113, 0.4)" class="pin-pulse-ring" pointer-events="none"/>
                    <circle r="14" fill="#27ae60" stroke="#ffffff" stroke-width="3" pointer-events="none"/>
                    <text y="5" text-anchor="middle" font-size="13" pointer-events="none">🌴</text>
                    <text y="32" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="13" font-weight="bold" fill="#1b5e20" pointer-events="none">Bali Island</text>
                    <text y="45" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="600" fill="#555555" pointer-events="none">Villa • Muddy ATV & Waterbom</text>
                  </g>
                  ${renderCustomPins('indonesia')}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["map"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
