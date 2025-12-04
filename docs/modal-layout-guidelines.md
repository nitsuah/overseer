# Modal Layout & Scrolling Guidelines

Purpose: Stop regressions with scrolling/overflow and provide a single, repeatable pattern for modals across desktop and mobile.

## Design Principles

- Single vertical scroller per content area: Only one element should own `overflow-y-auto`.
- Fixed-height content region: The preview/content pane must have a reliable, computed height.
- No competing overflows: Parents use `overflow-hidden`; children own the scroll.
- Predictable constraints: Use `min-h-0` on flex children that must shrink.
- Horizontal overflow in diffs: Long lines scroll horizontally; they should not wrap past the edge.

## Standard Modal Structure

- Modal container: `max-h-[90vh] flex flex-col`.
- Modal header/actions: `flex-shrink-0`.
- Modal body: `flex-1 min-h-0`.
- Modal footer: `flex-shrink-0`.

This guarantees the body consumes remaining space without pushing the footer offscreen.

## Preview Pane Pattern (Content Area)

- Outer preview pane: `flex flex-col overflow-hidden h-[calc(90vh-<reserved>px)]`.
  - `reserved` should account for modal header, action bar, and footer. Start with 180 and tune to your theme.
- Inner scroller (non-edit): a reusable component `ScrollPane` with `h-full min-h-0 overflow-y-auto`.
- Edit mode: Use a native `textarea` with `overflow-auto`; do not wrap it in another scroller.

## Grid vs Flex

- Prefer flex for vertical sizing within the modal body. Grid can be used for columns, but the preview column must include a fixed-height preview pane.
- When using grid:
  - Grid wrapper: `flex-1 min-h-0` to allow shrinking within the modal body.
  - Preview column: `h-full min-h-0 flex flex-col`.
  - Preview pane inside column: fixed height via `h-[calc(...)]`.

## DiffView Rules

- Root container: `w-full overflow-x-auto` to enable horizontal scroll for long lines.
- Line content: `whitespace-pre` (no `break-all`) to preserve spacing and avoid wrapping.
- Expandable sections: Expansion should increase inner scroll, not the pane height.

## Common Anti-Patterns (Avoid)

- Multiple `overflow-y-auto` on siblings/parents: leads to double scrollbars.
- Missing `min-h-0` on flex children: prevents shrinking; causes the body to grow.
- Relying on content to constrain height: plain `div`s will expand; set explicit heights on the container.
- Mixing grid auto rows with unbounded children: results in the preview pane expanding past the modal.

## Mobile Behavior

- Fullscreen modal on small screens: use `h-[100vh]` for the container and keep the pattern (header/actions `flex-shrink-0`, body `flex-1 min-h-0`, footer `flex-shrink-0`).
- Preview pane height: `h-[calc(100vh-<reserved>px)]` so primary actions remain visible.
- Reduce padding/borders on small screens to maximize content area.

## Refactor Checklist

1. Modal shell uses `max-h-[90vh] flex flex-col`.
2. Header + footer are `flex-shrink-0`; body is `flex-1 min-h-0`.
3. Inside body, columns use either flex or grid, but the preview column includes a fixed-height preview pane.
4. Non-edit views render inside `ScrollPane`.
5. Edit view uses a single `textarea` scroller.
6. DiffView root has `overflow-x-auto`; content lines use `whitespace-pre`.
7. No other element in the preview stack has `overflow-y-auto`.

## Tuning Notes

- Start `reserved` at 180px for `h-[calc(90vh-180px)]`; measure actual header+actions+footer and adjust.
- Use devtools to highlight scroll owners: add temporary `outline` on the scroller to confirm only one vertical scrollbar is present.

## Example Class Stack (Preview Column)

```
<div class="flex flex-col h-full min-h-0">
  <div class="flex items-center justify-between flex-shrink-0">...actions...</div>
  <div class="flex-1 min-h-0 h-[calc(90vh-180px)] overflow-hidden bg-slate-800 rounded border flex flex-col">
    <!-- Non-edit -->
    <div class="h-full min-h-0 overflow-y-auto"> ...content component... </div>
    <!-- Edit -->
    <textarea class="w-full h-full overflow-auto">...</textarea>
  </div>
</div>
```

Adopt this doc’s pattern before further tweaks to avoid repeated regressions. Adjust only the calc height and inner content styling as needed, never the scroll ownership or container overflow model.
