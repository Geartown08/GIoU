# Resolved Workspace Review Notes

Historical archive of issues that were fixed in earlier review cycles. These items are kept for
traceability only and should not be treated as open work.

Archived from `docs/REVIEW_NOTES.md` on 2026-05-20.

---

## Resolved Issues

| # | Area | Fix summary |
|---|---|---|
| F1 | `MetricsTab` | Instruction text only renders when fewer than two valid cuboids selected. |
| F2 | `MetricsTab` | Metric values formatted with `toFixed(4)`. |
| F3 | `MetricsTab` | Selection order preserved via `selectedId.map(id => find(...))`. |
| F4 | `ObjectTab` | List `className` no longer renders the literal string `"null"`. |
| F5 | `BottomStatusBar` | Internal enum names (`translate`, `mselect`, ...) replaced by user-facing labels via `TOOL_LABELS`. |
| F6 | `App` (mselect) | Analyse mode actually behaves differently from Select: up to two cuboids, repeat-click toggles. |
| F7 | `TopBar` | Removed `Help` and `Import` no-op buttons. |
| F8 | `LeftToolbar` | `Random` got the `Q` shortcut. |
| F9 | `ObjectTab` | Add Cuboid validation surfaces inline error and announces via `role="alert"`. |
| F10 | `ObjectTab` | Hex colour input shows `aria-invalid` and invalid border state. |
| F11 | `workspace.css` | Shared `:focus-visible` outline for all interactive workspace controls. |
| F12 | `App` | `A` shortcut centralised into App-level keyboard dispatcher. |
| F13 | `ObjectTab` / `App` | `A` shortcut uses the form values via `onAddShortcutChange` trampoline. |
| F14 | `App` | Duplicate/Delete with empty selection emits `"Select a cuboid before ..."` to the status bar. |
| F15 | `App` | `X` / Delete tool removes all selected cuboids in Analyse multi-select. |
| F16 | `ObjectTab` | List rows no longer nest interactive elements. |
| F17 | `RightSidebar` | Tabs marked up with `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, and `aria-labelledby`. |
| F18 | `LeftToolbar` / `ObjectTab` | Decorative shortcut `<kbd>` elements set `aria-hidden="true"`. |
| F19 | `workspace.css` | Top bar and bottom bar wrap responsively; bottom controls also wrap. |
| F20 | `useUiScale` / `TopBar` | Added `110%` and `115%` scale presets; `UiScaleOverride` union and validator updated. |
| F21 | `App` (handleSelect) | `mselect` branch no longer mutates `selectedIdsRef` inside a state-updater closure. |
| F22 | `App` (handleDelete) | Deleting one cuboid no longer wipes the entire selection. |
| F23 | `ObjectTab` list | Both row buttons have explicit `aria-label`s including index and dimensions. |
| F24 | `types/Workspace.ts`, `App`, `BottomStatusBar` | Removed dead `'add'` entry from `ToolMode` and its unreachable `handleToolChange` branch. |
| F25 | `ObjectTab` | Shortcut registration uses a stable trampoline and avoids register/unregister churn on every keystroke. |
| F26 | `ObjectTab` | Form validation failure also fires `onStatus` so the bottom status bar reflects errors outside the Object tab. |
| F27 | `App` | Analyse blank-canvas click no longer clears selection; it prompts `Press Esc to clear comparison`. |
| F28 | `App` (handleToolChange) | Switching to Select/Analyse/Move/Rotate/Scale updates the status bar. |
| F29 | `App` | Analyse status messages compressed to concise comparison messages. |
| F30 | `MetricsTab` | Rebase onto 2D mode now uses `giou2DOriented` / `giou3DOriented`; Metrics no longer depends on stale AABB helpers. |
| F31 | `MetricsTab` | `formatMetric` guards with `Number.isFinite`, so degenerate results render `--` instead of `"NaN"`. |
| F32 | `ObjectTab` | Rebase conflict kept nullable `handleAddRef` and null-safe shortcut dispatch. |
| F33 | `AnalysePanel` | Added `src/components/workspace/AnalysePanel.tsx` to git so `WorkspaceLayout` imports resolve on a clean checkout. |
| F34 | `App` / `MetricsTab` | Hoisted Analyse metrics return `null` outside `mselect`, preventing stale metric display after leaving Analyse mode. |
| F35 | `AnalysePanel` | Closed panel removes the close button from tab order and the close button participates in the shared focus outline. |
| F36 | `useCuboids` | Loaded scene id recovery now ignores malformed ids and only advances `nextId` from fully numeric ids. |
| F37 | `loadScene` | Scene loading now rejects malformed cuboid data before it can enter render or metric paths. |
| F38 | `WorkspaceLayout` | New/Open now asks for confirmation before discarding a non-empty scene. |
| F39 | `CameraRig` | 2D mode no longer repeatedly replaces the canvas camera and crashes with a maximum update depth error. |
