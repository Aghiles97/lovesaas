/**
 * Builder Inspector Module: map
 * Professional, comprehensive editor for interactive love map & destination stories.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  const DEFAULT_DESTINATION_ITEMS = [
    { key: "guangzhou", label: "Guangzhou (Canton Tower)", flag: "⭐", region: "china", vehicle: "airplane", x: 560, y: 360 },
    { key: "shenzhen", label: "Shenzhen (Beach & Ferris Wheel)", flag: "🌆", region: "china", vehicle: "train", x: 625, y: 385 },
    { key: "chongqing", label: "Chongqing (Mountain BBQ & Cats)", flag: "🌶️", region: "china", vehicle: "train", x: 420, y: 290 },
    { key: "chengdu", label: "Chengdu (Panda Sanctuary)", flag: "🐼", region: "china", vehicle: "train", x: 350, y: 270 },
    { key: "bipenggou", label: "Bipenggou (Frozen Alpine Lake)", flag: "❄️", region: "china", vehicle: "car", x: 305, y: 235 },
    { key: "dagu", label: "Dagu Glacier (5,000m Summit)", flag: "🗻", region: "china", vehicle: "car", x: 260, y: 200 },
    { key: "jiuzhaigou", label: "Jiuzhaigou (Turquoise Waters)", flag: "🏔️", region: "china", vehicle: "car", x: 340, y: 130 },
    { key: "huanglong", label: "Huanglong (High Altitude Hike)", flag: "🏞️", region: "china", vehicle: "walk", x: 310, y: 165 },
    { key: "nansha", label: "Nansha Port (Road Trip & EV)", flag: "🚗", region: "china", vehicle: "car", x: 575, y: 415 },
    { key: "wuhan", label: "Wuhan (Ancient Temple & Bikes)", flag: "🌸", region: "china", vehicle: "bike", x: 580, y: 280 },
    { key: "nanjing", label: "Nanjing (Buddha Mountain)", flag: "🛕", region: "china", vehicle: "train", x: 640, y: 235 },
    { key: "shanghai", label: "Shanghai (Turkish Feast & Skyline)", flag: "🌃", region: "china", vehicle: "train", x: 720, y: 240 },
    { key: "algeria", label: "Algeria (Boyfriend's Origin)", flag: "🇩🇿", region: "global", vehicle: "airplane", x: 160, y: 150 },
    { key: "china-base", label: "China Base (Where We Met)", flag: "🇨🇳", region: "global", vehicle: "airplane", x: 590, y: 180 },
    { key: "vietnam", label: "Vietnam (16h Layover)", flag: "🇻🇳", region: "global", vehicle: "airplane", x: 630, y: 280 },
    { key: "indonesia", label: "Indonesia (Girl's Origin)", flag: "🇮🇩", region: "global", vehicle: "airplane", x: 660, y: 370 },
    { key: "bali", label: "Bali (Beaches, Villa & ATV)", flag: "🌴", region: "indonesia", vehicle: "airplane", x: 720, y: 335 },
    { key: "jakarta", label: "Jakarta (Home, Indomie & Tekken)", flag: "🏡", region: "indonesia", vehicle: "airplane", x: 240, y: 285 }
  ];

  const VEHICLE_OPTIONS = [
    { id: "airplane", icon: "✈️", label: "Flight" },
    { id: "car", icon: "🚗", label: "Car" },
    { id: "train", icon: "🚆", label: "Train" },
    { id: "bike", icon: "🚲", label: "Bike" },
    { id: "boat", icon: "🚢", label: "Boat" },
    { id: "walk", icon: "🥾", label: "Walk / Hike" }
  ];

  const EMOJI_PRESETS = ["📍", "⭐", "🗼", "🏖️", "💍", "🌸", "🏔️", "☕", "🌶️", "🐼", "🌴", "🏡", "🌆", "🛕", "🎡", "🌊", "❄️", "🚤", "🎉"];

  const DEFAULT_STORIES = {
    "algeria": { icon: "🇩🇿", symbol: "🇩🇿✈️", tag: "Boyfriend's Origin (Ella Hasn't Visited Yet)", title: "Algeria (Boyfriend's Home)", desc: "Where I come from and count down every single hour until our next flight to see you! Ella hasn't traveled here yet—our next dream trip together awaits!", defaultCaption: "Algiers Mediterranean coast — where I come from & long to bring you 🇩🇿❤️", colorA: "#005c97", colorB: "#363795", vehicle: "airplane" },
    "china-base": { icon: "🇨🇳", symbol: "🇨🇳💖", tag: "Where We Met", title: "China (Where We Met) 🇨🇳", desc: "The fateful country where our eyes first met on September 17. From our Guangzhou base to scenic alpine mountains, traveling together across China was an unforgettable dream.", defaultCaption: "Where our fateful love story first began in China 🇨🇳✨", colorA: "#ff416c", colorB: "#8a2387", vehicle: "airplane" },
    "guangzhou": { icon: "⭐", symbol: "🗼🍲", tag: "Our Favorite City in China", title: "Guangzhou (Canton Tower & Secret 50m Food ⭐)", desc: "Our favorite place facing Canton Tower at night where we spent 7 hours talking non-stop! Sitting by the window watching city traffic, airport orange juice goodbyes, birthday perfume reunion, bike cuddles, sunflower seed proposal, and our secret 50m late-night restaurant!", defaultCaption: "7 hours talking by Canton Tower & sitting by the window watching traffic ❤️🗼", colorA: "#1a1c2e", colorB: "#7b1fa2", vehicle: "airplane" },
    "shenzhen": { icon: "🌆", symbol: "🌆✨", tag: "First Vlog & Ferris Wheel", title: "Shenzhen (3D Sand Heart & Ferris Wheel 🌆)", desc: "Our very first vlogging trip! Sculpting a 3D heart in the beach sand, searching for 420mm pads with the smiling pharmacist, experiencing drone delivery near HK, autonomous driverless cars, and our private Ferris wheel cabin.", defaultCaption: "3D sand heart, drone delivery & private Ferris wheel cabin in Shenzhen 🌆🎡", colorA: "#3a1c71", colorB: "#d76d77", vehicle: "train" },
    "chongqing": { icon: "🌶️", symbol: "🌶️🍲", tag: "Mountain BBQ, Cats & 360° Show", title: "Chongqing (Mountain BBQ, Cats & Skyscraper Ledge 🌶️)", desc: "Cobblestone streets, 10–15 RMB sweet street mangoes, spicy hotpot, open-air mountain BBQ with our friendly Pakistani host and his cats, mind-blowing 360° civil war theater, drone shows, and crazy skyscraper cable walks!", defaultCaption: "Mountain BBQ with cats & mind-blowing 360° civil war show in Chongqing 🌶️🌃", colorA: "#870000", colorB: "#190a05", vehicle: "train" },
    "chengdu": { icon: "🐼", symbol: "🐼🎋", tag: "Pandas & Twin Towers", title: "Chengdu (Panda Butt Ice Cream & 'Slimane & Abdenor' 🐼)", desc: "Visiting the Panda asylum, eating hilarious panda-butt ice cream, bamboo waterfalls, naming the Chengdu Twin Towers 'Slimane and Abdenor', and buying warm winter clothes before our pre-dawn snow expedition.", defaultCaption: "Panda asylum date & 'Slimane & Abdenor' Twin Towers in Chengdu 🐼🎋", colorA: "#11998e", colorB: "#38ef7d", vehicle: "train" },
    "bipenggou": { icon: "❄️", symbol: "❄️⛄", tag: "Frozen Lake & WhatsApp Avatars", title: "Bipenggou (Frozen Lake & Snow Fun ❄️)", desc: "Vast frozen alpine lake and playing in the deep fresh snow! The magical winter destination where our current official WhatsApp profile pictures were taken.", defaultCaption: "Our WhatsApp profile picture spot at Bipenggou frozen lake ❄️🏔️", colorA: "#1e3c72", colorB: "#00b4d8", vehicle: "car" },
    "dagu": { icon: "🗻", symbol: "🗻❄️", tag: "5,000m Summit & Chalet Piano", title: "Dagu Glacier (5,000m Summit & Piano 🗻)", desc: "Cable car up to 5,000m thin air with a cute couple, freezing glove-less photoshoot, rushing back to the chalet leaning on baby to warm up from dizziness, and baby showing off her piano skills!", defaultCaption: "5,000m freezing summit, warming up leaning on baby & chalet piano 🗻☕", colorA: "#2b5876", colorB: "#4e4376", vehicle: "car" },
    "jiuzhaigou": { icon: "🏔️", symbol: "❄️🏔️", tag: "Sci-Fi Waters & Lucky Hotel", title: "Jiuzhaigou (Sci-Fi Turquoise Waters 🏔️)", desc: "Surreal science-fiction crystal turquoise lakes and snow-covered pines! Lucky last-minute boutique hotel while the tour stayed in a boring one, taking countless gorgeous photos together.", defaultCaption: "Sci-fi turquoise waters & lucky boutique hotel in Jiuzhaigou 🏔️❄️", colorA: "#2c3e50", colorB: "#3498db", vehicle: "car" },
    "huanglong": { icon: "🏞️", symbol: "🏞️✨", tag: "The Never-Ending Hike", title: "Huanglong ('Almost There!' Hike 🏞️)", desc: "High-altitude hike fighting thin air dizziness! Motivating baby with 'we're almost there!' when it was still miles away, resting 10 mins every 5 mins while tourists passed us twice.", defaultCaption: "Telling baby 'we're almost there!' every 5 mins at Huanglong 🏞️😂", colorA: "#134e5e", colorB: "#71b280", vehicle: "walk" },
    "nansha": { icon: "🚗", symbol: "🚗⚡", tag: "First Rental Car & Poule d'Or", title: "Nansha Port (Rental Car, Poule d'Or & Night Park 🚗)", desc: "Our first rental car road trip! Baby sleeping beside me while I drove, eating Xiaobei's Poule d'Or, following sky lights to a peaceful family park by the port, loud music, and hunting for EV charging spots.", defaultCaption: "First rental car, Poule d'Or & hunting for EV chargers at Nansha 🚗⚡", colorA: "#1e3c72", colorB: "#2a5298", vehicle: "car" },
    "wuhan": { icon: "🌸", symbol: "🌸🍜", tag: "Ancient Temple & Bikes", title: "Wuhan (Ancient Temple Animation & Bikes 🌸)", desc: "Renting bikes through peaceful Wuhan streets, visiting a grand ancient temple with animated projection show, European concession architecture, and canceling the reverse monorail for food.", defaultCaption: "Renting bikes & ancient temple animated show in Wuhan 🌸🚲", colorA: "#f12711", colorB: "#f5af19", vehicle: "bike" },
    "nanjing": { icon: "🛕", symbol: "🛕✨", tag: "Rainy Buddha Mountain & Pupu", title: "Nanjing (Rainy Buddha Mountain & Legendary Pupu 🛕)", desc: "Niushoushan rainy mountain hike, thousands of Buddha statues, giant sleeping Buddha, curious elderly locals filming the foreigner, and our legendary public toilet 'pupu'!", defaultCaption: "Rainy Buddha temple, filming elders & our legendary pupu in Nanjing 🛕💩", colorA: "#c31432", colorB: "#240b36", vehicle: "train" },
    "shanghai": { icon: "🌃", symbol: "🌃💖", tag: "Turkish Feast & Machinery", title: "Shanghai (Turkish Feast & Frank the 'Clever Cheater' 🌃)", desc: "Machinery inspection with Ye Jing, delicious Turkish restaurant feast, supplier loan drama with Frank calling me 'clever cheater', and a bittersweet airport metro ride.", defaultCaption: "Turkish restaurant feast & supplier drama with Frank in Shanghai 🌃🍽️", colorA: "#0f2027", colorB: "#2c5364", vehicle: "train" },
    "vietnam": { icon: "🇻🇳", symbol: "🇻🇳🍜", tag: "4-Pants Restroom Sprint", title: "Vietnam (10kg Overweight & 16h Layover 🇻🇳)", desc: "10kg overweight luggage drama! Wearing 4 pants, 5 shirts and 2 jackets in 30°C heat, sprinting through VIP priority lanes to board last, peeling off layers in seats, and a cozy 16h airport layover.", defaultCaption: "Wearing 4 pants & 5 shirts in 30° heat & sprinting to the plane 🇻🇳✈️", colorA: "#d35400", colorB: "#c0392b", vehicle: "airplane" },
    "bali": { icon: "🌴", symbol: "🌴🥥", tag: "Villa, Pool Scrape & ATV Trails", title: "Bali (Villa with Friends, ATV Trails & Waterbom 🌴)", desc: "Meeting Rami and Elysia at the villa, pool bottom scrape ('am I a fish?!'), thrilling ATV jungle trails, eating Bebek ('your father'), and wild Waterbom adrenaline slides.", defaultCaption: "ATV jungle adventures & pool mishaps ('am I a fish?!') in Bali 🌴🌊", colorA: "#ff7e5f", colorB: "#feb47b", vehicle: "airplane" },
    "jakarta": { icon: "🏡", symbol: "🏡❤️", tag: "Lili & Ayung & PS5 Tekken", title: "Jakarta (Meeting Parents, Indomie & Tekken Defeats 🏡)", desc: "Meeting Lili and Ayung, deep psychology chats with Lili, late-night Indomie with cheese, getting brutally defeated at PS5 Tekken, and family cinema dates.", defaultCaption: "Meeting Lili & Ayung, Indomie with cheese & PS5 Tekken in Jakarta 🏡🎮", colorA: "#ff758c", colorB: "#ff7eb3", vehicle: "airplane" },
    "indonesia": { icon: "🇮🇩", symbol: "🇮🇩💖", tag: "Girl's Origin", title: "Indonesia (Girl's Origin) 🇮🇩", desc: "From ATV jungle rides and Waterbom in Bali to meeting Lili & Ayung and getting demolished at Tekken in Jakarta—our unforgettable Indonesian chapter!", defaultCaption: "Girl's origin — our magical moments across Indonesia 🇮🇩🌴🏡", colorA: "#ff4b1f", colorB: "#ff9068", vehicle: "airplane" }
  };

  let activeTab = "stories"; // "stories" or "stats"
  let selectedCityKey = "guangzhou";
  let isAddingCity = false;
  let newCityVeh = "airplane";
  let newCityEmoji = "📍";

  window.WIDGET_INSPECTORS["map"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      previewIframe = null,
      selectWidgetForInspector = () => {}
    } = ctx || {};

    let mapData = state.sectionsData.map;
    if (!mapData || typeof mapData !== "object") {
      mapData = state.sectionsData.map = {};
    }
    const mapTag = mapData.tag || "Our Real World Travels & Cities";
    const mapTitle = mapData.title || "Interactive Story Roadmap & World Map 🗺️";
    const mapDesc = mapData.desc || "From our 17h Vietnam transit to Bali beaches, Jakarta home days, and all our China city expeditions!";
    const totalKm = mapData.totalKm || "80,750+ km";
    const totalCountries = mapData.totalCountries || "3 Countries";
    const totalCities = mapData.totalCities || "15 Global Cities Visited";
    const earthLaps = mapData.earthLaps || "2× Around Earth";

    // Ensure destinations array is initialized
    if (!Array.isArray(mapData.destinations) || mapData.destinations.length === 0) {
      mapData.destinations = JSON.parse(JSON.stringify(DEFAULT_DESTINATION_ITEMS));
    }

    // Ensure stories dictionary is initialized and merged with defaults
    if (!mapData.stories || typeof mapData.stories !== "object") {
      mapData.stories = JSON.parse(JSON.stringify(DEFAULT_STORIES));
    } else {
      Object.keys(DEFAULT_STORIES).forEach(k => {
        if (!mapData.stories[k]) {
          mapData.stories[k] = JSON.parse(JSON.stringify(DEFAULT_STORIES[k]));
        }
      });
    }

    let currentDest = mapData.destinations.find(d => d.key === selectedCityKey);
    if (!currentDest) {
      currentDest = mapData.destinations[0];
      selectedCityKey = currentDest ? currentDest.key : "guangzhou";
    }

    const currentStory = mapData.stories[selectedCityKey] || DEFAULT_STORIES[selectedCityKey] || {
      icon: currentDest ? currentDest.flag : "📍",
      symbol: "✨",
      tag: "Journey Stop",
      title: currentDest ? currentDest.label : selectedCityKey,
      desc: "",
      defaultCaption: "",
      colorA: "#ff416c",
      colorB: "#8a2387",
      vehicle: currentDest ? (currentDest.vehicle || "airplane") : "airplane"
    };

    const shortcutsHtml = mapData.destinations.map(d => `
      <button type="button" class="btn btn-sm btn-outline map-spotlight-btn" data-city="${d.key}" style="padding: 4px 8px; font-size: 0.78rem;">
        ${d.flag || '📍'} ${d.label.split(" (")[0]}
      </button>
    `).join("");

    const renderDestinationOptions = () => {
      const regionNames = {
        china: "🇨🇳 China Journey",
        global: "🌍 Global Flight Route",
        indonesia: "🇮🇩 Indonesia Tour"
      };
      const grouped = {};
      mapData.destinations.forEach(d => {
        const reg = regionNames[d.region] || d.region || "Destinations";
        grouped[reg] = grouped[reg] || [];
        grouped[reg].push(d);
      });
      let html = "";
      Object.entries(grouped).forEach(([region, list]) => {
        html += `<optgroup label="${region}">`;
        list.forEach(item => {
          const isSel = item.key === selectedCityKey ? "selected" : "";
          const vehIcon = (VEHICLE_OPTIONS.find(v => v.id === item.vehicle) || {}).icon || "✈️";
          html += `<option value="${item.key}" ${isSel}>${item.flag || '📍'} ${item.label} (${vehIcon})</option>`;
        });
        html += `</optgroup>`;
      });
      return html;
    };

    const curVeh = currentStory.vehicle || (currentDest ? currentDest.vehicle : "airplane") || "airplane";

    inspectorFormContainer.innerHTML = `
      <!-- Subtabs bar -->
      <div class="hero-subtabs-bar" style="margin-bottom: 14px;">
        <button type="button" class="hero-subtab-btn ${activeTab === 'stories' ? 'active' : ''}" id="mapTabBtnStories">
          📍 Destinations &amp; Stops (${mapData.destinations.length})
        </button>
        <button type="button" class="hero-subtab-btn ${activeTab === 'stats' ? 'active' : ''}" id="mapTabBtnStats">
          🗺️ Stats &amp; Headings
        </button>
      </div>

      <!-- Tab 1: Destination Stories Editor -->
      <div id="mapStoriesPane" style="${activeTab === 'stories' ? '' : 'display: none;'}">
        <!-- Destination Manager & Selector Bar -->
        <div class="item-editor-card" style="margin-bottom: 12px; background: rgba(244, 63, 94, 0.04); border-color: rgba(244, 63, 94, 0.25);">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Current Journey Stop</label>
              <div style="display: flex; gap: 4px;">
                <button type="button" class="btn btn-sm btn-outline" id="btnMoveCityUp" title="Move stop earlier in route" style="padding: 2px 7px;">▲</button>
                <button type="button" class="btn btn-sm btn-outline" id="btnMoveCityDown" title="Move stop later in route" style="padding: 2px 7px;">▼</button>
                <button type="button" class="btn btn-sm btn-outline" id="btnDeleteCity" title="Delete this stop" style="padding: 2px 7px; color: #e11d48;">🗑️</button>
                <button type="button" class="btn btn-sm btn-primary" id="btnToggleAddCity" style="padding: 2px 9px; font-size: 0.76rem;">
                  ${isAddingCity ? '✕ Close' : '➕ Add Stop'}
                </button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <select id="mapCitySelector" style="font-weight: 600; font-size: 0.88rem; flex-grow: 1;">
                ${renderDestinationOptions()}
              </select>
              <button type="button" class="btn btn-sm btn-outline" id="btnSpotlightCurrentCity" title="Spotlight stop on live map" style="padding: 5px 8px; white-space: nowrap;">
                📍 View
              </button>
            </div>
          </div>
        </div>

        <!-- Add New Destination Collapsible Card -->
        <div class="item-editor-card" id="addCityCard" style="margin-bottom: 12px; background: #fff5f7; border: 1.5px dashed var(--primary); ${isAddingCity ? '' : 'display: none;'}">
          <div class="item-editor-header">
            <span class="item-editor-title">➕ Add New Destination / Stop</span>
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>City / Stop Name</label>
              <input type="text" id="new_city_name" placeholder="e.g. Paris, Tokyo, Rome">
            </div>
            <div class="input-group">
              <label>Journey Map Section</label>
              <select id="new_city_region">
                <option value="china">🇨🇳 China Journey</option>
                <option value="global" selected>🌍 Global Flight Route</option>
                <option value="indonesia">🇮🇩 Indonesia Tour</option>
              </select>
            </div>
          </div>

          <!-- Traveled Vehicle Mode Picker for New City -->
          <div class="input-group" style="margin-top: 8px;">
            <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Traveled Vehicle</label>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px;">
              ${VEHICLE_OPTIONS.map(v => `
                <button type="button" class="btn btn-sm ${newCityVeh === v.id ? 'btn-primary' : 'btn-outline'} new-veh-btn" data-veh="${v.id}" style="padding: 3px 8px; font-size: 0.78rem; border-radius: 999px;">
                  ${v.icon} ${v.label}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Pin Emoji Icon & Presets for New City -->
          <div class="input-group" style="margin-top: 8px;">
            <label>Pin Emoji Icon</label>
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="text" id="new_city_icon" value="${newCityEmoji}" style="width: 50px; text-align: center; font-size: 1.1rem;">
              <div style="display: flex; flex-wrap: wrap; gap: 4px; flex-grow: 1;">
                ${EMOJI_PRESETS.slice(0, 10).map(em => `
                  <button type="button" class="btn btn-sm btn-outline new-emoji-preset-btn" data-emoji="${em}" style="padding: 2px 5px; font-size: 0.85rem; line-height: 1;">${em}</button>
                `).join("")}
              </div>
            </div>
          </div>

          <div class="grid-2" style="margin-top: 8px;">
            <div class="input-group">
              <label>Map X Coord (0–900)</label>
              <input type="number" id="new_city_x" value="500" min="20" max="880">
            </div>
            <div class="input-group">
              <label>Map Y Coord (0–500)</label>
              <input type="number" id="new_city_y" value="250" min="20" max="480">
            </div>
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Story Subtitle Tag</label>
            <input type="text" id="new_city_tag" placeholder="e.g. Romantic Getaway">
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Story Headline Title</label>
            <input type="text" id="new_city_title" placeholder="e.g. Paris (Eiffel Tower &amp; Midnight Crepes)">
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Narrative Memory Story</label>
            <textarea id="new_city_desc" rows="2" placeholder="Story text when tapping on this pin..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
            <button type="button" class="btn btn-sm btn-outline" id="btnCancelAddCity">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" id="btnSaveNewCity">➕ Add Stop to Map</button>
          </div>
        </div>

        <!-- Selected Stop Editor Card -->
        <div class="item-editor-card" id="mapStoryCard">
          <div class="item-editor-header">
            <span class="item-editor-title">Stop Details: ${currentDest ? currentDest.label : selectedCityKey}</span>
            <button type="button" class="btn-sm btn-outline" id="btnJumpToChapter" title="Find or edit linked timeline chapter">
              📖 View in Timeline
            </button>
          </div>

          <!-- Traveled Vehicle Mode Switcher -->
          <div class="input-group" style="margin-bottom: 12px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 8px;">
            <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">
              Traveled Vehicle Mode
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${VEHICLE_OPTIONS.map(v => {
                const isSel = curVeh === v.id;
                return `<button type="button" class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-outline'} vehicle-mode-btn" data-veh="${v.id}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 999px;">
                  ${v.icon} ${v.label}
                </button>`;
              }).join("")}
            </div>
          </div>

          <!-- Pin Icon & Emoji Palette -->
          <div class="input-group">
            <label>Pin Emoji Icon &amp; Quick Palette</label>
            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
              <input type="text" id="story_icon" value="${currentStory.icon || '📍'}" placeholder="⭐" style="width: 55px; text-align: center; font-size: 1.2rem;">
              <div style="display: flex; flex-wrap: wrap; gap: 4px; flex-grow: 1;">
                ${EMOJI_PRESETS.map(em => `<button type="button" class="btn btn-sm btn-outline emoji-preset-btn" data-emoji="${em}" style="padding: 2px 6px; font-size: 0.85rem; line-height: 1.1;">${em}</button>`).join("")}
              </div>
            </div>
          </div>

          <div class="grid-2" style="margin-top: 8px;">
            <div class="input-group">
              <label>Sub-Symbols (2 Emojis)</label>
              <input type="text" id="story_symbol" value="${currentStory.symbol || '✨'}" placeholder="🗼🍲">
            </div>
            <div class="input-group">
              <label>Story Subtitle / Tag Badge</label>
              <input type="text" id="story_tag" value="${currentStory.tag || ''}" placeholder="e.g. Our Favorite City">
            </div>
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>City &amp; Story Headline Title</label>
            <input type="text" id="story_title" value="${currentStory.title || ''}" placeholder="e.g. Guangzhou (Canton Tower &amp; Secret Food ⭐)">
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Narrative Memory Story</label>
            <textarea id="story_desc" rows="4" placeholder="Story text when tapping on this map pin...">${currentStory.desc || ''}</textarea>
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Default Photo Caption</label>
            <input type="text" id="story_caption" value="${currentStory.defaultCaption || ''}" placeholder="Caption displayed beneath photo...">
          </div>

          <div class="chap-section-subheading" style="margin-top: 14px;">🎨 City Theme Gradient Colors</div>
          <div class="grid-2" style="margin-top: 6px;">
            <div class="input-group">
              <label>Color A (Primary)</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="color" id="story_colorA_picker" value="${currentStory.colorA || '#1a1c2e'}" style="width: 36px; height: 34px; padding: 2px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border);">
                <input type="text" id="story_colorA" value="${currentStory.colorA || '#1a1c2e'}" style="flex-grow: 1;">
              </div>
            </div>
            <div class="input-group">
              <label>Color B (Secondary)</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="color" id="story_colorB_picker" value="${currentStory.colorB || '#7b1fa2'}" style="width: 36px; height: 34px; padding: 2px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border);">
                <input type="text" id="story_colorB" value="${currentStory.colorB || '#7b1fa2'}" style="flex-grow: 1;">
              </div>
            </div>
          </div>
          <div id="storyGradientPreview" style="height: 14px; border-radius: 6px; margin-top: 10px; background: linear-gradient(135deg, ${currentStory.colorA || '#1a1c2e'}, ${currentStory.colorB || '#7b1fa2'}); border: 1px solid var(--border);"></div>
        </div>
      </div>

      <!-- Tab 2: Map Section Headings & Global Stats -->
      <div id="mapStatsPane" style="${activeTab === 'stats' ? '' : 'display: none;'}">
        <div class="item-editor-card" style="margin-bottom: 12px; background: rgba(244, 63, 94, 0.04); border-color: rgba(244, 63, 94, 0.25);">
          <div class="item-editor-header">
            <span class="item-editor-title">🗺️ Map Section Headings</span>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Section Tag</label>
              <input type="text" id="map_tag" value="${mapTag}">
            </div>
            <div class="input-group">
              <label>Section Title</label>
              <input type="text" id="map_title" value="${mapTitle}">
            </div>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Section Description</label>
            <textarea id="map_desc" rows="2">${mapDesc}</textarea>
          </div>
        </div>

        <div class="item-editor-card" style="margin-bottom: 12px;">
          <div class="item-editor-header">
            <span class="item-editor-title">✈️ Love Mileage &amp; Global Stats</span>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Total Distance Flown &amp; Traveled</label>
              <input type="text" id="map_totalKm" value="${totalKm}">
            </div>
            <div class="input-group">
              <label>Countries Hand-in-Hand</label>
              <input type="text" id="map_totalCountries" value="${totalCountries}">
            </div>
          </div>
          <div class="grid-2" style="margin-top: 6px;">
            <div class="input-group">
              <label>Global Cities Visited</label>
              <input type="text" id="map_totalCities" value="${totalCities}">
            </div>
            <div class="input-group">
              <label>Earth Circumference Laps</label>
              <input type="text" id="map_earthLaps" value="${earthLaps}">
            </div>
          </div>
        </div>

        <div class="item-editor-card">
          <div class="item-editor-header">
            <span class="item-editor-title">📍 Live Map Spotlight Test</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 8px 0;">Click any destination to spotlight and inspect it on the live interactive map:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">${shortcutsHtml}</div>
        </div>
      </div>
    `;

    // Tab switcher
    const tabBtnStories = document.getElementById("mapTabBtnStories");
    const tabBtnStats = document.getElementById("mapTabBtnStats");
    const storiesPane = document.getElementById("mapStoriesPane");
    const statsPane = document.getElementById("mapStatsPane");

    if (tabBtnStories && tabBtnStats) {
      tabBtnStories.onclick = () => {
        activeTab = "stories";
        tabBtnStories.classList.add("active");
        tabBtnStats.classList.remove("active");
        if (storiesPane) storiesPane.style.display = "";
        if (statsPane) statsPane.style.display = "none";
      };
      tabBtnStats.onclick = () => {
        activeTab = "stats";
        tabBtnStats.classList.add("active");
        tabBtnStories.classList.remove("active");
        if (storiesPane) storiesPane.style.display = "none";
        if (statsPane) statsPane.style.display = "";
      };
    }

    // Destination selector
    const citySelector = document.getElementById("mapCitySelector");
    if (citySelector) {
      citySelector.onchange = (e) => {
        selectedCityKey = e.target.value;
        window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
      };
    }

    // Reorder & Action Buttons
    const btnMoveUp = document.getElementById("btnMoveCityUp");
    const btnMoveDown = document.getElementById("btnMoveCityDown");
    const btnDelete = document.getElementById("btnDeleteCity");
    const curIdx = mapData.destinations.findIndex(d => d.key === selectedCityKey);

    if (btnMoveUp) {
      btnMoveUp.onclick = () => {
        if (curIdx > 0) {
          const temp = mapData.destinations[curIdx];
          mapData.destinations[curIdx] = mapData.destinations[curIdx - 1];
          mapData.destinations[curIdx - 1] = temp;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
          window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
        }
      };
    }

    if (btnMoveDown) {
      btnMoveDown.onclick = () => {
        if (curIdx >= 0 && curIdx < mapData.destinations.length - 1) {
          const temp = mapData.destinations[curIdx];
          mapData.destinations[curIdx] = mapData.destinations[curIdx + 1];
          mapData.destinations[curIdx + 1] = temp;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
          window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
        }
      };
    }

    if (btnDelete) {
      btnDelete.onclick = () => {
        if (mapData.destinations.length <= 1) {
          alert("At least one journey destination is required.");
          return;
        }
        const name = currentDest ? currentDest.label : selectedCityKey;
        if (confirm(`Remove "${name}" from map?`)) {
          mapData.destinations = mapData.destinations.filter(d => d.key !== selectedCityKey);
          selectedCityKey = mapData.destinations[0].key;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
          window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
        }
      };
    }

    // Toggle Add City Card
    const btnToggleAdd = document.getElementById("btnToggleAddCity");
    const addCityCard = document.getElementById("addCityCard");
    const btnCancelAdd = document.getElementById("btnCancelAddCity");
    const btnSaveNewCity = document.getElementById("btnSaveNewCity");

    if (btnToggleAdd) {
      btnToggleAdd.onclick = () => {
        isAddingCity = !isAddingCity;
        if (addCityCard) addCityCard.style.display = isAddingCity ? "" : "none";
        btnToggleAdd.textContent = isAddingCity ? "✕ Close" : "➕ Add Stop";
      };
    }

    if (btnCancelAdd) {
      btnCancelAdd.onclick = () => {
        isAddingCity = false;
        if (addCityCard) addCityCard.style.display = "none";
        if (btnToggleAdd) btnToggleAdd.textContent = "➕ Add Stop";
      };
    }

    // Add City Vehicle Mode Pickers
    document.querySelectorAll(".new-veh-btn").forEach(btn => {
      btn.onclick = () => {
        newCityVeh = btn.getAttribute("data-veh");
        document.querySelectorAll(".new-veh-btn").forEach(b => {
          b.classList.toggle("btn-primary", b.getAttribute("data-veh") === newCityVeh);
          b.classList.toggle("btn-outline", b.getAttribute("data-veh") !== newCityVeh);
        });
      };
    });

    // Add City Emoji Presets
    const newCityIconIn = document.getElementById("new_city_icon");
    document.querySelectorAll(".new-emoji-preset-btn").forEach(btn => {
      btn.onclick = () => {
        newCityEmoji = btn.getAttribute("data-emoji");
        if (newCityIconIn) newCityIconIn.value = newCityEmoji;
      };
    });

    // Save New City Button
    if (btnSaveNewCity) {
      btnSaveNewCity.onclick = () => {
        const nameIn = document.getElementById("new_city_name");
        const regionIn = document.getElementById("new_city_region");
        const xIn = document.getElementById("new_city_x");
        const yIn = document.getElementById("new_city_y");
        const tagIn = document.getElementById("new_city_tag");
        const titleIn = document.getElementById("new_city_title");
        const descIn = document.getElementById("new_city_desc");

        const name = (nameIn && nameIn.value.trim()) || "New Destination";
        const icon = (newCityIconIn && newCityIconIn.value.trim()) || newCityEmoji || "📍";
        const region = (regionIn && regionIn.value) || "china";
        const x = xIn ? parseInt(xIn.value, 10) || 500 : 500;
        const y = yIn ? parseInt(yIn.value, 10) || 250 : 250;

        let key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (!key || mapData.destinations.some(d => d.key === key)) {
          key = (key || "stop") + "-" + Date.now().toString().slice(-4);
        }

        const newDest = {
          key,
          label: name,
          flag: icon,
          region,
          vehicle: newCityVeh,
          x,
          y,
          isCustom: true
        };

        mapData.destinations.push(newDest);

        mapData.stories[key] = {
          icon,
          symbol: icon + "✨",
          tag: (tagIn && tagIn.value.trim()) || "Romantic Journey Stop",
          title: (titleIn && titleIn.value.trim()) || `${name} (${icon})`,
          desc: (descIn && descIn.value.trim()) || `Unforgettable memories together in ${name}!`,
          defaultCaption: `Our romantic memories in ${name} ❤️`,
          colorA: "#ff416c",
          colorB: "#8a2387",
          vehicle: newCityVeh
        };

        selectedCityKey = key;
        isAddingCity = false;

        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
        window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
      };
    }

    // Traveled Vehicle Mode Switcher for Current Stop
    document.querySelectorAll(".vehicle-mode-btn").forEach(btn => {
      btn.onclick = () => {
        const veh = btn.getAttribute("data-veh");
        if (currentDest) currentDest.vehicle = veh;
        currentStory.vehicle = veh;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
        window.WIDGET_INSPECTORS["map"](inspectorFormContainer, state, ctx);
      };
    });

    // Spotlight current city button
    const btnSpotCurrent = document.getElementById("btnSpotlightCurrentCity");
    if (btnSpotCurrent) {
      btnSpotCurrent.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "SPOTLIGHT_CITY", cityKey: selectedCityKey }, window.location.origin);
        }
      };
    }

    // Jump to Timeline Chapter button
    const btnJump = document.getElementById("btnJumpToChapter");
    if (btnJump) {
      btnJump.onclick = () => {
        if (typeof selectWidgetForInspector === "function") {
          selectWidgetForInspector("timeline");
        }
      };
    }

    // Story fields binding
    const sIcon = document.getElementById("story_icon");
    const sSymbol = document.getElementById("story_symbol");
    const sTag = document.getElementById("story_tag");
    const sTitle = document.getElementById("story_title");
    const sDesc = document.getElementById("story_desc");
    const sCaption = document.getElementById("story_caption");
    const sColA = document.getElementById("story_colorA");
    const sColAPicker = document.getElementById("story_colorA_picker");
    const sColB = document.getElementById("story_colorB");
    const sColBPicker = document.getElementById("story_colorB_picker");
    const sGradPreview = document.getElementById("storyGradientPreview");

    // Emoji Presets for Current Stop
    document.querySelectorAll(".emoji-preset-btn").forEach(btn => {
      btn.onclick = () => {
        const em = btn.getAttribute("data-emoji");
        currentStory.icon = em;
        if (currentDest) currentDest.flag = em;
        if (sIcon) sIcon.value = em;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    });

    const updateGradPreview = () => {
      if (sGradPreview) {
        sGradPreview.style.background = `linear-gradient(135deg, ${currentStory.colorA || '#1a1c2e'}, ${currentStory.colorB || '#7b1fa2'})`;
      }
    };

    if (sIcon) sIcon.oninput = (e) => {
      currentStory.icon = e.target.value;
      if (currentDest) currentDest.flag = e.target.value;
      debouncedLiveUpdate();
    };
    if (sSymbol) sSymbol.oninput = (e) => { currentStory.symbol = e.target.value; debouncedLiveUpdate(); };
    if (sTag) sTag.oninput = (e) => { currentStory.tag = e.target.value; debouncedLiveUpdate(); };
    if (sTitle) sTitle.oninput = (e) => { currentStory.title = e.target.value; debouncedLiveUpdate(); };
    if (sDesc) sDesc.oninput = (e) => { currentStory.desc = e.target.value; debouncedLiveUpdate(); };
    if (sCaption) sCaption.oninput = (e) => { currentStory.defaultCaption = e.target.value; debouncedLiveUpdate(); };

    if (sColA && sColAPicker) {
      sColA.oninput = (e) => {
        currentStory.colorA = e.target.value;
        sColAPicker.value = e.target.value;
        updateGradPreview();
        debouncedLiveUpdate();
      };
      sColAPicker.oninput = (e) => {
        currentStory.colorA = e.target.value;
        sColA.value = e.target.value;
        updateGradPreview();
        debouncedLiveUpdate();
      };
    }

    if (sColB && sColBPicker) {
      sColB.oninput = (e) => {
        currentStory.colorB = e.target.value;
        sColBPicker.value = e.target.value;
        updateGradPreview();
        debouncedLiveUpdate();
      };
      sColBPicker.oninput = (e) => {
        currentStory.colorB = e.target.value;
        sColB.value = e.target.value;
        updateGradPreview();
        debouncedLiveUpdate();
      };
    }

    // Stats and general headings inputs
    const tagIn = document.getElementById("map_tag");
    const titleIn = document.getElementById("map_title");
    const descIn = document.getElementById("map_desc");
    const kmIn = document.getElementById("map_totalKm");
    const countriesIn = document.getElementById("map_totalCountries");
    const citiesIn = document.getElementById("map_totalCities");
    const lapsIn = document.getElementById("map_earthLaps");

    if (tagIn) tagIn.oninput = (e) => { mapData.tag = e.target.value; debouncedLiveUpdate(); };
    if (titleIn) titleIn.oninput = (e) => { mapData.title = e.target.value; debouncedLiveUpdate(); };
    if (descIn) descIn.oninput = (e) => { mapData.desc = e.target.value; debouncedLiveUpdate(); };
    if (kmIn) kmIn.oninput = (e) => { mapData.totalKm = e.target.value; debouncedLiveUpdate(); };
    if (countriesIn) countriesIn.oninput = (e) => { mapData.totalCountries = e.target.value; debouncedLiveUpdate(); };
    if (citiesIn) citiesIn.oninput = (e) => { mapData.totalCities = e.target.value; debouncedLiveUpdate(); };
    if (lapsIn) lapsIn.oninput = (e) => { mapData.earthLaps = e.target.value; debouncedLiveUpdate(); };

    document.querySelectorAll(".map-spotlight-btn").forEach(btn => {
      btn.onclick = () => {
        const cityKey = btn.dataset.city;
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "SPOTLIGHT_CITY", cityKey }, window.location.origin);
        }
      };
    });
  };
})();
