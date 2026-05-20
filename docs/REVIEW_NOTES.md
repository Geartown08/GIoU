# Workspace UI/UX Review Notes

Open issues found during code review of the workspace UI. This document is intentionally limited
to unresolved work so follow-up sessions can start from the current priority list.

Last consolidated: 2026-05-20

Resolved historical issues are archived in [RESOLVED_REVIEW_NOTES.md](./RESOLVED_REVIEW_NOTES.md).

---

## P0 - Correctness / Data Integrity

### P0-1. Scene loading does not validate cuboid shape
- File: [src/utils/loadScene.ts](../src/utils/loadScene.ts)
- `openAndLoadScene` only checks that `parsed.cuboids` is an array. Malformed entries can reach
  rendering, transform, and metric code without required fields.
- Impact: missing `position`, `rotation`, `scale`, dimensions, `id`, or `color` can throw at
  runtime or corrupt scene state.
- Fix: add a minimal per-cuboid schema check before calling `onLoad`; reject or drop invalid
  entries and report a useful load error.

## P1 - Core UX / Usability

### P1-1. New/Open can silently discard the current scene
- File: [src/components/workspace/WorkspaceLayout.tsx](../src/components/workspace/WorkspaceLayout.tsx)
- The `new` and `open` actions replace the current scene without confirmation.
- Impact: a single click can destroy unsaved work.
- Fix: when `cuboids.length > 0`, gate both actions behind a discard confirmation. A later dirty
  flag can refine this, but a confirmation prompt is enough for the first fix.

### P1-2. Transform controls render in modes where editing should be inactive
- Files: [src/App.tsx](../src/App.tsx), [src/components/Cuboid.tsx](../src/components/Cuboid.tsx)
- `App` maps every non-rotate/non-scale tool to `translate`, and `Cuboid` renders
  `TransformControls` whenever a cuboid is selected.
- Impact: Select and Analyse can still show transform gizmos; Analyse with two selections can show
  two transform controls at once.
- Fix: pass an explicit transform mode of `translate | rotate | scale | null`, or a `showGizmo`
  prop, and render controls only when an edit tool is active and exactly one cuboid is selected.

### P1-3. Add position generation can collide after deletions
- File: [src/hooks/useCuboids.ts](../src/hooks/useCuboids.ts)
- `handleAdd` uses `prev.length` to place new cuboids. After deleting from the middle of the list,
  the next added cuboid can spawn where the deleted one used to be.
- Impact: object creation feels inconsistent and can hide newly added cuboids inside existing
  geometry.
- Fix: drive placement from a monotonic counter, such as a dedicated `positionCounterRef`, instead
  of the current array length.

### P1-4. Deleting one compared cuboid leaves weak Analyse feedback
- Files: [src/App.tsx](../src/App.tsx), [src/hooks/useCuboids.ts](../src/hooks/useCuboids.ts)
- Deleting one item from a two-cuboid Analyse selection only reports the deletion. The remaining
  half-comparison is left selected, while metrics disappear because a full pair no longer exists.
- Impact: users see metrics vanish without a clear next action.
- Fix: after deleting in Analyse mode, if one selected cuboid remains, report
  `Comparison: #id (pick one more)` and keep the status aligned with the remaining selection.

### P1-5. Cuboid material produces additive see-through artefacts
- File: [src/components/Cuboid.tsx](../src/components/Cuboid.tsx)
- Cuboids use `AdditiveBlending`, `opacity={1}`, and `depthWrite={false}`.
- Impact: overlapping cuboids saturate toward white and can appear incorrectly sorted while
  orbiting.
- Fix: decide whether this is intentional visualisation. If it is not, switch to normal
  transparent rendering with depth writes, or enable additive blending only for a deliberate
  comparison/highlight mode.

### P1-6. Global font and colour system reduces readability
- Files: [src/index.css](../src/index.css), [src/styles/workspace.css](../src/styles/workspace.css)
- The UI uses a compact system font stack and many hard-coded dark sci-fi colours.
- Impact: the style has a technical mood, but long-form labels, formulas, status text, and sidebar
  controls are harder to read; users also have no light/day mode.
- Fix: introduce semantic theme tokens, keep the current palette as night mode, add a day mode,
  and use a more readable UI font stack. Theme state can be exposed through a `data-theme`
  attribute or equivalent root class.

### P1-7. Explain and Analyse formulas are not clear enough
- Files: [src/components/workspace/tabs/ExplainTab.tsx](../src/components/workspace/tabs/ExplainTab.tsx),
  [src/components/workspace/AnalysePanel.tsx](../src/components/workspace/AnalysePanel.tsx)
- Explain currently renders formulas as plain monospace text; Analyse shows metric descriptions
  but not clear mathematical expressions.
