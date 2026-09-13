// tests/birthday-widgets-gauntlet.test.js
// Loop Gauntlet Automated Verification Suite for 5 Birthday Reconciliation Widgets

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIDGET_IDS = [
  'forgiveness_meter',
  'truce_agreement',
  'reform_deck',
  'reparation_coupons',
  'comfort_soundboard'
];

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedChecks++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n=============================================');
console.log('🚀 BIRTHDAY WIDGETS LOOP GAUNTLET RUNNER');
console.log('=============================================\n');

// --- GATE 1: FILE EXISTENCE & SYNTAX AUDIT ---
console.log('--- GATE 1: File Existence & Syntax Audit ---');
for (const id of WIDGET_IDS) {
  const templatePath = path.join(ROOT_DIR, 'core/templates', `${id}.template.js`);
  const cssPath = path.join(ROOT_DIR, 'public/css/widgets', `${id}.css`);
  const runtimePath = path.join(ROOT_DIR, 'public/js/widgets', `${id.replace(/_/g, '-')}.runtime.js`);
  const inspectorPath = path.join(ROOT_DIR, 'builder/inspectors', `${id}.inspector.js`);

  assert(fs.existsSync(templatePath), `Template file exists: core/templates/${id}.template.js`);
  assert(fs.existsSync(cssPath), `CSS file exists: public/css/widgets/${id}.css`);
  assert(fs.existsSync(runtimePath), `Runtime file exists: public/js/widgets/${id.replace(/_/g, '-')}.runtime.js`);
  assert(fs.existsSync(inspectorPath), `Inspector file exists: builder/inspectors/${id}.inspector.js`);

  if (fs.existsSync(templatePath)) {
    try {
      new vm.Script(fs.readFileSync(templatePath, 'utf8'));
      assert(true, `Syntax valid: ${id}.template.js`);
    } catch (e) {
      assert(false, `Syntax error in ${id}.template.js: ${e.message}`);
    }
  }

  if (fs.existsSync(runtimePath)) {
    try {
      new vm.Script(fs.readFileSync(runtimePath, 'utf8'));
      assert(true, `Syntax valid: ${id.replace(/_/g, '-')}.runtime.js`);
    } catch (e) {
      assert(false, `Syntax error in ${id.replace(/_/g, '-')}.runtime.js: ${e.message}`);
    }
  }

  if (fs.existsSync(inspectorPath)) {
    try {
      new vm.Script(fs.readFileSync(inspectorPath, 'utf8'));
      assert(true, `Syntax valid: ${id}.inspector.js`);
    } catch (e) {
      assert(false, `Syntax error in ${id}.inspector.js: ${e.message}`);
    }
  }
}

// --- GATE 2: TEMPLATE RENDERING CONTRACT ---
console.log('\n--- GATE 2: Template Rendering Contract ---');
for (const id of WIDGET_IDS) {
  const templatePath = path.join(ROOT_DIR, 'core/templates', `${id}.template.js`);
  if (!fs.existsSync(templatePath)) continue;

  try {
    const sandbox = { module: {}, exports: {}, window: {}, global: {} };
    vm.createContext(sandbox);
    const code = fs.readFileSync(templatePath, 'utf8');
    vm.runInContext(code, sandbox);

    const renderer = sandbox.module.exports || sandbox.window.WIDGET_TEMPLATES?.[id];
    assert(typeof renderer === 'function', `Template exports render function for ${id}`);

    if (typeof renderer === 'function') {
      const mockData = {};
      const mockRoot = { partnerName: 'Ella', partner2: 'Ella', partner1: 'Aghiles' };
      const renderedHtml = renderer(mockData, mockRoot);
      assert(typeof renderedHtml === 'string' && renderedHtml.length > 50, `Rendered HTML non-empty for ${id} (length: ${renderedHtml ? renderedHtml.length : 0})`);
      assert(renderedHtml.includes('section') || renderedHtml.includes('class='), `Rendered HTML contains valid elements for ${id}`);
    }
  } catch (e) {
    assert(false, `Template evaluation failed for ${id}: ${e.message}`);
  }
}

