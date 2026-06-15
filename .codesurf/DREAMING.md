# CodeSurf Workspace Memory — tinyworld

Generated: 2026-06-15

---

## Overview

Tiny World Builder is a vanilla ES6, no-bundler 3D world editor on Three.js r128. Shell lives in `tiny-world-builder.html` (~1.4k lines); logic is split across approximately **64 modules** under `engine/world/` (numbered 00–60 + 99, with `09b` and two `46-` files). Styles in `styles/tiny-world.css` (~5.2k lines). Deployed via Vercel and Netlify from `dist/` via `./publish.sh`. Port 8888 is the Netlify dev server; must be running with local `tinyworld` Postgres before any Worlds MMO features can be browser-tested.

A separate **landing/marketing page** (`index.html`) is also in the repo with its own build/publish pipeline — distinct from `tiny-world-builder.html`.

---

## Durable Facts

**Architecture**
- Shell: `tiny-world-builder.html` — HTML, boot config, ordered `<script src>` tags only
- Engine modules: ~64 `.js` files sharing one global scope + `flight-combat-math.mjs` (ES module companion to `34-flight-sim.js`); classic scripts, not ES modules
- Non-sequential extras: `09b-voxel-build-factories.js` (between 09 and 10); two files share the `46-` prefix (`46-mesh-terrain.js`, `46-worlds-universe.js`) — load order between them not formally documented
- Skybound additions (modules 53–60) added after the core 00–52 inventory; `99-late-boot.js` is the final late-init module
- Duplicate top-level identifiers silently kill the declaring module without affecting others; prefix module-local scratch globals (e.g. `_fl…` for flight, `_sr…` for surface-roam, `_sf…` for skyfall)
- Three.js pinned to r128; MeshLambertMaterial, ExtrudeGeometry, and shadow setup assume r128 semantics — do not bump
- Materials in `M.*` are shared across meshes — clone before mutating color; `disposeGroup` disposes geometries but NOT materials
- `setCell(x, z, opts)` is the only sanctioned way to mutate world state; never write `world[x][z]` directly outside of init
- No bundler, no npm runtime dependencies; `npm test` for static checks, `./publish.sh` for dist
- Edits auto-commit to main and Netlify prod deploys immediately — branches do not guarantee isolation

**Skill directories**
- `.codex/skills/` — 24 skill files for core engine systems (tinyworld-single-file, tinyworld-render-performance, tinyworld-flight-sim, tinyworld-tinyverse-race-track, tinyworld-surface-roam, etc.)
- `.agents/skills/` — 5 additional skills: `3d-modeling`, `lightweight-3d-effects`, `poly-pizza-api`, `threejs-primitive-reconstructor`, `tinyworld-i18n`
- AGENTS.md lists only `.codex/skills/` routing; `.agents/skills/` entries are not yet referenced there

