# Workspace UI/UX Review Notes

Living document tracking issues found during Claude / Codex multi-round code review of the
`fix/button&tab` branch. Use this as the entry point for follow-up sessions: fixed items are
kept for context; open items are prioritised for next development passes.

Last consolidated: 2026-05-19

---

## 1. Already-fixed issues (this review cycle)

These were identified in earlier review rounds and have **landed on the branch**. Original
pre-rebase commits were `661a893` and `ad80ba3`; after rebasing onto `main` they are represented
by `b033c8f` and `c620f66`. Kept here so future reviewers can see prior decisions.

| # | Area | Fix summary |
|---|---|---|
| F1  | `MetricsTab` | Instruction text only renders when fewer than two valid cuboids selected. |
| F2  | `MetricsTab` | Metric values formatted with `toFixed(4)`. |
| F3  | `MetricsTab` | Selection order preserved via `selectedId.map(id => find(...))`. |
| F4  | `ObjectTab` | List `className` no longer renders the literal string `"null"`. |
| F5  | `BottomStatusBar` | Internal enum names (`translate`, `mselect`, ...) replaced by user-facing labels via `TOOL_LABELS`. |
| F6  | `App` (mselect) | Analyse mode actually behaves differently from Select: up to two cuboids, repeat-click toggles. |
| F7  | `TopBar` | Removed `Help` and `Import` no-op buttons. |
| F8  | `LeftToolbar` | `Random` got the `Q` shortcut. |
| F9  | `ObjectTab` | Add Cuboid validation surfaces inline error and announces via `role="alert"`. |
| F10 | `ObjectTab` | Hex colour input shows `aria-invalid` + invalid border state. |
| F11 | `workspace.css` | Shared `:focus-visible` outline for all interactive workspace controls. |
| F12 | `App` | `A` shortcut centralised into App-level keyboard dispatcher. |
| F13 | `ObjectTab` ↔ `App` | `A` shortcut uses the form values via `onAddShortcutChange` trampoline (handler is stable, latest `handleAdd` read through `handleAddRef`). |
| F14 | `App` | Duplicate / Delete with empty selection emits `"Select a cuboid before …"` to status bar. |
| F15 | `App` | `X` / Delete tool removes **all** selected cuboids (multi-delete in mselect). |
| F16 | `ObjectTab` | List rows no longer nest interactive elements: separate `.object-list-select-button` and `.object-delete-button` siblings. |
| F17 | `RightSidebar` | Tabs marked up with `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`. |
| F18 | `LeftToolbar` / `ObjectTab` | Decorative shortcut `<kbd>` elements set `aria-hidden="true"`. |
| F19 | `workspace.css` | Top bar and bottom bar wrap responsively; bottom controls also wrap. |
| F20 | `useUiScale` / `TopBar` | Added `110%` and `115%` scale presets; `UiScaleOverride` union and validator updated. |
| F21 | `App` (handleSelect) | `mselect` branch no longer mutates `selectedIdsRef` inside a state-updater closure; ref is computed and written synchronously before `setSelectedIds`. |
| F22 | `App` (handleDelete) | Deleting one cuboid no longer wipes the entire selection — only the deleted id is removed from selection ref + state. |
| F23 | `ObjectTab` list | Both row buttons have explicit `aria-label`s including index and dimensions. |
| F24 | `types/Workspace.ts`, `App`, `BottomStatusBar` | Removed dead `'add'` entry from `ToolMode` and its unreachable `handleToolChange` branch. |
| F25 | `ObjectTab` | Shortcut registration uses a stable trampoline (`handleAddRef`); no more register/unregister churn on every keystroke. |
| F26 | `ObjectTab` | Form validation failure also fires `onStatus` so the bottom status bar reflects errors when user is not on the Object tab. |
| F27 | `App` | mselect blank-canvas click no longer clears selection; instead emits `"Press Esc to clear comparison"`. `Esc` clears selection globally. |
| F28 | `App` (handleToolChange) | Switching to Select / Analyse / Move / Rotate / Scale updates status bar (`Mode: …`). |
| F29 | `App` | mselect status messages compressed: `Comparison: #N (pick one more)` / `Comparing #A and #B` / `Removed #N from comparison` / `Comparison cleared`. |
| F30 | `MetricsTab` | Rebase onto 2D mode now uses `giou2DOriented` / `giou3DOriented`; Metrics no longer depends on stale `ConvertCuboid` AABB helpers. |
| F31 | `MetricsTab` | `formatMetric` now guards with `Number.isFinite`, so degenerate results render `--` instead of `"NaN"`. |
| F32 | `ObjectTab` | Rebase conflict kept nullable `handleAddRef` (`useRef<(() => void) \| null>(null)`) and null-safe shortcut dispatch. |
| F33 | `AnalysePanel` | Added `src/components/workspace/AnalysePanel.tsx` to git so `WorkspaceLayout`'s import resolves on a clean checkout. |
| F34 | `App` / `MetricsTab` | Hoisted Analyse metrics now return `null` outside `mselect`, so the Metrics tab no longer shows a stale pair after leaving Analyse mode. |
| F35 | `AnalysePanel` | Closed panel removes the close button from tab order and the close button now participates in the shared focus outline. |