// --- GATE 3: SCRIPT & CSS TAG INTEGRITY ---
console.log('\n--- GATE 3: Script & CSS Tag Integrity ---');
const viewerHtml = fs.readFileSync(path.join(ROOT_DIR, 'public/viewer.html'), 'utf8');
const builderHtml = fs.readFileSync(path.join(ROOT_DIR, 'builder/index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'public/css/style.css'), 'utf8');

for (const id of WIDGET_IDS) {
  const runtimeFilename = `${id.replace(/_/g, '-')}.runtime.js`;
  const templateFilename = `${id}.template.js`;
  const inspectorFilename = `${id}.inspector.js`;
  const cssFilename = `${id}.css`;

  assert(viewerHtml.includes(templateFilename), `viewer.html includes template ${templateFilename}`);
  assert(viewerHtml.includes(runtimeFilename), `viewer.html includes runtime ${runtimeFilename}`);
  assert(builderHtml.includes(templateFilename), `builder/index.html includes template ${templateFilename}`);
  assert(builderHtml.includes(inspectorFilename), `builder/index.html includes inspector ${inspectorFilename}`);
  assert(styleCss.includes(cssFilename), `style.css imports ${cssFilename}`);
}

// --- GATE 4: REGISTRY & RENDERER ENGINE HOOKS ---
console.log('\n--- GATE 4: Registry & Renderer Engine Hooks ---');
const registryCode = fs.readFileSync(path.join(ROOT_DIR, 'core/widget-registry.js'), 'utf8');
const rendererCode = fs.readFileSync(path.join(ROOT_DIR, 'core/dynamic-renderer.js'), 'utf8');
const widgetTemplatesCode = fs.readFileSync(path.join(ROOT_DIR, 'core/widget-templates.js'), 'utf8');

for (const id of WIDGET_IDS) {
  assert(registryCode.includes(`${id}:`), `widget-registry.js registers ${id}`);
  assert(rendererCode.includes(`${id}:`), `dynamic-renderer.js maps engine for ${id}`);
  assert(widgetTemplatesCode.includes(`${id}:`), `widget-templates.js exports ${id}`);
}

// --- GATE 5: BUILDER PREVIEWS & LABELS ---
console.log('\n--- GATE 5: Builder Previews & Labels ---');
const previewsCode = fs.readFileSync(path.join(ROOT_DIR, 'builder/widget-previews.js'), 'utf8');
const builderCode = fs.readFileSync(path.join(ROOT_DIR, 'builder/builder.js'), 'utf8');

for (const id of WIDGET_IDS) {
  assert(previewsCode.includes(`PREVIEWS.${id}`) || previewsCode.includes(`PREVIEWS["${id}"]`), `widget-previews.js has preview SVG for ${id}`);
  assert(builderCode.includes(`${id}:`), `builder.js maps label for ${id}`);
}

// --- GATE 6: DATABASE DEFAULTS & SCHEMA ---
console.log('\n--- GATE 6: Database Defaults & Schema ---');
const dbCode = fs.readFileSync(path.join(ROOT_DIR, 'server/db/index.js'), 'utf8');
for (const id of WIDGET_IDS) {
  assert(dbCode.includes(`${id}:`), `server/db/index.js contains default config for ${id}`);
}

// --- GATE 7: LANDING PAGE DIRECTORY & SHOWCASE ---
console.log('\n--- GATE 7: Landing Page Directory & Showcase ---');
const landingCode = fs.readFileSync(path.join(ROOT_DIR, 'public/js/landing.js'), 'utf8');
for (const id of WIDGET_IDS) {
  assert(landingCode.includes(`${id}:`), `landing.js showcases ${id}`);
}

console.log('\n=============================================');
console.log(`GAUNTLET SUMMARY: ${passedChecks}/${totalChecks} PASSED`);
console.log('=============================================\n');

if (passedChecks === totalChecks) {
  console.log('🎉 ALL GAUNTLET VERIFICATION GATES PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`⚠️ GAUNTLET FAILED (${totalChecks - passedChecks} checks failing)`);
  process.exit(1);
}
