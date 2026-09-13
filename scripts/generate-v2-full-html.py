# Generate complete, rich Design 2 HTML for LoveSaas
import re

v2_html = '''<div id="landingViewV2" class="landing-version-view v2-theme hidden">

  <!-- Mobile Drawer Menu Overlay -->
  <div class="v2-mobile-menu-overlay" id="v2MobileMenuOverlay"></div>
  <div class="v2-mobile-menu" id="v2MobileMenu">
    <div class="v2-mobile-menu-header">
      <div class="v2-nav-brand">
        <div class="v2-logo-icon">
          <svg viewBox="0 0 44 40" fill="none" stroke="#f5a39a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 7.5 C11.5 3.5 6 3.8 3.5 7 C0.8 10.5 1 16 4.5 20 L16 32 L20 28" />
            <path d="M29.5 7.5 C32.5 3.5 38 3.8 40.5 7 C43.2 10.5 43 16 39.5 20 L28 32 L16 20" />
            <path d="M14.5 7.5 C16.5 10 18.5 13 22 17 C25.5 13 27.5 10 29.5 7.5" />
          </svg>
        </div>
        <div class="v2-brand-text-wrap">
          <span class="v2-brand-name">LoveSaas</span>
          <span class="v2-brand-sub">PRESERVE WHAT MATTERS</span>
        </div>
      </div>
      <button type="button" class="v2-btn-close-menu" id="btnV2CloseMenu" aria-label="Close menu">✕</button>
    </div>
    <nav class="v2-mobile-nav-links">
      <a href="#v2Templates" class="v2-mobile-nav-link">🎨 Romantic Templates</a>
      <a href="#v2Features" class="v2-mobile-nav-link">🧩 16+ Modular Widgets</a>
      <a href="#v2HowItWorks" class="v2-mobile-nav-link">✨ How It Works</a>
      <a href="#v2Demo" class="v2-mobile-nav-link">📱 Live Device Demo</a>
      <a href="#v2Reviews" class="v2-mobile-nav-link">💖 Couple Stories &amp; Reviews</a>
      <a href="#v2Pricing" class="v2-mobile-nav-link">💎 Lifetime Pricing (50% OFF)</a>
      <a href="#v2Faq" class="v2-mobile-nav-link">❓ FAQ</a>
    </nav>
    <div class="v2-mobile-menu-footer">
      <a href="/builder" class="v2-btn-primary" style="width: 100%;">
        <span>🚀</span> Open Visual Builder →
      </a>
      <button type="button" class="v2-btn-secondary btn-open-signin-v2" style="width: 100%; margin-top: 8px;">
        <span>🔑</span> Sign In to Account
      </button>
    </div>
  </div>

  <!-- Sticky Header Navigation -->
  <header class="v2-header">
    <div class="v2-container">
      <nav class="v2-nav">
        <!-- Brand -->
        <a href="/welcome" class="v2-nav-brand">
          <div class="v2-logo-icon">
            <svg viewBox="0 0 44 40" fill="none" stroke="#f5a39a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 7.5 C11.5 3.5 6 3.8 3.5 7 C0.8 10.5 1 16 4.5 20 L16 32 L20 28" />
              <path d="M29.5 7.5 C32.5 3.5 38 3.8 40.5 7 C43.2 10.5 43 16 39.5 20 L28 32 L16 20" />
              <path d="M14.5 7.5 C16.5 10 18.5 13 22 17 C25.5 13 27.5 10 29.5 7.5" />
            </svg>
          </div>
          <div class="v2-brand-text-wrap">
            <span class="v2-brand-name">LoveSaas</span>
            <span class="v2-brand-sub">PRESERVE WHAT MATTERS</span>
          </div>
        </a>

        <!-- Desktop Navigation Links (Visible on Tablet & Desktop) -->
        <div class="v2-desktop-nav-links" role="navigation" aria-label="Desktop Navigation">
          <a href="#v2Templates" class="v2-desktop-nav-link">Templates</a>
          <a href="#v2Features" class="v2-desktop-nav-link">16+ Widgets</a>
          <a href="#v2HowItWorks" class="v2-desktop-nav-link">How It Works</a>
          <a href="#v2Demo" class="v2-desktop-nav-link">Demo</a>
          <a href="#v2Reviews" class="v2-desktop-nav-link">Reviews</a>
          <a href="#v2Pricing" class="v2-desktop-nav-link">Pricing</a>
          <a href="#v2Faq" class="v2-desktop-nav-link">FAQ</a>
        </div>

        <!-- Header Actions -->
        <div class="v2-nav-actions">
          <button type="button" class="v2-btn-signin-ghost btn-open-signin-v2" id="btnV2SignIn">
            Sign In
          </button>
          <a href="/builder" class="v2-btn-builder" id="btnV2HeaderBuilder">
            <span class="v2-builder-dot"></span>
            <span>Builder</span>
            <span class="v2-builder-arrow">›</span>
          </a>
          <button type="button" class="v2-user-avatar btn-open-signin-v2" id="btnV2Avatar" title="Account Menu">
            <span>M</span>
          </button>
          <button type="button" class="v2-nav-hamburger" id="btnV2Hamburger" aria-label="Toggle navigation menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <!-- Promo Pill Banner (Exact Match to Screenshot) -->
  <div class="v2-container">
    <div class="v2-promo-pill-wrap">
      <a href="#v2Pricing" class="v2-promo-pill">
        <span class="v2-promo-icon">🌸</span>
        <span class="v2-promo-text">50% OFF: Private Couple Keepsake &amp; Visual Builder</span>
        <span class="v2-promo-arrow">→</span>
      </a>
    </div>
  </div>

  <!-- Hero Section (Exact Match to Screenshot) -->
  <section class="v2-hero">
    <div class="v2-container">
      <div class="v2-hero-layout">
        <!-- Left Content -->
        <div class="v2-hero-content">
          <div class="v2-hero-eyebrow">PRIVATE COUPLE KEEPSAKE</div>
          <h1 class="v2-hero-title">
            A Private Website<br>for Your <em>Love Story</em>
          </h1>
          <p class="v2-hero-desc">
            Photos, wax-sealed letters, travel maps, and milestone countdowns — ready in 2 minutes.
          </p>

          <div class="v2-hero-ctas">
            <a href="/builder" class="v2-btn-primary" id="btnV2HeroBuilder">
              <span>🚀</span> Go to Builder →
            </a>
            <button type="button" class="v2-btn-secondary" id="btnV2BuilderDemo">
              <span>🎨</span> Builder Demo
            </button>
            <button type="button" class="v2-btn-tertiary" id="btnV2WebsiteDemo">
              <span>▶</span> Website Demo
            </button>
          </div>
        </div>

        <!-- Right Visual (Seamless Sunset Couple + Script Note Composition) -->
        <div class="v2-hero-visual">
          <img class="v2-hero-art-img" src="/images/landing-v2/hero-right-composition.png" alt="Couple watching city lights at sunset" loading="eager" width="236" height="350">
        </div>
      </div>
    </div>
  </section>

  <!-- 5 Feature Squircles Row (Exact Match to Screenshot) -->
  <section class="v2-features-quick-section">
    <div class="v2-container">
      <div class="v2-features-row">
        <!-- 1. Photos & Videos -->
        <a href="#v2Features" class="v2-feature-item" data-filter="memories">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.8" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <span class="v2-feature-label">Photos &amp; Videos</span>
        </a>

        <!-- 2. Wax-Sealed Letters -->
        <a href="#v2Features" class="v2-feature-item" data-filter="story">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path d="M3 7l9 6 9-6" />
              <circle cx="12" cy="14" r="2" fill="currentColor" />
            </svg>
          </div>
          <span class="v2-feature-label">Wax-Sealed Letters</span>
        </a>

        <!-- 3. Travel Maps -->
        <a href="#v2Features" class="v2-feature-item" data-filter="memories">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </div>
          <span class="v2-feature-label">Travel Maps</span>
        </a>

        <!-- 4. Countdowns -->
        <a href="#v2Features" class="v2-feature-item" data-filter="story">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="3.5" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <circle cx="12" cy="15" r="2" />
            </svg>
          </div>
          <span class="v2-feature-label">Countdowns</span>
        </a>

        <!-- 5. And More -->
        <a href="#v2Features" class="v2-feature-item" data-filter="all">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span class="v2-feature-label">And More</span>
        </a>
      </div>
    </div>
  </section>

  <!-- 4 Stats Row (Exact Match to Screenshot with Vertical Dividers) -->
  <section class="v2-stats-section">
    <div class="v2-container">
      <div class="v2-stats-row">
        <div class="v2-stat-item">
          <div class="v2-stat-value">1,280+</div>
          <div class="v2-stat-label">COUPLES</div>
        </div>
        <div class="v2-stat-item">
          <div class="v2-stat-value">2 Mins</div>
          <div class="v2-stat-label">FAST SETUP</div>
        </div>
        <div class="v2-stat-item">
          <div class="v2-stat-value">Forever</div>
          <div class="v2-stat-label">LIFETIME ACCESS</div>
        </div>
        <div class="v2-stat-item">
          <div class="v2-stat-value">100%</div>
          <div class="v2-stat-label">PRIVATE &amp; SECURE</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Review Pill Banner (Exact Match to Screenshot) -->
  <div class="v2-container">
    <a href="#v2Reviews" class="v2-review-pill">
      <div class="v2-review-avatars">
        <img src="/images/landing-v2/couple-avatars-clean.png" alt="Happy Couples" width="67" height="30">
      </div>
      <div class="v2-stars">★★★★★</div>
      <span class="v2-review-text">4.9/5 from 1,200+ happy couples</span>
      <span class="v2-review-arrow">›</span>
    </a>
  </div>

  <!-- Templates Showcase Section (Exact Match to Screenshot) -->
  <section class="v2-templates-section" id="v2Templates">
    <div class="v2-container">
      <div class="v2-section-eyebrow">BEAUTIFUL TEMPLATES</div>
      <h2 class="v2-section-title">Designed for Every Love Story</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        From anniversaries to weddings, find the perfect design and make it yours.
      </p>

      <div class="v2-templates-grid">
        <!-- Template 1: Our Story -->
        <div class="v2-template-card" data-preset="romantic-rose">
          <div class="v2-template-media">
            <img class="v2-template-img" src="/images/landing-v2/template-our-story.png" alt="Our Story Template Preview" loading="lazy">
            <div class="v2-template-overlay">
              <span class="v2-template-tag">Sunset Romance</span>
              <h4 class="v2-template-title">Together Always</h4>
              <p class="v2-template-blurb">Soft golden hour beaches &amp; cinematic typography.</p>
              <a href="/builder?preset=theme1" class="v2-btn-preview-template">Customize This Style →</a>
            </div>
          </div>
        </div>

        <!-- Template 2: You & Me -->
        <div class="v2-template-card" data-preset="cinematic-dusk">
          <div class="v2-template-media">
            <img class="v2-template-img" src="/images/landing-v2/template-you-and-me.png" alt="You &amp; Me Template Preview" loading="lazy">
            <div class="v2-template-overlay">
              <span class="v2-template-tag">Starry Twilight</span>
              <h4 class="v2-template-title">You &amp; Me</h4>
              <p class="v2-template-blurb">Deep moody evening skies with enchanted forest pathway.</p>
              <a href="/builder?preset=theme2" class="v2-btn-preview-template">Customize This Style →</a>
            </div>
          </div>
        </div>

        <!-- Template 3: A Love That Grows -->
        <div class="v2-template-card" data-preset="tulip-romance">
          <div class="v2-template-media">
            <img class="v2-template-img" src="/images/landing-v2/template-love-grows.png" alt="A Love That Grows Template Preview" loading="lazy">
            <div class="v2-template-overlay">
              <span class="v2-template-tag">Floral Keepsake</span>
              <h4 class="v2-template-title">A Love That Grows</h4>
              <p class="v2-template-blurb">Blush pink tulips on handmade cream paper with polaroids.</p>
              <a href="/builder?preset=theme3" class="v2-btn-preview-template">Customize This Style →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 1: 16+ MODULAR WIDGETS & GAMES          -->
  <!-- ================================================================ -->
  <section class="v2-features-grid-section" id="v2Features">
    <div class="v2-container">
      <div class="v2-section-eyebrow">HANDCRAFTED MODULES</div>
      <h2 class="v2-section-title">16+ Modular Widgets &amp; Mini-Games</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        Pick and choose any module to craft your dream couple website. Toggle on or off anytime with live drag-and-drop.
      </p>

      <!-- Category Filter Pills -->
      <div class="v2-filter-bar" role="tablist">
        <button type="button" class="v2-filter-btn active" data-filter="all">All Modules (16+)</button>
        <button type="button" class="v2-filter-btn" data-filter="story">💌 Letters &amp; Story</button>
        <button type="button" class="v2-filter-btn" data-filter="memories">📸 Photos &amp; Travel</button>
        <button type="button" class="v2-filter-btn" data-filter="games">🎮 Couple Games</button>
        <button type="button" class="v2-filter-btn" data-filter="occasions">🎂 Birthday &amp; Occasions</button>
      </div>

      <!-- Widgets Showcase Cards Grid -->
      <div class="v2-widgets-grid">
        <!-- 1. Hero Header & LDR Clocks -->
        <div class="v2-widget-card" data-cat="story">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">👑</div>
            <span class="v2-widget-badge">Story</span>
          </div>
          <h3 class="v2-widget-name">Hero Header &amp; LDR Clocks</h3>
          <p class="v2-widget-summary">Dual live timezones, reunion flight countdown, and romantic autoplay music player.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=hero" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 2. Wax-Sealed Letter -->
        <div class="v2-widget-card" data-cat="story">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">💌</div>
            <span class="v2-widget-badge">Story</span>
          </div>
          <h3 class="v2-widget-name">Wax-Sealed Audio Letter</h3>
          <p class="v2-widget-summary">Tap to crack open the 3D wax seal and reveal your heartfelt handwritten letter &amp; voice recording.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=letter" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 3. Interactive World Travel Map -->
        <div class="v2-widget-card" data-cat="memories">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🗺️</div>
            <span class="v2-widget-badge">Memories</span>
          </div>
          <h3 class="v2-widget-name">Interactive Love Travel Map</h3>
          <p class="v2-widget-summary">Pin every city, flight route, road trip, and memory stop with photos and flight mileage counters.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=map" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 4. Polaroid Memory Gallery -->
        <div class="v2-widget-card" data-cat="memories">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">📸</div>
            <span class="v2-widget-badge">Memories</span>
          </div>
          <h3 class="v2-widget-name">Polaroid Memories Wall</h3>
          <p class="v2-widget-summary">Scattered washi tape polaroid cards with romantic handwritten captions and lightboxes.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=memories" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 5. Milestone Love Timeline -->
        <div class="v2-widget-card" data-cat="story">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">⏳</div>
            <span class="v2-widget-badge">Story</span>
          </div>
          <h3 class="v2-widget-name">Milestone Love Timeline</h3>
          <p class="v2-widget-summary">Vertical story chapters tracing when you first met, first date, travels, and unforgettable milestones.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=timeline" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 6. 100 Reasons Why I Love You -->
        <div class="v2-widget-card" data-cat="story">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">✨</div>
            <span class="v2-widget-badge">Story</span>
          </div>
          <h3 class="v2-widget-name">Reasons Why I Lof You</h3>
          <p class="v2-widget-summary">Interactive cards revealing all the cute, silly, and deep reasons your partner is your favorite human.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=reasons" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 7. Romantic Love Coupons -->
        <div class="v2-widget-card" data-cat="games">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🎟️</div>
            <span class="v2-widget-badge">Games</span>
          </div>
          <h3 class="v2-widget-name">Redeemable Love Coupons</h3>
          <p class="v2-widget-summary">Tearable scratch-off voucher cards for back rubs, midnight food runs, date nights &amp; cuddles.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=coupons" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 8. Truth or Dare Couple Game -->
        <div class="v2-widget-card" data-cat="games">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🎲</div>
            <span class="v2-widget-badge">Games</span>
          </div>
          <h3 class="v2-widget-name">Couple Truth or Dare</h3>
          <p class="v2-widget-summary">Playful interactive spin cards with cute questions, romantic challenges, and custom dares.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=truth_dare" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 9. Date Night Decision Spinner -->
        <div class="v2-widget-card" data-cat="games">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🎡</div>
            <span class="v2-widget-badge">Games</span>
          </div>
          <h3 class="v2-widget-name">Date Night Wheel Spinner</h3>
          <p class="v2-widget-summary">Spin the colorful wheel when you can't decide what to eat or what romantic movie to watch.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=spinner" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 10. Candle Blow-Out & Birthday Wish -->
        <div class="v2-widget-card" data-cat="occasions">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🎂</div>
            <span class="v2-widget-badge">Occasion</span>
          </div>
          <h3 class="v2-widget-name">Interactive Birthday Candle</h3>
          <p class="v2-widget-summary">Tap or blow into microphone to extinguish the flickering candle flame with confetti and sparkle chime.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=candle_blowout" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 11. 3D Gift Box Unboxer -->
        <div class="v2-widget-card" data-cat="occasions">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">🎁</div>
            <span class="v2-widget-badge">Occasion</span>
          </div>
          <h3 class="v2-widget-name">3D Ribbon Gift Unboxer</h3>
          <p class="v2-widget-summary">Animated gift box with untying satin ribbon that reveals surprises, vouchers, or secret notes.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=gift_unboxer" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>

        <!-- 12. Celestial Night Sky Star Map -->
        <div class="v2-widget-card" data-cat="memories">
          <div class="v2-widget-top">
            <div class="v2-widget-icon-box">✨</div>
            <span class="v2-widget-badge">Memories</span>
          </div>
          <h3 class="v2-widget-name">Celestial Star Map</h3>
          <p class="v2-widget-summary">Real night sky constellations exactly as they were positioned on your anniversary night.</p>
          <div class="v2-widget-action">
            <a href="/builder?widget=star_map" class="v2-btn-card-link">Customize in Builder →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 2: HOW IT WORKS IN 3 SIMPLE STEPS       -->
  <!-- ================================================================ -->
  <section class="v2-steps-section" id="v2HowItWorks">
    <div class="v2-container">
      <div class="v2-section-eyebrow">EFFORTLESS CREATION</div>
      <h2 class="v2-section-title">How Your Love Website Comes to Life</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        No coding, no complicated setup. In just 2 minutes, surprise your partner with an unforgettable digital sanctuary.
      </p>

      <div class="v2-steps-grid">
        <!-- Step 1 -->
        <div class="v2-step-card">
          <div class="v2-step-num">01</div>
          <div class="v2-step-icon">🎨</div>
          <h3 class="v2-step-title">Choose Your Style &amp; Theme</h3>
          <p class="v2-step-desc">Select from romantic aesthetic presets: sunset beaches, enchanted midnight dusk, or elegant floral blush.</p>
        </div>

        <!-- Step 2 -->
        <div class="v2-step-card">
          <div class="v2-step-num">02</div>
          <div class="v2-step-icon">📸</div>
          <h3 class="v2-step-title">Add Your Sweet Memories</h3>
          <p class="v2-step-desc">Upload favorite photos, write a wax-sealed love letter, pin your trip destinations, and set your reunion clock.</p>
        </div>

        <!-- Step 3 -->
        <div class="v2-step-card">
          <div class="v2-step-num">03</div>
          <div class="v2-step-icon">💌</div>
          <h3 class="v2-step-title">Surprise Your Partner</h3>
          <p class="v2-step-desc">Share your private link with password protection. Watch them tear up as romantic music plays and memories unfold.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 3: LIVE INTERACTIVE DEVICE SHOWCASE     -->
  <!-- ================================================================ -->
  <section class="v2-demo-section" id="v2Demo">
    <div class="v2-container">
      <div class="v2-demo-card">
        <div class="v2-demo-header">
          <div>
            <span class="v2-section-eyebrow">INTERACTIVE PREVIEW</span>
            <h3 class="v2-demo-title">Test-Drive a Real Couple Keepsake</h3>
            <p class="v2-demo-desc">Tap through photos, play music, open wax letters, and test the travel map right now.</p>
          </div>
          <div class="v2-demo-actions">
            <a href="/sites/demo" target="_blank" class="v2-btn-primary" style="width: auto; padding: 11px 24px; font-size: 14.5px;">
              <span>🌐</span> Open Fullscreen Demo ↗
            </a>
            <a href="/builder" class="v2-btn-secondary" style="width: auto; padding: 11px 22px; font-size: 14px;">
              <span>🛠️</span> Open Visual Builder
            </a>
          </div>
        </div>

        <!-- Device Mockup Frame -->
        <div class="v2-device-mockup-wrap">
          <div class="v2-iphone-frame">
            <div class="v2-iphone-notch">
              <span class="v2-iphone-camera"></span>
              <span class="v2-iphone-speaker"></span>
            </div>
            <iframe src="/sites/demo" title="LoveSaas Live Demo Site" loading="lazy" class="v2-demo-iframe"></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 4: REAL COUPLE STORIES & REVIEWS        -->
  <!-- ================================================================ -->
  <section class="v2-reviews-section" id="v2Reviews">
    <div class="v2-container">
      <div class="v2-section-eyebrow">HEARTFELT STORIES</div>
      <h2 class="v2-section-title">Loved by 1,200+ Couples Worldwide</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        From anniversary surprises to long-distance reunions and wedding vows, here is what couples say:
      </p>

      <div class="v2-reviews-grid">
        <!-- Review 1 -->
        <div class="v2-review-card">
          <div class="v2-review-card-header">
            <div class="v2-review-card-stars">★★★★★</div>
            <span class="v2-review-badge">1st Anniversary</span>
          </div>
          <p class="v2-review-quote">
            "I sent the link to my girlfriend at midnight on our anniversary. She literally called me in tears. The wax seal letter and the music playing in the background made it so personal and romantic!"
          </p>
          <div class="v2-review-author">
            <div class="v2-author-avatar">SL</div>
            <div class="v2-author-meta">
              <strong>Slimane &amp; Ella</strong>
              <span>Algiers ⇄ Jakarta • LDR Couple</span>
            </div>
          </div>
        </div>

        <!-- Review 2 -->
        <div class="v2-review-card">
          <div class="v2-review-card-header">
            <div class="v2-review-card-stars">★★★★★</div>
            <span class="v2-review-badge">Wedding Keepsake</span>
          </div>
          <p class="v2-review-quote">
            "We put a QR code on our wedding reception tables that led to our LoveSaas website. All our guests loved browsing our travel map and reading how our story started. Incredible quality!"
          </p>
          <div class="v2-review-author">
            <div class="v2-author-avatar">MR</div>
            <div class="v2-author-meta">
              <strong>Marcus &amp; Rachel</strong>
              <span>London, UK • Married June 2025</span>
            </div>
          </div>
        </div>

        <!-- Review 3 -->
        <div class="v2-review-card">
          <div class="v2-review-card-header">
            <div class="v2-review-card-stars">★★★★★</div>
            <span class="v2-review-badge">Valentine's Day</span>
          </div>
          <p class="v2-review-quote">
            "Best Valentine's gift I have ever made. The visual builder took me 5 minutes, and the scratch coupons are still being redeemed 6 months later! Worth 10x the price."
          </p>
          <div class="v2-review-author">
            <div class="v2-author-avatar">TK</div>
            <div class="v2-author-meta">
              <strong>Thomas &amp; Kim</strong>
              <span>Seattle, USA • Together 4 Years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 5: COMPREHENSIVE PRICING SUITE          -->
  <!-- ================================================================ -->
  <section class="v2-pricing-section" id="v2Pricing">
    <div class="v2-container">
      <div class="v2-section-eyebrow">SIMPLE ONE-TIME PRICING</div>
      <h2 class="v2-section-title">Pay Once. Own Your Keepsake Forever.</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        No monthly recurring charges. Lifetime hosting included with every plan.
      </p>

      <div class="v2-pricing-grid">
        <!-- Starter Plan -->
        <div class="v2-pricing-card">
          <span class="v2-pricing-tier-tag">ESSENTIAL</span>
          <h3 class="v2-pricing-plan-name">Story Starter</h3>
          <p class="v2-pricing-plan-desc">For couples who want a clean, romantic online keepsake with core chapters and photos.</p>
          <div class="v2-pricing-price-wrap">
            <span class="v2-price-currency">$</span>
            <span class="v2-price-val">19</span>
            <span class="v2-price-lifetime">one-time / lifetime</span>
          </div>
          <ul class="v2-pricing-features-list">
            <li><span class="v2-check">✓</span> <strong>Full Access to Visual Drag-and-Drop Builder</strong></li>
            <li><span class="v2-check">✓</span> 6 Core Story Modules (Hero, Timeline, Map, Polaroids, Letter)</li>
            <li><span class="v2-check">✓</span> Custom Couple Private URL &amp; Password Lock</li>
            <li><span class="v2-check">✓</span> 50 Photo Storage with Lightbox</li>
            <li><span class="v2-check">✓</span> Lifetime Keepsake Cloud Hosting (No Monthly Fees)</li>
            <li class="disabled"><span class="v2-cross">✕</span> Couple Mini-Games (Truth/Dare, Spinner, Scratch Coupons)</li>
            <li class="disabled"><span class="v2-cross">✕</span> Birthday Candle Blow-Out &amp; 3D Ribbon Gift</li>
            <li class="disabled"><span class="v2-cross">✕</span> Voice Note Audio Letter &amp; Background Soundtracks</li>
          </ul>
          <button type="button" class="v2-btn-secondary btn-open-checkout" data-plan="starter" style="width: 100%; margin-top: 24px;">
            Select Starter — $19
          </button>
        </div>

        <!-- VIP Suite Plan (Featured) -->
        <div class="v2-pricing-card featured">
          <div class="v2-pricing-popular-pill">🌸 50% OFF • FOREVER VIP KEEPSAKE</div>
          <span class="v2-pricing-tier-tag">LIFETIME SUITE</span>
          <h3 class="v2-pricing-plan-name">Forever VIP Keepsake</h3>
          <p class="v2-pricing-plan-desc">The complete luxury couple experience with all 16+ modules, audio player, and mini-games.</p>
          <div class="v2-pricing-price-wrap">
            <span class="v2-price-currency">$</span>
            <span class="v2-price-val">39</span>
            <span class="v2-price-strike"><del>$79</del></span>
            <span class="v2-price-lifetime">one-time / lifetime</span>
          </div>
          <ul class="v2-pricing-features-list">
            <li><span class="v2-check">✓</span> <strong>Instant VIP Builder Unlock (Instant Delivery)</strong></li>
            <li><span class="v2-check">✓</span> <strong>All 16+ Modular Widgets &amp; Mini-Games Included</strong></li>
            <li><span class="v2-check">✓</span> Couple Games (Truth/Dare, Date Spinner, Love Coupons, Love Quiz)</li>
            <li><span class="v2-check">✓</span> Occasions (Candle Blow-Out &amp; Wish, Life Stats, 3D Gift Box)</li>
            <li><span class="v2-check">✓</span> Wax-Sealed Audio Recording Player &amp; Voice Capsule</li>
            <li><span class="v2-check">✓</span> Romantic Background Music Player &amp; Audio Library</li>
            <li><span class="v2-check">✓</span> <strong>Unlimited High-Resolution Photos &amp; Audio Storage</strong></li>
            <li><span class="v2-check">✓</span> All Luxury Aesthetic Presets (Sunset, Starry Dusk, Tulip Bloom)</li>
            <li><span class="v2-check">✓</span> Custom Couple URL &amp; Private Secret Password Gate</li>
            <li><span class="v2-check">✓</span> Lifetime Keepsake Hosting &amp; Priority VIP Support</li>
          </ul>
          <button type="button" class="v2-btn-primary btn-open-checkout" data-plan="vip" style="width: 100%; margin-top: 24px;">
            <span>💖</span> Get Forever VIP Keepsake — $39
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 6: FAQ ACCORDION                        -->
  <!-- ================================================================ -->
  <section class="v2-faq-section" id="v2Faq">
    <div class="v2-container">
      <div class="v2-section-eyebrow">QUESTIONS &amp; ANSWERS</div>
      <h2 class="v2-section-title">Frequently Asked Questions</h2>
      <div class="v2-section-rule"></div>
      <p class="v2-section-desc">
        Everything you need to know about creating, preserving, and gifting your couple website.
      </p>

      <div class="v2-faq-list">
        <!-- Item 1 -->
        <div class="v2-faq-item open">
          <button type="button" class="v2-faq-question">
            <span>How do I access the Builder after getting a plan?</span>
            <span class="v2-faq-chevron">▾</span>
          </button>
          <div class="v2-faq-answer">
            Immediately after checkout, you get instant access to your private builder link. You can also sign in anytime with your email credentials to edit, add new milestones, or upload new memories whenever you wish.
          </div>
        </div>

        <!-- Item 2 -->
        <div class="v2-faq-item">
          <button type="button" class="v2-faq-question">
            <span>Do I need any coding or design experience?</span>
            <span class="v2-faq-chevron">▾</span>
          </button>
          <div class="v2-faq-answer">
            None at all! The builder is 100% visual with live side-by-side preview. Simply choose your preset, type your names, upload your photos, and click Save. It takes under 2 minutes.
          </div>
        </div>

        <!-- Item 3 -->
        <div class="v2-faq-item">
          <button type="button" class="v2-faq-question">
            <span>Can I keep our website private with a password?</span>
            <span class="v2-faq-chevron">▾</span>
          </button>
          <div class="v2-faq-answer">
            Yes! Every LoveSaas website includes an optional private password lock or secret anniversary passcode, ensuring only you and your partner can view your memories.
          </div>
        </div>

        <!-- Item 4 -->
        <div class="v2-faq-item">
          <button type="button" class="v2-faq-question">
            <span>Is it really a one-time payment with no subscriptions?</span>
            <span class="v2-faq-chevron">▾</span>
          </button>
          <div class="v2-faq-answer">
            Absolutely. We believe love stories should be preserved forever without worrying about monthly subscriptions. You pay once and your digital keepsake remains hosted for a lifetime.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================ -->
  <!-- EXPANDED CONTENT SECTION 7: LUXE DARK FOOTER                     -->
  <!-- ================================================================ -->
  <footer class="v2-footer">
    <div class="v2-container">
      <div class="v2-footer-top">
        <div class="v2-footer-brand-block">
          <div class="v2-nav-brand">
            <div class="v2-logo-icon">
              <svg viewBox="0 0 44 40" fill="none" stroke="#f5a39a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 7.5 C11.5 3.5 6 3.8 3.5 7 C0.8 10.5 1 16 4.5 20 L16 32 L20 28" />
                <path d="M29.5 7.5 C32.5 3.5 38 3.8 40.5 7 C43.2 10.5 43 16 39.5 20 L28 32 L16 20" />
                <path d="M14.5 7.5 C16.5 10 18.5 13 22 17 C25.5 13 27.5 10 29.5 7.5" />
              </svg>
            </div>
            <div class="v2-brand-text-wrap">
              <span class="v2-brand-name">LoveSaas</span>
              <span class="v2-brand-sub">PRESERVE WHAT MATTERS</span>
            </div>
          </div>
          <p class="v2-footer-mission">
            The world's most intimate couple keepsake platform. Handcrafted with love for anniversaries, long-distance relationships, and lifetime commitments.
          </p>
        </div>

        <div class="v2-footer-links-group">
          <h4>Explore</h4>
          <a href="#v2Templates">Templates</a>
          <a href="#v2Features">16+ Widgets</a>
          <a href="#v2HowItWorks">How It Works</a>
          <a href="#v2Demo">Live Demo</a>
        </div>

        <div class="v2-footer-links-group">
          <h4>Keepsake</h4>
          <a href="#v2Pricing">Pricing &amp; Plans</a>
          <a href="/builder">Visual Builder</a>
          <a href="#v2Reviews">Love Stories</a>
          <a href="#v2Faq">FAQ</a>
        </div>

        <div class="v2-footer-links-group">
          <h4>Security</h4>
          <span class="v2-security-badge">🔒 256-Bit SSL Encrypted</span>
          <span class="v2-security-badge">🛡️ 100% Private &amp; Secure</span>
          <span class="v2-security-badge">⚡ Lifetime Cloud Hosting</span>
        </div>
      </div>

      <div class="v2-footer-bottom">
        <p class="v2-footer-copyright">
          &copy; 2026 LoveSaas. All rights reserved. Crafted with love for couples worldwide ❤️
        </p>
        <div class="v2-footer-bottom-links">
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </div>
  </footer>

</div><!-- /#landingViewV2 -->'''

index_path = '/Users/dza/git-projects/ela/saas-platform/public/index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace existing #landingViewV2 block cleanly
pattern = r'<div id="landingViewV2".*?</div><!-- /#landingViewV2 -->'
if re.search(pattern, html, flags=re.DOTALL):
    html = re.sub(pattern, v2_html, html, flags=re.DOTALL)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Successfully updated #landingViewV2 in index.html with full rich sections!')
else:
    print('Warning: pattern not matched')
