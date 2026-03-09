# Release Notes: RRM-0025 Desktop Web UX

## Summary

Desktop layout and interaction polish has been added for scoped pages while preserving the existing mobile baseline contract.

## Improvements

- Added a shared desktop layout contract for `/home`, `/schedule`, and `/setting`:
  - Centered page content
  - Page-specific max-width constraints
  - Consistent desktop-only padding
- Added desktop interaction affordances for pointer/keyboard users:
  - Hover brightness feedback
  - Focus-visible outlines for actionable controls
  - Subtle active-state press feedback
- Added regression guardrails to enforce desktop-only scope and mobile no-change parity.

## Mobile Behavior

No intentional mobile layout or interaction changes are included. Desktop-specific rules are constrained to:

- `@media (min-width: 1024px)` for layout contracts
- `@media (min-width: 1024px) and (hover: hover) and (pointer: fine)` for affordances

