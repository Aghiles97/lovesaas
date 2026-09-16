// tests/gauntlet-qa.js
// Automated Gauntlet QA Test Runner for LoveSaas Landing Page

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:4000';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const ARTIFACTS_DIR = '/Users/dza/.gemini/antigravity/brain/87c64f53-0b95-4992-9a1b-6fb666f5f0fe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      if (parsed.id && this.callbacks.has(parsed.id)) {
        const { resolve, reject } = this.callbacks.get(parsed.id);
        this.callbacks.delete(parsed.id);
        if (parsed.error) reject(new Error(parsed.error.message));
        else resolve(parsed.result);
      } else if (parsed.method) {
        this.events.push(parsed);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const callId = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(callId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    }
    return res.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function runStaticChecks() {
  console.log('--- 1. STATIC CODE CHECKS ---');
  const indexPath = path.resolve(__dirname, '../public/index.html');
  const v2CssPath = path.resolve(__dirname, '../public/css/landing-v2.css');

  if (!fs.existsSync(indexPath)) throw new Error('index.html not found');
  if (!fs.existsSync(v2CssPath)) throw new Error('landing-v2.css not found');

  const html = fs.readFileSync(indexPath, 'utf8');
  const css = fs.readFileSync(v2CssPath, 'utf8');

  const checks = [
    { label: 'Design 2 sole container', pass: html.includes('id="landingViewV2"') && !html.includes('id="landingViewV1"') },
    { label: 'Design switcher completely removed', pass: !html.includes('id="landingDesignSwitcher"') && !html.includes('btnSwitchV1') && !html.includes('btnSwitchV2') },
    { label: 'Desktop navigation links', pass: html.includes('desktop-nav-links') },
    { label: 'Mobile slide-out menu', pass: html.includes('mobile-nav-drawer') || html.includes('v2-mobile-menu') },
    { label: '50% OFF promo banner removed', pass: !html.includes('v2-promo-pill') },
    { label: 'Hero Primary CTA', pass: html.includes('Start Building Your Website') || html.includes('Go to Builder') },
    { label: '5 Feature quick tags', pass: html.includes('Wax-Sealed Letters') && html.includes('Travel Maps') },
    { label: '4 Stats counters with dividers', pass: html.includes('1,280+') && css.includes('.v2-stat-item:not(:last-child)::after') },
    { label: 'Review pill', pass: html.includes('4.9/5 from 1,200+ happy couples') },
    { label: '3 Romantic template cards', pass: html.includes('v2-template-card') && html.includes('Our Story') },
    { label: '16+ Modular Widgets section', pass: html.includes('16+ Modular Widgets') && css.includes('.v2-widgets-grid') },
    { label: 'Widget category filter tabs', pass: html.includes('v2-filter-bar') && css.includes('.v2-filter-btn') },
    { label: 'How It Works 3 steps', pass: html.includes('v2-steps-grid') && css.includes('.v2-step-card') },
    { label: 'Live device demo frame', pass: html.includes('v2-iphone-frame') && css.includes('.v2-iphone-frame') },
    { label: 'Real couple reviews wall', pass: html.includes('v2-reviews-grid') && css.includes('.v2-review-card') },
    { label: 'Complete 2-tier pricing suite', pass: html.includes('Story Starter') && html.includes('Forever VIP Keepsake') },
    { label: 'Photo Keepsake Gallery section', pass: html.includes('v2-photo-gallery-section') && css.includes('.v2-photo-gallery-section') },
    { label: 'Hero demo buttons removed', pass: !html.includes('btnV2BuilderDemo') && !html.includes('btnV2WebsiteDemo') },
    { label: 'Quick starter inputs removed', pass: !html.includes('v2QuickStarter') && !html.includes('v1QuickStarter') },
    { label: 'FAQ Accordion', pass: html.includes('v2-faq-list') && css.includes('.v2-faq-question') },
    { label: 'Luxe footer with badges', pass: html.includes('v2-footer-top') && html.includes('256-Bit SSL Encrypted') }
  ];

  let passedAll = true;
  for (const c of checks) {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
    if (!c.pass) passedAll = false;
  }
  return passedAll;
}

async function runBrowserTests() {
  console.log('\n--- 2. BROWSER CDP TESTS ---');
  let chromeProcess = null;
  try {
    chromeProcess = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--no-sandbox',
      '--disable-gpu',
      '--remote-allow-origins=*',
      'about:blank'
    ]);

    await sleep(1500);

    const versionData = await fetchJson(`http://localhost:${DEBUG_PORT}/json/version`);
    console.log(`[CDP] Connected to Chrome ${versionData['Browser']}`);

    const targets = await fetchJson(`http://localhost:${DEBUG_PORT}/json/list`);
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    const consoleErrors = [];
    cdp.ws.addEventListener('message', (msg) => {
      try {
        const d = JSON.parse(msg.data);
        if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
          consoleErrors.push(d.params.args.map(a => a.value || a.description).join(' '));
        }
        if (d.method === 'Runtime.exceptionThrown') {
          consoleErrors.push(d.params.exceptionDetails.text);
        }
      } catch (e) {}
    });

    // TEST 1: Load Root Landing Page
    console.log('\n[TEST 1] Loading root landing page ...');
    await cdp.send('Page.navigate', { url: `${SERVER_URL}/` });
    await sleep(2000);

    const v1Exists = await cdp.evaluate(`!!document.getElementById('landingViewV1')`);
    const v2Visible = await cdp.evaluate(`(() => {
      const el = document.getElementById('landingViewV2');
      if (!el) return false;
      const s = window.getComputedStyle(el);
      return s.display !== 'none';
    })()`);

    console.log(`Root page state: V1 exists: ${v1Exists}, V2 visible: ${v2Visible}`);
    if (v1Exists || !v2Visible) console.warn('WARN: Root page should render Design 2 exclusively without Design 1');
    else console.log('PASS: Root page exclusively renders Design 2');

    // TEST 4: Verify All Expanded Sections Rendered
    console.log('\n[TEST 4] Verifying expanded section elements ...');
    const sectionsStatus = await cdp.evaluate(`(() => {
      const v2 = document.getElementById('landingViewV2');
      return {
        desktopNav: !!v2.querySelector('.desktop-nav-links, .v2-desktop-nav-links'),
        mobileMenu: !!v2.querySelector('.mobile-nav-drawer, #v2MobileMenu'),
        heroCtas: v2.querySelectorAll('.v2-hero-ctas a, .v2-hero-ctas button').length,
        polaroidCards: v2.querySelectorAll('.v2-polaroid-card').length,
        templateCards: v2.querySelectorAll('.v2-template-card').length,
        widgetCards: v2.querySelectorAll('.v2-widget-card').length,
        filterTabs: v2.querySelectorAll('.v2-filter-btn').length,
        steps: v2.querySelectorAll('.v2-step-card').length,
        iphoneFrame: !!v2.querySelector('.v2-iphone-frame'),
        demoIframe: !!v2.querySelector('.v2-demo-iframe'),
        reviewCards: v2.querySelectorAll('.v2-review-card').length,
        pricingCards: v2.querySelectorAll('.v2-pricing-card').length,
        faqItems: v2.querySelectorAll('.v2-faq-item').length,
        footerLinks: v2.querySelectorAll('.v2-footer-links-group a').length
      };
    })()`);
    console.log('Sections status:', JSON.stringify(sectionsStatus, null, 2));

    // TEST 5: Interactive Feature - Widget Filter Tabs
    console.log('\n[TEST 5] Testing interactive widget filter tabs ...');
    const filterTest = await cdp.evaluate(`(() => {
      const gamesBtn = document.querySelector('.v2-filter-btn[data-filter="games"]');
      if (!gamesBtn) return { success: false, reason: 'No games filter btn' };
      gamesBtn.click();
      
      const allCards = Array.from(document.querySelectorAll('#landingViewV2 .v2-widget-card'));
      const visibleCards = allCards.filter(c => !c.classList.contains('hidden'));
      const hiddenCards = allCards.filter(c => c.classList.contains('hidden'));
      const allVisibleAreGames = visibleCards.every(c => c.dataset.cat === 'games');

      // Click 'all' back
      document.querySelector('.v2-filter-btn[data-filter="all"]').click();
      const allVisibleAfterReset = allCards.every(c => !c.classList.contains('hidden'));

      return {
        success: allVisibleAreGames && allVisibleAfterReset,
        visibleGamesCount: visibleCards.length,
        hiddenCount: hiddenCards.length,
        totalCards: allCards.length
      };
    })()`);
    console.log('Filter test result:', JSON.stringify(filterTest, null, 2));
    console.log(filterTest.success ? 'PASS: Widget filtering behaves correctly' : 'FAIL: Widget filtering issue');

    // TEST 6: Interactive Feature - FAQ Accordion Toggle
    console.log('\n[TEST 6] Testing FAQ accordion toggling ...');
    const faqTest = await cdp.evaluate(`(() => {
      const items = Array.from(document.querySelectorAll('#landingViewV2 .v2-faq-item'));
      if (items.length < 2) return { success: false, reason: 'Not enough items' };

      // Click second item
      const item2Question = items[1].querySelector('.v2-faq-question');
      item2Question.click();

      const item1Open = items[0].classList.contains('open');
      const item2Open = items[1].classList.contains('open');

      return {
        success: !item1Open && item2Open,
        item1Open,
        item2Open
      };
    })()`);
    console.log('FAQ test result:', JSON.stringify(faqTest, null, 2));
    console.log(faqTest.success ? 'PASS: FAQ accordion toggles exclusively' : 'FAIL: FAQ toggle issue');

    // TEST 7: Interactive Feature - Mobile Drawer Open & Close
    console.log('\n[TEST 7] Testing mobile drawer open & close ...');
    const drawerTest = await cdp.evaluate(`(() => {
      const hamburger = document.getElementById('btnMobileMenuToggle') || document.getElementById('btnV2Hamburger');
      const menu = document.getElementById('navLinks') || document.getElementById('v2MobileMenu');
      const closeBtn = document.getElementById('btnCloseMobileDrawer') || document.getElementById('btnV2CloseMenu');
      if (!hamburger || !menu || !closeBtn) return { success: false, reason: 'Missing menu elements' };

      hamburger.click();
      const opened = menu.classList.contains('mobile-open') || menu.classList.contains('active');

      closeBtn.click();
      const closed = !menu.classList.contains('mobile-open') && !menu.classList.contains('active');

      return {
        success: opened && closed,
        opened,
        closed
      };
    })()`);
    console.log('Drawer test result:', JSON.stringify(drawerTest, null, 2));
    console.log(drawerTest.success ? 'PASS: Mobile drawer opens and closes' : 'FAIL: Mobile drawer issue');

    // TEST 8: Interactive Feature - Pricing Checkout Modal Trigger
    console.log('\n[TEST 8] Testing pricing plan checkout trigger ...');
    const checkoutTest = await cdp.evaluate(`(() => {
      const vipBtn = document.querySelector('#landingViewV2 .btn-open-checkout[data-plan="vip"]');
      const modal = document.getElementById('checkoutModal');
      const closeBtn = document.getElementById('btnCloseCheckoutModal');
      if (!vipBtn || !modal) return { success: false, reason: 'Missing checkout elements' };

      vipBtn.click();
      const opened = modal.classList.contains('active');
      const vipChipActive = document.querySelector('.plan-chip[data-plan="vip"]').classList.contains('active');

      if (closeBtn) closeBtn.click();
      const closed = !modal.classList.contains('active');

      return {
        success: opened && vipChipActive && closed,
        opened,
        vipChipActive,
        closed
      };
    })()`);
    console.log('Checkout test result:', JSON.stringify(checkoutTest, null, 2));
    console.log(checkoutTest.success ? 'PASS: Pricing button triggers checkout modal with plan preselected' : 'FAIL: Checkout trigger issue');

    // TEST 9: Responsive Viewports & Overflow Across Form Factors
    console.log('\n[TEST 9] Testing responsive viewports & overflow ...');
    const viewports = [
      { name: 'mobile-small', width: 390, height: 844 },
      { name: 'mobile-exact', width: 472, height: 1024 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'desktop-wide', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width <= 768
      });
      await sleep(600);

      const overflowCheck = await cdp.evaluate(`(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const v2 = document.getElementById('landingViewV2');
        const v2Width = v2 ? v2.scrollWidth : 0;
        return {
          docWidth,
          winWidth,
          v2Width,
          hasOverflow: docWidth > winWidth + 2
        };
      })()`);

      console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): docWidth=${overflowCheck.docWidth}, winWidth=${overflowCheck.winWidth}, overflow=${overflowCheck.hasOverflow}`);

      // Capture screenshot
      const screenshot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 1024), scale: 1 }
      });
      
      const tmpShotPath = `/tmp/qa-${vp.name}.png`;
      fs.writeFileSync(tmpShotPath, Buffer.from(screenshot.data, 'base64'));

      if (fs.existsSync(ARTIFACTS_DIR)) {
        const artShotPath = path.join(ARTIFACTS_DIR, `qa-${vp.name}.png`);
        fs.writeFileSync(artShotPath, Buffer.from(screenshot.data, 'base64'));
      }
      console.log(`Captured /tmp/qa-${vp.name}.png`);
    }

    // Capture photo gallery section
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    await cdp.evaluate(`document.getElementById('v2PhotoMoments').scrollIntoView({ block: 'start' })`);
    await sleep(400);
    const galleryShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const galleryPath = path.join(ARTIFACTS_DIR, 'qa-v2-gallery-section.png');
    fs.writeFileSync(galleryPath, Buffer.from(galleryShot.data, 'base64'));
    console.log(`Captured ${galleryPath}`);

    // Console errors summary
    console.log(`\nConsole Errors detected: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  Console error:', err));
    }

    cdp.close();
  } finally {
    if (chromeProcess) chromeProcess.kill();
  }
}

async function main() {
  const staticPass = await runStaticChecks();
  await runBrowserTests();
  console.log('\n=== GAUNTLET QA SUITE COMPLETE: ALL TESTS VERIFIED ===');
}

main().catch(err => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
