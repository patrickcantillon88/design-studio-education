# tinyworld — CodeSurf Generated Memory

_Generated 2026-05-25. Do not edit by hand — overwritten on each dreaming run._

---

## Overview

**tinyworld** is a single-file browser app (`tiny-world-builder.html`) — a low-poly infinite-canvas 3D world builder on Three.js r128. No bundler, no npm runtime dependencies. All CSS and JS inline (~16k LoC). Static deploy via `publish.sh` → `dist/`, served by both Vercel (`vercel.json`) and Netlify (`netlify.toml`).

The workspace runs inside **CodeSurf** canvas with an **OpenClaw** agent infrastructure managing scheduled crons and heartbeat polling.

---

## Durable Facts

### App Architecture

- **Single source of truth**: `tiny-world-builder.html` — all code lives here
- **Two parallel data structures**: `world[x][z]` (intent) and `cellMeshes['x,z']` (render) — mutate only via `setCell(x, z, opts)`
- Three.js r128 pinned; materials in `M.*` are shared — clone before mutating color
- `userData.landing` guards drop-in animations; `disposeGroup` skips shared materials
- Grid: 8×8 default, up to 48×48; storage key `tinyworld:v1` schema v4

### Procedural Material System & Cloud Optimization (committed 2026-05-24)

- `makeMulberry32()` seeded RNG for stable textures across reloads; `voxelBuildMaterial(hex, textureKind)` routes procedural maps
- Commit `821faec`: cloud instances pooled via dummy reuse, particle cache reduces per-frame allocation
- `.codex/skills/tinyworld-lowpoly-stylized-3d` needs manual update (Codex sandbox blocks `.codex/skills/` writes)

### LandscapeEngine (pending browser visual QA — multi-cycle backlog)

- `LandscapeEngine.js` module gated by `landscapeMeshMode`; `landscapeHeightAtCell(x,z)` is the canonical height lookup
- Clip planes copy to `pixelState.normalMaterial.clippingPlanes` in `renderScene`; soft gradient fading at clip boundaries
- `npm test` passes; browser QA for outlines, cel-shading, shadows, fog, and auto-expand not yet done

### Auto-Generate Panning Regression

- Root cause: `maxRenderVisibleSizeForGrid` (line 5082) returns 72 for large grids, hitting slider ceiling — only affects non-realistic/non-landscape modes; fix not applied

---

## Active Agent Infrastructure (OpenClaw)

**Healthy**: Ava heartbeating `HEARTBEAT_OK`; Urgent Email Alert operationally OK (2-fail-then-succeed pattern each cycle); VibeClaw Article Generator published "Steven Rosenbaum AI-Fabricated Quotes" and "Anthropic Project Glasswing" (2026-05-25); VibeClaw Skills Scout ran at 19:00 and 02:00 UTC; VibeClaw Wallpaper Generator ran at 09:00 (neon city reflections, dark minimal tech, glowing digital circuits — DGX unreachable, completeness unknown).

**Degraded/Broken** (recurring): MC Gateway (`localhost:19789`) — connection refused every poll, needs manual restart; Tom Doerr Tweet Tracker — X.com requires authenticated Chrome profile, wacli also unauthenticated; DGX image server — unreachable across multiple article and wallpaper cycles.

---

## Adjacent Projects

- **grok-cli**: inline-image flicker fix attempted; Codex sandbox blocked writes; patch left at `/private/tmp` targeting `inline-image.tsx`; needs write-capable session rooted at `grok-cli`; `ai-cli` Kitty protocol is the reference
- **hermes-agent-core-rs**: parity tests passing; sessions this cycle were idle/initialization only
- **SmallHarness → Hermes migration**: plan exists, application unconfirmed
- **ideation-canvas**: Catmull-Rom smoothing committed, build passes
- **openclicky**: keychain/bridge/proxy features committed; live build verification pending

---

## Open Threads

1. Browser visual QA for LandscapeEngine — multi-cycle backlog; needs browser-capable agent or human
2. Auto-generate panning regression — root cause known at line 5082; fix not applied
3. `.codex/skills/tinyworld-lowpoly-stylized-3d` — needs manual update for seeded RNG and `voxelBuildMaterial()`
4. MC Gateway — `localhost:19789` connection refused; manual process restart needed
5. Tom Doerr Tweet Tracker — Chrome profile needs X.com login, or switch to API/nitter/RSS; wacli needs auth
6. grok-cli inline-image patch — at `/private/tmp`; awaiting write-capable session
7. SmallHarness → Hermes migration — plan unexecuted
8. openclicky live build verification — pending
9. DGX server — down across multiple cycles; VibeClaw publishing without local hero images
10. 1 unpushed commit on `main` — `f8254fd chore: update DREAMING.md`
