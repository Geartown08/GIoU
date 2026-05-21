# Workspace UI/UX Review Notes

Open issues found during code review of the workspace UI. This document is intentionally limited
to unresolved work so follow-up sessions can start from the current priority list.

Last consolidated: 2026-05-21

Resolved historical issues are archived in [RESOLVED_REVIEW_NOTES.md](./RESOLVED_REVIEW_NOTES.md).

---

## P1 - Core UX / Usability

No open P1 issues.

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

1. Accessibility and consistency pass: all P2 items.
2. Cleanup pass: P3-1 through P3-8.
3. Performance pass: P3-9 only when bundle size becomes an explicit target.
