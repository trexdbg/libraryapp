# La Librairie des Mondes — Showcase 3D Three.js

A standalone isometric 3D environmental showcase for the library project, placed at `/showcase-3d/` within GitHub Pages. Unlike earlier versions, **no generated illustration or flat background is used for the town**: all buildings, dome glazing, roof tiles, stairs, balustrades, fountain, cliffs, bridges and vegetation are Three.js geometry.

## Launch

Serve statically (`python3 -m http.server 8000`) then open `/showcase-3d/`. Three.js 0.180.0 and its official post-processing addons load from jsDelivr. No build tool or backend is needed. GitHub Pages can host it as is.

## Controls

- Drag to orbit; scroll/pinch to zoom.
- Select the places anchored to actual 3D world points to focus on a literary district.
- Choose day, golden hour, dusk or night, and change season.
- Toggle bloom post-processing and fullscreen.
- Use the home camera button to return to the village vista.

## Performance

- Geometry is in Three.js, with procedurally drawn canvas-based surface textures.
- Leaf and flower clusters use instancing.
- Resolution and bloom default to conservative settings on touch/low-core devices.
- Scene is meant as an **art-direction prototype**, not an actual AAA production environment. A production-quality scene would still benefit from designed / baked GLB meshes, authored PBR textures, LODs, GPU profiling and device testing.

## Integration direction

This is an optional, independent 3D landing experience for the existing app. The book selections are editorial demonstration data, **not store availability**; replace these with real catalog records and affiliate URLs via the same product API that will later serve physical inventory.