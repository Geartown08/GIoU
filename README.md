# 3D Cuboid Workspace

An interactive web application for creating, transforming, and analysing 3D cuboid objects in both perspective and orthographic views. Built with React Three Fiber and Three.js, it provides real-time IoU/GIoU metrics for selected pairs of cuboids — supporting both axis-aligned and rotated bounding boxes.

## Features

- **3D/2D viewport** — switch between perspective and top-down orthographic views
- **Transform tools** — translate, rotate, and scale cuboids with visual gizmos
- **Analyse mode** — select two cuboids and compute IoU and GIoU (2D and 3D)
- **Intersection highlighting** — CSG-based glowing wireframe overlay on overlapping regions
- **Scene management** — save and load scenes as JSON files
- **Customisation** — rename objects, pick colours, set exact dimensions
- **View aids** — coordinate axes, grid, and a Unity-style view cube gizmo

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| 3D Renderer | Three.js via React Three Fiber + Drei |
| Intersection Geometry | three-bvh-csg |
| Build Tool | Vite |
| Linting | ESLint (TypeScript + React hooks) |

## Getting Started

**Prerequisites:** Node.js v18+ and npm.

```bash
# Clone the repo
git clone <your-repo-url>
cd 3162

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the source tree |

## Keyboard Shortcuts

| Key | Tool |
|---|---|
| `V` | Select |
| `M` / `W` | Move (translate) |
| `E` | Rotate |
| `R` | Scale |
| `D` | Duplicate selected |
| `X` | Delete selected |
| `A` | Analyse mode (multi-select for IoU/GIoU) |

## Project Structure

```
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
│   ├── giou.ts                      # Axis-aligned IoU / GIoU (2D and 3D)
│   ├── giouOriented.ts              # IoU / GIoU for rotated bounding boxes
│   ├── cuboidBoxConvert.ts          # Data conversion helpers
│   ├── saveScene.ts                 # JSON scene export
│   └── loadScene.ts                 # JSON scene import
└── hooks/
    └── useUiScale.ts                # Responsive UI scaling
```

## IoU / GIoU Metrics

The **Metrics** tab computes intersection metrics for a selected pair of cuboids:

- **IoU** — Intersection over Union (0–1), measures volumetric overlap
- **GIoU** — Generalized IoU (−1–1), penalises non-overlapping cases based on the smallest enclosing box
- Both **2D** (XY-plane projection) and **3D** variants are reported
- Rotated bounding boxes are handled via `giouOriented.ts`

## Scene File Format

Scenes are saved as `.json` files with the following top-level shape:

```json
{
  "version": "v1",
  "timestamp": "<ISO string>",
  "cuboids": [ /* array of CuboidData objects */ ]
}
```
