# Tiny World Builder

<img width="1324" height="1016" alt="Screenshot 2026-05-11 at 07 09 24" src="https://github.com/user-attachments/assets/1b19a5f7-def5-42bf-b85f-01714f502afa" />

## Run

```bash
open tiny-world-builder.html
# or serve it
python3 -m http.server 8000
```

## Deploy

The app deploys to Vercel as a static site. `vercel.json` runs `./publish.sh`
and serves the generated `dist/` directory.

```bash
npm run build
vercel deploy
```

## Controls

| Action            | Input                                  |
| ----------------- | -------------------------------------- |
| Place             | click a cell                           |
| Erase             | `E` then click, or pick the eraser     |
| Orbit             | drag                                   |
| Zoom              | scroll wheel                           |
| Stack/enhance item | click the same object tool on an existing object (max 8) |
| Raise/lower terrain | `R` / `F` over the hovered cell      |
| Switch tool       | `1`–`9`, then letter shortcuts shown in the toolbar |
| Toggle camera     | `P` or `I` (isometric ⇄ soft ⇄ perspective) |
| Reset to preset   | reset button                           |
| Clear to grass    | `C`                                    |

## Tools

`Grass` · `Path` · `Dirt` · `Water` · `Stone` · `Lava` · `Sand` · `Snow` ·
`House` · `Tree` · `Fence` · `Rock` · `Bridge` · `Crop` · `Corn` · `Wheat` ·
`Pumpkin` · `Carrot` · `Sunflower` · `Tuft` · `Flower` · `Bush` · `Cow` ·
`Sheep` · `Erase`.

Terrain/object rules are normalized by the renderer: crops force dirt
underneath, bridges force water, and ordinary objects do not float on water.
Paths, shorelines, water foam, bridges, fences, castle walls, houses, and
rocks are adjacency-aware — placing a neighbor re-renders surrounding cells
so roads join, rivers get banks, bridge direction updates, fence walls connect,
house clusters form L/T/+/square buildings, and rock cells grow into craggy
outcrops.

## Architecture

Single `<script>` block, currently ~16k lines of vanilla JS, organised by section
comments (`// -------- xyz --------`). The model is split cleanly:

- **`world[x][z]`** — intent: `{ terrain, kind, floors }` per cell.
- **`cellMeshes['x,z']`** — rendered Three.js groups for each cell.
- **`setCell(x, z, opts)`** — single mutation entry point. Updates `world`,
  rebuilds the cell's tile/object meshes, and re-renders any neighbors that
  care about adjacency (fence/house clusters).

House clusters use BFS (`bfsHouseCluster`) plus `tryComposite` (L/T/+) and
`trySquare` to decide whether a group of house cells should render as a
unified structure or stretched rectangles.

A shared `dropAnims` queue ease-outs new tiles/objects into place. Other
per-frame animations (tree sway, crop bob, smoke origin) check
`obj.userData.landing` so they yield while a piece is still falling in.

See [AGENTS.md](./AGENTS.md) for guidance on extending the codebase.

## Files

```
tiny-world-builder.html          the app
README.md                        this file
AGENTS.md                        guidance for AI coding agents
world.schema.json                import/export schema mirrored into the app
```
