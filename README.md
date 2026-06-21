# Design Studio Education

A classroom-focused fork of Tiny World Builder for teaching spatial design process.

## What changed

- Removed public account/auth bootstraps from the landing page and builder shell.
- Removed wallet/token/community/Tinyverse framing from the primary UI.
- Reframed the product around: brief → prototype → critique → iterate.
- Kept the browser-native voxel editor and static Vercel deployment path.
- No student sign-in is required for the core studio.

## Run locally

```bash
npm run dev
# open http://localhost:3000/tiny-world-builder
```

## Verify and build

```bash
npm test
npm run build
```

## Deploy on Vercel

```bash
vercel deploy
# or: vercel deploy --prod
```

Vercel uses `vercel.json`: build command `./publish.sh`, output directory `dist`.

## License

This fork preserves the upstream AGPL-3.0-only license. If deployed publicly, keep the source available under the same license.
