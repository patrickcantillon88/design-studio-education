#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const fail = (message) => { console.error('smoke failed:', message); process.exit(1); };
const indexRaw = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlRaw = fs.readFileSync(path.join(root, 'tiny-world-builder.html'), 'utf8');
const devServer = fs.readFileSync(path.join(root, 'tools/dev-server.js'), 'utf8');

for (const needle of [
  'href="/tiny-world-builder"',
  'styles/landing.css',
  'assets/landing-hero.png',
  'Brief. Prototype. Critique. Iterate.',
]) {
  if (!indexRaw.includes(needle)) fail('landing missing ' + needle);
}
for (const needle of [
  'vendor/three/three.r128.min.js',
  'vendor/three/GLTFLoader.r128.js',
  'engine/world/19-tools-toolbar.js',
  'engine/world/20-input-place-erase.js',
  'engine/world/99-late-boot.js',
]) {
  if (!htmlRaw.includes(needle)) fail('builder missing ' + needle);
}
for (const forbidden of ['vendor/tinyworld-auth.js', '@netlify/identity', '$TINYWORLD', 'data-action="collaborate"', '38-multiplayer-partykit.js']) {
  if (htmlRaw.includes(forbidden) || indexRaw.includes(forbidden)) fail('legacy surface still present: ' + forbidden);
}
for (const asset of ['vendor/three/three.r128.min.js', 'vendor/three/GLTFLoader.r128.js', 'styles/tiny-world.css', 'assets/landing-hero.png']) {
  if (!fs.existsSync(path.join(root, asset))) fail('missing local asset ' + asset);
}
if (!devServer.includes("if (pathname === '/') return { file: path.resolve(root, 'index.html') };")) {
  fail('dev server bare root should serve index.html landing page');
}
if (!devServer.includes("pathname === '/tiny-world-builder'")) {
  fail('dev server should serve tiny-world-builder.html for normal access');
}
console.log('smoke ok');