---

## 2. Rebase / conflict-resolution notes

The branch was rebased onto `main` at `512a6e4` (2D IoU / 2D mode toggle work). Conflict
resolution decisions worth preserving for review:

- `MetricsTab` now keeps the review fixes while using the new view-mode-aware metric path:
  selection order is preserved through `selectedId.map(id => find(...))`, values are formatted
  through the finite-number guard, 2D mode calls `giou2DOriented`, and 3D mode calls
  `giou3DOriented`. This resolves the old Metrics-specific scale/rotation concerns that were
  attached to `ConvertCuboid`; that legacy helper remains a cleanup item only.
- `ObjectTab` keeps both sides of the conflict: main's object naming / inline rename / 2D depth
  hiding behaviour, plus this branch's `A` shortcut trampoline, form validation status feedback,
  color-picker keyboard handling, and non-nested list row buttons.
- `RightSidebar` / `WorkspaceLayout` were merged by passing through both feature sets:
  `viewMode` / `onToggleViewMode` / `onRename` from main and `onObjectAddShortcutChange` /
  `onStatus` from this branch.
- `App` keeps main's 2D camera/view-mode flow while preserving the shortcut and selection-state
  fixes from this branch. `add` remains removed from `ToolMode`; `A` is dispatched through
  `ObjectTab`'s registered handler.
- `package-lock.json` modify/delete conflict was resolved by keeping the current `main` lockfile.
  The conflicting commit only deleted the lockfile; preserving it keeps npm installs
  reproducible.
- The rebase rewrote commit hashes. The pre-rebase `ad80ba3` changes are represented by rebased
  commit `c620f66` in the current branch history.

Post-rebase verification:

- `npm run lint` — passes with 3 existing CSG warnings:
  `CsgIntersectionHighlight.tsx` cleanup refs and `CsgIntersectionLayer.tsx` missing
  `cuboids` dependency.
- `npm run build` — passes with the existing Vite chunk-size warning.
- Working tree after rebase: only untracked `.claude/` remains, matching open issue P1-3.

---

## 3. Open issues, prioritised

File:line references were originally captured around pre-rebase commit `ad80ba3` and may have
shifted after rebasing onto `main` at `512a6e4`. Re-verify before starting work.

### P0 — Correctness / data integrity (fix first)

#### P0-1. `handleLoadScene` produces `NaN` ids on non-numeric input
- File: [src/App.tsx:152](../src/App.tsx)
- `Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1` becomes `NaN` if any id fails to parse,
  and every subsequently created cuboid gets id `"NaN"` → React duplicate keys, broken
  selection.
- Codex addendum: `parseInt("1abc")` is `1`, so even after a `Number.isFinite` guard a malformed id
  can still skew `nextId`. Validate with `/^\d+$/` before parsing.
- Fix:
  ```ts
  const numericIds = loaded
    .map(c => c.id)
    .filter(id => /^\d+$/.test(id))
    .map(id => parseInt(id, 10));
  nextId = (numericIds.length ? Math.max(...numericIds) : 0) + 1;
  ```

#### P0-2. `loadScene` does not validate cuboid shape
- File: [src/utils/loadScene.ts:20](../src/utils/loadScene.ts)
- Only checks `Array.isArray(parsed.cuboids)`. Malformed entries propagate into render and metric
  utilities, where missing `position` / `rotation` / `scale` etc. can throw at runtime.
- Fix: minimal per-item schema check (numeric `width/height/depth`, length-3 numeric arrays for
  `position/rotation/scale`, string `id`, string `color`). Drop invalid entries with `onError`.

### P1 — High priority (real UX / data risk)

#### P1-1. `New` / `Open` silently discard the current scene
- File: [src/components/workspace/WorkspaceLayout.tsx:62](../src/components/workspace/WorkspaceLayout.tsx) and `:69`
- No confirmation prompt; one click destroys 10 minutes of work.
- Fix: when `cuboids.length > 0`, gate behind `window.confirm("Discard current scene?")`. A dirty
  flag is nicer but the confirm is a one-liner.

