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

  window.WIDGET_PREVIEWS = PREVIEWS;
  window.getWidgetPreviewImage = function(widgetId) {
    return PREVIEWS[widgetId] || null;
  };
})();
