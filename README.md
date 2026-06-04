# GIoU Visualiser

GIoU Visualiser is a local web app for building, transforming, and analysing
2D/3D cuboid bounding boxes. It is designed for interactive inspection of IoU
and GIoU behaviour: users can create cuboids, transform them in the scene, keep
an Analyse popup open, and watch the compared pair update as geometry changes.

The app is a pure frontend project built with React, TypeScript, Vite, Three.js,
React Three Fiber, and Drei. There is no backend service.

## Current Features

- **3D and 2D workspace** - switch between perspective 3D and top-down
  orthographic 2D mode.
- **Cuboid authoring** - add, rename, duplicate, delete, recolour, and size
  cuboids from the Object panel.
- **Transform tools** - move, rotate, and scale cuboids with Three.js transform
  controls.
- **Independent Analyse workflow** - the analysed pair is separate from the
  active transform selection, so the Analyse popup can stay open while another
  cuboid is moved, rotated, or scaled. Click two cuboids one after another in
  Analyse mode; no Shift or Ctrl key is required.
- **Live IoU/GIoU metrics** - 2D and 3D oriented bounding-box metrics update
  from the selected Analyse pair.
- **Formula rendering** - Analyse and Explain views use KaTeX for clearer
  symbolic formulas, numeric substitutions, and final metric values.
- **Intersection highlighting** - overlapping volume is highlighted with a
  CSG-generated solid/wireframe overlay.
- **Theme and scaling controls** - persisted day/night theme toggle plus UI
  scale presets.
- **Scene files** - save and load scenes as JSON.
- **View aids** - grid, coordinate axes, origin marker, and a view cube gizmo.
- **First-run guide** - a Quick Start dialog opens on first visit; reopen it any
  time from the **Help** button in the top bar.
- **Default example scene** - click **Example** in the top bar to load two
  overlapping cuboids (`Reference Box` and `Prediction Box`) so
  IoU/GIoU/Explain and the intersection highlight are easy to try. The app
  still starts with an empty scene, and the example does not auto-enter Analyse.

## Known Priority Issue

Analyse-on 3D performance is currently tracked as a P0 issue in
[docs/REVIEW_NOTES.md](./docs/REVIEW_NOTES.md). After Analyse is enabled, the
3D viewport can become sluggish, especially because live transform updates,
oriented GIoU calculation, KaTeX panel updates, and CSG intersection rendering
can all run on the same interaction path.

## Tech Stack

| Area | Technology |
|---|---|
| App framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| 3D rendering | Three.js, `@react-three/fiber` |
| 3D controls/helpers | `@react-three/drei` |
| CSG / overlap geometry | `three-bvh-csg` |
| Formula rendering | KaTeX |
| Colour picker | `react-colorful` |
| Styling | Plain CSS with semantic theme tokens |
| Linting | ESLint 9, TypeScript ESLint, React Hooks rules |
| Package manager | npm with `package-lock.json` |

## Getting Started

Prerequisites:

- Node.js 18 or newer
- npm

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Vite will print the local URL, usually:

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check with `tsc -b` and build for production |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Preview the production build locally |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Select |
| `M` | Analyse |
| `W` | Move |
| `E` | Rotate |
| `R` | Scale |
| `Q` | Add a random cuboid |
| `D` | Duplicate active selected cuboid |
| `X` | Delete active selected cuboid |
| `A` | Add cuboid from the Object panel form |
| `Esc` | Clear current selection or Analyse comparison |

## Analyse Workflow

1. Add at least two cuboids.
2. Open Analyse with the toolbar button or `M`.
3. Select two cuboids to create the analysed pair.
4. Keep the Analyse popup open.
5. Switch to Move, Rotate, or Scale.
6. Select the cuboid you want to transform.
7. Transform changes update the cuboid state and the Analyse metrics for the
   analysed pair.

The active transform selection and analysed pair are intentionally separate:
selecting an active object for Move/Rotate/Scale does not replace the analysed
pair.

## Project Structure

```text
src/
├── App.tsx                          # Root component — canvas and cuboid state
├── components/
│   ├── Cuboid.tsx                   # Single cuboid mesh with transform controls
│   ├── CsgIntersectionLayer.tsx     # Manages intersection highlight pairs
│   ├── CsgIntersectionHighlight.tsx # CSG-based overlap visualisation
│   ├── SceneGuides.tsx              # Axes and origin markers
│   ├── ViewCubeGizmo.tsx            # Orientation cube (top-right corner)
│   └── workspace/
│       ├── WorkspaceLayout.tsx      # Five-panel layout shell
│       ├── TopBar.tsx               # File menu (New / Open / Save)
│       ├── LeftToolbar.tsx          # Tool mode buttons
│       ├── ViewportPanel.tsx        # Canvas container
│       ├── RightSidebar.tsx         # Object / Metrics / Explain tabs
│       ├── BottomStatusBar.tsx      # Status bar
│       └── tabs/
│           ├── ObjectTab.tsx        # Add, rename, delete, colour cuboids
│           ├── MetricsTab.tsx       # IoU / GIoU readout for selected pair
│           └── ExplainTab.tsx       # Contextual documentation
├── types/
│   ├── Cuboid.ts                    # CuboidData interface and transform modes
│   ├── Workspace.ts                 # Tool modes, view modes, UI state types
│   └── Scenefile.ts                 # Scene file format (v1)
├── utils/
│   ├── giou.ts                      # Axis-aligned IoU / GIoU (2D and 3D) - Original GIoU calculation as per paper from Stanford.
│   ├── giouOriented.ts              # IoU / GIoU for rotated bounding boxes - this is an adaptation on the original GIoU calculations to allow for rotations.
│   ├── cuboidBoxConvert.ts          # Data conversion helpers
│   ├── saveScene.ts                 # JSON scene export
│   └── loadScene.ts                 # JSON scene import
└── hooks/
    └── useUiScale.ts                # Responsive UI scaling
```

## Metrics

The app reports:

- **IoU** - intersection over union.
- **GIoU** - generalized IoU with an enclosing-box penalty.
- **L_IoU** - `1 - IoU`.
- **L_GIoU** - `1 - GIoU`.

Metrics are calculated from the current Analyse pair. In 2D mode, the app uses
the XY projection; in 3D mode, it uses oriented cuboid geometry.

## Scene File Format

Scenes are saved as JSON files:

```json
{
  "version": "v1",
  "timestamp": "2026-05-29T00:00:00.000Z",
  "cuboids": []
}
```

Loaded scenes are validated before replacing the current workspace.

## Review Notes

Open review issues are tracked in
[docs/REVIEW_NOTES.md](./docs/REVIEW_NOTES.md). Resolved historical items are
archived in [docs/RESOLVED_REVIEW_NOTES.md](./docs/RESOLVED_REVIEW_NOTES.md).
