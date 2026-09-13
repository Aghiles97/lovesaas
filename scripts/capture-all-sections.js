const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/dza/.gemini/antigravity/brain/87c64f53-0b95-4992-9a1b-6fb666f5f0fe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
    this.ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      if (parsed.id && this.callbacks.has(parsed.id)) {
        const { resolve, reject } = this.callbacks.get(parsed.id);
        this.callbacks.delete(parsed.id);
        if (parsed.error) reject(new Error(parsed.error.message));
        else resolve(parsed.result);
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
    return res.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--no-sandbox',
    '--disable-gpu',
    'about:blank'
  ]);
  await sleep(1500);

  const targets = await new Promise((res, rej) => {
    http.get('http://localhost:9227/json/list', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const cdp = new CDPClient(targets[0].webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: 'http://localhost:4000/?design=v2' });
  await sleep(2000);

  const sections = [
    { id: 'v2Templates', name: 'templates' },
    { id: 'v2Features', name: 'widgets-grid' },
    { id: 'v2HowItWorks', name: 'how-it-works' },
    { id: 'v2Demo', name: 'device-demo' },
    { id: 'v2Reviews', name: 'reviews' },
    { id: 'v2Pricing', name: 'pricing' },
    { id: 'v2Faq', name: 'faq' }
  ];

  // Desktop captures (1280x800)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await sleep(500);

  for (const s of sections) {
    await cdp.evaluate(`document.getElementById("${s.id}").scrollIntoView({ block: "start" })`);
    await sleep(400);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(ARTIFACTS_DIR, `desktop-sec-${s.name}.png`);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved desktop-sec-${s.name}.png`);
  }

  // Mobile captures (472x960)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 472,
    height: 960,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(500);

  for (const s of sections) {
    await cdp.evaluate(`document.getElementById("${s.id}").scrollIntoView({ block: "start" })`);
    await sleep(400);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(ARTIFACTS_DIR, `mobile-sec-${s.name}.png`);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved mobile-sec-${s.name}.png`);
  }

  cdp.close();
  chrome.kill();
  console.log('ALL SECTION SCREENSHOTS READY');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