**Module reference — 34–52**
- `34-flight-sim.js` — flyable plane via `stunt-plane` model-stamp; click-to-Enter/Fly, rear chase-cam, Escape exits; `flight-combat-math.mjs` is its ES module companion; static body parts merged into single BufferGeometry via `threeStdlib.mergeGeometries`; only engine node keeps `frustumCulled=false`
- `38-multiplayer-partykit.js` — multiplayer via PartyKit
- `39-atmosphere-effects.js` — atmosphere/day-night effects; time-progression not wired to any UI control
- `40-shield-system.js` — VoxelShield materials are Lambert; per-mesh glow material clones are explicitly disposed on teardown
- `41-flight-combat.js` — missiles/projectiles fully implemented; **player hit detection stub removed 2026-06-12** (empty `if (hit) {}` block deleted); **altitude ceiling enforcement removed 2026-06-12** (`altitudeCeilingHeight` block deleted from `updateFlight`); health/damage not implemented; fog/atmosphere provides visual altitude boundary only
- `42-account-wallet-players.js` — JWT/cloud-save; **subscription system fully removed 2026-05-31**; no replacement monetisation wired
- `43-drag-drop-import.js` — GLB/FBX/OBJ/VOX/VDB drag-drop pipeline
- `44-sub-object-edit.js` — part-level selection, hover hulls, transform delegation
- `45-shader-fx.js` — `window.TinyShaderFX`; GLSL effects via `onBeforeCompile`
- `46-mesh-terrain.js` — opt-in voxel-block landscape sculptor; persists under `tinyworld:meshTerrain:*`; no `setCell` bake
- `46-worlds-universe.js` — Worlds MMO universe map, world buying (USDC), management/publish; dispatches `tinyworld:worlds-ready` and exposes `window.__tinyworldWorldsReady` promise
- `47-worlds-room.js` — Worlds MMO room client (PartyKit `world-<slug>`); sprite system uses `Without_shadow` sheets; exposes `WS.enterRoom/leaveRoom/harvest/setAvatarClass`; `createAvatar` routes through `window.makeVoxelAvatar` for self + peers + bots; owns skyfall ring meshes (torus geometry/material per ring, recolored each skyfall tick) + camera follow + steering keys for the freefall minigame; runs a SEPARATE avatar `requestAnimationFrame` in addition to the main render loop — do NOT add a third rAF for freefall/race mechanics; dispatches `tinyworld:skyfall-start` with `{rings: skyfall.rings}` on portal-jump; **also owns the `_sr*` surface-roam controller**
- `48-worlds-harvest-hud.js` — Worlds MMO in-world HUD (hearts, resources, harvest actions, cooldowns, reward popups); SVG glyphs only
- `49-worlds-avatar-picker.js` — avatar picker gallery; drives `WS.setAvatarClass`; extensible via `WS.registerAvatarProvider`
- `50-worlds-play-chat.js` — play-mode chat panel; wires to `47` events; reuses `mp-chat-*` CSS classes + `tw-play-chat-*` glassmorphism overrides; IIFE-wrapped
- `51-worlds-bots.js` — localhost-only bot simulation; 3 deterministic bots via seeded LCG PRNG; **localhost/127.0.0.1 only — never runs in production**
- `52-worlds-demo-seed.js` — localhost-only demo resource seeder; **localhost/127.0.0.1 only — never runs in production**
- `99-late-boot.js` — late boot finalization; `?meshbake=1` URL param activates early-prototype terrain bake; `window.runTerrainBake` exposed for console/settings invocation

**Skybound modules (53–60)**
- `53-voxel-avatar.js` — `window.makeVoxelAvatar`; replaces 2.5D sprite "stripes" for self + peers + bots; FK rig with named limb groups (`armL_sh`/`armR_sh`, `armL_elbow`/`armR_elbow`, `legL_hip`/`legR_hip`, `legL_knee`/`legR_knee`, chest, `head`); material MUST be `side:THREE.DoubleSide` (voxGeo winding inconsistent); `AVATAR_HEIGHT=0.5`; uses same LCG PRNG seeding pattern as `60-skyfall.js`; **new API added 2026-06-15**: `setFirstPerson(on)` hides `head` group (Minecraft-style), `getEyeWorldPosition(out)` returns world-space eye position via head group world matrix + `(0, AVATAR_HEIGHT*0.4, 0)` offset
- `54-fly-down.js` — fly-down mechanic (key `j`); `window.__tinyworldFlyDown.{descend,ascend,toggle,isDown}`; eases camera to planet underlay; sets `window.__flyDownActive`; calls `window.__setPlanetLandscapeNearView(true/false)`; shows/hides home-island proxy (~4 draws) and force-hides the full board via `window.__hideHomeLayer`
- `55-stargate.js` — stargate object (key `G`); `window.__tinyworldStargate`; styles: nested/voyager/portal/rings; `nested` = voxel stone casing + recessed ring + white energy centre, sunk at ground level
- `56-gate-transit.js` — gate transit mechanic (key `h`); `window.__tinyworldGateTransit.{placeGate,enter,isOnSurface}`; `placeLobbyGates()` scatters 3 paired gates on enter; auto-travel loop every ~4–8s; CYBERGATE sign (`buildSign`) + maintenance climb rig + `climb-ladder` marker live on the lobby screen (58); **new accessors added 2026-06-15**: `skyGateCell/ensureSkyGate/flashSky/ensureLandGate/flashLand/landGateWorldPos`; sky-edge descend gate relabeled "GROUND LEVEL" with `rotation.y = Math.PI`
- `57-poser-surface.js` — `window.__tinyworldPoserSurface.{show,hide,build}`; VERBATIM lift of voxel-poser.html's SATS/ISLE/groundH geometry + banded water shader + foam ribbons; scaled (SCALE 1.6 / **Y_BOOST 1** — changed from 3 on 2026-06-15) at y=−60 under home board; fly-down (54) shows/hides on descend/ascend; sea animates on its own rAF; **do NOT reimplement — extract verbatim per feedback-extract-dont-reinvent**; perf fix committed (5160cc8): G 0.2→0.4, sea plane 80×80→8×8; **CRITICAL**: `sampleWorld`/`worldToLocal` must read `group.position.x/z` (not hardcoded origin) to correctly map world coordinates to surface-local coordinates; surface-roam (`_sr*`) currently only tracks and moves the local player — no peer position sync exists on the surface yet

