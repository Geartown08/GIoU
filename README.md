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
- **Default example scene** - the app boots with two overlapping cuboids
  (`Reference Box` and `Prediction Box`) so IoU/GIoU/Explain and the
  intersection highlight are immediately usable. Click **Example** in the top
  bar at any time to restore them. The example does not auto-enter Analyse -
  click `Analyse` (or press `M`) and pick the two cuboids in turn.

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
  App.tsx                          Root state and workspace orchestration
  main.tsx                         React entry point
  index.css                        Global CSS variables and base styles
  styles/
    workspace.css                  Workspace layout, theme, and control styles
  components/
    Cuboid.tsx                     Cuboid mesh, selection outlines, transform controls
    CsgIntersectionLayer.tsx       Builds overlap-highlight pairs
    CsgIntersectionHighlight.tsx   CSG intersection mesh generation
    CsgIntersectionMaterials.ts    Shared intersection materials
    SceneGuides.tsx                Axes and origin marker
    ViewCubeGizmo.tsx              View cube direction arrows
    CamerRig.tsx                   Camera mode switching helper
    scene/
      SceneCanvas.tsx              React Three Fiber canvas scene
    workspace/
      WorkspaceLayout.tsx          App shell layout
      TopBar.tsx                   Theme, UI scale, New/Open/Save
      LeftToolbar.tsx              Tool buttons and shortcuts
      ViewportPanel.tsx            Canvas container
      RightSidebar.tsx             Object and Explain tabs
      AnalysePanel.tsx             Floating Analyse popup
      MathFormula.tsx              KaTeX rendering wrapper
      BottomStatusBar.tsx          Status and view controls
      tabs/
        ObjectTab.tsx              Cuboid creation, list, rename, delete
        ExplainTab.tsx             GIoU explanation and derivation
  hooks/
    useCuboids.ts                  Cuboid collection, add/delete/update/load
    useSelection.ts                Active selection and Analyse pair selection
    useCalcutlations.ts            Analyse metric derivation hook
    useTheme.ts                    Day/night theme persistence
    useUiScale.ts                  UI scale persistence and resolution
  types/
    Cuboid.ts                      Cuboid and transform types
    Workspace.ts                   Tool, view, and calculation types
    Scenefile.ts                   Scene file schema
  utils/
    giou.ts                        Shared IoU/GIoU types and legacy AABB helpers
    giouOriented.ts                Oriented 2D/3D IoU/GIoU implementation
    cuboidBoxConvert.ts            Volume/surface and conversion helpers
    metricFormula.ts               Formula text and formatting helpers
    saveScene.ts                   JSON scene export
    loadScene.ts                   JSON scene import and validation
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
