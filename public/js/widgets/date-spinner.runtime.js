/**
 * Runtime Widget Engine: date-spinner.runtime.js
 * Modularized for high maintainability.
 */
function setupDateSpinner(customData, heroData) {
  const section = document.getElementById("dateNightSpinnerSection");
  if (!section) return;

  const sp = customData || window.SPINNER_OPTIONS || window.__TENANT_CONFIG__?.sectionsData?.spinner || {};
  const hero = heroData || window.__TENANT_CONFIG__?.sectionsData?.hero || {};
  const p1 = sp.partner1 || (typeof state !== "undefined" && state.senderName) || hero.partner1 || "Aghiles";
  const p2 = sp.partner2 || (typeof state !== "undefined" && state.partnerName) || hero.partner2 || "Ela";

  const foods = Array.isArray(sp.foods) && sp.foods.length > 0 ? sp.foods : [
    "🍕 Cheesy Local Pizza & Fries Night",
    "🍜 Cozy Indomie / Ramen Battle with Custom Toppings",
    "🌮 Favorite Local Fast Food (Algerian Tacos / Indo Street Eats)",
    "🍝 Cook the Same Pasta Recipe Live on Video",
    "🍔 Late-Night Comfort Burger & Soda",
    "🍳 Breakfast-for-Dinner Video Call (Time-Zone Match)"
  ];
  const activities = Array.isArray(sp.activities) && sp.activities.length > 0 ? sp.activities : [
    "🎬 Synced Movie Night (Teleparty / Discord) & FaceTime Sleep Call",
    "✈️ Planning Our Next Flight Reunion & Hotel Wishlist",
    "🎮 Cozy Online Gaming (Roblox / Plato / Sky / 8 Ball Pool)",
    "🎨 Virtual Drawing / Skribbl.io Doodle Duel",
    "🌌 Late-Night FaceTime Call with Spotify Jam & Lofi",
    "🗺️ Virtual Google Earth Tour of Spots We Want to Visit"
  ];
  const desserts = Array.isArray(sp.desserts) && sp.desserts.length > 0 ? sp.desserts : [
    "🥞 Warm Crepes or Waffles with Nutella",
    "🍦 Ice Cream Sundae or Local Gelato Treat",
    "🍫 Favorite Chocolate Bar & Hot Cocoa",
    "🍰 Local Patisserie Treat (Cake Slice or Millefeuille)",
    "☕ Fresh Mint Tea / Warm Coffee & Biscuits",
    "🍓 Fresh Fruit Bowl with Melted Chocolate"
  ];

  window.SPINNER_OPTIONS = { foods, activities, desserts, phone: sp.phone || "" };

  const spinBtn = document.getElementById("spinDateBtn");
  const lockBtn = document.getElementById("lockDateBtn");
  const rFood = document.getElementById("reelFood");
  const rAct = document.getElementById("reelActivity");
  const rDessert = document.getElementById("reelDessert");
  const alertBox = document.getElementById("dateLockAlert");
  const alertText = document.getElementById("dateLockText");
  const shareWhatsAppBtn = document.getElementById("shareDateWhatsAppBtn");

  let spinning = false;

  const getDateWhatsAppPayload = () => {
    const food = rFood ? rFood.textContent.trim() : "Delicious Food";
    const act = rAct ? rAct.textContent.trim() : "Fun Couple Activity";
    const dessert = rDessert ? rDessert.textContent.trim() : "Sweet Dessert";
    const msg = sp.waCustomMsg
      ? sp.waCustomMsg.replace("{food}", food).replace("{activity}", act).replace("{dessert}", dessert).replace("{p1}", p1).replace("{p2}", p2)
      : `${p2}! Our Date Night Spinner picked our next virtual date:\n🍽️ Dinner: ${food}\n🎮 Activity: ${act}\n🍨 Dessert: ${dessert}\n\nI can't wait to do this with you! Love you so much ❤️`;
    const encoded = encodeURIComponent(msg);
    const rawPhone = sp.phone || localStorage.getItem("gf_boyfriend_phone") || "";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const nativeApp = phone ? `whatsapp://send?phone=${phone}&text=${encoded}` : `whatsapp://send?text=${encoded}`;
    const webUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    return { msg, encoded, nativeApp, webUrl };
  };

  const updateDateWhatsAppUrl = () => {
    if (!shareWhatsAppBtn) return;
    const { webUrl } = getDateWhatsAppPayload();
    shareWhatsAppBtn.href = webUrl;
  };

  updateDateWhatsAppUrl();

  if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const { msg, nativeApp, webUrl } = getDateWhatsAppPayload();

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(msg).catch(() => {});
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = nativeApp;
        setTimeout(() => {
          if (document.hasFocus()) window.open(webUrl, "_blank");
        }, 1100);
      } else {
        window.open(webUrl, "_blank");
      }
      if (typeof showComplimentToast === "function") {
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "💬 Opening WhatsApp for partner! ❤️");
      }
    });
  }

  const triggerSpin = () => {
    if (spinning || !rFood || !rAct || !rDessert) return;
    spinning = true;
    if (alertBox) alertBox.classList.add("hidden");
    rFood.classList.add("spinning");
    rAct.classList.add("spinning");
    rDessert.classList.add("spinning");

    let counter = 0;
    const interval = setInterval(() => {
      rFood.textContent = foods[Math.floor(Math.random() * foods.length)];
      rAct.textContent = activities[Math.floor(Math.random() * activities.length)];
      rDessert.textContent = desserts[Math.floor(Math.random() * desserts.length)];
      if (typeof audio !== "undefined") audio.playTick();
      counter++;

      if (counter > 16) {
        clearInterval(interval);
        rFood.classList.remove("spinning");
        rAct.classList.remove("spinning");
        rDessert.classList.remove("spinning");
        spinning = false;
        if (typeof audio !== "undefined") audio.playChimeCascade();
        updateDateWhatsAppUrl();
        if (typeof particles !== "undefined" && spinBtn) {
          const b = spinBtn.getBoundingClientRect();
          particles.burst(b.left + b.width / 2, b.top + b.height / 2, 35);
        }
      }
    }, 80);
  };

  const triggerLock = () => {
    if (!rFood || !rAct || !rDessert) return;
    const plan = `${rFood.textContent} • ${rAct.textContent} • ${rDessert.textContent}`;
    if (alertText) alertText.textContent = `Locked In! Tonight's Date: ${plan} 💕`;
    if (alertBox) alertBox.classList.remove("hidden");
    if (typeof audio !== "undefined") audio.playFanfare();
    if (typeof particles !== "undefined") particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

    updateDateWhatsAppUrl();
    if (shareWhatsAppBtn) {
      shareWhatsAppBtn.classList.remove("hidden");
    }
  };

  if (spinBtn) spinBtn.addEventListener("click", triggerSpin);
  if (lockBtn) lockBtn.addEventListener("click", triggerLock);

  window.spinDate = triggerSpin;
  window.lockDate = triggerLock;
}

// Next Trip Planner & Interactive Live Boarding Pass Generator
const AIRPORT_CODES = {
  japan: "TYO",
  tokyo: "TYO",
  kyoto: "TYO",
  switzerland: "ZRH",
  zurich: "ZRH",
  maldives: "MLE",
  algeria: "ALG",
  algiers: "ALG",
  china: "CAN",
  guangzhou: "CAN",
  bali: "DPS",
  paris: "CDG",
  france: "CDG",
  rome: "FCO",
  italy: "FCO",
  turkey: "IST",
  istanbul: "IST",
  cappadocia: "NAV",
  azerbaijan: "GYD",
  baku: "GYD",
  iceland: "KEF",
  korea: "ICN",
  seoul: "ICN",
  london: "LHR",
  uk: "LHR",
  newyork: "JFK",
  dubai: "DXB"
};

