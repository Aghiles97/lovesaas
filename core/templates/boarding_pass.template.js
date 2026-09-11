/**
 * Template Renderer: boarding_pass
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
    const tag = data.tag || "✈️ Where Are We Flying Next?";
    const title = data.title || "Our Next Dream Adventure & Boarding Pass 🌍💍";
    const desc = data.desc || "Pick your dream destination below to generate your official First Class Boarding Pass!";
    const selectorLabel = data.selectorLabel || "Select Our Next Dream Escape:";
    const customPlaceholder = data.customPlaceholder || "Or type any other dream city in the world (e.g. Paris, Iceland, Turkey)...";
    const airline = data.airline || "INFINITE LOF AIRWAYS";
    const flightClass = data.flightClass || "FIRST CLASS VIP 💕";
    const departureCode = data.departureCode || "ALG / CGK";
    const departureName = data.departureName || "Algiers & Jakarta";
    const durationTag = data.durationTag || "NON-STOP LOF";
    const partnerName = rootData.partner2 || data.passengerName || "Ella";
    const seat = data.seat || "1A (Beside Me Forever)";
    const flightNumber = data.flightNumber || "LOF-999";
    const status = data.status || "RESERVED FOR TWO 🎟️✨";
    const barcode = data.barcode || "ETKT 999 2847 1928 4032 0 • FIRST CLASS VIP";
    const claimBtnText = data.claimBtnText || "✈️ Lock In & Confirm Flight Wish! 💖";
    const downloadBtnText = data.downloadBtnText || "📥 Save Ticket (PNG) 🎟️";
    const whatsAppBtnText = data.whatsAppBtnText || "📲 Send Wish on WhatsApp 💬";
    const confirmedNotice = data.confirmedNotice || "🎉 Trip Wish Officially Stamped! Pack your bags baby, our next adventure is waiting! ✈️💖";

    const defaultDests = [
      { name: "Japan", code: "TYO", title: "Japan 🇯🇵 (Tokyo & Kyoto Cherry Blossom Date)", quote: "Walking under pink cherry blossoms in Kyoto & eating authentic ramen in Tokyo together!", label: "🌸 Japan (TYO)" },
      { name: "Turkey", code: "IST", title: "Turkey 🇹🇷 (Istanbul Bosphorus & Cappadocia)", quote: "Hot air balloons floating over Cappadocia at sunrise & sunset cruises across the Bosphorus in Istanbul!", label: "🇹🇷 Turkey (IST)" },
      { name: "Azerbaijan", code: "GYD", title: "Azerbaijan 🇦🇿 (Baku Caspian & Flame Towers)", quote: "Walking along the sparkling Baku Caspian boulevard, glowing Flame Towers at night, and authentic tea together!", label: "🇦🇿 Azerbaijan (GYD)" },
      { name: "Algeria", code: "ALG", title: "Algeria 🇩🇿 (Algiers Mediterranean Coast & Home Welcome)", quote: "Showing you my home country, Mediterranean beaches, and the most delicious family welcome feast!", label: "🇩🇿 Algeria (ALG)" },
      { name: "Switzerland", code: "ZRH", title: "Switzerland 🇨🇭 (Alpine Peaks & Glacier Express Train)", quote: "Cozy alpine chalets, snowy mountains, and scenic panoramic trains across the Swiss Alps!", label: "🏔️ Switzerland (ZRH)" },
      { name: "Maldives", code: "MLE", title: "Maldives 🇲🇻 (Overwater Bungalow Sunset Villa)", quote: "Clear turquoise water right beneath our private bungalow, romantic sunset dinners on the beach!", label: "🏝️ Maldives (MLE)" },
      { name: "China", code: "CAN", title: "China 🇨🇳 (Guangzhou Reunion & Canton Tower Lights)", quote: "Back to where our story started: Canton Tower night walks, shared bike sprints, and endless halal buffet!", label: "🇨🇳 China (CAN)" },
      { name: "Bali", code: "DPS", title: "Bali 🌴 (Back to Our Favorite Beaches & Sunsets)", quote: "Fresh coconuts, warm ocean breeze, and watching the golden sunset hold hands along the sand!", label: "🌴 Bali (DPS)" }
    ];

    const destList = (Array.isArray(data.destinations) && data.destinations.length > 0) ? data.destinations : defaultDests;
    const initialDest = destList[0] || defaultDests[0];

    const chipsHtml = destList.map((d, i) => {
      const activeClass = i === 0 ? " active selected" : "";
      const chipLabel = d.label || `${d.name} (${d.code || 'VIP'})`;
      return `<button type="button" class="dest-chip${activeClass}" data-dest="${d.name || ''}" data-code="${d.code || 'VIP'}" data-title="${d.title || d.name || ''}" data-quote="${d.quote || ''}">${chipLabel}</button>`;
    }).join("\n                ");

    return `
    <section class="section mystery-gift-section" id="nextAdventureSection">
      <div class="container">
        <div class="mystery-gift-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${tag}</span>
            <h2 class="section-title">${title}</h2>
            <p class="section-desc">${desc}</p>
          </div>

          <div class="trip-generator-container">
            <!-- Destination Selection Chips -->
            <div class="dest-selector-bar">
              <label class="dest-label-text">${selectorLabel}</label>
              <div class="destination-chips-grid" id="destChipsGrid">
                ${chipsHtml}
              </div>

              <div class="custom-dest-input-wrap">
                <input type="text" id="customDestInput" class="custom-dest-input" placeholder="${customPlaceholder}" />
              </div>
            </div>

            <!-- Embedded First-Class Boarding Pass Live Preview -->
            <div class="live-ticket-wrap">
              <div class="boarding-pass-card glass-panel" id="embeddedBoardingPass">
                <div class="boarding-pass-header">
                  <div class="airline-brand">
                    <span class="plane-icon-flight">✈️</span>
                    <span class="airline-name">${airline}</span>
                  </div>
                  <div class="flight-class-badge">${flightClass}</div>
                </div>

                <div class="boarding-pass-body">
                  <div class="ticket-route-row">
                    <div class="airport-code-box">
                      <span class="airport-code">${departureCode}</span>
                      <span class="airport-name">${departureName}</span>
                    </div>
                    <div class="flight-arrow-path">
                      <span class="flight-duration-tag">${durationTag}</span>
                    </div>
                    <div class="airport-code-box">
                      <span class="airport-code" id="ticketDestCode">${initialDest.code || "TYO"}</span>
                      <span class="airport-name" id="ticketDestName">${initialDest.title || initialDest.name || "Japan 🇯🇵 (Tokyo & Kyoto)"}</span>
                    </div>
                  </div>

                  <div class="ticket-details-grid">
                    <div class="ticket-col">
                      <span class="t-label">PASSENGER</span>
                      <strong class="t-val partner-name-display">${partnerName}</strong>
                    </div>
                    <div class="ticket-col">
                      <span class="t-label">SEAT</span>
                      <strong class="t-val highlight-gold" id="ticketSeatVal">${seat}</strong>
                    </div>
                    <div class="ticket-col">
                      <span class="t-label">FLIGHT</span>
                      <strong class="t-val" id="ticketFlightVal">${flightNumber}</strong>
                    </div>
                    <div class="ticket-col">
                      <span class="t-label">STATUS</span>
                      <strong class="t-val status-confirmed" id="ticketStatusVal">${status}</strong>
                    </div>
                  </div>

                  <div class="ticket-note-box">
                    <span id="ticketQuoteText">💌 <em>"${initialDest.quote || ''}"</em></span>
                  </div>

                  <!-- Realistic Flight Ticket Barcode -->
                  <div class="ticket-barcode-wrap" title="VIP Boarding Barcode">
                    <div class="ticket-barcode"></div>
                    <span class="barcode-number">${barcode}</span>
                  </div>
                </div>

                <div class="boarding-pass-actions">
                  <button id="claimGiftBtn" class="btn btn-primary btn-pulse" type="button">
                    <span>${claimBtnText}</span>
                  </button>
                  <button id="downloadTicketBtn" class="btn btn-outline" type="button" title="Save ticket image to camera roll">
                    <span>${downloadBtnText}</span>
                  </button>
                  <a id="shareTripWhatsAppBtn" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                    <span>${whatsAppBtnText}</span>
                  </a>
                </div>

                <div id="tripConfirmedNotice" class="trip-confirmed-notice hidden">
                  <span>${confirmedNotice}</span>
                </div>
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
    window.WIDGET_TEMPLATES["boarding_pass"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