#### P1-2. `TransformControls` shows in wrong modes (and double in mselect)
- File: [src/components/Cuboid.tsx:32](../src/components/Cuboid.tsx)
- Two issues collapse here:
  1. mselect with two selections renders **two** gizmos at once — drei's `TransformControls`
     isn't designed to be stacked; clicks/drags get eaten.
  2. Codex addendum: in plain Select mode, gizmos still appear because
     [App.tsx:63](../src/App.tsx) falls back to `'translate'` for any non-rotate/scale tool.
     Select & Analyse should show no gizmo at all.
- Fix: pass an explicit `showGizmo` prop (or `mode | null`) — only render gizmo when
  `activeTool` is one of `translate | rotate | scale` **and** there is exactly one selection.

#### P1-3. `.gitignore` no longer ignores `/.claude/`
- File: [.gitignore](../.gitignore)
- Earlier commit removed the `/.claude/` line **and** dropped the trailing newline. Local
  agent state will start showing up in `git status` and may be committed accidentally.
- Fix: restore `/.claude/` and the trailing newline. If the removal was intentional, do it in a
  dedicated commit with a rationale.

#### P1-4. `getNextPosition` collides after middle-of-list deletions
- File: [src/App.tsx:79](../src/App.tsx)
- Position formula uses `prev.length`. Delete from the middle, add a new cuboid → new cuboid
  spawns where the deleted one used to be. Visually confusing.
- Fix: drive the spiral from a monotonic counter (e.g. derived from `nextId` or a separate
  `positionCounter` ref) rather than the current array length.

#### P1-5. mselect leaves orphaned half-comparison without explanation
- File: [src/App.tsx:84](../src/App.tsx)
- Deleting one of two compared cuboids via the list `✕` shows only `Deleted cuboid #A`. The
  Metrics panel silently drops back to `--`, with no hint that comparison is now incomplete.
- Fix: in `handleDelete`, if `activeToolRef.current === 'mselect'` and a remaining selected id
  exists, append `Comparison: #B (pick one more)`.

#### P1-6. Esc / blank-click status messages disagree
- File: [src/App.tsx:140](../src/App.tsx) vs [src/App.tsx:221](../src/App.tsx)
- mselect blank-click prompts `Press Esc to clear comparison`, but the actual Esc handler emits
  the default `Selection cleared`.
- Fix:
  ```ts
  if (key === 'escape') {
    clearSelection(activeToolRef.current === 'mselect' ? 'Comparison cleared' : 'Selection cleared');
    return;
  }
  ```

#### P1-7. Cuboid material uses `AdditiveBlending` + `depthWrite=false`
- File: [src/components/Cuboid.tsx:48](../src/components/Cuboid.tsx)
- Overlapping cuboids saturate towards white and depth sorting fails (visible "see-through"
  artefacts when orbiting).
- Decision needed: is this an intentional GIoU visualisation effect? If yes, document it in a
  comment. If no, switch to standard `transparent + opacity ~0.6 + depthWrite=true`, or only
  enable additive in mselect mode.

### P2 — Medium priority (consistency / a11y polish)

