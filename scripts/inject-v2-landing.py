import os
import re

index_path = '/Users/dza/git-projects/ela/saas-platform/public/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Ensure landing-v2.css is linked
if 'landing-v2.css' not in html:
    html = html.replace(
        '<link rel="stylesheet" href="/css/landing.css?v=2.7.2">',
        '<link rel="stylesheet" href="/css/landing.css?v=2.7.2">\n  <link rel="stylesheet" href="/css/landing-v2.css?v=2.0.0">'
    )

# 2. Wrap Design 1 if not already wrapped
if '<div id="landingViewV1"' not in html:
    target_start = '<!-- Romantic Announcement Top Banner -->'
    html = html.replace(target_start, '<div id="landingViewV1" class="landing-version-view">\n  ' + target_start)
    
    target_end = '</footer>'
    idx = html.find(target_end)
    if idx != -1:
        html = html[:idx + len(target_end)] + '\n</div><!-- /#landingViewV1 -->' + html[idx + len(target_end):]

# 3. Construct Design 2 HTML
v2_html = '''
<!-- ========================================================================== -->
<!-- LANDING PAGE DESIGN 2: LUXE DARK / CINEMATIC EDITION (User Screenshot 1:1) -->
<!-- ========================================================================== -->
<div id="landingViewV2" class="landing-version-view v2-theme hidden">

  <!-- Header -->
  <header class="v2-header">
    <div class="v2-container">
      <nav class="v2-nav">
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

        <div class="v2-nav-actions">
          <a href="/builder" class="v2-btn-builder" id="btnV2HeaderBuilder">
            <span class="v2-builder-dot"></span>
            <span>Builder</span>
            <span class="v2-builder-arrow">›</span>
          </a>
          <button type="button" class="v2-user-avatar" id="btnV2Avatar" title="Account Menu">
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

  <!-- Promo Pill Banner -->
  <div class="v2-container">
    <div class="v2-promo-pill-wrap">
      <a href="#pricing" class="v2-promo-pill">
        <span class="v2-promo-icon">🌸</span>
        <span class="v2-promo-text">50% OFF: Private Couple Keepsake &amp; Visual Builder</span>
        <span class="v2-promo-arrow">→</span>
      </a>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="v2-hero">
    <div class="v2-container">
      <div class="v2-hero-layout">
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

        <div class="v2-hero-visual">
          <div class="v2-hero-script-note">
            A more beautiful<br>way to remember<br>us ♡
          </div>
          <div class="v2-hero-art-box">
            <img class="v2-hero-art-img" src="/images/landing-v2/hero-couple-clean-art.png" alt="Couple by city sunset" loading="eager">
          </div>
          <div class="v2-hero-tagline">
            <span>SAME LOVE</span>
            <span>A BRIGHTER TOMORROW</span>
          </div>
          <div class="v2-tagline-line"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- 5 Feature Squircles Row -->
  <section class="v2-features-section">
    <div class="v2-container">
      <div class="v2-features-row">
        <!-- 1. Photos & Videos -->
        <div class="v2-feature-item">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.8" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <span class="v2-feature-label">Photos &amp; Videos</span>
        </div>

        <!-- 2. Wax-Sealed Letters -->
        <div class="v2-feature-item">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path d="M3 7l9 6 9-6" />
              <circle cx="12" cy="14" r="2" fill="currentColor" />
            </svg>
          </div>
          <span class="v2-feature-label">Wax-Sealed Letters</span>
        </div>

        <!-- 3. Travel Maps -->
        <div class="v2-feature-item">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </div>
          <span class="v2-feature-label">Travel Maps</span>
        </div>

        <!-- 4. Countdowns -->
        <div class="v2-feature-item">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="3.5" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <circle cx="12" cy="15" r="2" />
            </svg>
          </div>
          <span class="v2-feature-label">Countdowns</span>
        </div>

        <!-- 5. And More -->
        <div class="v2-feature-item">
          <div class="v2-feature-squircle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span class="v2-feature-label">And More</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 Stats Row -->
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

  <!-- Review Pill Banner -->
  <div class="v2-container">
    <a href="#reviews" class="v2-review-pill">
      <div class="v2-review-avatars">
        <img src="/images/landing-v2/couple-avatars-clean.png" alt="Happy Couples" width="68" height="30">
      </div>
      <div class="v2-stars">★★★★★</div>
      <span class="v2-review-text">4.9/5 from 1,200+ happy couples</span>
      <span class="v2-review-arrow">›</span>
    </a>
  </div>

  <!-- Templates Showcase Section -->
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
              <a href="/builder?preset=theme3" class="v2-btn-preview-template">Customize This Style →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Demo Showcase in V2 Theme -->
  <section class="v2-demo-section" id="v2Demo">
    <div class="v2-container">
      <div class="v2-demo-card">
        <div class="v2-demo-header">
          <div>
            <span class="v2-section-eyebrow">LIVE INTERACTIVE PREVIEW</span>
            <h3 class="v2-demo-title">Experience a Real Love Website</h3>
            <p class="v2-demo-desc">Tap below to test-drive photos, wax letters, travel pins, and music.</p>
          </div>
          <div class="v2-demo-actions">
            <a href="/sites/demo" target="_blank" class="v2-btn-primary" style="width: auto; padding: 10px 22px; font-size: 14px;">
              <span>🌐</span> Open Full Demo ↗
            </a>
            <a href="/builder" class="v2-btn-secondary" style="width: auto; padding: 10px 22px; font-size: 14px;">
              <span>🚀</span> Start Building
            </a>
          </div>
        </div>
        <div class="v2-demo-preview-frame">
          <iframe src="/sites/demo" title="LoveSaas Live Site Demo" loading="lazy" class="v2-demo-iframe"></iframe>
        </div>
      </div>
    </div>
  </section>

  <!-- V2 Pricing Quick Bar -->
  <section class="v2-pricing-section" id="v2Pricing">
    <div class="v2-container">
      <div class="v2-pricing-card">
        <div class="v2-pricing-badge">🌸 LIMITED OFFER • 50% OFF</div>
        <h3 class="v2-pricing-title">Forever Love Keepsake Suite</h3>
        <p class="v2-pricing-sub">One-time payment • No monthly subscriptions • Lifetime keepsake hosting</p>
        <div class="v2-pricing-amount">
          <span class="v2-price-currency">$</span><span class="v2-price-val">39</span>
          <span class="v2-price-was"><del>$79</del> (Save $40)</span>
        </div>
        <ul class="v2-pricing-perks">
          <li>✓ All 16+ Modular Widgets &amp; Interactive Mini-Games</li>
          <li>✓ High-Quality Cloud Storage &amp; Background Music</li>
          <li>✓ Mobile &amp; Desktop Touch-Friendly Responsive Experience</li>
          <li>✓ Instant Unlock with Visual Drag-and-Drop Builder</li>
        </ul>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 24px;">
          <button type="button" class="v2-btn-primary btn-open-checkout" data-plan="vip" style="max-width: 320px;">
            <span>💖</span> Get Forever VIP Keepsake ($39)
          </button>
          <a href="/builder" class="v2-btn-secondary" style="max-width: 220px;">
            <span>🛠️</span> Try Visual Builder Free
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- V2 Minimalist Luxury Footer -->
  <footer class="v2-footer">
    <div class="v2-container">
      <div class="v2-footer-content">
        <div class="v2-footer-brand">
          <span class="v2-brand-name">LoveSaas</span>
          <span class="v2-brand-sub">PRESERVE WHAT MATTERS</span>
        </div>
        <p class="v2-footer-copy">
          &copy; 2026 LoveSaas. Crafted with love for couples worldwide ❤️
        </p>
        <div class="v2-footer-links">
          <a href="/welcome">Home</a>
          <a href="#v2Templates">Templates</a>
          <a href="#v2Demo">Demo</a>
          <a href="#v2Pricing">Pricing</a>
          <a href="/builder">Builder</a>
        </div>
      </div>
    </div>
  </footer>

</div><!-- /#landingViewV2 -->
'''

