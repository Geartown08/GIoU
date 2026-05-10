# Workspace UI/UX Review Notes

Living document tracking issues found during Claude / Codex multi-round code review of the
`fix/button&tab` branch. Use this as the entry point for follow-up sessions: fixed items are
kept for context; open items are prioritised for next development passes.

Last consolidated: 2026-05-11

---

## 1. Already-fixed issues (this review cycle)

These were identified in earlier review rounds and have **landed on the branch** (commits
`661a893`, `ad80ba3`). Kept here so future reviewers can see prior decisions.

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

---

## 2. Open issues, prioritised

File:line references are accurate as of commit `ad80ba3`. Re-verify before starting work.

### P0 — Correctness / data integrity (fix first)

#### P0-1. `ConvertCuboid` ignores `cuboid.scale`
- File: [src/utils/cuboidBoxConvert.ts:5](../src/utils/cuboidBoxConvert.ts)
- ObjectTab displays `width * scale[0]` etc. as the actual size, but the GIoU input uses raw
  `width/height/depth`. After using the Scale tool the rendered box and the box passed to
  `giou3D` no longer match — Metrics values are wrong.
- Fix: multiply half-extents by the corresponding `cuboid.scale` axis. Rename `cuboidScale`
  → `halfExtents` while you're in there (the current name is confusing alongside `cuboid.scale`).

#### P0-2. `ConvertCuboid` ignores `cuboid.rotation`
- File: [src/utils/cuboidBoxConvert.ts:5](../src/utils/cuboidBoxConvert.ts)
- The function returns the un-rotated AABB, so rotated boxes produce mathematically wrong GIoU.
- Minimum-cost fix: surface a warning in `MetricsTab` when either selected cuboid has any non-zero
  rotation component (`AABB approximation — rotation not reflected`).
- Full fix: compute the world AABB of the rotated mesh, or implement OBB IoU. Higher cost.

#### P0-3. `handleLoadScene` produces `NaN` ids on non-numeric input
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