- Impact: users cannot easily connect IoU, GIoU, loss values, and the numeric derivation.
- Fix: add KaTeX-based formula rendering and reuse it in both Explain and Analyse. Show the
  symbolic formula, the numeric substitution, and the final result for `IoU`, `GIoU`, `L_IoU`,
  and `L_GIoU`.

## P2 - Accessibility / Consistency Polish

| # | File / location | Problem | Suggested fix |
|---|---|---|---|
| P2-1 | [workspace.css](../src/styles/workspace.css) | `.object-list-item:hover` highlights the row, but only inner buttons are clickable. | Move hover affordance to the select button, or use a parent style driven by button hover/focus. |
| P2-2 | [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | `aria-live="polite"` can re-announce repeated mselect status messages. | Suppress duplicate consecutive announcements and consider `role="status"`. |
| P2-3 | [RightSidebar.tsx](../src/components/workspace/RightSidebar.tsx) | Tabs have ARIA roles but no roving `tabIndex` or arrow-key navigation. | Follow the WAI-ARIA tabs pattern with active-only tab stop plus Left/Right/Home/End handlers. |
| P2-4 | [ObjectTab.tsx](../src/components/workspace/tabs/ObjectTab.tsx) | Object list selection uses `aria-pressed`; listbox-like selection state is not explicit. | Add `aria-selected={isSelected}` or adopt a consistent listbox/button pattern. |
| P2-5 | [ObjectTab.tsx](../src/components/workspace/tabs/ObjectTab.tsx) | Escape does not close the colour picker popout. | Add an Escape handler while the picker is open. |
| P2-6 | [App.tsx](../src/App.tsx) | Operation status messages never auto-clear. | Revert transient Add/Delete/Duplicate messages to `Ready` or the current mode after 3-5 seconds. |
| P2-7 | [workspace.css](../src/styles/workspace.css), [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | Long status messages can wrap and grow the bottom bar. | Use ellipsis styling and expose the full message through `title`. |
| P2-8 | [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | `Grid: On`, `Snap: Off`, and `Camera: ...` read like controls but are mostly static status text. | Either implement them as real controls or restyle/remove the inactive items. |

## P3 - Cleanup / Maintainability

| # | File / location | Problem | Suggested fix |
|---|---|---|---|
| P3-1 | [CuboidPanel.tsx](../src/components/CuboidPanel.tsx), [types/Cuboid.ts](../src/types/Cuboid.ts) | Dead panel component and `CuboidPanelProps` type drift from `ObjectTab`. | Delete both if no longer used. |
| P3-2 | [App.tsx](../src/App.tsx), [BottomStatusBar.tsx](../src/components/workspace/BottomStatusBar.tsx) | `MODE_STATUS` and `TOOL_LABELS` duplicate the same tool labels. | Move labels to one shared module and derive status strings from it. |
| P3-3 | [useCuboids.ts](../src/hooks/useCuboids.ts) | Module-level mutable `nextId` survives outside React state. | Move it into a ref or reducer-owned state so HMR and tests are easier to reason about. |
| P3-4 | [cuboidBoxConvert.ts](../src/utils/cuboidBoxConvert.ts) | Legacy helpers ignore rotation/scale assumptions and are still used for volume/surface metadata. | Rename or update helpers so future metric work does not accidentally reuse AABB semantics. |
| P3-5 | [saveScene.ts](../src/utils/saveScene.ts) | `URL.revokeObjectURL` runs immediately after `a.click()`. | Defer revocation with `setTimeout` to avoid aborting downloads in stricter browsers. |
| P3-6 | [loadScene.ts](../src/utils/loadScene.ts) | The temporary file input keeps its `onchange` closure after use. | Clear `input.onchange` after the handler runs. |
| P3-7 | [Cuboid.tsx](../src/components/Cuboid.tsx) | Mesh stored in state causes an extra render when the ref attaches. | Use a ref plus a small force update, or document the accepted extra render. |
| P3-8 | [Cuboid.tsx](../src/components/Cuboid.tsx) | `handleClick` is recreated on every render. | Wrap it in `useCallback([data.id, onSelect])` if object counts grow. |
| P3-9 | Vite build output | Bundle exceeds Vite's default 500 kB chunk warning. | Split three.js, drei, and react-colorful into vendor chunks when performance work is in scope. |

## Recommended Fix Order

1. Immediate correctness pass: P0-1, P1-1, P1-2.
2. Core UX pass: P1-3, P1-4, P1-5, P1-6, P1-7.
3. Accessibility and consistency pass: all P2 items.
4. Cleanup pass: P3-1 through P3-8.
5. Performance pass: P3-9 only when bundle size becomes an explicit target.
