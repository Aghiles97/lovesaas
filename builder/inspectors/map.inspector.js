/**
 * Builder Inspector Module: map
 * Professional, comprehensive editor for interactive love map & destination stories.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  const DESTINATION_ITEMS = [
    { key: "guangzhou", label: "Guangzhou (Canton Tower)", flag: "⭐", region: "China Tour" },
    { key: "shenzhen", label: "Shenzhen (Beach & Ferris Wheel)", flag: "🌆", region: "China Tour" },
    { key: "chongqing", label: "Chongqing (Mountain BBQ & Cats)", flag: "🌶️", region: "China Tour" },
    { key: "chengdu", label: "Chengdu (Panda Sanctuary)", flag: "🐼", region: "China Tour" },
    { key: "bipenggou", label: "Bipenggou (Frozen Alpine Lake)", flag: "❄️", region: "China Tour" },
    { key: "dagu", label: "Dagu Glacier (5,000m Summit)", flag: "🗻", region: "China Tour" },
    { key: "jiuzhaigou", label: "Jiuzhaigou (Turquoise Waters)", flag: "🏔️", region: "China Tour" },
    { key: "huanglong", label: "Huanglong (High Altitude Hike)", flag: "🏞️", region: "China Tour" },
    { key: "nansha", label: "Nansha Port (Road Trip & EV)", flag: "🚗", region: "China Tour" },
    { key: "wuhan", label: "Wuhan (Ancient Temple & Bikes)", flag: "🌸", region: "China Tour" },
    { key: "nanjing", label: "Nanjing (Buddha Mountain)", flag: "🛕", region: "China Tour" },
    { key: "shanghai", label: "Shanghai (Turkish Feast & Skyline)", flag: "🌃", region: "China Tour" },
    { key: "algeria", label: "Algeria (Boyfriend's Origin)", flag: "🇩🇿", region: "Global Flight Route" },
    { key: "china-base", label: "China Base (Where We Met)", flag: "🇨🇳", region: "Global Flight Route" },
    { key: "vietnam", label: "Vietnam (16h Layover)", flag: "🇻🇳", region: "Global Flight Route" },
    { key: "indonesia", label: "Indonesia (Girl's Origin)", flag: "🇮🇩", region: "Global Flight Route" },
    { key: "bali", label: "Bali (Beaches, Villa & ATV)", flag: "🌴", region: "Indonesia Tour" },
    { key: "jakarta", label: "Jakarta (Home, Indomie & Tekken)", flag: "🏡", region: "Indonesia Tour" }
  ];

  const DEFAULT_STORIES = {
    "algeria": { icon: "🇩🇿", symbol: "🇩🇿✈️", tag: "Boyfriend's Origin (Ella Hasn't Visited Yet)", title: "Algeria (Boyfriend's Home)", desc: "Where I come from and count down every single hour until our next flight to see you! Ella hasn't traveled here yet—our next dream trip together awaits!", defaultCaption: "Algiers Mediterranean coast — where I come from & long to bring you 🇩🇿❤️", colorA: "#005c97", colorB: "#363795" },
    "china-base": { icon: "🇨🇳", symbol: "🇨🇳💖", tag: "Where We Met", title: "China (Where We Met) 🇨🇳", desc: "The fateful country where our eyes first met on September 17. From our Guangzhou base to scenic alpine mountains, traveling together across China was an unforgettable dream.", defaultCaption: "Where our fateful love story first began in China 🇨🇳✨", colorA: "#ff416c", colorB: "#8a2387" },
    "guangzhou": { icon: "⭐", symbol: "🗼🍲", tag: "Our Favorite City in China", title: "Guangzhou (Canton Tower & Secret 50m Food ⭐)", desc: "Our favorite place facing Canton Tower at night where we spent 7 hours talking non-stop! Sitting by the window watching city traffic, airport orange juice goodbyes, birthday perfume reunion, bike cuddles, sunflower seed proposal, and our secret 50m late-night restaurant!", defaultCaption: "7 hours talking by Canton Tower & sitting by the window watching traffic ❤️🗼", colorA: "#1a1c2e", colorB: "#7b1fa2" },
    "shenzhen": { icon: "🌆", symbol: "🌆✨", tag: "First Vlog & Ferris Wheel", title: "Shenzhen (3D Sand Heart & Ferris Wheel 🌆)", desc: "Our very first vlogging trip! Sculpting a 3D heart in the beach sand, searching for 420mm pads with the smiling pharmacist, experiencing drone delivery near HK, autonomous driverless cars, and our private Ferris wheel cabin.", defaultCaption: "3D sand heart, drone delivery & private Ferris wheel cabin in Shenzhen 🌆🎡", colorA: "#3a1c71", colorB: "#d76d77" },
    "chongqing": { icon: "🌶️", symbol: "🌶️🍲", tag: "Mountain BBQ, Cats & 360° Show", title: "Chongqing (Mountain BBQ, Cats & Skyscraper Ledge 🌶️)", desc: "Cobblestone streets, 10–15 RMB sweet street mangoes, spicy hotpot, open-air mountain BBQ with our friendly Pakistani host and his cats, mind-blowing 360° civil war theater, drone shows, and crazy skyscraper cable walks!", defaultCaption: "Mountain BBQ with cats & mind-blowing 360° civil war show in Chongqing 🌶️🌃", colorA: "#870000", colorB: "#190a05" },
    "chengdu": { icon: "🐼", symbol: "🐼🎋", tag: "Pandas & Twin Towers", title: "Chengdu (Panda Butt Ice Cream & 'Slimane & Abdenor' 🐼)", desc: "Visiting the Panda asylum, eating hilarious panda-butt ice cream, bamboo waterfalls, naming the Chengdu Twin Towers 'Slimane and Abdenor', and buying warm winter clothes before our pre-dawn snow expedition.", defaultCaption: "Panda asylum date & 'Slimane & Abdenor' Twin Towers in Chengdu 🐼🎋", colorA: "#11998e", colorB: "#38ef7d" },
    "bipenggou": { icon: "❄️", symbol: "❄️⛄", tag: "Frozen Lake & WhatsApp Avatars", title: "Bipenggou (Frozen Lake & Snow Fun ❄️)", desc: "Vast frozen alpine lake and playing in the deep fresh snow! The magical winter destination where our current official WhatsApp profile pictures were taken.", defaultCaption: "Our WhatsApp profile picture spot at Bipenggou frozen lake ❄️🏔️", colorA: "#1e3c72", colorB: "#00b4d8" },
    "dagu": { icon: "🗻", symbol: "🗻❄️", tag: "5,000m Summit & Chalet Piano", title: "Dagu Glacier (5,000m Summit & Piano 🗻)", desc: "Cable car up to 5,000m thin air with a cute couple, freezing glove-less photoshoot, rushing back to the chalet leaning on baby to warm up from dizziness, and baby showing off her piano skills!", defaultCaption: "5,000m freezing summit, warming up leaning on baby & chalet piano 🗻☕", colorA: "#2b5876", colorB: "#4e4376" },
    "jiuzhaigou": { icon: "🏔️", symbol: "❄️🏔️", tag: "Sci-Fi Waters & Lucky Hotel", title: "Jiuzhaigou (Sci-Fi Turquoise Waters 🏔️)", desc: "Surreal science-fiction crystal turquoise lakes and snow-covered pines! Lucky last-minute boutique hotel while the tour stayed in a boring one, taking countless gorgeous photos together.", defaultCaption: "Sci-fi turquoise waters & lucky boutique hotel in Jiuzhaigou 🏔️❄️", colorA: "#2c3e50", colorB: "#3498db" },
    "huanglong": { icon: "🏞️", symbol: "🏞️✨", tag: "The Never-Ending Hike", title: "Huanglong ('Almost There!' Hike 🏞️)", desc: "High-altitude hike fighting thin air dizziness! Motivating baby with 'we're almost there!' when it was still miles away, resting 10 mins every 5 mins while tourists passed us twice.", defaultCaption: "Telling baby 'we're almost there!' every 5 mins at Huanglong 🏞️😂", colorA: "#134e5e", colorB: "#71b280" },
    "nansha": { icon: "🚗", symbol: "🚗⚡", tag: "First Rental Car & Poule d'Or", title: "Nansha Port (Rental Car, Poule d'Or & Night Park 🚗)", desc: "Our first rental car road trip! Baby sleeping beside me while I drove, eating Xiaobei's Poule d'Or, following sky lights to a peaceful family park by the port, loud music, and hunting for EV charging spots.", defaultCaption: "First rental car, Poule d'Or & hunting for EV chargers at Nansha 🚗⚡", colorA: "#1e3c72", colorB: "#2a5298" },
    "wuhan": { icon: "🌸", symbol: "🌸🍜", tag: "Ancient Temple & Bikes", title: "Wuhan (Ancient Temple Animation & Bikes 🌸)", desc: "Renting bikes through peaceful Wuhan streets, visiting a grand ancient temple with animated projection show, European concession architecture, and canceling the reverse monorail for food.", defaultCaption: "Renting bikes & ancient temple animated show in Wuhan 🌸🚲", colorA: "#f12711", colorB: "#f5af19" },
    "nanjing": { icon: "🛕", symbol: "🛕✨", tag: "Rainy Buddha Mountain & Pupu", title: "Nanjing (Rainy Buddha Mountain & Legendary Pupu 🛕)", desc: "Niushoushan rainy mountain hike, thousands of Buddha statues, giant sleeping Buddha, curious elderly locals filming the foreigner, and our legendary public toilet 'pupu'!", defaultCaption: "Rainy Buddha temple, filming elders & our legendary pupu in Nanjing 🛕💩", colorA: "#c31432", colorB: "#240b36" },
    "shanghai": { icon: "🌃", symbol: "🌃💖", tag: "Turkish Feast & Machinery", title: "Shanghai (Turkish Feast & Frank the 'Clever Cheater' 🌃)", desc: "Machinery inspection with Ye Jing, delicious Turkish restaurant feast, supplier loan drama with Frank calling me 'clever cheater', and a bittersweet airport metro ride.", defaultCaption: "Turkish restaurant feast & supplier drama with Frank in Shanghai 🌃🍽️", colorA: "#0f2027", colorB: "#2c5364" },
    "vietnam": { icon: "🇻🇳", symbol: "🇻🇳🍜", tag: "4-Pants Restroom Sprint", title: "Vietnam (10kg Overweight & 16h Layover 🇻🇳)", desc: "10kg overweight luggage drama! Wearing 4 pants, 5 shirts and 2 jackets in 30°C heat, sprinting through VIP priority lanes to board last, peeling off layers in seats, and a cozy 16h airport layover.", defaultCaption: "Wearing 4 pants & 5 shirts in 30° heat & sprinting to the plane 🇻🇳✈️", colorA: "#d35400", colorB: "#c0392b" },
    "bali": { icon: "🌴", symbol: "🌴🥥", tag: "Villa, Pool Scrape & ATV Trails", title: "Bali (Villa with Friends, ATV Trails & Waterbom 🌴)", desc: "Meeting Rami and Elysia at the villa, pool bottom scrape ('am I a fish?!'), thrilling ATV jungle trails, eating Bebek ('your father'), and wild Waterbom adrenaline slides.", defaultCaption: "ATV jungle adventures & pool mishaps ('am I a fish?!') in Bali 🌴🌊", colorA: "#ff7e5f", colorB: "#feb47b" },
    "jakarta": { icon: "🏡", symbol: "🏡❤️", tag: "Lili & Ayung & PS5 Tekken", title: "Jakarta (Meeting Parents, Indomie & Tekken Defeats 🏡)", desc: "Meeting Lili and Ayung, deep psychology chats with Lili, late-night Indomie with cheese, getting brutally defeated at PS5 Tekken, and family cinema dates.", defaultCaption: "Meeting Lili & Ayung, Indomie with cheese & PS5 Tekken in Jakarta 🏡🎮", colorA: "#ff758c", colorB: "#ff7eb3" },
    "indonesia": { icon: "🇮🇩", symbol: "🇮🇩💖", tag: "Girl's Origin", title: "Indonesia (Girl's Origin) 🇮🇩", desc: "From ATV jungle rides and Waterbom in Bali to meeting Lili & Ayung and getting demolished at Tekken in Jakarta—our unforgettable Indonesian chapter!", defaultCaption: "Girl's origin — our magical moments across Indonesia 🇮🇩🌴🏡", colorA: "#ff4b1f", colorB: "#ff9068" }
  };

  let activeTab = "stories"; // "stories" or "stats"
  let selectedCityKey = "guangzhou";

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

    const currentStory = mapData.stories[selectedCityKey] || DEFAULT_STORIES[selectedCityKey] || {
      icon: "📍", symbol: "✨", tag: "Journey Stop", title: selectedCityKey, desc: "", defaultCaption: "", colorA: "#ff416c", colorB: "#8a2387"
    };

    const shortcutsHtml = DESTINATION_ITEMS.map(d => `
      <button type="button" class="btn btn-sm btn-outline map-spotlight-btn" data-city="${d.key}" style="padding: 4px 8px; font-size: 0.78rem;">
        ${d.flag} ${d.label.split(" (")[0]}
      </button>
    `).join("");

    const renderDestinationOptions = () => {
      const grouped = {};
      DESTINATION_ITEMS.forEach(d => {
        grouped[d.region] = grouped[d.region] || [];
        grouped[d.region].push(d);
      });
      let html = "";
      Object.entries(grouped).forEach(([region, list]) => {
        html += `<optgroup label="${region}">`;
        list.forEach(item => {
          const isSel = item.key === selectedCityKey ? "selected" : "";
          html += `<option value="${item.key}" ${isSel}>${item.flag} ${item.label}</option>`;
        });
        html += `</optgroup>`;
      });
      return html;
    };

    inspectorFormContainer.innerHTML = `
      <!-- Subtabs bar -->
      <div class="hero-subtabs-bar" style="margin-bottom: 14px;">
        <button type="button" class="hero-subtab-btn ${activeTab === 'stories' ? 'active' : ''}" id="mapTabBtnStories">
          📍 Destination Stories (${DESTINATION_ITEMS.length})
        </button>
        <button type="button" class="hero-subtab-btn ${activeTab === 'stats' ? 'active' : ''}" id="mapTabBtnStats">
          🗺️ Stats & Headings
        </button>
      </div>

      <!-- Tab 1: Destination Stories Editor -->
      <div id="mapStoriesPane" style="${activeTab === 'stories' ? '' : 'display: none;'}">
        <div class="item-editor-card" style="margin-bottom: 12px; background: rgba(244, 63, 94, 0.04); border-color: rgba(244, 63, 94, 0.25);">
          <div class="item-editor-header" style="border-bottom: none; margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
              <span style="font-size: 1.2rem;">📍</span>
              <div style="flex-grow: 1;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Select Destination</label>
                <select id="mapCitySelector" style="font-weight: 600; font-size: 0.88rem; width: 100%; margin-top: 2px;">
                  ${renderDestinationOptions()}
                </select>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary" id="btnSpotlightCurrentCity" style="margin-left: 8px;" title="Spotlight destination on map">
              📍 Spotlight
            </button>
          </div>
        </div>

        <div class="item-editor-card" id="mapStoryCard">
          <div class="item-editor-header">
            <span class="item-editor-title">Story Content: ${currentStory.title || selectedCityKey}</span>
            <button type="button" class="btn-sm btn-outline" id="btnJumpToChapter" title="Find or edit linked timeline chapter">
              📖 View in Timeline
            </button>
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>Pin Emoji Icon</label>
              <input type="text" id="story_icon" value="${currentStory.icon || '📍'}" placeholder="⭐">
            </div>
            <div class="input-group">
              <label>Sub-Symbols (2 Emojis)</label>
              <input type="text" id="story_symbol" value="${currentStory.symbol || '✨'}" placeholder="🗼🍲">
            </div>
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>Story Subtitle / Tag Badge</label>
            <input type="text" id="story_tag" value="${currentStory.tag || ''}" placeholder="e.g. Our Favorite City in China">
          </div>

          <div class="input-group" style="margin-top: 8px;">
            <label>City & Story Headline Title</label>
            <input type="text" id="story_title" value="${currentStory.title || ''}" placeholder="e.g. Guangzhou (Canton Tower & Secret 50m Food ⭐)">
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
            <span class="item-editor-title">✈️ Love Mileage & Global Stats</span>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Total Distance Flown & Traveled</label>
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

    // Spotlight current city button
    const btnSpotCurrent = document.getElementById("btnSpotlightCurrentCity");
    if (btnSpotCurrent) {
      btnSpotCurrent.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "SPOTLIGHT_CITY", cityKey: selectedCityKey }, "*");
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

    const updateGradPreview = () => {
      if (sGradPreview) {
        sGradPreview.style.background = `linear-gradient(135deg, ${currentStory.colorA || '#1a1c2e'}, ${currentStory.colorB || '#7b1fa2'})`;
      }
    };

    if (sIcon) sIcon.oninput = (e) => { currentStory.icon = e.target.value; debouncedLiveUpdate(); };
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
          previewIframe.contentWindow.postMessage({ type: "SPOTLIGHT_CITY", cityKey }, "*");
        }
      };
    });
  };
})();