#### P0-4. `loadScene` does not validate cuboid shape
- File: [src/utils/loadScene.ts:20](../src/utils/loadScene.ts)
- Only checks `Array.isArray(parsed.cuboids)`. Malformed entries propagate into render and
  `ConvertCuboid`, where missing `position` etc. throw at runtime.
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
| P2-1 | [MetricsTab.tsx:19](../src/components/workspace/tabs/MetricsTab.tsx) | `formatMetric` returns `"NaN"` for degenerate boxes | `Number.isFinite(v) ? v.toFixed(4) : '--'` |
| P2-2 | [workspace.css:545](../src/styles/workspace.css) | `.object-list-item:hover` highlights the row but only inner buttons are clickable | Move hover to inner button, or use `:has(.object-list-select-button:hover)` |
| P2-3 | [BottomStatusBar.tsx:41](../src/components/workspace/BottomStatusBar.tsx) | `aria-live="polite"` re-announces on every click in mselect | Suppress duplicate consecutive announcements; consider `role="status"` |
| P2-4 | [RightSidebar.tsx](../src/components/workspace/RightSidebar.tsx) | Tabs lack roving `tabIndex` and arrow-key navigation | WAI-ARIA tabs pattern: only active tab is `tabIndex=0`, others `-1`, ←/→/Home/End handlers |
| P2-5 | [ObjectTab.tsx:198](../src/components/workspace/tabs/ObjectTab.tsx) | List rows have no `aria-selected` on the inner select button | Add `aria-selected={selected}` to `.object-list-select-button` |
| P2-6 | [ObjectTab.tsx](../src/components/workspace/tabs/ObjectTab.tsx) | Esc does not close the colour picker popout | Add Esc handler local to the picker, or close on Esc when `showPicker` is true |
| P2-7 | [ObjectTab.tsx:56](../src/components/workspace/tabs/ObjectTab.tsx) | `formError` does not clear when user fixes the inputs | Clear on `onChange` of W/H/D when valid |
| P2-8 | [ObjectTab.tsx:57](../src/components/workspace/tabs/ObjectTab.tsx) | Inline error and status bar play the same string twice | Keep inline only; status gets a short summary (`Add failed: invalid size`) |
| P2-9 | [App.tsx:65](../src/App.tsx) | Status messages never auto-clear | Operation messages (Added/Deleted/Duplicated) revert to `Ready` or `Mode: …` after 3–5 s |
| P2-10 | [workspace.css:365](../src/styles/workspace.css) | Long status messages wrap and grow the bottom bar | `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` + `title={statusMessage}` |
| P2-11 | [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | `Snap: Off` / `Grid: On` / `Camera: Perspective` are dead text that look like toggles | Either implement them or remove |

### P3 — Cleanup / maintainability

| # | File / location | Problem | Suggested fix |
|---|---|---|---|
| P3-1 | [src/components/CuboidPanel.tsx](../src/components/CuboidPanel.tsx) and [types/Cuboid.ts:24](../src/types/Cuboid.ts) | Dead component + dead `CuboidPanelProps` type, ~272 lines drifting from `ObjectTab` | Delete file and type |
| P3-2 | [App.tsx:14](../src/App.tsx) and [BottomStatusBar.tsx:13](../src/components/workspace/BottomStatusBar.tsx) | `MODE_STATUS` and `TOOL_LABELS` duplicate `ToolMode → label` | Move `TOOL_LABELS` to `types/Workspace.ts` (or new `workspaceLabels.ts`); derive `MODE_STATUS` as `` `Mode: ${TOOL_LABELS[t]}` `` |
| P3-3 | [App.tsx:11](../src/App.tsx) | Module-level mutable `let nextId = 1` | Move into `useRef`; survives HMR cleanly, easier to test |
| P3-4 | [ObjectTab.tsx:25](../src/components/workspace/tabs/ObjectTab.tsx) | `useRef<() => void>(() => undefined)` initial value mismatches the type semantics | `useRef<(() => void) | null>(null)` + null-check in trampoline |
| P3-5 | [saveScene.ts:17](../src/utils/saveScene.ts) | `URL.revokeObjectURL` immediately after `a.click()` may abort download in some browsers | Defer with `setTimeout(() => URL.revokeObjectURL(url), 0)` |
| P3-6 | [loadScene.ts:38](../src/utils/loadScene.ts) | `<input>` element retained by closure on each open | Set `input.onchange = null` after handler runs, drop reference |
| P3-7 | [Cuboid.tsx:8](../src/components/Cuboid.tsx) | Mesh stored in `useState` causes an extra render on attach | Use `useRef` + a `forceUpdate` on first attach, or accept the extra render and document |
| P3-8 | [Cuboid.tsx:13](../src/components/Cuboid.tsx) | `handleClick` recreated each render — small overhead at scale | Wrap in `useCallback([data.id, onSelect])` |
| P3-9 | [App.tsx](../src/App.tsx) | Vite chunk-size warning > 500 kB after minify | Code-split three.js / drei / react-colorful into manual vendor chunks (out-of-scope for UX work) |

---

## 3. Recommended fix order

1. **Immediate, single small commit** — P0-1 (`ConvertCuboid` × scale), P0-3 (`nextId` NaN /
   regex), P1-3 (`.gitignore` restore), P1-2 (gizmo gating).
2. **Next PR** — P0-2 (rotation warning), P0-4 (loadScene schema), P1-1 (New/Open confirm),
   P1-6 (Esc copy), P2-1 (NaN in formatMetric).
3. **Polish PR** — P1-4 (position counter), P1-5 (orphan comparison hint), P1-7 (material
   decision + comment), all P2 items.
4. **Cleanup PR** — P3-1 (delete `CuboidPanel`), P3-2 (merge label maps), P3-3 (`nextId` ref).

---

## 4. Known non-issues / deferred

These were raised in review but explicitly **not** treated as defects:

- Vite bundle-size warning (P3-9): pre-existing, unrelated to UX.
- Local `.idea/`, `.DS_Store` files in working tree: developer-machine artefacts, ignored.
- Status-message-as-aria-live verbosity: tracked under P2-3 / P2-9 rather than redesigning the
  status channel.
- OBB IoU implementation: out of scope; AABB approximation acceptable so long as the rotation
  warning lands (P0-2).

---

## 5. Verification baseline

At commit `ad80ba3`:

- `npm run lint` — passes
- `npm run build` — passes (single warning: Vite chunk size > 500 kB)
- Manual smoke checks partially performed: ObjectTab Add (button + `A`) and object list
  two-button row were checked. Some in-app browser interaction checks around mselect hit
  locator/click issues and should be re-run before PR.

Re-run all three before opening any PR derived from this list.