---

## Active Workflows / Capabilities

- `./publish.sh` — builds dist and pushes to Netlify; required after any view-facing edit
- `npm test` — static checks; `npm run build` — dist generation without deploy
- PartyKit `party/index.js` — multiplayer presence + slide-sync; deployed separately via `partykit deploy` (not `publish.sh`)
- SVG glyphs only in all in-world UI (no PNG icons anywhere)
- `window.__tinyworldFlyDown.descend()` → shows poser surface, hides home board; `.ascend()` reverses
- `window.makeVoxelAvatar(opts)` → returns avatar group with `.setFirstPerson(on)` and `.getEyeWorldPosition(out)` (as of 2026-06-15)
- `window.__tinyworldGateTransit` → `skyGateCell`, `ensureSkyGate`, `flashSky`, `ensureLandGate`, `flashLand`, `landGateWorldPos` (as of 2026-06-15)

---

## Open Threads

**1. Tinyverse lobby gate guard (planned, not implemented)**
- `56-gate-transit.js` calls `placeLobbyGates()` inside `WS.enter`, so gates appear in ALL joined worlds — Build, Play, draft, and private islands — not just Tinyverse
- Fix: add an `isTinyverseWorld` guard in `47-worlds-room.js` before calling `_56_placeGate`; "Tinyverse mode" = entered via `window.__tinyworldWorlds` / `?world=<slug>`
- Without this guard, every joined world gets lobby gates, signage, and the auto-travel loop

**2. First-person gate fly-through camera (APIs exist, wiring incomplete)**
- `setFirstPerson(on)` and `getEyeWorldPosition(out)` added to `53-voxel-avatar.js` on 2026-06-15
- `skyGateCell`/`ensureSkyGate` accessors added to `56-gate-transit.js` on 2026-06-15
- Camera transition that calls `setFirstPerson(true)` and switches camera source to `getEyeWorldPosition` when descending through the sky gate is **not yet wired** in `56-gate-transit.js` or `47-worlds-room.js`

**3. Peer surface-roam for Tinyverse multiplayer lobby (not started)**
- `_sr*` state in `47-worlds-room.js` is local-player-only; no peer broadcasting or rendering on the poser surface
- For a real Tinyverse lobby where players see each other on the lower island, `47` needs to broadcast `_sr*` position over PartyKit and render peer avatars at surface-local coordinates
- Dependency: Tinyverse guard (thread 1) must be in place first

**4. Race-track / Tinyverse separation (deferred)**
- `tinyworld-tinyverse-race-track` skill documents rally loop mechanics, but race HUD and kart currently load regardless of world type
- Same `isTinyverseWorld` guard pattern needed; race UI should not appear in non-Tinyverse sessions
