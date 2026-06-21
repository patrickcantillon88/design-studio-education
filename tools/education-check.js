#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error('education check failed:', message); process.exit(1); };
const mustInclude = (text, needle, label) => { if (!text.includes(needle)) fail(`missing ${label || needle}`); };
const mustNotInclude = (text, needle, label) => { if (text.includes(needle)) fail(`unexpected ${label || needle}`); };

const index = read('index.html');
const builder = read('tiny-world-builder.html');
const pkg = JSON.parse(read('package.json'));
const vercel = read('vercel.json');
const publish = read('publish.sh');

const landingCss = read('styles/landing.css');
const studioCss = read('styles/tiny-world.css');
for (const cssNeedle of ['Pixelify Sans', 'Press Start 2P', 'Bitcount Single']) {
  mustNotInclude(landingCss, cssNeedle, `landing readable font guard: ${cssNeedle}`);
  mustNotInclude(studioCss, cssNeedle, `studio readable font guard: ${cssNeedle}`);
}

if (pkg.name !== 'design-studio-education') fail('package name should identify the education fork');
for (const dep of ['@netlify/identity', '@netlify/database', 'netlify-cli', 'partykit', '@anthropic-ai/sdk', '@open-pets/client']) {
  if (JSON.stringify(pkg).includes(dep)) fail(`package should not depend on ${dep}`);
}

for (const needle of ['Design Studio', 'Design first.', 'Build with intent.', 'Brief. Prototype. Critique. Iterate.', 'No accounts. No tokens. No leaderboard. No multiplayer noise.']) {
  mustInclude(index, needle, `landing education copy: ${needle}`);
}
for (const needle of ['tinyworld-auth.js', '@netlify/identity', 'landing-auth-chip.js', 'landing-feed.js', 'github-stars.js', 'Star on GitHub', 'Tinyverse', 'Battle Worlds', 'Sign in with your wallet', '$TINYWORLD']) {
  mustNotInclude(index, needle, `landing legacy/auth/gimmick surface: ${needle}`);
}

for (const needle of ['<title>Design Studio</title>', '>Design Studio</span>', 'Game/community modules intentionally not loaded', 'Copy local share URL']) {
  mustInclude(builder, needle, `builder education surface: ${needle}`);
}
mustInclude(read('engine/world/30-ui-boot-wiring.js'), "chooseWelcomeMode('build');", 'direct-to-studio welcome bypass');
for (const needle of ['tinyworld-auth.js', '@netlify/identity', 'gotrue-js', '$TINYWORLD', 'Autoincentive', 'Game mode', 'WAVE', 'welcome-logo', 'scripts/countdown.js', 'data-action="collaborate"', 'data-action="manage"', '38-multiplayer-partykit.js', '40-shield-system.js', '41-flight-combat.js', '42-account-wallet-players.js', '46-worlds-universe.js', '47-worlds-room.js', '48-worlds-harvest-hud.js', '50-worlds-play-chat.js', '64-lobby-chat-bridge.js']) {
  mustNotInclude(builder, needle, `builder legacy/auth/game surface: ${needle}`);
}

for (const needle of ['vendor/three/three.r128.min.js', 'vendor/three/GLTFLoader.r128.js', 'engine/world/19-tools-toolbar.js', 'engine/world/20-input-place-erase.js', 'engine/world/29-persistence-api.js', 'engine/world/30-ui-boot-wiring.js']) {
  mustInclude(builder, needle, `core editor script: ${needle}`);
}
for (const asset of ['vendor/three/three.r128.min.js', 'vendor/three/GLTFLoader.r128.js', 'styles/tiny-world.css', 'assets/landing-hero.png']) {
  if (!fs.existsSync(path.join(root, asset))) fail(`missing runtime asset ${asset}`);
}

if (!vercel.includes('"buildCommand": "./publish.sh"') || !vercel.includes('"outputDirectory": "dist"')) fail('vercel.json must deploy publish.sh dist output');
for (const legacyPage of ['community.html', 'admin-users.html', 'worlds.html', 'harvest.html', 'features.html']) {
  mustNotInclude(publish, `cp ${legacyPage}`, `legacy publish page ${legacyPage}`);
}

// Syntax-check edited project JS that still runs in the browser or build path.
const jsFiles = [
  'tools/dev-server.js',
  'tools/smoke-static.js',
  'tools/education-check.js',
  'LandscapeEngine.js',
  ...fs.readdirSync(path.join(root, 'engine/world')).filter((f) => f.endsWith('.js')).map((f) => `engine/world/${f}`),
  ...fs.readdirSync(path.join(root, 'engine/i18n')).filter((f) => f.endsWith('.js')).map((f) => `engine/i18n/${f}`),
];
for (const file of jsFiles) {
  const res = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (res.status !== 0) fail(`syntax check failed for ${file}\n${res.stderr || res.stdout}`);
}

console.log('education check ok');