# Check if #landingViewV2 already exists, if so replace it, else append after #landingViewV1
if '<div id="landingViewV2"' in html:
    html = re.sub(r'<div id="landingViewV2".*?</div><!-- /#landingViewV2 -->', v2_html.strip(), html, flags=re.DOTALL)
else:
    v1_end = '</div><!-- /#landingViewV1 -->'
    html = html.replace(v1_end, v1_end + '\n' + v2_html)

# 4. Insert Switcher & Switcher Script if not present
switcher_html = '''
  <!-- Floating 2-Button Design Switcher -->
  <div id="landingDesignSwitcher" aria-label="Landing Page Design Switcher">
    <button type="button" class="switcher-btn active" id="btnSwitchV1" data-version="v1" title="Switch to Design 1 (Classic)">
      <span>✨</span> Design 1
    </button>
    <button type="button" class="switcher-btn" id="btnSwitchV2" data-version="v2" title="Switch to Design 2 (New Luxury)">
      <span>💎</span> Design 2 (New)
    </button>
  </div>

  <script>
    // Dual-Landing Page Version Switcher Engine
    (function() {
      const btnV1 = document.getElementById('btnSwitchV1');
      const btnV2 = document.getElementById('btnSwitchV2');
      const viewV1 = document.getElementById('landingViewV1');
      const viewV2 = document.getElementById('landingViewV2');

      function applyLandingVersion(ver, syncUrl = true) {
        const isV2 = (ver === 'v2');
        if (viewV1) viewV1.classList.toggle('hidden', isV2);
        if (viewV2) viewV2.classList.toggle('hidden', !isV2);
        if (btnV1) btnV1.classList.toggle('active', !isV2);
        if (btnV2) btnV2.classList.toggle('active', isV2);
        document.body.classList.toggle('v2-active', isV2);

        try {
          localStorage.setItem('lovesaas_landing_version', isV2 ? 'v2' : 'v1');
        } catch (err) {}

        if (syncUrl) {
          const url = new URL(window.location.href);
          url.searchParams.set('design', isV2 ? 'v2' : 'v1');
          window.history.replaceState(null, '', url.toString());
        }
      }

      if (btnV1) btnV1.addEventListener('click', () => applyLandingVersion('v1'));
      if (btnV2) btnV2.addEventListener('click', () => applyLandingVersion('v2'));

      // Check URL search parameter or localStorage on initial load
      const urlParams = new URLSearchParams(window.location.search);
      const urlDesign = urlParams.get('design');
      let savedDesign = null;
      try {
        savedDesign = localStorage.getItem('lovesaas_landing_version');
      } catch (e) {}

      if (urlDesign === 'v2' || (!urlDesign && savedDesign === 'v2')) {
        applyLandingVersion('v2', false);
      } else {
        applyLandingVersion('v1', false);
      }

      // Delegate V2 Demo Buttons
      const v2BuilderDemo = document.getElementById('btnV2BuilderDemo');
      if (v2BuilderDemo) {
        v2BuilderDemo.addEventListener('click', () => {
          window.location.href = '/builder?demo=1';
        });
      }

      const v2WebsiteDemo = document.getElementById('btnV2WebsiteDemo');
      if (v2WebsiteDemo) {
        v2WebsiteDemo.addEventListener('click', () => {
          const demoSec = document.getElementById('v2Demo');
          if (demoSec) {
            demoSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = '/sites/demo';
          }
        });
      }

      const v2Avatar = document.getElementById('btnV2Avatar');
      if (v2Avatar) {
        v2Avatar.addEventListener('click', () => {
          const signInModal = document.getElementById('signInModal');
          if (signInModal) signInModal.classList.add('active');
        });
      }

      const v2Hamburger = document.getElementById('btnV2Hamburger');
      if (v2Hamburger) {
        v2Hamburger.addEventListener('click', () => {
          const tmpl = document.getElementById('v2Templates');
          if (tmpl) tmpl.scrollIntoView({ behavior: 'smooth' });
        });
      }
    })();
  </script>
'''

if 'id="landingDesignSwitcher"' not in html:
    html = html.replace('</body>', switcher_html + '\n</body>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Successfully injected Design 2 and Switcher into public/index.html!')