| # | File / location | Problem | Suggested fix |
|---|---|---|---|
| P2-1 | [workspace.css:545](../src/styles/workspace.css) | `.object-list-item:hover` highlights the row but only inner buttons are clickable | Move hover to inner button, or use `:has(.object-list-select-button:hover)` |
| P2-2 | [BottomStatusBar.tsx:41](../src/components/workspace/BottomStatusBar.tsx) | `aria-live="polite"` re-announces on every click in mselect | Suppress duplicate consecutive announcements; consider `role="status"` |
| P2-3 | [RightSidebar.tsx](../src/components/workspace/RightSidebar.tsx) | Tabs lack roving `tabIndex` and arrow-key navigation | WAI-ARIA tabs pattern: only active tab is `tabIndex=0`, others `-1`, ←/→/Home/End handlers |
| P2-4 | [ObjectTab.tsx:198](../src/components/workspace/tabs/ObjectTab.tsx) | List rows have no `aria-selected` on the inner select button | Add `aria-selected={selected}` to `.object-list-select-button` |
| P2-5 | [ObjectTab.tsx](../src/components/workspace/tabs/ObjectTab.tsx) | Esc does not close the colour picker popout | Add Esc handler local to the picker, or close on Esc when `showPicker` is true |
| P2-6 | [ObjectTab.tsx:56](../src/components/workspace/tabs/ObjectTab.tsx) | `formError` does not clear when user fixes the inputs | Clear on `onChange` of W/H/D when valid |
| P2-7 | [ObjectTab.tsx:57](../src/components/workspace/tabs/ObjectTab.tsx) | Inline error and status bar can still create duplicate feedback | Keep inline details; status gets only a short summary (`Add failed: invalid size`) |
| P2-8 | [App.tsx:65](../src/App.tsx) | Status messages never auto-clear | Operation messages (Added/Deleted/Duplicated) revert to `Ready` or `Mode: …` after 3–5 s |
| P2-9 | [workspace.css:365](../src/styles/workspace.css) | Long status messages wrap and grow the bottom bar | `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` + `title={statusMessage}` |
| P2-10 | [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | `Snap: Off` / `Grid: On` / `Camera: Perspective` are dead text that look like toggles | Either implement them or remove |

### P3 — Cleanup / maintainability

| # | File / location | Problem | Suggested fix |
|---|---|---|---|
| P3-1 | [src/components/CuboidPanel.tsx](../src/components/CuboidPanel.tsx) and [types/Cuboid.ts:24](../src/types/Cuboid.ts) | Dead component + dead `CuboidPanelProps` type, ~272 lines drifting from `ObjectTab` | Delete file and type |
| P3-2 | [App.tsx:14](../src/App.tsx) and [BottomStatusBar.tsx:13](../src/components/workspace/BottomStatusBar.tsx) | `MODE_STATUS` and `TOOL_LABELS` duplicate `ToolMode → label` | Move `TOOL_LABELS` to `types/Workspace.ts` (or new `workspaceLabels.ts`); derive `MODE_STATUS` as `` `Mode: ${TOOL_LABELS[t]}` `` |
| P3-3 | [App.tsx:11](../src/App.tsx) | Module-level mutable `let nextId = 1` | Move into `useRef`; survives HMR cleanly, easier to test |
| P3-4 | [src/utils/cuboidBoxConvert.ts](../src/utils/cuboidBoxConvert.ts) | Legacy AABB conversion helpers ignore `scale` / `rotation` and are no longer used by `MetricsTab` after the rebase | Delete if unused, or update before reusing them in any metric path |
| P3-5 | [saveScene.ts:17](../src/utils/saveScene.ts) | `URL.revokeObjectURL` immediately after `a.click()` may abort download in some browsers | Defer with `setTimeout(() => URL.revokeObjectURL(url), 0)` |
| P3-6 | [loadScene.ts:38](../src/utils/loadScene.ts) | `<input>` element retained by closure on each open | Set `input.onchange = null` after handler runs, drop reference |
| P3-7 | [Cuboid.tsx:8](../src/components/Cuboid.tsx) | Mesh stored in `useState` causes an extra render on attach | Use `useRef` + a `forceUpdate` on first attach, or accept the extra render and document |
| P3-8 | [Cuboid.tsx:13](../src/components/Cuboid.tsx) | `handleClick` recreated each render — small overhead at scale | Wrap in `useCallback([data.id, onSelect])` |
| P3-9 | [App.tsx](../src/App.tsx) | Vite chunk-size warning > 500 kB after minify | Code-split three.js / drei / react-colorful into manual vendor chunks (out-of-scope for UX work) |

---

## 4. Recommended fix order

1. **Immediate, single small commit** — P0-1 (`nextId` NaN / regex), P1-3 (`.gitignore`
   restore), P1-2 (gizmo gating).
2. **Next PR** — P0-2 (loadScene schema), P1-1 (New/Open confirm), P1-6 (Esc copy),
   P2-3 (tab roving focus).
3. **Polish PR** — P1-4 (position counter), P1-5 (orphan comparison hint), P1-7 (material
   decision + comment), all P2 items.
4. **Cleanup PR** — P3-1 (delete `CuboidPanel`), P3-2 (merge label maps), P3-3 (`nextId` ref).

---

## 5. Known non-issues / deferred

These were raised in review but explicitly **not** treated as defects:

- Vite bundle-size warning (P3-9): pre-existing, unrelated to UX.
- Local `.idea/`, `.DS_Store` files in working tree: developer-machine artefacts, ignored.
- Status-message-as-aria-live verbosity: tracked under P2-2 / P2-8 rather than redesigning the
  status channel.
- OBB IoU implementation: no longer a Metrics blocker after rebasing onto main's
  `giouOriented` implementation. Legacy AABB helpers are tracked as cleanup under P3-4.

---

## 6. Verification baseline

At pre-rebase commit `ad80ba3`:

- `npm run lint` — passes
- `npm run build` — passes (single warning: Vite chunk size > 500 kB)
- Manual smoke checks partially performed: ObjectTab Add (button + `A`) and object list
  two-button row were checked. Some in-app browser interaction checks around mselect hit
  locator/click issues and should be re-run before PR.

Re-run all three before opening any PR derived from this list.

At 2026-05-19 after the AnalysePanel review:

- `npm run lint` — passes with the same 3 existing CSG warnings.
- `npm run build` — passes locally with the existing Vite chunk-size warning.
