/**
 * High-Fidelity Visual SVG Previews for all 13 Modular Couple SaaS Widgets
 * Renders each widget in its "fully opened and visible" state.
 */
(function() {
  const PREVIEWS = {};

  // Helper to encode SVG to data URI
  function svgToUri(svgString) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString.trim());
  }

  // 1. HERO
  PREVIEWS.hero = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0f3"/>
          <stop offset="50%" stop-color="#ffe5ec"/>
          <stop offset="100%" stop-color="#fcddec"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#ff4365" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="800" height="480" fill="url(#heroBg)"/>
      <circle cx="80" cy="70" r="45" fill="#ffccd5" opacity="0.4"/>
      <circle cx="720" cy="400" r="60" fill="#ffccd5" opacity="0.4"/>

      <!-- Header Tag -->
      <rect x="290" y="30" width="220" height="32" rx="16" fill="#ff4365" opacity="0.9"/>
      <text x="400" y="51" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">👑 OUR INFINITE LOVE STORY</text>

      <!-- Main Title -->
      <text x="400" y="105" fill="#1e293b" font-family="Georgia, serif" font-size="34" font-weight="700" text-anchor="middle">Aghiles 💍 Ella</text>
      <text x="400" y="132" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">Happy Birthday My Princess • Forever &amp; Always ❤️</text>

      <!-- Dual LDR Clocks Card -->
      <rect x="80" y="160" width="300" height="150" rx="16" fill="#ffffff" filter="url(#cardShadow)"/>
      <text x="105" y="195" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">LIVE LONG DISTANCE TIME</text>
      <text x="105" y="235" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="24" font-weight="800">🇩🇿 14:30 <tspan fill="#94a3b8" font-size="14" font-weight="500">Algiers</tspan></text>
      <text x="105" y="275" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="24" font-weight="800">🇨🇳 21:30 <tspan fill="#94a3b8" font-size="14" font-weight="500">Guangzhou (+7h)</tspan></text>
      <rect x="295" y="220" width="65" height="24" rx="12" fill="#f1f5f9"/>
      <text x="327" y="236" fill="#475569" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">CONNECTED</text>

      <!-- Flight Reunion Ticket Card -->
      <rect x="420" y="160" width="300" height="150" rx="16" fill="#ffffff" filter="url(#cardShadow)"/>
      <text x="445" y="195" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">NEXT REUNION COUNTDOWN</text>
      <text x="445" y="238" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="28" font-weight="800">42 <tspan font-size="15" font-weight="600">Days</tspan> 14 <tspan font-size="15" font-weight="600">Hours</tspan></text>
      <text x="445" y="270" fill="#64748b" font-family="-apple-system, sans-serif" font-size="13">✈️ Flight AF-382 • Paris ➔ Guangzhou</text>
      <rect x="445" y="285" width="250" height="6" rx="3" fill="#ffccd5"/>
      <rect x="445" y="285" width="175" height="6" rx="3" fill="#ff4365"/>

      <!-- Vinyl Soundtrack Bar -->
      <rect x="180" y="340" width="440" height="70" rx="35" fill="#1e293b" filter="url(#cardShadow)"/>
      <circle cx="220" cy="375" r="22" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
      <circle cx="220" cy="375" r="7" fill="#fbbf24"/>
      <text x="260" y="370" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="15" font-weight="700">The Fate of Ophelia 🎵</text>
      <text x="260" y="390" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">Taylor Swift ✨ • Live Music Visualizer</text>
      <rect x="560" y="358" width="34" height="34" rx="17" fill="#ff4365"/>
      <polygon points="573,369 573,381 583,375" fill="#ffffff"/>
    </svg>
  `);

  // 2. LOVE METER
  PREVIEWS.love_meter = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fff5f5"/>
      <rect x="150" y="40" width="500" height="400" rx="20" fill="#ffffff" stroke="#ffd1dc" stroke-width="2"/>
      <text x="400" y="80" fill="#ff4365" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">📈 The Real-Time Lof-O-Meter</text>
      <text x="400" y="105" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Quintillion Heart Gauge • Maximum Overdrive Reached ✨</text>
      <circle cx="400" cy="210" r="85" fill="#fff0f3" stroke="#ff4365" stroke-width="8"/>
      <text x="400" y="205" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="44" font-weight="900" text-anchor="middle">100%</text>
      <text x="400" y="235" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">QUINTILLION LOF 💥</text>
      <rect x="220" y="320" width="360" height="18" rx="9" fill="#ffe4e6"/>
      <rect x="220" y="320" width="360" height="18" rx="9" fill="#ff4365"/>
      <rect x="210" y="365" width="115" height="44" rx="12" fill="#ff4365"/>
      <text x="267" y="392" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">💋 +1000 Kisses</text>
      <rect x="342" y="365" width="115" height="44" rx="12" fill="#ff4365"/>
      <text x="399" y="392" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">🤗 Mega Hugs</text>
      <rect x="475" y="365" width="115" height="44" rx="12" fill="#fb7185"/>
      <text x="532" y="392" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">✨ Infinite Lof</text>
    </svg>
  `);

  // 3. REASONS
  PREVIEWS.reasons = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fdf4f5"/>
      <text x="400" y="65" fill="#1e293b" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">💌 Reasons Why I Lof You</text>
      <text x="400" y="92" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Tactile Romance Card Deck (Revealed Note)</text>
      <!-- Fanned Cards -->
      <rect x="210" y="140" width="380" height="230" rx="16" fill="#fbcfe8" transform="rotate(-4 400 250)"/>
      <rect x="210" y="140" width="380" height="230" rx="16" fill="#ffe4e6" transform="rotate(3 400 250)"/>
      <!-- Main Card -->
      <rect x="210" y="140" width="380" height="230" rx="16" fill="#ffffff" stroke="#f43f5e" stroke-width="2"/>
      <rect x="235" y="165" width="80" height="22" rx="11" fill="#ffe4e6"/>
      <text x="275" y="180" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">ROMANCE</text>
      <text x="560" y="182" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="end">#14 of 50</text>
      <text x="400" y="235" fill="#1e293b" font-family="Georgia, serif" font-size="20" font-weight="600" text-anchor="middle">"The way your eyes light up with joy</text>
      <text x="400" y="265" fill="#1e293b" font-family="Georgia, serif" font-size="20" font-weight="600" text-anchor="middle">every time we share warm dumplings in Guangzhou."</text>
      <text x="400" y="325" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle">❤️ Endless Love &amp; Kisses</text>
      <rect x="310" y="395" width="80" height="36" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="350" y="418" fill="#475569" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">◀ Prev</text>
      <rect x="410" y="395" width="80" height="36" rx="18" fill="#ff4365"/>
      <text x="450" y="418" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Next ▶</text>
    </svg>
  `);

  // 4. TIMELINE
  PREVIEWS.timeline = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fffaf5"/>
      <text x="400" y="60" fill="#1e293b" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">📖 Chapters of Our Journey</text>
      <text x="400" y="85" fill="#d97706" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Chronological Milestones, Photos &amp; Stories</text>
      <!-- Timeline stem -->
      <line x1="160" y1="120" x2="160" y2="440" stroke="#fcd34d" stroke-width="4" stroke-dasharray="6,6"/>
      <circle cx="160" cy="180" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="4"/>
      <!-- Chapter Card -->
      <rect x="200" y="135" width="520" height="260" rx="16" fill="#ffffff" stroke="#fde68a" stroke-width="2"/>
      <rect x="225" y="160" width="110" height="24" rx="12" fill="#fef3c7"/>
      <text x="280" y="176" fill="#b45309" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">🇨🇳 GUANGZHOU</text>
      <text x="225" y="215" fill="#1e293b" font-family="Georgia, serif" font-size="22" font-weight="700">Chapter 1: Where Our Magic Began ⭐</text>
      <text x="225" y="245" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14">Late night strolls along the Pearl River, Canton Tower views &amp; dim sum feasts.</text>
      <!-- Photos mini strip -->
      <rect x="225" y="270" width="90" height="70" rx="8" fill="#ffedd5"/>
      <text x="270" y="310" font-size="24" text-anchor="middle">🗼</text>
      <rect x="325" y="270" width="90" height="70" rx="8" fill="#fee2e2"/>
      <text x="370" y="310" font-size="24" text-anchor="middle">🥟</text>
      <rect x="425" y="270" width="90" height="70" rx="8" fill="#fef9c3"/>
      <text x="470" y="310" font-size="24" text-anchor="middle">🌸</text>
      <!-- Read button -->
      <rect x="545" y="285" width="150" height="40" rx="20" fill="#f59e0b"/>
      <text x="620" y="310" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Read Full Story →</text>
    </svg>
  `);

  // 5. MAP
  PREVIEWS.map = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#f0f9ff"/>
      <text x="400" y="55" fill="#0369a1" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🗺️ Interactive Love Map</text>
      <!-- Map Background Graphic -->
      <rect x="80" y="80" width="640" height="360" rx="18" fill="#e0f2fe" stroke="#bae6fd" stroke-width="2"/>
      <!-- Continents simplified -->
      <path d="M120,200 Q160,160 220,180 T260,280 T160,340 Z" fill="#bae6fd"/>
      <path d="M420,150 Q520,120 620,170 T660,300 T500,320 Z" fill="#bae6fd"/>
      <!-- Flight Path Curve -->
      <path d="M220,240 Q380,110 540,220" fill="none" stroke="#ff4365" stroke-width="3" stroke-dasharray="6,6"/>
      <circle cx="220" cy="240" r="8" fill="#ff4365"/>
      <text x="220" y="265" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">🇩🇿 Algiers</text>
      <circle cx="540" cy="220" r="10" fill="#ff4365"/>
      <text x="540" y="245" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">🇨🇳 Guangzhou ⭐</text>
      <circle cx="590" cy="290" r="7" fill="#0284c7"/>
      <text x="590" y="310" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="11" font-weight="600" text-anchor="middle">🇮🇩 Bali</text>
      <!-- Floating Postcard Box -->
      <rect x="420" y="320" width="280" height="95" rx="12" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="435" y="345" fill="#0369a1" font-family="-apple-system, sans-serif" font-size="11" font-weight="800">AIRMAIL 💌 GUANGZHOU BASE</text>
      <text x="435" y="370" fill="#334155" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">"Where all our sweet memories live ❤️"</text>
      <text x="435" y="395" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">15 Cities Explored Together →</text>
    </svg>
  `);

  // 6. TRUTH OR DARE
  PREVIEWS.truth_dare = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#18181b"/>
      <text x="400" y="60" fill="#fafafa" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🍾 Truth or Dare: 100% Fair &amp; Square</text>
      <text x="400" y="85" fill="#a1a1aa" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Animated Spinning Bottle Duel &amp; Couples Scoreboard</text>
      <!-- Arena Circle -->
      <circle cx="260" cy="260" r="130" fill="#27272a" stroke="#a855f7" stroke-width="4"/>
      <!-- Bottle in Center -->
      <rect x="250" y="170" width="20" height="120" rx="10" fill="#22c55e" transform="rotate(35 260 260)"/>
      <circle cx="260" cy="260" r="25" fill="#a855f7"/>
      <text x="260" y="265" fill="#ffffff" font-size="14" text-anchor="middle">🍾</text>
      <!-- Dare Card -->
      <rect x="440" y="140" width="300" height="240" rx="16" fill="#27272a" stroke="#ec4899" stroke-width="2"/>
      <rect x="465" y="165" width="70" height="24" rx="12" fill="#ec4899"/>
      <text x="500" y="181" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">DARE 🔥</text>
      <text x="465" y="225" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="700">"Give Ella 10 gentle</text>
      <text x="465" y="255" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="700">kisses on the cheek &amp; whisper</text>
      <text x="465" y="285" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="700">your sweetest memory!"</text>
      <rect x="465" y="320" width="250" height="40" rx="10" fill="#ec4899"/>
      <text x="590" y="345" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">DONE! (+1 POINT) 💋</text>
    </svg>
  `);

  // 7. SPINNER
  PREVIEWS.spinner = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fff7ed"/>
      <text x="400" y="60" fill="#c2410c" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🎡 Date Night Roulette Spinner</text>
      <text x="400" y="85" fill="#ea580c" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Slot Machine Reels: Dinner + Activity + Sweet Treat</text>
      <!-- Slot Machine Frame -->
      <rect x="120" y="120" width="560" height="240" rx="20" fill="#ffffff" stroke="#fdba74" stroke-width="3"/>
      <!-- Reel 1 -->
      <rect x="150" y="150" width="150" height="150" rx="14" fill="#ffedd5" stroke="#fb923c" stroke-width="2"/>
      <text x="225" y="210" font-size="38" text-anchor="middle">🍝</text>
      <text x="225" y="250" fill="#9a3412" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Candlelight Pasta</text>
      <!-- Reel 2 -->
      <rect x="325" y="150" width="150" height="150" rx="14" fill="#ffedd5" stroke="#fb923c" stroke-width="2"/>
      <text x="400" y="210" font-size="38" text-anchor="middle">🎬</text>
      <text x="400" y="250" fill="#9a3412" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Rooftop Cinema</text>
      <!-- Reel 3 -->
      <rect x="500" y="150" width="150" height="150" rx="14" fill="#ffedd5" stroke="#fb923c" stroke-width="2"/>
      <text x="575" y="210" font-size="38" text-anchor="middle">🧋</text>
      <text x="575" y="250" fill="#9a3412" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Mango Boba Feasts</text>
      <!-- Spin Button -->
      <rect x="300" y="380" width="200" height="48" rx="24" fill="#ea580c"/>
      <text x="400" y="410" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle">✨ SPIN OUR DATE ✨</text>
    </svg>
  `);

  // 8. MEMORIES
  PREVIEWS.memories = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#faf5ff"/>
      <text x="400" y="55" fill="#6b21a8" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">📸 Polaroid Photo Wall</text>
      <text x="400" y="80" fill="#9333ea" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">3D Flippable Polaroid Frames &amp; Lightbox Zoom</text>
      <!-- Polaroid 1 -->
      <g transform="rotate(-6 220 250)">
        <rect x="130" y="120" width="180" height="230" rx="6" fill="#ffffff" stroke="#e9d5ff" stroke-width="2"/>
        <rect x="145" y="135" width="150" height="140" fill="#f3e8ff"/>
        <text x="220" y="215" font-size="40" text-anchor="middle">🌅</text>
        <text x="220" y="310" fill="#4c1d95" font-family="Georgia, serif" font-size="14" font-weight="700" text-anchor="middle">Sunset Stroll ❤️</text>
      </g>
      <!-- Polaroid 2 -->
      <g transform="rotate(4 400 240)">
        <rect x="310" y="110" width="180" height="230" rx="6" fill="#ffffff" stroke="#e9d5ff" stroke-width="2"/>
        <rect x="325" y="125" width="150" height="140" fill="#fce7f3"/>
        <text x="400" y="205" font-size="40" text-anchor="middle">✈️</text>
        <text x="400" y="300" fill="#4c1d95" font-family="Georgia, serif" font-size="14" font-weight="700" text-anchor="middle">Airport Reunion Hug</text>
      </g>
      <!-- Polaroid 3 -->
      <g transform="rotate(-3 580 250)">
        <rect x="490" y="120" width="180" height="230" rx="6" fill="#ffffff" stroke="#e9d5ff" stroke-width="2"/>
        <rect x="505" y="135" width="150" height="140" fill="#e0e7ff"/>
        <text x="580" y="215" font-size="40" text-anchor="middle">☕</text>
        <text x="580" y="310" fill="#4c1d95" font-family="Georgia, serif" font-size="14" font-weight="700" text-anchor="middle">Cute Matcha Date</text>
      </g>
      <rect x="320" y="390" width="160" height="36" rx="18" fill="#9333ea"/>
      <text x="400" y="413" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">🔍 Tap to Zoom</text>
    </svg>
  `);

  // 9. COUPONS
  PREVIEWS.coupons = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fffbeb"/>
      <text x="400" y="60" fill="#b45309" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🎟️ Scratch-Off Love Coupons</text>
      <text x="400" y="85" fill="#d97706" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Revealed Golden Privilege Vouchers for Ella</text>
      <!-- Coupon 1 -->
      <rect x="90" y="130" width="190" height="240" rx="14" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
      <rect x="90" y="130" width="190" height="36" rx="14" fill="#fef3c7"/>
      <text x="185" y="153" fill="#b45309" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">VOUCHER #1 ✨</text>
      <text x="185" y="220" font-size="40" text-anchor="middle">💆</text>
      <text x="185" y="260" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Full Body Massage</text>
      <text x="185" y="285" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">30 mins relaxation</text>
      <rect x="120" y="315" width="130" height="30" rx="6" fill="#10b981"/>
      <text x="185" y="335" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">✓ REDEEMED</text>
      <!-- Coupon 2 -->
      <rect x="305" y="130" width="190" height="240" rx="14" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
      <rect x="305" y="130" width="190" height="36" rx="14" fill="#fef3c7"/>
      <text x="400" y="153" fill="#b45309" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">VOUCHER #2 🌹</text>
      <text x="400" y="220" font-size="40" text-anchor="middle">🍽️</text>
      <text x="400" y="260" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Fancy Dinner Date</text>
      <text x="400" y="285" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Any restaurant picked</text>
      <rect x="335" y="315" width="130" height="30" rx="6" fill="#f59e0b"/>
      <text x="400" y="335" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">CLAIM VOUCHER</text>
      <!-- Coupon 3 -->
      <rect x="520" y="130" width="190" height="240" rx="14" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
      <rect x="520" y="130" width="190" height="36" rx="14" fill="#fef3c7"/>
      <text x="615" y="153" fill="#b45309" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">VOUCHER #3 🍿</text>
      <text x="615" y="220" font-size="40" text-anchor="middle">🎬</text>
      <text x="615" y="260" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Movie &amp; Cuddles</text>
      <text x="615" y="285" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Unlimited popcorn</text>
      <rect x="550" y="315" width="130" height="30" rx="6" fill="#f59e0b"/>
      <text x="615" y="335" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">CLAIM VOUCHER</text>
    </svg>
  `);

  // 10. BOARDING PASS
  PREVIEWS.boarding_pass = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#f1f5f9"/>
      <text x="400" y="55" fill="#0f172a" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">✈️ Next Adventure &amp; Boarding Pass</text>
      <!-- Main Boarding Pass -->
      <rect x="100" y="100" width="600" height="270" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Top Red Brand Bar -->
      <rect x="100" y="100" width="600" height="50" rx="18" fill="#ff4365"/>
      <text x="130" y="132" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">INFINITE LOF AIRWAYS ✈️</text>
      <text x="670" y="132" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="end">FIRST CLASS VIP</text>
      <!-- Content Details -->
      <text x="130" y="185" fill="#64748b" font-size="11" font-weight="700">PASSENGER</text>
      <text x="130" y="210" fill="#0f172a" font-size="18" font-weight="800">Ella &amp; Aghiles</text>
      <text x="320" y="185" fill="#64748b" font-size="11" font-weight="700">FLIGHT</text>
      <text x="320" y="210" fill="#ff4365" font-size="18" font-weight="800">LOF-2026</text>
      <text x="440" y="185" fill="#64748b" font-size="11" font-weight="700">SEAT</text>
      <text x="440" y="210" fill="#0f172a" font-size="18" font-weight="800">01A (VIP)</text>
      <!-- Route -->
      <text x="130" y="260" fill="#64748b" font-size="11" font-weight="700">ROUTE</text>
      <text x="130" y="295" fill="#0f172a" font-size="24" font-weight="800">ALG ➔ CAN <tspan fill="#ff4365" font-size="14">(Dream Trip)</tspan></text>
      <!-- Barcode stub -->
      <line x1="560" y1="150" x2="560" y2="370" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6,6"/>
      <text x="630" y="200" font-size="36" text-anchor="middle">🎁</text>
      <text x="630" y="240" fill="#0f172a" font-size="13" font-weight="700" text-anchor="middle">BOARDING PASS</text>
      <rect x="580" y="260" width="100" height="30" fill="#e2e8f0"/>
      <text x="630" y="280" font-family="monospace" font-size="11" text-anchor="middle">||||||||||||||||</text>
      <!-- Download Button -->
      <rect x="300" y="395" width="200" height="44" rx="22" fill="#ff4365"/>
      <text x="400" y="422" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">📥 Download Ticket PNG</text>
    </svg>
  `);

  // 11. QUIZ
  PREVIEWS.quiz = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fdf2f8"/>
      <text x="400" y="55" fill="#9d174d" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🧠 Couples Trivia Challenge</text>
      <!-- Question Card -->
      <rect x="140" y="90" width="520" height="280" rx="18" fill="#ffffff" stroke="#fbcfe8" stroke-width="2"/>
      <rect x="165" y="115" width="120" height="24" rx="12" fill="#fce7f3"/>
      <text x="225" y="131" fill="#be185d" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">QUESTION 5 OF 5</text>
      <text x="635" y="131" fill="#10b981" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="end">Score: 5/5 ⭐</text>
      <text x="165" y="180" fill="#1e293b" font-family="Georgia, serif" font-size="20" font-weight="700">"Where was our very first official date together?"</text>
      <!-- Answers -->
      <rect x="165" y="210" width="470" height="40" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
      <text x="185" y="235" fill="#15803d" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">✓ The cozy dim sum tea shop in Guangzhou</text>
      <rect x="165" y="260" width="470" height="40" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="185" y="285" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14">Paris cafe near the Seine</text>
      <rect x="165" y="310" width="470" height="40" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="185" y="335" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14">A rooftop lounge in Shanghai</text>
      <!-- Certificate Button -->
      <rect x="280" y="395" width="240" height="44" rx="22" fill="#be185d"/>
      <text x="400" y="422" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">📜 View Certificate of Love</text>
    </svg>
  `);

  // 12. LETTER
  PREVIEWS.letter = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fefce8"/>
      <!-- Unfolded Parchment Paper -->
      <rect x="140" y="40" width="520" height="400" rx="12" fill="#fef9c3" stroke="#fde047" stroke-width="2"/>
      <!-- Broken Seal at Top -->
      <circle cx="400" cy="55" r="18" fill="#e11d48"/>
      <text x="400" y="61" fill="#ffffff" font-size="14" text-anchor="middle">💌</text>
      <!-- Audio Player Bar -->
      <rect x="200" y="85" width="400" height="38" rx="19" fill="#713f12" opacity="0.1"/>
      <circle cx="225" cy="104" r="12" fill="#e11d48"/>
      <polygon points="222,99 222,109 230,104" fill="#ffffff"/>
      <text x="250" y="109" fill="#854d0e" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">▶️ Play Voice Reading • 02:45</text>
      <!-- Letter Calligraphy Text -->
      <text x="190" y="160" fill="#713f12" font-family="Georgia, serif" font-size="22" font-style="italic">Dearest Ella,</text>
      <text x="190" y="200" fill="#854d0e" font-family="Georgia, serif" font-size="15">Happy Birthday my darling! Looking back at every single mile</text>
      <text x="190" y="230" fill="#854d0e" font-family="Georgia, serif" font-size="15">we traveled and every late night call across 7 timezones,</text>
      <text x="190" y="260" fill="#854d0e" font-family="Georgia, serif" font-size="15">I know without a doubt that you are my destiny and soulmate.</text>
      <text x="190" y="290" fill="#854d0e" font-family="Georgia, serif" font-size="15">May all your sweetest birthday dreams come true!</text>
      <text x="190" y="340" fill="#713f12" font-family="Georgia, serif" font-size="17" font-style="italic">Forever &amp; Always Yours with Infinite Kisses,</text>
      <text x="190" y="370" fill="#e11d48" font-family="Georgia, serif" font-size="20" font-weight="700">Aghiles ❤️</text>
    </svg>
  `);

  // 13. PLAYFUL
  PREVIEWS.playful = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fff1f2"/>
      <text x="400" y="70" fill="#e11d48" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🙈 Playful Quick Question</text>
      <!-- Question Card -->
      <rect x="180" y="110" width="440" height="280" rx="20" fill="#ffffff" stroke="#fecdd3" stroke-width="2"/>
      <text x="400" y="170" font-size="44" text-anchor="middle">🥺❤️</text>
      <text x="400" y="220" fill="#1e293b" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">"Do you lof me with all your heart?"</text>
      <!-- Big YES Button -->
      <rect x="230" y="270" width="200" height="56" rx="28" fill="#ff4365"/>
      <text x="330" y="305" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle">YES! 1000% YES! 💖</text>
      <!-- Runaway NO Button -->
      <g transform="translate(460, 275) rotate(-8)">
        <rect width="80" height="46" rx="23" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="40" y="28" fill="#64748b" font-family="-apple-system, sans-serif" font-size="13" font-weight="600" text-anchor="middle">No... 🏃‍♂️</text>
      </g>
      <text x="400" y="360" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">✨ (Warning: The 'No' button runs away when you try to tap it!)</text>
    </svg>
  `);

  
  // 14. CANDLE BLOWOUT
  PREVIEWS.candle_blowout = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fff5f7"/>
      <text x="400" y="60" fill="#ff4365" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🎂 Candle Blow-Out &amp; Wish Reveal</text>
      <text x="400" y="88" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Mic/Click Trigger • Animated Flames • Secret Wish Card</text>
      <!-- Cake Stand -->
      <rect x="250" y="340" width="300" height="14" rx="7" fill="#cbd5e1"/>
      <rect x="370" y="354" width="60" height="24" rx="4" fill="#94a3b8"/>
      <!-- Cake Bottom Tier -->
      <rect x="280" y="240" width="240" height="100" rx="14" fill="#ff4365"/>
      <rect x="280" y="240" width="240" height="20" rx="10" fill="#ffffff"/>
      <!-- Cake Top Tier -->
      <rect x="320" y="160" width="160" height="80" rx="12" fill="#ff758c"/>
      <rect x="320" y="160" width="160" height="16" rx="8" fill="#ffffff"/>
      <!-- Candles -->
      <g transform="translate(345, 110)">
        <rect x="0" y="15" width="8" height="35" rx="3" fill="#ffd166"/>
        <ellipse cx="4" cy="5" rx="7" ry="12" fill="#ff9e00"/>
        <ellipse cx="4" cy="6" rx="4" ry="7" fill="#ffff3f"/>
      </g>
      <g transform="translate(395, 100)">
        <rect x="0" y="15" width="8" height="45" rx="3" fill="#ffd166"/>
        <ellipse cx="4" cy="5" rx="8" ry="14" fill="#ff9e00"/>
        <ellipse cx="4" cy="6" rx="5" ry="8" fill="#ffff3f"/>
      </g>
      <g transform="translate(445, 110)">
        <rect x="0" y="15" width="8" height="35" rx="3" fill="#ffd166"/>
        <ellipse cx="4" cy="5" rx="7" ry="12" fill="#ff9e00"/>
        <ellipse cx="4" cy="6" rx="4" ry="7" fill="#ffff3f"/>
      </g>
      <!-- Controls -->
      <rect x="260" y="395" width="130" height="40" rx="20" fill="#ff4365"/>
      <text x="325" y="420" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">💨 Blow Candles</text>
      <rect x="410" y="395" width="130" height="40" rx="20" fill="#ffffff" stroke="#ff4365" stroke-width="2"/>
      <text x="475" y="420" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">🎙️ Mic Trigger</text>
    </svg>
  `);

  // 15. MILESTONE STATS
  PREVIEWS.milestone_stats = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#f8fafc"/>
      <text x="400" y="60" fill="#1e293b" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">⏳ Milestone Life Stats</text>
      <text x="400" y="88" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Total Alive Seconds Ticker + Quirky Life Metrics</text>
      <!-- Alive Ticker Card -->
      <rect x="120" y="115" width="560" height="120" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <text x="400" y="145" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">TOTAL TIME ALIVE</text>
      <!-- Slots -->
      <rect x="140" y="160" width="115" height="55" rx="10" fill="#fff1f2"/>
      <text x="197" y="195" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">8,760</text>
      <text x="197" y="210" fill="#64748b" font-size="10" text-anchor="middle">DAYS</text>

      <rect x="270" y="160" width="115" height="55" rx="10" fill="#fff1f2"/>
      <text x="327" y="195" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">14</text>
      <text x="327" y="210" fill="#64748b" font-size="10" text-anchor="middle">HOURS</text>

      <rect x="400" y="160" width="115" height="55" rx="10" fill="#fff1f2"/>
      <text x="457" y="195" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">38</text>
      <text x="457" y="210" fill="#64748b" font-size="10" text-anchor="middle">MINUTES</text>

      <rect x="530" y="160" width="115" height="55" rx="10" fill="#fff1f2"/>
      <text x="587" y="195" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">42</text>
      <text x="587" y="210" fill="#64748b" font-size="10" text-anchor="middle">SECONDS</text>

      <!-- Quirky Grid -->
      <rect x="120" y="255" width="265" height="85" rx="14" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="145" y="305" font-size="28">💓</text>
      <text x="190" y="290" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="18" font-weight="800">908,236,800</text>
      <text x="190" y="315" fill="#64748b" font-size="12">Estimated Heartbeats</text>

      <rect x="415" y="255" width="265" height="85" rx="14" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="440" y="305" font-size="28">☕</text>
      <text x="485" y="290" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="18" font-weight="800">14,016 Cups</text>
      <text x="485" y="315" fill="#64748b" font-size="12">Coffee &amp; Morning Tea</text>

      <rect x="120" y="355" width="265" height="85" rx="14" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="145" y="405" font-size="28">🌍</text>
      <text x="190" y="390" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="18" font-weight="800">24.00 Orbits</text>
      <text x="190" y="415" fill="#64748b" font-size="12">Trips Around the Sun</text>

      <rect x="415" y="355" width="265" height="85" rx="14" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="440" y="405" font-size="28">💤</text>
      <text x="485" y="390" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="18" font-weight="800">70,080 Hours</text>
      <text x="485" y="415" fill="#64748b" font-size="12">Hours of Sweet Dreams</text>
    </svg>
  `);

  // 16. GIFT UNBOXER
  PREVIEWS.gift_unboxer = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fef2f2"/>
      <text x="400" y="60" fill="#e11d48" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🎁 3D Surprise Gift Unboxer</text>
      <text x="400" y="88" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Untie Ribbon ➔ Lift Lid ➔ Surprise Reveal</text>
      <!-- 3D Gift Box -->
      <g transform="translate(320, 140)">
        <rect x="0" y="50" width="160" height="130" rx="12" fill="#ff4365"/>
        <rect x="65" y="50" width="30" height="130" fill="#ffd166"/>
        <rect x="0" y="100" width="160" height="30" fill="#ffd166"/>
        <!-- Lid flying off -->
        <g transform="translate(-20, -30) rotate(-18)">
          <rect x="0" y="20" width="180" height="40" rx="8" fill="#ff5d82"/>
          <rect x="75" y="20" width="30" height="40" fill="#ffd166"/>
          <text x="90" y="15" font-size="36" text-anchor="middle">🎀</text>
        </g>
      </g>
      <!-- Surprise Card Pop Out -->
      <rect x="220" y="310" width="360" height="130" rx="16" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
      <rect x="330" y="325" width="140" height="24" rx="12" fill="#fef3c7"/>
      <text x="400" y="341" fill="#b45309" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">🎟️ SPECIAL BIRTHDAY PASS</text>
      <text x="400" y="380" fill="#1e293b" font-family="Georgia, serif" font-size="18" font-weight="700" text-anchor="middle">VIP Shopping &amp; Romantic Dinner</text>
      <text x="400" y="405" fill="#64748b" font-size="12" text-anchor="middle">All-expenses covered • Valid anytime anywhere! ✨</text>
      <rect x="310" y="415" width="180" height="18" rx="9" fill="#ff4365"/>
      <text x="400" y="428" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Claim Birthday Gift</text>
    </svg>
  `);

  // 17. ROAST & TOAST
  PREVIEWS.roast_toast = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fffbeb"/>
      <text x="400" y="60" fill="#b45309" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">🥂 Roast &amp; Toast Birthday Wheel 🔥</text>
      <text x="400" y="88" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Spin the Wheel • Alternates Funny Roasts &amp; Sweet Toasts</text>
      <!-- Wheel -->
      <g transform="translate(400, 240)">
        <circle cx="0" cy="0" r="130" fill="#ffffff" stroke="#cbd5e1" stroke-width="6"/>
        <!-- Slices -->
        <path d="M 0 0 L 130 0 A 130 130 0 0 1 91.9 91.9 Z" fill="#ef4444"/>
        <path d="M 0 0 L 91.9 91.9 A 130 130 0 0 1 0 130 Z" fill="#f59e0b"/>
        <path d="M 0 0 L 0 130 A 130 130 0 0 1 -91.9 91.9 Z" fill="#ef4444"/>
        <path d="M 0 0 L -91.9 91.9 A 130 130 0 0 1 -130 0 Z" fill="#f59e0b"/>
        <path d="M 0 0 L -130 0 A 130 130 0 0 1 -91.9 -91.9 Z" fill="#ef4444"/>
        <path d="M 0 0 L -91.9 -91.9 A 130 130 0 0 1 0 -130 Z" fill="#f59e0b"/>
        <path d="M 0 0 L 0 -130 A 130 130 0 0 1 91.9 -91.9 Z" fill="#ef4444"/>
        <path d="M 0 0 L 91.9 -91.9 A 130 130 0 0 1 130 0 Z" fill="#f59e0b"/>
        <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <text x="0" y="8" font-size="20" text-anchor="middle">🎲</text>
      </g>
      <!-- Pointer -->
      <polygon points="400,105 388,85 412,85" fill="#ef4444"/>
      <!-- Button -->
      <rect x="320" y="395" width="160" height="46" rx="23" fill="#ff4365"/>
      <text x="400" y="424" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">Spin the Wheel! 🎯</text>
    </svg>
  `);

  // 18. GUESTBOOK WISH WALL
  PREVIEWS.guestbook = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#f8fafc"/>
      <text x="400" y="55" fill="#1e293b" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">📌 Guestbook Wish Wall</text>
      <text x="400" y="82" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Visitor Message Submissions &amp; Photo Pins</text>
      <!-- Corkboard -->
      <rect x="80" y="105" width="640" height="345" rx="16" fill="#fbf7ee" stroke="#d4a373" stroke-width="8"/>
      <!-- Sticky Note 1 -->
      <g transform="translate(120, 150) rotate(-3)">
        <rect width="160" height="170" rx="3" fill="#fef08a" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <circle cx="80" cy="0" r="6" fill="#ef4444"/>
        <text x="18" y="45" font-family="Georgia, serif" font-size="14" fill="#713f12">Happy 24th bff! 🎂</text>
        <text x="18" y="70" font-family="Georgia, serif" font-size="12" fill="#854d0e">May all your sweetest</text>
        <text x="18" y="90" font-family="Georgia, serif" font-size="12" fill="#854d0e">dreams come true!</text>
        <text x="18" y="145" font-size="11" font-weight="700" fill="#713f12">— Maya (Bestie)</text>
      </g>
      <!-- Sticky Note 2 -->
      <g transform="translate(320, 145) rotate(2)">
        <rect width="160" height="170" rx="3" fill="#fbcfe8" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <circle cx="80" cy="0" r="6" fill="#ef4444"/>
        <text x="18" y="45" font-family="Georgia, serif" font-size="14" fill="#831843">Princess Ella ❤️</text>
        <text x="18" y="70" font-family="Georgia, serif" font-size="12" fill="#9d174d">You illuminate my whole</text>
        <text x="18" y="90" font-family="Georgia, serif" font-size="12" fill="#9d174d">world with endless lof.</text>
        <text x="18" y="145" font-size="11" font-weight="700" fill="#831843">— Aghiles 💍</text>
      </g>
      <!-- Sticky Note 3 -->
      <g transform="translate(520, 155) rotate(-2)">
        <rect width="160" height="170" rx="3" fill="#bae6fd" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <circle cx="80" cy="0" r="6" fill="#ef4444"/>
        <text x="18" y="45" font-family="Georgia, serif" font-size="14" fill="#0c4a6e">To health &amp; joy! 🥂</text>
        <text x="18" y="70" font-family="Georgia, serif" font-size="12" fill="#0369a1">So proud of everything</text>
        <text x="18" y="90" font-family="Georgia, serif" font-size="12" fill="#0369a1">you achieve each year!</text>
        <text x="18" y="145" font-size="11" font-weight="700" fill="#0c4a6e">— Leo (Family)</text>
      </g>
      <!-- Add Button -->
      <rect x="310" y="375" width="180" height="42" rx="21" fill="#ff4365"/>
      <text x="400" y="401" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">✍️ Pin a Birthday Wish</text>
    </svg>
  `);

  // 19. PARTY JUKEBOX
  PREVIEWS.party_jukebox = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#0f172a"/>
      <text x="400" y="55" fill="#f8fafc" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">📻 Party Jukebox &amp; Playlist</text>
      <text x="400" y="82" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Vinyl Turntable • Animated Audio Equalizer • Birthday Bops</text>
      <!-- Jukebox Player Deck -->
      <rect x="80" y="110" width="640" height="335" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <!-- Vinyl Turntable -->
      <g transform="translate(220, 270)">
        <circle cx="0" cy="0" r="105" fill="#000000" stroke="#334155" stroke-width="4"/>
        <circle cx="0" cy="0" r="70" fill="#09090b" stroke="#18181b" stroke-width="2"/>
        <circle cx="0" cy="0" r="35" fill="#ff4365"/>
        <text x="0" y="8" font-size="22" text-anchor="middle">🎂</text>
        <!-- Tone arm -->
        <g transform="translate(80, -90) rotate(20)">
          <circle cx="0" cy="0" r="10" fill="#94a3b8"/>
          <rect x="-2" y="0" width="4" height="110" fill="#cbd5e1"/>
          <rect x="-6" y="100" width="12" height="18" fill="#f59e0b"/>
        </g>
      </g>
      <!-- Player Controls & Equalizer -->
      <g transform="translate(380, 160)">
        <text x="0" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="22" font-weight="800">Celebration Jam 🎵</text>
        <text x="0" y="50" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="14">Kool &amp; The Gang • Birthday Track 01</text>
        <!-- Equalizer Bars -->
        <g transform="translate(0, 75)">
          <rect x="0" y="10" width="8" height="25" rx="4" fill="#ff4365"/>
          <rect x="14" y="0" width="8" height="35" rx="4" fill="#fbbf24"/>
          <rect x="28" y="18" width="8" height="17" rx="4" fill="#ff4365"/>
          <rect x="42" y="5" width="8" height="30" rx="4" fill="#fbbf24"/>
          <rect x="56" y="12" width="8" height="23" rx="4" fill="#ff4365"/>
          <rect x="70" y="0" width="8" height="35" rx="4" fill="#fbbf24"/>
          <rect x="84" y="8" width="8" height="27" rx="4" fill="#ff4365"/>
        </g>
        <!-- Controls -->
        <g transform="translate(0, 135)">
          <rect x="0" y="0" width="45" height="40" rx="10" fill="#334155"/>
          <text x="22" y="25" fill="#ffffff" font-size="15" text-anchor="middle">⏮️</text>
          <rect x="55" y="0" width="90" height="40" rx="20" fill="#ff4365"/>
          <text x="100" y="25" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">▶️ Play</text>
          <rect x="155" y="0" width="45" height="40" rx="10" fill="#334155"/>
          <text x="177" y="25" fill="#ffffff" font-size="15" text-anchor="middle">⏭️</text>
        </g>
        <!-- Mini Playlist -->
        <rect x="0" y="195" width="300" height="65" rx="10" fill="#0f172a" opacity="0.6"/>
        <text x="15" y="222" fill="#ff758c" font-size="12" font-weight="700">1. Celebration Jam (Playing)</text>
        <text x="15" y="244" fill="#64748b" font-size="12">2. Birthday Anthem • Sweet Melody</text>
      </g>
    </svg>
  `);

  // 19. TENURE TICKER
  PREVIEWS.tenure_ticker = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="tenureBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff5f5"/>
          <stop offset="50%" stop-color="#fff0f3"/>
          <stop offset="100%" stop-color="#ffe4e6"/>
        </linearGradient>
        <linearGradient id="roseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff4365"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#tenureBg)"/>
      <rect x="270" y="24" width="260" height="30" rx="15" fill="#ff4365" opacity="0.1"/>
      <text x="400" y="44" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">⏳ OUR LOVE IN NUMBERS</text>
      <text x="400" y="80" fill="#0f172a" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">Forever &amp; Counting Every Second ❤️</text>
      <text x="400" y="104" fill="#64748b" font-family="-apple-system, sans-serif" font-size="13" text-anchor="middle">Live elapsed precision counter since June 18, 2021</text>
      
      <!-- Elapsed Counter Grid (6 slots) -->
      <g transform="translate(60, 130)">
        <rect x="0" y="0" width="680" height="150" rx="20" fill="#ffffff" stroke="#fecdd3" stroke-width="1.5"/>
        <g transform="translate(25, 25)">
          <!-- Years -->
          <rect x="0" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="46" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">5</text>
          <text x="46" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">YEARS</text>
          <!-- Months -->
          <rect x="107" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="153" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">2</text>
          <text x="153" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">MONTHS</text>
          <!-- Days -->
          <rect x="214" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="260" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">24</text>
          <text x="260" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">DAYS</text>
          <!-- Hours -->
          <rect x="321" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="367" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">14</text>
          <text x="367" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">HOURS</text>
          <!-- Minutes -->
          <rect x="428" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="474" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">38</text>
          <text x="474" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">MINUTES</text>
          <!-- Seconds -->
          <rect x="535" y="0" width="92" height="95" rx="14" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>
          <text x="581" y="52" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="36" font-weight="800" text-anchor="middle">49</text>
          <text x="581" y="76" fill="#9f1239" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">SECONDS</text>
        </g>
      </g>

      <!-- Next Milestone Card -->
      <g transform="translate(60, 305)">
        <rect x="0" y="0" width="680" height="135" rx="18" fill="#1e293b"/>
        <text x="35" y="38" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">🎯 NEXT BIG MILESTONE</text>
        <text x="35" y="66" fill="#ffffff" font-family="Georgia, serif" font-size="20" font-weight="700">2,000 Days Together • Diamond Jubilee 💎</text>
        <text x="35" y="88" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="13">Countdown: 148 Days • 09 Hours • 21 Minutes Remaining</text>
        <!-- Progress Bar -->
        <rect x="35" y="104" width="610" height="10" rx="5" fill="#334155"/>
        <rect x="35" y="104" width="460" height="10" rx="5" fill="url(#roseGlow)"/>
        <text x="590" y="90" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="12" font-weight="800">75% Complete</text>
      </g>
    </svg>
  `);

  // 20. STAR MAP
  PREVIEWS.star_map = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <radialGradient id="skyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#030712"/>
        </radialGradient>
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#030712"/>
      <!-- Header -->
      <text x="400" y="38" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">✨ THE NIGHT WE MET</text>
      <text x="400" y="65" fill="#f8fafc" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">Under These Exact Stars, Our Universe Began</text>
      
      <!-- Astrolabe Outer Dial -->
      <g transform="translate(260, 260)">
        <circle cx="0" cy="0" r="175" fill="none" stroke="url(#goldRing)" stroke-width="4"/>
        <circle cx="0" cy="0" r="165" fill="url(#skyGrad)" stroke="#1e293b" stroke-width="2"/>
        
        <!-- Stars & Constellations -->
        <!-- Ursa Major -->
        <g stroke="#93c5fd" stroke-width="1.2" opacity="0.8" fill="none">
          <line x1="-80" y1="-70" x2="-45" y2="-80"/>
          <line x1="-45" y1="-80" x2="-20" y2="-55"/>
          <line x1="-20" y1="-55" x2="20" y2="-50"/>
          <line x1="20" y1="-50" x2="55" y2="-85"/>
          <line x1="55" y1="-85" x2="95" y2="-75"/>
          <line x1="95" y1="-75" x2="50" y2="-35"/>
          <line x1="50" y1="-35" x2="20" y2="-50"/>
        </g>
        <circle cx="-80" cy="-70" r="3.5" fill="#ffffff"/>
        <circle cx="-45" cy="-80" r="2.5" fill="#ffffff"/>
        <circle cx="-20" cy="-55" r="3.5" fill="#ffffff"/>
        <circle cx="20" cy="-50" r="3" fill="#ffffff"/>
        <circle cx="55" cy="-85" r="3.5" fill="#ffffff"/>
        <circle cx="95" cy="-75" r="4" fill="#ffffff"/>
        <circle cx="50" cy="-35" r="3" fill="#ffffff"/>
        <text x="40" y="-100" fill="#93c5fd" font-family="-apple-system, sans-serif" font-size="9" font-weight="700">URSA MAJOR</text>

        <!-- Orion -->
        <g stroke="#fbbf24" stroke-width="1.2" opacity="0.8" fill="none">
          <line x1="-60" y1="30" x2="20" y2="35"/>
          <line x1="-60" y1="30" x2="-35" y2="75"/>
          <line x1="20" y1="35" x2="-5" y2="80"/>
          <!-- Belt -->
          <line x1="-25" y1="75" x2="5" y2="78"/>
          <!-- Legs -->
          <line x1="-35" y1="75" x2="-55" y2="120"/>
          <line x1="-5" y1="80" x2="15" y2="125"/>
        </g>
        <circle cx="-60" cy="30" r="4.5" fill="#fca5a5"/>
        <circle cx="20" cy="35" r="3.5" fill="#ffffff"/>
        <circle cx="-25" cy="75" r="3" fill="#67e8f9"/>
        <circle cx="-10" cy="76" r="3" fill="#67e8f9"/>
        <circle cx="5" cy="78" r="3" fill="#67e8f9"/>
        <circle cx="-55" cy="120" r="4" fill="#ffffff"/>
        <circle cx="15" cy="125" r="4.5" fill="#93c5fd"/>
        <text x="-40" y="140" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="9" font-weight="700">ORION</text>

        <!-- Cardinal markers -->
        <text x="0" y="-178" fill="#fbbf24" font-size="12" font-weight="800" text-anchor="middle">N</text>
        <text x="0" y="192" fill="#fbbf24" font-size="12" font-weight="800" text-anchor="middle">S</text>
        <text x="188" y="5" fill="#fbbf24" font-size="12" font-weight="800" text-anchor="middle">E</text>
        <text x="-192" y="5" fill="#fbbf24" font-size="12" font-weight="800" text-anchor="middle">W</text>
      </g>

      <!-- Location & Metadata Sidebar Card -->
      <g transform="translate(500, 130)">
        <rect x="0" y="0" width="240" height="260" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <text x="24" y="38" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">📍 OBSERVATION POINT</text>
        <text x="24" y="66" fill="#f8fafc" font-family="Georgia, serif" font-size="18" font-weight="700">Paris, France</text>
        <text x="24" y="90" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">48.8566° N • 2.3522° E</text>
        <line x1="24" y1="108" x2="216" y2="108" stroke="#334155" stroke-width="1"/>
        <text x="24" y="132" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">📅 MOMENT IN TIME</text>
        <text x="24" y="156" fill="#f8fafc" font-size="14" font-weight="600">June 18, 2021 • 22:30</text>
        <text x="24" y="176" fill="#64748b" font-size="12">Moon Phase: Waxing Gibbous 🌔</text>
        <rect x="24" y="200" width="192" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="120" y="223" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle">✨ 88 Constellations Synced</text>
      </g>
    </svg>
  `);

  // 21. THEN VS NOW SLIDER
  PREVIEWS.then_now_slider = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="thenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="nowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#0f172a"/>
      <text x="400" y="38" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">🌗 OUR JOURNEY THROUGH TIME</text>
      <text x="400" y="65" fill="#f8fafc" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">Then vs. Now: How It Started &amp; How It's Going</text>

      <!-- Slider Frame Container -->
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="600" height="270" rx="16" fill="#1e293b"/>
        <!-- Left (Then) Half -->
        <rect x="0" y="0" width="300" height="270" rx="16" fill="url(#thenGrad)"/>
        <text x="150" y="115" font-size="44" text-anchor="middle">☕</text>
        <text x="150" y="155" fill="#ffffff" font-family="Georgia, serif" font-size="20" font-weight="700" text-anchor="middle">THEN (2021)</text>
        <text x="150" y="180" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="13" text-anchor="middle">Our very first nervous coffee date</text>

        <!-- Right (Now) Half -->
        <g transform="translate(300, 0)">
          <rect x="0" y="0" width="300" height="270" rx="16" fill="url(#nowGrad)"/>
          <text x="150" y="115" font-size="44" text-anchor="middle">💍</text>
          <text x="150" y="155" fill="#ffffff" font-family="Georgia, serif" font-size="20" font-weight="700" text-anchor="middle">NOW (2026)</text>
          <text x="150" y="180" fill="#ffe4e6" font-family="-apple-system, sans-serif" font-size="13" text-anchor="middle">5 years deep • Forever by your side</text>
        </g>

        <!-- Divider Line & Drag Handle -->
        <line x1="300" y1="0" x2="300" y2="270" stroke="#ffffff" stroke-width="3"/>
        <circle cx="300" cy="135" r="22" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"/>
        <text x="300" y="141" fill="#0f172a" font-size="16" font-weight="800" text-anchor="middle">↔</text>
      </g>

      <!-- Bottom Drag Prompt -->
      <text x="400" y="415" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="13" text-anchor="middle">👈 Drag handle left or right to compare our story over 5 years 👉</text>
    </svg>
  `);

  // 22. COUPLE BUCKET LIST
  PREVIEWS.bucket_list = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="listGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#f8fafc"/>
      <text x="400" y="38" fill="#10b981" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">🎯 OUR SHARED HORIZON</text>
      <text x="400" y="65" fill="#0f172a" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">The Couple Bucket List</text>
      
      <!-- Progress Bar Card -->
      <g transform="translate(100, 85)">
        <rect x="0" y="0" width="600" height="60" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="24" y="26" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">4 of 6 Dreams Conquered</text>
        <text x="576" y="26" fill="#10b981" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="end">67%</text>
        <rect x="24" y="36" width="552" height="10" rx="5" fill="#e2e8f0"/>
        <rect x="24" y="36" width="370" height="10" rx="5" fill="url(#listGrad)"/>
      </g>

      <!-- Checklist Items -->
      <g transform="translate(100, 165)">
        <!-- Item 1 (Done) -->
        <rect x="0" y="0" width="600" height="52" rx="12" fill="#ffffff" stroke="#e2e8f0"/>
        <circle cx="28" cy="26" r="11" fill="#10b981"/>
        <text x="28" y="30" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle">✓</text>
        <text x="55" y="30" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-decoration="line-through">Watch Northern Lights in a glass igloo 🌌</text>
        <rect x="495" y="15" width="85" height="22" rx="6" fill="#d1fae5"/>
        <text x="537" y="30" fill="#065f46" font-size="11" font-weight="700" text-anchor="middle">Travel • Done</text>

        <!-- Item 2 (Done) -->
        <rect x="0" y="62" width="600" height="52" rx="12" fill="#ffffff" stroke="#e2e8f0"/>
        <circle cx="28" cy="88" r="11" fill="#10b981"/>
        <text x="28" y="92" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle">✓</text>
        <text x="55" y="92" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-decoration="line-through">Adopt our rescue puppy together 🐶</text>
        <rect x="495" y="77" width="85" height="22" rx="6" fill="#d1fae5"/>
        <text x="537" y="92" fill="#065f46" font-size="11" font-weight="700" text-anchor="middle">Home • Done</text>

        <!-- Item 3 (Pending) -->
        <rect x="0" y="124" width="600" height="52" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
        <circle cx="28" cy="150" r="11" fill="none" stroke="#94a3b8" stroke-width="2"/>
        <text x="55" y="154" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">Road trip along the Amalfi Coast 🚗</text>
        <rect x="485" y="139" width="95" height="22" rx="6" fill="#fef3c7"/>
        <text x="532" y="154" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Target: 2027</text>

        <!-- Item 4 (Pending) -->
        <rect x="0" y="186" width="600" height="52" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
        <circle cx="28" cy="212" r="11" fill="none" stroke="#94a3b8" stroke-width="2"/>
        <text x="55" y="216" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">Build our cozy countryside home with a garden 🏡</text>
        <rect x="485" y="201" width="95" height="22" rx="6" fill="#fef3c7"/>
        <text x="532" y="216" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Target: 2029</text>
      </g>
    </svg>
  `);

  // 23. AUDIO TIME CAPSULE
  PREVIEWS.audio_capsule = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="audioGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#090d16"/>
      <text x="400" y="38" fill="#a78bfa" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">🎙️ VOICE MEMORIES ACROSS TIME</text>
      <text x="400" y="65" fill="#f8fafc" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">Audio Time Capsule</text>

      <!-- Player Deck -->
      <g transform="translate(80, 95)">
        <rect x="0" y="0" width="640" height="340" rx="20" fill="#131b2e" stroke="#1f293d" stroke-width="1.5"/>
        
        <!-- Animated Waveform Section -->
        <rect x="25" y="25" width="590" height="95" rx="14" fill="#0c1222"/>
        <!-- Waveform Bars -->
        <g transform="translate(45, 72)">
          <line x1="0" y1="-15" x2="0" y2="15" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="16" y1="-28" x2="16" y2="28" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
          <line x1="32" y1="-10" x2="32" y2="10" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="48" y1="-35" x2="48" y2="35" stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>
          <line x1="64" y1="-20" x2="64" y2="20" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="80" y1="-30" x2="80" y2="30" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
          <line x1="96" y1="-12" x2="96" y2="12" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="112" y1="-26" x2="112" y2="26" stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>
          <line x1="128" y1="-18" x2="128" y2="18" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="144" y1="-32" x2="144" y2="32" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
          <line x1="160" y1="-8" x2="160" y2="8" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="176" y1="-24" x2="176" y2="24" stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>
          <line x1="192" y1="-36" x2="192" y2="36" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="208" y1="-15" x2="208" y2="15" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
          <line x1="224" y1="-28" x2="224" y2="28" stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>
          <line x1="240" y1="-10" x2="240" y2="10" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
          <line x1="256" y1="-30" x2="256" y2="30" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
          <line x1="272" y1="-20" x2="272" y2="20" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
        </g>
        <circle cx="370" cy="72" r="22" fill="url(#audioGlow)"/>
        <text x="372" y="77" fill="#ffffff" font-size="16" text-anchor="middle">▶</text>
        <text x="410" y="65" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">First Birthday Voice Note</text>
        <text x="410" y="85" fill="#94a3b8" font-size="12">From Alex • Jun 18, 2021 (0:45)</text>

        <!-- Archive List (Memos across years) -->
        <g transform="translate(25, 140)">
          <!-- Year Tabs -->
          <rect x="0" y="0" width="55" height="26" rx="8" fill="#8b5cf6"/>
          <text x="27" y="17" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">All</text>
          <rect x="65" y="0" width="55" height="26" rx="8" fill="#1e293b"/>
          <text x="92" y="17" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">2021</text>
          <rect x="130" y="0" width="55" height="26" rx="8" fill="#1e293b"/>
          <text x="157" y="17" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">2022</text>
          <rect x="195" y="0" width="55" height="26" rx="8" fill="#1e293b"/>
          <text x="222" y="17" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">2023</text>
          <rect x="260" y="0" width="55" height="26" rx="8" fill="#1e293b"/>
          <text x="287" y="17" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">2024</text>

          <!-- Memo 1 -->
          <rect x="0" y="40" width="590" height="42" rx="8" fill="#1a2238"/>
          <text x="20" y="66" fill="#f8fafc" font-size="13" font-weight="600">1. Midnight Flight Voice Note</text>
          <text x="320" y="66" fill="#a78bfa" font-size="12">From Ella • 2022</text>
          <text x="560" y="66" fill="#64748b" font-size="12" text-anchor="end">1:12 🎧</text>

          <!-- Memo 2 -->
          <rect x="0" y="90" width="590" height="42" rx="8" fill="#1a2238"/>
          <text x="20" y="116" fill="#f8fafc" font-size="13" font-weight="600">2. Saying Yes in Tuscany</text>
          <text x="320" y="116" fill="#a78bfa" font-size="12">From Both • 2023</text>
          <text x="560" y="116" fill="#64748b" font-size="12" text-anchor="end">0:58 🎧</text>

          <!-- Memo 3 -->
          <rect x="0" y="140" width="590" height="42" rx="8" fill="#1a2238"/>
          <text x="20" y="166" fill="#f8fafc" font-size="13" font-weight="600">3. Our 3-Year Anniversary Promise</text>
          <text x="320" y="166" fill="#a78bfa" font-size="12">From Ella • 2024</text>
          <text x="560" y="166" fill="#64748b" font-size="12" text-anchor="end">1:35 🎧</text>
        </g>
      </g>
    </svg>
  `);

  // 24. MILESTONE ODYSSEY
  PREVIEWS.milestone_odyssey = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff4365"/>
          <stop offset="50%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#0f172a"/>
      <text x="400" y="38" fill="#fbbf24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">🚀 OUR LOVE TIMELINE</text>
      <text x="400" y="65" fill="#f8fafc" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">Milestone Odyssey</text>
      
      <!-- Horizontal Track Connecting Line -->
      <path d="M 60 220 C 180 180, 240 260, 360 220 C 480 180, 540 260, 740 220" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-dasharray="6,6"/>

      <!-- Node 1: Met -->
      <g transform="translate(100, 200)">
        <circle cx="0" cy="0" r="24" fill="#1e293b" stroke="#ff4365" stroke-width="3"/>
        <text x="0" y="6" font-size="16" text-anchor="middle">☕</text>
        <rect x="-65" y="38" width="130" height="85" rx="10" fill="#1e293b" stroke="#334155"/>
        <text x="0" y="58" fill="#ff4365" font-size="11" font-weight="800" text-anchor="middle">JUN 2021</text>
        <text x="0" y="76" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">The First Hello</text>
        <text x="0" y="96" fill="#94a3b8" font-size="10" text-anchor="middle">Paris Bistro</text>
      </g>

      <!-- Node 2: Official -->
      <g transform="translate(280, 235)">
        <circle cx="0" cy="0" r="24" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
        <text x="0" y="6" font-size="16" text-anchor="middle">💍</text>
        <rect x="-65" y="-105" width="130" height="85" rx="10" fill="#1e293b" stroke="#334155"/>
        <text x="0" y="-85" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">OCT 2021</text>
        <text x="0" y="-67" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Official Day 1</text>
        <text x="0" y="-47" fill="#94a3b8" font-size="10" text-anchor="middle">City Park</text>
      </g>

      <!-- Node 3: First Flight -->
      <g transform="translate(460, 200)">
        <circle cx="0" cy="0" r="24" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
        <text x="0" y="6" font-size="16" text-anchor="middle">✈️</text>
        <rect x="-65" y="38" width="130" height="85" rx="10" fill="#1e293b" stroke="#334155"/>
        <text x="0" y="58" fill="#60a5fa" font-size="11" font-weight="800" text-anchor="middle">AUG 2022</text>
        <text x="0" y="76" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Tokyo Adventure</text>
        <text x="0" y="96" fill="#94a3b8" font-size="10" text-anchor="middle">Shibuya Crossing</text>
      </g>

      <!-- Node 4: Proposal -->
      <g transform="translate(660, 235)">
        <circle cx="0" cy="0" r="26" fill="#1e293b" stroke="#ec4899" stroke-width="3"/>
        <text x="0" y="7" font-size="18" text-anchor="middle">💖</text>
        <rect x="-70" y="-105" width="140" height="85" rx="10" fill="#1e293b" stroke="#ec4899"/>
        <text x="0" y="-85" fill="#f472b6" font-size="11" font-weight="800" text-anchor="middle">SEP 2024</text>
        <text x="0" y="-67" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">The Proposal 💍</text>
        <text x="0" y="-47" fill="#fbcfe8" font-size="10" text-anchor="middle">Tuscany Sunset</text>
      </g>
    </svg>
  `);

  // 26. VALENTINE SCRATCH-OFF & ITINERARY
  PREVIEWS.valentine_scratch = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fff5f7"/>
      <text x="400" y="60" fill="#e11d48" font-family="Georgia, serif" font-size="28" font-weight="700" text-anchor="middle">💝 Valentine Scratch-Off &amp; Secret Date</text>
      <text x="400" y="88" fill="#64748b" font-family="-apple-system, sans-serif" font-size="14" text-anchor="middle">Interactive Canvas Scratch • Secret Itinerary • Dress Code &amp; Love Message</text>
      
      <!-- Scratch Card Box -->
      <rect x="220" y="115" width="360" height="260" rx="18" fill="#ffffff" stroke="#fecdd3" stroke-width="2"/>
      
      <!-- Secret Itinerary Inside -->
      <rect x="240" y="135" width="320" height="220" rx="12" fill="#fff1f2"/>
      <text x="400" y="168" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">💌 SECRET DATE ITINERARY</text>
      <text x="260" y="200" fill="#334155" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">📍 Location: A Magical Secret Rooftop ✨</text>
      <text x="260" y="225" fill="#334155" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">📅 Date: February 14, 2026</text>
      <text x="260" y="250" fill="#334155" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">⏰ Time: 7:30 PM</text>
      <text x="260" y="275" fill="#334155" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">👗 Dress Code: Dress to impress 💃🕺</text>
      <text x="400" y="315" fill="#e11d48" font-family="Georgia, serif" font-size="13" font-style="italic" text-anchor="middle">"Every single day with you is Valentine's Day! ❤️"</text>

      <!-- Scratch Overlay Simulated -->
      <path d="M 400 135 L 560 135 L 560 355 L 430 355 Z" fill="#e84393" opacity="0.9"/>
      <text x="490" y="245" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">✨ Scratch Here ✨</text>

      <!-- Progress Bar -->
      <rect x="280" y="395" width="240" height="12" rx="6" fill="#f1f5f9"/>
      <rect x="280" y="395" width="140" height="12" rx="6" fill="#e11d48"/>
      <text x="400" y="425" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">58% scratched • Almost revealed!</text>
    </svg>
  `);

  // 27. FORGIVENESS METER
  PREVIEWS.forgiveness_meter = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="fmBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="100%" stop-color="#dcfce7"/>
        </linearGradient>
        <linearGradient id="fmSliderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
        <filter id="fmShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#10b981" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="800" height="480" fill="url(#fmBg)"/>
      <rect x="100" y="25" width="600" height="430" rx="20" fill="#ffffff" filter="url(#fmShadow)"/>

      <rect x="300" y="42" width="200" height="28" rx="14" fill="#10b981" opacity="0.15"/>
      <text x="400" y="61" fill="#059669" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">EMOTIONAL BAROMETER 💓</text>

      <text x="400" y="98" fill="#1e293b" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">Forgiveness Meter for Ella 🕊️</text>
      <text x="400" y="118" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Slide to adjust forgiveness level • Full peace unlocks celebration reward</text>

      <!-- Mood Badge Display -->
      <rect x="310" y="135" width="180" height="48" rx="24" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
      <text x="360" y="166" font-size="22">🥰</text>
      <text x="415" y="164" fill="#059669" font-family="-apple-system, sans-serif" font-size="15" font-weight="800">Truce (100%)</text>

      <!-- Slider Track -->
      <rect x="150" y="205" width="500" height="16" rx="8" fill="#f1f5f9"/>
      <rect x="150" y="205" width="500" height="16" rx="8" fill="url(#fmSliderGrad)"/>
      <circle cx="650" cy="213" r="14" fill="#ffffff" stroke="#10b981" stroke-width="4"/>

      <!-- Scale Markers -->
      <text x="150" y="238" fill="#ef4444" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Furious 😤 (0%)</text>
      <text x="400" y="238" fill="#f59e0b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Slightly Annoyed 🙄 (50%)</text>
      <text x="650" y="238" fill="#10b981" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="end">Truce 🥰 (100%)</text>

      <!-- Gold Foil Reward Card -->
      <rect x="160" y="260" width="480" height="170" rx="14" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
      <rect x="330" y="275" width="140" height="22" rx="11" fill="#fef3c7"/>
      <text x="400" y="290" fill="#b45309" font-family="-apple-system, sans-serif" font-size="10" font-weight="800" text-anchor="middle">🌟 LEVEL 100 PEACE</text>
      <text x="400" y="325" fill="#92400e" font-family="Georgia, serif" font-size="18" font-weight="700" text-anchor="middle">Forgiveness Granted! 🎉</text>
      <text x="400" y="350" fill="#78350f" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">"Thank you for choosing peace, Ella. I love you endlessly!"</text>
      <rect x="275" y="375" width="250" height="38" rx="19" fill="#10b981"/>
      <text x="400" y="399" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Claim Reconciliation Gift 🎁</text>
    </svg>
  `);

  // 28. TRUCE AGREEMENT
  PREVIEWS.truce_agreement = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="taParchment" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffdf7"/>
          <stop offset="100%" stop-color="#fbf4e2"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#f5f0e6"/>
      <!-- Parchment Outer Frame -->
      <rect x="90" y="25" width="620" height="430" rx="16" fill="url(#taParchment)" stroke="#d4b483" stroke-width="3"/>
      <rect x="100" y="35" width="600" height="410" rx="12" fill="none" stroke="#d4b483" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- Corner Ornaments -->
      <text x="115" y="60" fill="#c49a62" font-size="18">❦</text>
      <text x="670" y="60" fill="#c49a62" font-size="18">❦</text>
      <text x="115" y="430" fill="#c49a62" font-size="18">❦</text>
      <text x="670" y="430" fill="#c49a62" font-size="18">❦</text>

      <text x="400" y="70" fill="#92400e" font-family="Georgia, serif" font-size="22" font-weight="700" text-anchor="middle">📜 Bilateral Peace &amp; Truce Treaty</text>
      <text x="400" y="90" fill="#78350f" font-family="-apple-system, sans-serif" font-size="11" text-anchor="middle">Official Diplomatic Accord Ratified with Sacred Covenants</text>

      <!-- Parties Row -->
      <rect x="160" y="105" width="200" height="50" rx="8" fill="#ffffff" stroke="#e6c99c"/>
      <text x="260" y="125" fill="#a16207" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">PARTY A (SENDER)</text>
      <text x="260" y="145" fill="#1e293b" font-family="Georgia, serif" font-size="15" font-weight="700" text-anchor="middle">Aghiles</text>

      <circle cx="400" cy="130" r="18" fill="#fef3c7"/>
      <text x="400" y="136" font-size="16" text-anchor="middle">🕊️</text>

      <rect x="440" y="105" width="200" height="50" rx="8" fill="#ffffff" stroke="#e6c99c"/>
      <text x="540" y="125" fill="#a16207" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">PARTY B (PARTNER)</text>
      <text x="540" y="145" fill="#1e293b" font-family="Georgia, serif" font-size="15" font-weight="700" text-anchor="middle">Ella</text>

      <!-- Terms Box -->
      <rect x="150" y="170" width="500" height="150" rx="10" fill="#ffffff" opacity="0.85"/>
      <text x="175" y="195" fill="#166534" font-size="13">✓</text>
      <text x="195" y="195" fill="#334155" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">I promise to listen with an open, non-defensive heart whenever you speak.</text>
      <text x="175" y="225" fill="#166534" font-size="13">✓</text>
      <text x="195" y="225" fill="#334155" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">I promise immediate hugs, comfort, and soothing reassurance on demand.</text>
      <text x="175" y="255" fill="#166534" font-size="13">✓</text>
      <text x="195" y="255" fill="#334155" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">I promise never to let anger linger past sundown without reconciliation.</text>
      <text x="175" y="285" fill="#166534" font-size="13">✓</text>
      <text x="195" y="285" fill="#334155" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">I promise to prioritize our connection, empathy, and love over individual pride.</text>

      <!-- Wax Seal & Signature -->
      <circle cx="400" cy="370" r="42" fill="#be123c" stroke="#9f1239" stroke-width="4"/>
      <circle cx="400" cy="370" r="34" fill="none" stroke="#fecdd3" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="400" y="360" font-size="16" text-anchor="middle">⚜️</text>
      <text x="400" y="378" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="9" font-weight="900" text-anchor="middle">RATIFIED</text>
      <text x="400" y="390" fill="#fecdd3" font-family="-apple-system, sans-serif" font-size="8" text-anchor="middle">&amp; SEALED</text>
      <text x="400" y="425" fill="#78350f" font-family="Georgia, serif" font-size="11" font-style="italic" text-anchor="middle">Ratified on September 13, 2026 • Eternal Peace Accord</text>
    </svg>
  `);

  // 29. REFORM DECK
  PREVIEWS.reform_deck = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#faf5ff"/>
      <text x="400" y="55" fill="#6b21a8" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">🃏 The Honest Reform Deck</text>
      <text x="400" y="78" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">3D Flippable Cards • Apology • Complete Ownership • Future Actionable Commitments</text>

      <!-- 3 Cards Fan / Grid -->
      <!-- Card 1: Front -->
      <rect x="80" y="110" width="190" height="300" rx="14" fill="#ffffff" stroke="#c084fc" stroke-width="2"/>
      <rect x="100" y="130" width="150" height="24" rx="12" fill="#f3e8ff"/>
      <text x="175" y="146" fill="#7e22ce" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">🃏 PLEDGE #1</text>
      <circle cx="175" cy="210" r="30" fill="#faf5ff"/>
      <text x="175" y="219" font-size="28" text-anchor="middle">👂</text>
      <text x="175" y="275" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Listening Without</text>
      <text x="175" y="295" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Defensiveness</text>
      <rect x="110" y="345" width="130" height="32" rx="16" fill="#f3e8ff"/>
      <text x="175" y="365" fill="#7e22ce" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Tap to Flip ↻</text>

      <!-- Card 2: Flipped (Back Side Revealed) -->
      <rect x="305" y="105" width="190" height="310" rx="14" fill="#ffffff" stroke="#9333ea" stroke-width="3"/>
      <rect x="315" y="115" width="170" height="24" rx="6" fill="#f5f3ff"/>
      <text x="400" y="131" fill="#6d28d9" font-family="-apple-system, sans-serif" font-size="10" font-weight="800" text-anchor="middle">💬 PROMISE REVEALED ✅</text>
      <rect x="315" y="145" width="170" height="60" rx="6" fill="#fdf2f8"/>
      <text x="325" y="162" fill="#be185d" font-family="-apple-system, sans-serif" font-size="9" font-weight="700">THE APOLOGY</text>
      <text x="325" y="178" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">Sorry for retreating into</text>
      <text x="325" y="192" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">silence during stress.</text>

      <rect x="315" y="212" width="170" height="60" rx="6" fill="#fefce8"/>
      <text x="325" y="228" fill="#a16207" font-family="-apple-system, sans-serif" font-size="9" font-weight="700">ACCOUNTABILITY</text>
      <text x="325" y="244" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">Distance creates worry;</text>
      <text x="325" y="258" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">you deserve transparency.</text>

      <rect x="315" y="278" width="170" height="60" rx="6" fill="#ecfdf5"/>
      <text x="325" y="294" fill="#047857" font-family="-apple-system, sans-serif" font-size="9" font-weight="700">FUTURE COMMITMENT</text>
      <text x="325" y="310" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">I promise proactive updates</text>
      <text x="325" y="324" fill="#475569" font-family="-apple-system, sans-serif" font-size="9">and open emotional doors.</text>
      <text x="400" y="395" fill="#9333ea" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Flip Back ↺</text>

      <!-- Card 3: Front -->
      <rect x="530" y="110" width="190" height="300" rx="14" fill="#ffffff" stroke="#c084fc" stroke-width="2"/>
      <rect x="550" y="130" width="150" height="24" rx="12" fill="#f3e8ff"/>
      <text x="625" y="146" fill="#7e22ce" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">🃏 PLEDGE #3</text>
      <circle cx="625" cy="210" r="30" fill="#faf5ff"/>
      <text x="625" y="219" font-size="28" text-anchor="middle">🕊️</text>
      <text x="625" y="275" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Patience &amp; Gentle</text>
      <text x="625" y="295" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Loving Tone</text>
      <rect x="560" y="345" width="130" height="32" rx="16" fill="#f3e8ff"/>
      <text x="625" y="365" fill="#7e22ce" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Tap to Flip ↻</text>

      <text x="400" y="445" fill="#9333ea" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Progress: 1 / 4 Promises Reviewed ❤️</text>
    </svg>
  `);

  // 30. REPARATION COUPONS
  PREVIEWS.reparation_coupons = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#fffbeb"/>
      <text x="400" y="55" fill="#b45309" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">🎟️ Reparation &amp; Peace Offering Coupons</text>
      <text x="400" y="78" fill="#78350f" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Scratchable Gold Foil Vouchers • Guaranteed Restitution Passes • Redeem Anytime</text>

      <!-- Coupon 1: Scratched -->
      <g transform="translate(80, 110)">
        <rect width="300" height="150" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="0" cy="75" r="12" fill="#fffbeb"/>
        <circle cx="300" cy="75" r="12" fill="#fffbeb"/>
        <rect x="25" y="20" width="80" height="20" rx="10" fill="#fef3c7"/>
        <text x="65" y="34" fill="#d97706" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" text-anchor="middle">ULTRA PAMPER</text>
        <text x="30" y="75" font-size="28">💆‍♀️</text>
        <text x="75" y="65" fill="#1e293b" font-family="Georgia, serif" font-size="14" font-weight="700">30-Min Full Massage</text>
        <text x="75" y="85" fill="#64748b" font-family="-apple-system, sans-serif" font-size="10">Essential oils &amp; zero complaints.</text>
        <!-- Claimed Stamp Overlay -->
        <rect x="180" y="45" width="100" height="40" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2" transform="rotate(-10 230 65)"/>
        <text x="230" y="70" fill="#dc2626" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle" transform="rotate(-10 230 65)">CLAIMED ✓</text>
        <rect x="25" y="105" width="250" height="30" rx="6" fill="#f1f5f9"/>
        <text x="150" y="125" fill="#64748b" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">✓ Redeemed</text>
      </g>

      <!-- Coupon 2: Unscratched Foil -->
      <g transform="translate(420, 110)">
        <rect width="300" height="150" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="0" cy="75" r="12" fill="#fffbeb"/>
        <circle cx="300" cy="75" r="12" fill="#fffbeb"/>
        <!-- Gold foil simulated -->
        <rect x="20" y="20" width="260" height="75" rx="8" fill="#fbbf24"/>
        <text x="150" y="62" fill="#78350f" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">✨ Scratch to Reveal Foil ✨</text>
        <rect x="25" y="105" width="250" height="30" rx="6" fill="#f59e0b"/>
        <text x="150" y="125" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Mark as Claimed</text>
      </g>

      <!-- Coupon 3: Golden Pass -->
      <g transform="translate(80, 280)">
        <rect width="300" height="150" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="0" cy="75" r="12" fill="#fffbeb"/>
        <circle cx="300" cy="75" r="12" fill="#fffbeb"/>
        <rect x="25" y="20" width="80" height="20" rx="10" fill="#fef3c7"/>
        <text x="65" y="34" fill="#d97706" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" text-anchor="middle">GOLDEN PASS</text>
        <text x="30" y="75" font-size="28">🏳️</text>
        <text x="75" y="65" fill="#1e293b" font-family="Georgia, serif" font-size="14" font-weight="700">Win Any Argument</text>
        <text x="75" y="85" fill="#64748b" font-family="-apple-system, sans-serif" font-size="10">Instant surrender on the spot!</text>
        <rect x="25" y="105" width="250" height="30" rx="6" fill="#f59e0b"/>
        <text x="150" y="125" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Mark as Claimed</text>
      </g>

      <!-- Coupon 4: Breakfast in Bed -->
      <g transform="translate(420, 280)">
        <rect width="300" height="150" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="0" cy="75" r="12" fill="#fffbeb"/>
        <circle cx="300" cy="75" r="12" fill="#fffbeb"/>
        <rect x="25" y="20" width="80" height="20" rx="10" fill="#fef3c7"/>
        <text x="65" y="34" fill="#d97706" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" text-anchor="middle">ROOM SERVICE</text>
        <text x="30" y="75" font-size="28">🥐</text>
        <text x="75" y="65" fill="#1e293b" font-family="Georgia, serif" font-size="14" font-weight="700">VIP Breakfast in Bed</text>
        <text x="75" y="85" fill="#64748b" font-family="-apple-system, sans-serif" font-size="10">Coffee, pastries &amp; berries served.</text>
        <rect x="25" y="105" width="250" height="30" rx="6" fill="#f59e0b"/>
        <text x="150" y="125" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Mark as Claimed</text>
      </g>
    </svg>
  `);

  // 31. COMFORT SOUNDBOARD
  PREVIEWS.comfort_soundboard = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <rect width="800" height="480" fill="#f0f9ff"/>
      <text x="400" y="55" fill="#0369a1" font-family="Georgia, serif" font-size="24" font-weight="700" text-anchor="middle">🎧 Comfort &amp; Calming Soundboard</text>
      <text x="400" y="78" fill="#0284c7" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Procedural Web Audio Ambient Mixer • Sound Equalizer • Serene Photo Stream</text>

      <!-- Master Deck -->
      <rect x="80" y="100" width="640" height="55" rx="12" fill="#ffffff" stroke="#bae6fd"/>
      <rect x="100" y="112" width="160" height="32" rx="16" fill="#0284c7"/>
      <text x="180" y="132" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">▶ Play Calming Ambience</text>

      <!-- Equalizer Bars -->
      <g transform="translate(560, 115)">
        <rect x="0" y="15" width="5" height="15" rx="2" fill="#0284c7"/>
        <rect x="9" y="8" width="5" height="22" rx="2" fill="#0ea5e9"/>
        <rect x="18" y="3" width="5" height="27" rx="2" fill="#38bdf8"/>
        <rect x="27" y="12" width="5" height="18" rx="2" fill="#0284c7"/>
        <rect x="36" y="5" width="5" height="25" rx="2" fill="#0ea5e9"/>
        <rect x="45" y="18" width="5" height="12" rx="2" fill="#38bdf8"/>
      </g>

      <!-- Mixer Channels Row -->
      <g transform="translate(80, 175)">
        <!-- Ch 1: Rain -->
        <rect x="0" y="0" width="120" height="110" rx="10" fill="#ffffff" stroke="#e0f2fe"/>
        <text x="60" y="30" font-size="22" text-anchor="middle">🌧️</text>
        <text x="60" y="50" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Soft Rain</text>
        <rect x="15" y="70" width="90" height="6" rx="3" fill="#e2e8f0"/>
        <rect x="15" y="70" width="60" height="6" rx="3" fill="#0284c7"/>
        <text x="60" y="95" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9" text-anchor="middle">65%</text>

        <!-- Ch 2: Hearth -->
        <rect x="130" y="0" width="120" height="110" rx="10" fill="#ffffff" stroke="#e0f2fe"/>
        <text x="190" y="30" font-size="22" text-anchor="middle">🔥</text>
        <text x="190" y="50" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Warm Hearth</text>
        <rect x="145" y="70" width="90" height="6" rx="3" fill="#e2e8f0"/>
        <rect x="145" y="70" width="45" height="6" rx="3" fill="#0284c7"/>
        <text x="190" y="95" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9" text-anchor="middle">50%</text>

        <!-- Ch 3: Waves -->
        <rect x="260" y="0" width="120" height="110" rx="10" fill="#ffffff" stroke="#e0f2fe"/>
        <text x="320" y="30" font-size="22" text-anchor="middle">🌊</text>
        <text x="320" y="50" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Ocean Shore</text>
        <rect x="275" y="70" width="90" height="6" rx="3" fill="#e2e8f0"/>
        <rect x="275" y="70" width="40" height="6" rx="3" fill="#0284c7"/>
        <text x="320" y="95" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9" text-anchor="middle">45%</text>

        <!-- Ch 4: Breeze -->
        <rect x="390" y="0" width="120" height="110" rx="10" fill="#ffffff" stroke="#e0f2fe"/>
        <text x="450" y="30" font-size="22" text-anchor="middle">🍃</text>
        <text x="450" y="50" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Night Breeze</text>
        <rect x="405" y="70" width="90" height="6" rx="3" fill="#e2e8f0"/>
        <rect x="405" y="70" width="30" height="6" rx="3" fill="#0284c7"/>
        <text x="450" y="95" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9" text-anchor="middle">35%</text>

        <!-- Ch 5: Cafe -->
        <rect x="520" y="0" width="120" height="110" rx="10" fill="#ffffff" stroke="#e0f2fe"/>
        <text x="580" y="30" font-size="22" text-anchor="middle">☕</text>
        <text x="580" y="50" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Cozy Cafe</text>
        <rect x="535" y="70" width="90" height="6" rx="3" fill="#e2e8f0"/>
        <rect x="535" y="70" width="25" height="6" rx="3" fill="#0284c7"/>
        <text x="580" y="95" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9" text-anchor="middle">30%</text>
      </g>

      <!-- Calming Photo Stream Carousel Preview -->
      <g transform="translate(80, 305)">
        <rect width="640" height="145" rx="12" fill="#1e293b"/>
        <!-- Simulated Landscape Photo -->
        <rect x="2" y="2" width="636" height="141" rx="10" fill="#0f172a"/>
        <circle cx="150" cy="50" r="30" fill="#fde047" opacity="0.3"/>
        <path d="M 0 120 Q 200 60 400 110 T 640 90 L 640 145 L 0 145 Z" fill="#047857" opacity="0.7"/>
        <!-- Caption Bar -->
        <rect x="0" y="110" width="640" height="35" rx="0" fill="rgba(0,0,0,0.6)"/>
        <text x="320" y="132" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Golden sunlight drifting through gentle forest leaves 🍃</text>
      </g>
    </svg>
  `);

  // 32. SCRAPBOOK GAME
  PREVIEWS.scrapbook_game = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="sbBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#faf6ee"/>
          <stop offset="100%" stop-color="#f2ebe0"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#sbBg)"/>
      <rect x="40" y="30" width="720" height="420" rx="16" fill="#fffdf9" stroke="#d5c7b5" stroke-dasharray="6,6" stroke-width="2"/>
      <rect x="50" y="18" width="100" height="24" rx="2" fill="#fbb6ce" opacity="0.85" transform="rotate(-5 100 30)"/>
      <rect x="650" y="18" width="100" height="24" rx="2" fill="#fcd34d" opacity="0.85" transform="rotate(6 700 30)"/>
      <text x="400" y="80" fill="#b03a60" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1" text-anchor="middle">INTERACTIVE COUPLE SCRAPBOOK 📓✨</text>
      <text x="400" y="115" fill="#2b1e1a" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">How Well Do You Know Me? ✂️</text>
      <g transform="translate(90, 150)">
        <rect width="220" height="240" rx="6" fill="#ffffff" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.1))" transform="rotate(-3)"/>
        <rect x="12" y="12" width="196" height="170" rx="4" fill="#fed7aa" transform="rotate(-3)"/>
        <text x="110" y="105" font-size="36" text-anchor="middle" transform="rotate(-3)">🍜</text>
        <text x="110" y="215" fill="#55443e" font-family="-apple-system, sans-serif" font-size="12" font-style="italic" text-anchor="middle" transform="rotate(-3)">Late-night food crawls</text>
      </g>
      <g transform="translate(360, 155)">
        <text x="0" y="25" fill="#8c6a5b" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">MEMORY 1 OF 5</text>
        <text x="0" y="55" fill="#2b1e1a" font-family="-apple-system, sans-serif" font-size="18" font-weight="700">What is my absolute comfort food?</text>
        <rect x="0" y="80" width="180" height="42" rx="8" fill="#e8f8f0" stroke="#2ecc71" stroke-width="2"/>
        <text x="15" y="106" fill="#1b6d3d" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">A. Spicy Noodles 🍜 ✓</text>
        <rect x="195" y="80" width="180" height="42" rx="8" fill="#fdfbf7" stroke="#ecdccc" stroke-width="2"/>
        <text x="210" y="106" fill="#4a3b34" font-family="-apple-system, sans-serif" font-size="13">B. Cheese Pizza 🍕</text>
        <rect x="0" y="132" width="180" height="42" rx="8" fill="#fdfbf7" stroke="#ecdccc" stroke-width="2"/>
        <text x="15" y="158" fill="#4a3b34" font-family="-apple-system, sans-serif" font-size="13">C. Warm Rice Bowl 🍚</text>
        <rect x="195" y="132" width="180" height="42" rx="8" fill="#fdfbf7" stroke="#ecdccc" stroke-width="2"/>
        <text x="210" y="158" fill="#4a3b34" font-family="-apple-system, sans-serif" font-size="13">D. Dessert Crepe 🥞</text>
        <rect x="120" y="195" width="140" height="34" rx="6" fill="none" stroke="#27ae60" stroke-width="3" transform="rotate(-6)"/>
        <text x="190" y="218" fill="#27ae60" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle" transform="rotate(-6)">✨ SPOT ON!</text>
      </g>
    </svg>
  `);

  // 33. LOVE STORY CROSSWORD
  PREVIEWS.love_crossword = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="cwBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a1523"/>
          <stop offset="50%" stop-color="#1a0c16"/>
          <stop offset="100%" stop-color="#0f070e"/>
        </linearGradient>
        <linearGradient id="cwGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#f7d794"/>
          <stop offset="100%" stop-color="#b87b42"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#cwBg)"/>
      <rect x="30" y="25" width="740" height="430" rx="20" fill="rgba(255,255,255,0.05)" stroke="url(#cwGold)" stroke-width="2"/>
      <text x="400" y="65" fill="#ff758c" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="2" text-anchor="middle">AGHILES &amp; ELLA'S LOVE STORY 🧩❤️</text>
      <text x="400" y="102" fill="url(#cwGold)" font-family="Georgia, serif" font-size="28" font-weight="800" text-anchor="middle">How Well Do You Know Our Story?</text>

      <!-- Mini Crossword Grid Representation -->
      <g transform="translate(60, 130)">
        <rect width="320" height="300" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(224,169,109,0.3)"/>
        <!-- Active word beam -->
        <rect x="25" y="65" width="270" height="32" rx="4" fill="rgba(255,67,101,0.22)" stroke="#ff4365"/>
        <text x="35" y="86" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="10" font-weight="800">3</text>
        <text x="45" y="88" fill="#fff" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="18">CANTON</text>

        <!-- Intersecting word beam (BALI) -->
        <rect x="72" y="30" width="32" height="150" rx="4" fill="rgba(247,215,148,0.18)" stroke="#d4af37"/>
        <text x="76" y="44" fill="#d4af37" font-family="-apple-system, sans-serif" font-size="10" font-weight="800">1</text>
        <text x="88" y="52" fill="#fbe3d2" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">B</text>
        <text x="88" y="88" fill="#fff" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">A</text>
        <text x="88" y="124" fill="#fbe3d2" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">L</text>
        <text x="88" y="160" fill="#fbe3d2" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">I</text>

        <!-- Solved word (ALGERIA) -->
        <rect x="25" y="145" width="220" height="32" rx="4" fill="rgba(247,215,148,0.25)" stroke="#d4af37"/>
        <text x="35" y="166" fill="#d4af37" font-family="-apple-system, sans-serif" font-size="10" font-weight="800">5</text>
        <text x="45" y="168" fill="#f7d794" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="14">ALGERIA</text>
      </g>

      <!-- Clues & Trophy Card -->
      <g transform="translate(420, 130)">
        <rect width="320" height="150" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(224,169,109,0.3)"/>
        <text x="20" y="32" fill="#ff758c" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">↔️ ACROSS CLUES</text>
        <text x="20" y="60" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="600">3. Guangzhou tower sunrise talks 🗼 ✓</text>
        <text x="20" y="85" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="600">5. Home country beaches &amp; feast 🇩🇿 ✓</text>
        <text x="20" y="110" fill="rgba(255,255,255,0.7)" font-family="-apple-system, sans-serif" font-size="12">8. Balinese duck dinner 'your father' 🦆</text>
        <text x="20" y="135" fill="rgba(255,255,255,0.7)" font-family="-apple-system, sans-serif" font-size="12">9. Airport 4-pants restroom sprint 🇻🇳</text>

        <!-- Soulmate Diploma Preview Badge -->
        <g transform="translate(0, 170)">
          <rect width="320" height="115" rx="14" fill="rgba(255,67,101,0.15)" stroke="#ff4365"/>
          <text x="160" y="35" fill="#ff4365" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle">🏆 100% SOULMATE AFFINITY</text>
          <text x="160" y="62" fill="#fbe3d2" font-family="Georgia, serif" font-size="13" font-style="italic" text-anchor="middle">"Every clue solved binds our eternal story"</text>
          <rect x="60" y="78" width="200" height="26" rx="13" fill="url(#cwGold)"/>
          <text x="160" y="95" fill="#2c131d" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">📥 DOWNLOAD KEEPSAKE DIPLOMA</text>
        </g>
      </g>
    </svg>
  `);

  // 34. MEMORY PHOTO PUZZLE
  PREVIEWS.puzzle_photo = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="pzBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2c1124"/>
          <stop offset="50%" stop-color="#190915"/>
          <stop offset="100%" stop-color="#0d040a"/>
        </linearGradient>
        <linearGradient id="pzRose" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff5470"/>
          <stop offset="100%" stop-color="#ff758c"/>
        </linearGradient>
        <linearGradient id="pzTileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff9a9e"/>
          <stop offset="50%" stop-color="#fecfef"/>
          <stop offset="100%" stop-color="#a1c4fd"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#pzBg)"/>
      <rect x="30" y="25" width="740" height="430" rx="20" fill="rgba(255,255,255,0.05)" stroke="url(#pzRose)" stroke-width="2"/>
      <text x="400" y="65" fill="#ff758c" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="2" text-anchor="middle">MEMORY PHOTO PUZZLE 🧩❤️</text>
      <text x="400" y="100" fill="#ffffff" font-family="Georgia, serif" font-size="26" font-weight="800" text-anchor="middle">Piece Our Love Together</text>

      <!-- HUD Bar -->
      <g transform="translate(60, 115)">
        <rect width="680" height="40" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
        <text x="25" y="25" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">⏱️ 01:24</text>
        <text x="120" y="25" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">🔄 18 moves</text>
        <text x="230" y="25" fill="#ff758c" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">🎯 8/9 Solved</text>
        <rect x="520" y="7" width="65" height="26" rx="13" fill="url(#pzRose)"/>
        <text x="552" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Slide</text>
        <rect x="595" y="7" width="65" height="26" rx="13" fill="rgba(255,255,255,0.1)"/>
        <text x="627" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Swap</text>
      </g>

      <!-- 3x3 Puzzle Board representation -->
      <g transform="translate(80, 175)">
        <rect width="270" height="255" rx="16" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <!-- 3x3 tiles -->
        <rect x="12" y="10" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="76" y="74" fill="#333" font-size="10" font-weight="800">1</text>
        <rect x="96" y="10" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="160" y="74" fill="#333" font-size="10" font-weight="800">2</text>
        <rect x="180" y="10" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="244" y="74" fill="#333" font-size="10" font-weight="800">3</text>

        <rect x="12" y="90" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="76" y="154" fill="#333" font-size="10" font-weight="800">4</text>
        <rect x="96" y="90" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="160" y="154" fill="#333" font-size="10" font-weight="800">5</text>
        <rect x="180" y="90" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="244" y="154" fill="#333" font-size="10" font-weight="800">6</text>

        <rect x="12" y="170" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="76" y="234" fill="#333" font-size="10" font-weight="800">7</text>
        <rect x="96" y="170" width="76" height="72" rx="8" fill="url(#pzTileGrad)" stroke="rgba(255,255,255,0.4)"/>
        <text x="160" y="234" fill="#333" font-size="10" font-weight="800">8</text>
        <!-- Empty Slot -->
        <rect x="180" y="170" width="76" height="72" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,84,112,0.4)" stroke-dasharray="4,4"/>
        <text x="218" y="212" font-size="20" text-anchor="middle">💖</text>
      </g>

      <!-- Keepsake Reveal Voucher Preview -->
      <g transform="translate(410, 175)">
        <rect width="320" height="255" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,182,193,0.3)"/>
        <rect x="60" y="16" width="200" height="26" rx="13" fill="url(#pzRose)"/>
        <text x="160" y="33" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">💌 SECRET KEEPSAKE</text>
        <text x="160" y="75" fill="#ffffff" font-family="Georgia, serif" font-size="18" font-weight="700" text-anchor="middle">You Complete My World</text>
        <text x="160" y="105" fill="#ffe4e8" font-family="Georgia, serif" font-size="12" font-style="italic" text-anchor="middle">"Every piece of my heart belongs to you."</text>
        
        <!-- Polaroid Mini -->
        <rect x="105" y="125" width="110" height="85" rx="6" fill="#ffffff" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))" transform="rotate(-3 160 165)"/>
        <rect x="112" y="132" width="96" height="60" rx="3" fill="url(#pzTileGrad)" transform="rotate(-3 160 165)"/>
        <text x="160" y="202" fill="#ff5470" font-size="9" font-weight="800" text-anchor="middle" transform="rotate(-3 160 165)">100% SOLVED ❤️</text>

        <rect x="60" y="222" width="200" height="24" rx="12" fill="#25d366"/>
        <text x="160" y="238" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">🥂 Claim Romantic Date</text>
      </g>
    </svg>
  `);

  // 35. VINTAGE PHOTOBOOTH
  PREVIEWS.photobooth = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="pbBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1f141e"/>
          <stop offset="50%" stop-color="#140d17"/>
          <stop offset="100%" stop-color="#08040a"/>
        </linearGradient>
        <linearGradient id="pbPink" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e06377"/>
          <stop offset="100%" stop-color="#ff8da1"/>
        </linearGradient>
        <linearGradient id="pbCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#48cae4"/>
          <stop offset="100%" stop-color="#0077b6"/>
        </linearGradient>
        <linearGradient id="pbStrip" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#fdfbf7"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#pbBg)"/>
      <rect x="30" y="25" width="740" height="430" rx="20" fill="rgba(255,255,255,0.04)" stroke="url(#pbPink)" stroke-width="2"/>
      
      <!-- Top Badges -->
      <g transform="translate(400, 55)" text-anchor="middle">
        <rect x="-110" y="-14" width="220" height="24" rx="12" fill="rgba(224,99,119,0.2)" stroke="url(#pbPink)"/>
        <text y="3" fill="#ff8da1" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="2">VINTAGE PHOTOBOOTH 📸</text>
        <text y="36" fill="#ffffff" font-family="Georgia, serif" font-size="24" font-weight="700">Capture Our Sweet Moments</text>
      </g>

      <!-- Machine Viewfinder Screen -->
      <g transform="translate(60, 115)">
        <rect width="320" height="315" rx="16" fill="#0e0710" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <rect x="15" y="15" width="290" height="230" rx="10" fill="#1b1220"/>
        
        <!-- Camera Lens Circle -->
        <circle cx="160" cy="120" r="50" fill="#25172d" stroke="#e06377" stroke-width="3"/>
        <circle cx="160" cy="120" r="32" fill="#352042" stroke="rgba(255,255,255,0.3)"/>
        <circle cx="150" cy="110" r="10" fill="rgba(255,255,255,0.2)"/>
        <text x="160" y="126" font-size="22" text-anchor="middle">📸</text>

        <!-- Viewfinder HUD Overlays -->
        <path d="M 25 25 L 45 25 M 25 25 L 25 45" stroke="#ff8da1" stroke-width="2" fill="none"/>
        <path d="M 295 25 L 275 25 M 295 25 L 295 45" stroke="#ff8da1" stroke-width="2" fill="none"/>
        <path d="M 25 235 L 45 235 M 25 235 L 25 215" stroke="#ff8da1" stroke-width="2" fill="none"/>
        <path d="M 295 235 L 275 235 M 295 235 L 295 215" stroke="#ff8da1" stroke-width="2" fill="none"/>
        
        <rect x="25" y="32" width="55" height="18" rx="9" fill="#e06377"/>
        <text x="52" y="44" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">● REC</text>

        <!-- Shutter Button & Upload Bar -->
        <rect x="25" y="260" width="130" height="38" rx="19" fill="url(#pbPink)"/>
        <text x="90" y="284" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Take Photo 📸</text>
        <rect x="165" y="260" width="130" height="38" rx="19" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/>
        <text x="230" y="284" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Upload 🖼️</text>
      </g>

      <!-- Frame Rack & Ejected Photostrip -->
      <g transform="translate(410, 115)">
        <text x="165" y="10" fill="rgba(255,255,255,0.7)" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">PICK A FRAME INSIDE THE BOOTH</text>
        
        <!-- 4 mini frame selector icons -->
        <g transform="translate(0, 22)">
          <rect x="5" y="0" width="70" height="110" rx="8" fill="#48cae4" stroke="#ffffff" stroke-width="2"/>
          <text x="40" y="100" fill="#003554" font-size="8" font-weight="800" text-anchor="middle">STRIP</text>
          
          <rect x="85" y="0" width="70" height="110" rx="8" fill="#40916c" stroke="#b7e4c7" stroke-width="1.5"/>
          <text x="120" y="100" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">GRID</text>

          <rect x="165" y="0" width="70" height="110" rx="8" fill="#f72585" stroke="#ffb703" stroke-width="1.5"/>
          <text x="200" y="100" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">PAIR</text>

          <rect x="245" y="0" width="70" height="110" rx="8" fill="#7209b7" stroke="#c77dff" stroke-width="1.5"/>
          <text x="280" y="100" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">WIDE</text>
        </g>

        <!-- Ejected Strip Machine Slot -->
        <g transform="translate(60, 150)">
          <rect x="0" y="0" width="200" height="14" rx="7" fill="#08040a" stroke="rgba(255,255,255,0.3)"/>
          
          <!-- Printed Photostrip Sliding Out -->
          <g transform="translate(25, 10)">
            <rect width="150" height="155" rx="6" fill="url(#pbStrip)" stroke="#e06377" stroke-width="2" filter="drop-shadow(0 6px 15px rgba(0,0,0,0.5))"/>
            <!-- 3 Mini Photos -->
            <rect x="12" y="10" width="126" height="34" rx="4" fill="#331c38"/>
            <rect x="12" y="48" width="126" height="34" rx="4" fill="#331c38"/>
            <rect x="12" y="86" width="126" height="34" rx="4" fill="#331c38"/>
            
            <text x="75" y="32" font-size="14" text-anchor="middle">🥰</text>
            <text x="75" y="70" font-size="14" text-anchor="middle">🫶</text>
            <text x="75" y="108" font-size="14" text-anchor="middle">✨</text>
            
            <text x="75" y="132" fill="#e06377" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" text-anchor="middle">ALEX &amp; SAM ♡ 2026</text>
            <text x="75" y="144" fill="#999" font-size="6" text-anchor="middle">CLASSIC PHOTOBOOTH STRIP</text>
          </g>
        </g>
      </g>
    </svg>
  `);

  // 36. DRAW FOR TWO (COUPLE DRAWING STUDIO)
  PREVIEWS.draw = svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
      <defs>
        <linearGradient id="dwBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1528"/>
          <stop offset="50%" stop-color="#140e1b"/>
          <stop offset="100%" stop-color="#0b080f"/>
        </linearGradient>
        <linearGradient id="dwPink" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f7789e"/>
          <stop offset="100%" stop-color="#ff5470"/>
        </linearGradient>
        <linearGradient id="dwBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#5fa0ff"/>
          <stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>

      <rect width="800" height="480" fill="url(#dwBg)"/>

      <!-- Header -->
      <g transform="translate(400, 45)" text-anchor="middle">
        <rect x="-130" y="-18" width="260" height="28" rx="14" fill="rgba(247,120,158,0.15)" stroke="rgba(247,120,158,0.4)"/>
        <text y="0" fill="#f7789e" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">🎨 SYNCHRONIZED DRAWING STUDIO</text>
        <text y="38" fill="#ffffff" font-family="'Playfair Display', Georgia, serif" font-size="24" font-weight="700">Draw for Two 💕</text>
        <text y="60" fill="rgba(255,255,255,0.6)" font-family="-apple-system, sans-serif" font-size="12">Sketch prompts together across the distance in real-time</text>
      </g>

      <!-- Dual Drawing Pads -->
      <g transform="translate(60, 130)">
        <!-- Left Pad: You (Alex) -->
        <g transform="translate(0, 0)">
          <rect width="310" height="230" rx="16" fill="#ffffff" stroke="#f7789e" stroke-width="2" filter="drop-shadow(0 8px 24px rgba(247,120,158,0.2))"/>
          <!-- Pad Header -->
          <rect x="14" y="12" width="70" height="22" rx="6" fill="rgba(247,120,158,0.15)"/>
          <text x="49" y="27" fill="#e11d48" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">ALEX ♀</text>
          <text x="290" y="27" fill="#71717a" font-family="-apple-system, sans-serif" font-size="11" text-anchor="end">Drawing... ✏️</text>

          <!-- Inner Canvas -->
          <rect x="14" y="42" width="282" height="135" rx="10" fill="#fafafa" stroke="#e4e4e7"/>
          <!-- Cute Doodled Heart & Flower -->
          <path d="M140 85 C140 70 120 65 110 80 C100 100 130 115 140 130 C150 115 180 100 170 80 C160 65 140 70 140 85 Z" fill="none" stroke="#f7789e" stroke-width="3" stroke-linecap="round"/>
          <circle cx="210" cy="100" r="8" fill="#ffd23f"/>
          <text x="140" y="162" fill="#71717a" font-family="-apple-system, sans-serif" font-size="11" text-anchor="middle">"Thinking of you" 🌸</text>

          <!-- Palette Swatches -->
          <g transform="translate(16, 192)">
            <circle cx="10" cy="12" r="8" fill="#f7789e"/>
            <circle cx="32" cy="12" r="8" fill="#5fa0ff"/>
            <circle cx="54" cy="12" r="8" fill="#18181b"/>
            <circle cx="76" cy="12" r="8" fill="#28c76f"/>
            <circle cx="98" cy="12" r="8" fill="#ffd23f"/>
            <circle cx="120" cy="12" r="8" fill="#9b5de5"/>
          </g>
        </g>

        <!-- Center Heart Connector -->
        <g transform="translate(340, 90)">
          <circle cx="0" cy="0" r="22" fill="url(#dwPink)" filter="drop-shadow(0 4px 12px rgba(247,120,158,0.5))"/>
          <text x="0" y="6" font-size="18" text-anchor="middle">💕</text>
          <text x="0" y="36" fill="#a1a1aa" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" letter-spacing="1" text-anchor="middle">SYNC</text>
        </g>

        <!-- Right Pad: Partner (Sam) -->
        <g transform="translate(370, 0)">
          <rect width="310" height="230" rx="16" fill="#ffffff" stroke="#5fa0ff" stroke-width="2" filter="drop-shadow(0 8px 24px rgba(95,160,255,0.2))"/>
          <!-- Pad Header -->
          <rect x="14" y="12" width="70" height="22" rx="6" fill="rgba(95,160,255,0.15)"/>
          <text x="49" y="27" fill="#2563eb" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">SAM ♂</text>
          <text x="290" y="27" fill="#71717a" font-family="-apple-system, sans-serif" font-size="11" text-anchor="end">Drawing... ✏️</text>

          <!-- Inner Canvas -->
          <rect x="14" y="42" width="282" height="135" rx="10" fill="#fafafa" stroke="#e4e4e7"/>
          <!-- Cute Doodled Star & Cat Face -->
          <circle cx="155" cy="95" r="25" fill="none" stroke="#5fa0ff" stroke-width="3"/>
          <circle cx="146" cy="90" r="3" fill="#5fa0ff"/>
          <circle cx="164" cy="90" r="3" fill="#5fa0ff"/>
          <path d="M150 102 Q155 106 160 102" fill="none" stroke="#5fa0ff" stroke-width="2" stroke-linecap="round"/>
          <text x="155" y="162" fill="#71717a" font-family="-apple-system, sans-serif" font-size="11" text-anchor="middle">"Forever &amp; Always" ⭐</text>

          <!-- Poke Reactions -->
          <g transform="translate(170, 192)">
            <text x="0" y="16" font-size="16">👉</text>
            <text x="24" y="16" font-size="16">💖</text>
            <text x="48" y="16" font-size="16">😂</text>
            <text x="72" y="16" font-size="16">🌀</text>
            <text x="96" y="16" font-size="16">💥</text>
            <text x="120" y="16" font-size="16">⭐</text>
          </g>
        </g>
      </g>

      <!-- Bottom Launch Actions -->
      <g transform="translate(400, 420)" text-anchor="middle">
        <rect x="-140" y="-18" width="280" height="36" rx="18" fill="url(#dwPink)"/>
        <text y="5" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">🚀 START ROOM &amp; DRAW TOGETHER</text>
      </g>
    </svg>
  `);

  window.WIDGET_PREVIEWS = PREVIEWS;
  window.getWidgetPreviewImage = function(widgetId) {
    return PREVIEWS[widgetId] || null;
  };
})();
